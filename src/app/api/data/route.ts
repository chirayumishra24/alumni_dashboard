import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { sendVerificationEmail } from '@/lib/email';
import { invalidateAlumniCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [alumniSnap, studentsSnap, mentorshipSnap, eventsSnap, widgetsSnap] = await Promise.all([
      firestore.collection('alumni_profiles').get(),
      firestore.collection('student_profiles').get(),
      firestore.collection('mentorship_connections').get(),
      firestore.collection('events').get(),
      firestore.collection('widget_testimonials').get()
    ]);

    const alumni = alumniSnap.docs.map((doc: QueryDocumentSnapshot) => doc.data());
    const students = studentsSnap.docs.map((doc: QueryDocumentSnapshot) => doc.data());
    const mentorships = mentorshipSnap.docs.map((doc: QueryDocumentSnapshot) => doc.data());
    
    // Sort events by eventDate ascending with proper type definitions
    const events = eventsSnap.docs
      .map((doc: QueryDocumentSnapshot) => doc.data() as { eventDate: string })
      .sort((a: { eventDate: string }, b: { eventDate: string }) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    const widgets = widgetsSnap.docs.map((doc: QueryDocumentSnapshot) => doc.data());

    return NextResponse.json({
      alumni,
      students,
      mentorships,
      events,
      widgets
    });
  } catch (error) {
    console.error('Firestore API GET error: ', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...payload } = body;

    if (action === 'createMentorship') {
      const { studentId, alumniId, notes } = payload;
      
      // Prevent duplicate requests
      const existingQuery = await firestore.collection('mentorship_connections')
        .where('studentId', '==', studentId)
        .where('alumniId', '==', alumniId)
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        return NextResponse.json({ error: 'Request already exists' }, { status: 400 });
      }

      // Fetch student and alumni profiles to snapshot details inside connection
      const [studentDoc, alumniDoc] = await Promise.all([
        firestore.collection('student_profiles').doc(studentId).get(),
        firestore.collection('alumni_profiles').doc(alumniId).get()
      ]);

      if (!studentDoc.exists || !alumniDoc.exists) {
        return NextResponse.json({ error: 'Student or Alumni profile not found' }, { status: 404 });
      }

      const studentData = studentDoc.data();
      const alumniData = alumniDoc.data();

      const connectionRef = firestore.collection('mentorship_connections').doc();
      const connectionData = {
        id: connectionRef.id,
        studentId,
        alumniId,
        notes,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        student: studentData,
        alumni: alumniData
      };

      await connectionRef.set(connectionData);
      return NextResponse.json({ success: true, connection: connectionData });
    }

    if (action === 'updatePreferences') {
      const { studentProfileId, preferences } = payload;

      // Update the student preferences array nested inside the profile doc
      const studentDocRef = firestore.collection('student_profiles').doc(studentProfileId);
      const studentDoc = await studentDocRef.get();

      if (!studentDoc.exists) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }

      const formattedPrefs = preferences.map((pref: { careerChoice: string; country: string }, idx: number) => ({
        id: `${studentProfileId}_pref_${idx}`,
        careerChoice: pref.careerChoice,
        country: pref.country,
        preferenceOrder: idx + 1
      }));

      await studentDocRef.update({
        preferences: formattedPrefs
      });

      return NextResponse.json({ success: true, preferences: formattedPrefs });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Firestore API POST error: ', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, id, status, isApproved } = body;

    if (action === 'updateMentorshipStatus') {
      const connectionRef = firestore.collection('mentorship_connections').doc(id);
      
      // If we are updating dummy connection (from checklist checkbox action), return success
      if (id === 'dummy') {
        return NextResponse.json({ success: true });
      }

      const connectionDoc = await connectionRef.get();
      if (!connectionDoc.exists) {
        return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
      }

      await connectionRef.update({ status });
      const updated = (await connectionRef.get()).data();
      return NextResponse.json({ success: true, connection: updated });
    }

    if (action === 'updateWidgetApproval') {
      const widgetRef = firestore.collection('widget_testimonials').doc(id);
      const widgetDoc = await widgetRef.get();

      if (!widgetDoc.exists) {
        return NextResponse.json({ error: 'Widget testimonial not found' }, { status: 404 });
      }

      await widgetRef.update({ isApproved });
      const updated = (await widgetRef.get()).data();
      return NextResponse.json({ success: true, widget: updated });
    }

    if (action === 'verifyAlumni') {
      const profileRef = firestore.collection('alumni_profiles').doc(id);
      const profileDoc = await profileRef.get();

      if (!profileDoc.exists) {
        return NextResponse.json({ error: 'Alumni profile not found' }, { status: 404 });
      }

      // Update both isVerified flag and profileComplete percentage
      await profileRef.update({
        isVerified: true,
        profileComplete: 80
      });

      const updated = (await profileRef.get()).data();
      
      // Trigger automatic verification email in background
      if (updated && updated.user) {
        try {
          await sendVerificationEmail(updated.user.email, updated.user.name, updated.school);
        } catch (err) {
          console.error('Failed to send verification email:', err);
        }
      }

      // Invalidate custom in-memory cache
      invalidateAlumniCache();

      return NextResponse.json({ success: true, profile: updated });
    }

    if (action === 'deleteAlumni') {
      const profileRef = firestore.collection('alumni_profiles').doc(id);
      const profileDoc = await profileRef.get();

      if (!profileDoc.exists) {
        return NextResponse.json({ error: 'Alumni profile not found' }, { status: 404 });
      }

      const profileData = profileDoc.data();
      const userId = profileData?.userId;

      // Delete the alumni profile
      await profileRef.delete();

      // Delete the associated user if exists
      if (userId) {
        await firestore.collection('users').doc(userId).delete();
      }

      // Delete widget testimonials associated with this profile
      const widgetsQuery = await firestore.collection('widget_testimonials')
        .where('alumniProfileId', '==', id)
        .get();
      const batch = firestore.batch();
      widgetsQuery.docs.forEach((doc: QueryDocumentSnapshot) => batch.delete(doc.ref));
      await batch.commit();

      // Invalidate custom in-memory cache
      invalidateAlumniCache();

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Firestore API PATCH error: ', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}
