import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { sendVerificationEmail, sendEmail } from '@/lib/email';
import { invalidateAlumniCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [alumniSnap, studentsSnap, mentorshipSnap, eventsSnap, widgetsSnap, rsvpsSnap] = await Promise.all([
      firestore.collection('alumni_profiles').get(),
      firestore.collection('student_profiles').get(),
      firestore.collection('mentorship_connections').get(),
      firestore.collection('events').get(),
      firestore.collection('widget_testimonials').get(),
      firestore.collection('event_rsvps').get()
    ]);

    const alumni = alumniSnap.docs.map((doc: QueryDocumentSnapshot) => doc.data());
    const students = studentsSnap.docs.map((doc: QueryDocumentSnapshot) => doc.data());
    const mentorships = mentorshipSnap.docs.map((doc: QueryDocumentSnapshot) => doc.data());
    
    // Sort events by eventDate ascending with proper type definitions
    const events = eventsSnap.docs
      .map((doc: QueryDocumentSnapshot) => doc.data() as { eventDate: string })
      .sort((a: { eventDate: string }, b: { eventDate: string }) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    const widgets = widgetsSnap.docs.map((doc: QueryDocumentSnapshot) => doc.data());
    const eventRsvps = rsvpsSnap.docs.map((doc: QueryDocumentSnapshot) => doc.data());

    return NextResponse.json({
      alumni,
      students,
      mentorships,
      events,
      widgets,
      eventRsvps
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
      let studentDoc = await firestore.collection('student_profiles').doc(studentId).get();
      const alumniDoc = await firestore.collection('alumni_profiles').doc(alumniId).get();

      if (!alumniDoc.exists) {
        return NextResponse.json({ error: 'Alumni profile not found' }, { status: 404 });
      }

      // Auto-create simulated or missing student profile to allow robust flow
      if (!studentDoc.exists) {
        const studentName = studentId.includes('@') 
          ? studentId.split('@')[0].replace(/[^a-zA-Z]/g, ' ')
          : studentId.replace(/_/g, ' ');
          
        const cleanedName = studentName.charAt(0).toUpperCase() + studentName.slice(1);
        const defaultStudent = {
          id: studentId,
          userId: `user_${studentId}`,
          batch: 2026,
          program: 'Science',
          user: {
            id: `user_${studentId}`,
            email: studentId.includes('@') ? studentId : `${studentId}@student.cchsalumni.org`,
            name: cleanedName || 'Simulated Student',
            role: 'STUDENT',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanedName)}&background=001f3f&color=fff`
          }
        };
        await firestore.collection('student_profiles').doc(studentId).set(defaultStudent);
        studentDoc = await firestore.collection('student_profiles').doc(studentId).get();
      }

      const studentData = studentDoc.data();
      const alumniData = alumniDoc.data();

      if (!alumniData?.isVerified || !alumniData?.isMentor) {
        return NextResponse.json({ error: 'Selected alumni profile is not available for mentorship' }, { status: 400 });
      }

      const connectionRef = firestore.collection('mentorship_connections').doc();
      const connectionData = {
        id: connectionRef.id,
        studentId,
        alumniId,
        notes,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        scheduledAt: null,
        meetingUrl: null,
        meetingPlatform: null,
        scheduledBy: null,
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

      if (!['PENDING', 'SCHEDULED', 'DECLINED', 'COMPLETED', 'ACCEPTED'].includes(status)) {
        return NextResponse.json({ error: 'Invalid mentorship status' }, { status: 400 });
      }

      const connectionDoc = await connectionRef.get();
      if (!connectionDoc.exists) {
        return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
      }

      await connectionRef.update({
        status,
        updatedAt: new Date().toISOString()
      });
      const updated = (await connectionRef.get()).data();
      invalidateAlumniCache();
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
      if (!widgetsQuery.empty) {
        const batch = firestore.batch();
        widgetsQuery.docs.forEach((doc: QueryDocumentSnapshot) => batch.delete(doc.ref));
        await batch.commit();
      }

      // Invalidate custom in-memory cache
      invalidateAlumniCache();

      return NextResponse.json({ success: true });
    }

    if (action === 'sendDraftEmail') {
      const { subject, body: emailBody } = body;
      const profileRef = firestore.collection('alumni_profiles').doc(id);
      const profileDoc = await profileRef.get();

      if (!profileDoc.exists) {
        return NextResponse.json({ error: 'Alumni profile not found' }, { status: 404 });
      }

      const profileData = profileDoc.data();
      if (!profileData?.user?.email) {
        return NextResponse.json({ error: 'Recipient email not found' }, { status: 400 });
      }

      const recipientEmail = profileData.user.email;
      const recipientName = profileData.user.name;

      // Wrap the text body into a nice HTML layout
      const formattedHtml = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <h2 style="color: #6b1d2f; margin-bottom: 20px; font-family: serif;">CCGS Alumni Verification</h2>
        <p style="white-space: pre-wrap; line-height: 1.6; color: #334155; font-size: 0.95em;">${emailBody}</p>
        <br/>
        <p style="margin-top: 20px; font-size: 0.9em; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 15px;">
          Warm regards,<br/>
          <strong>CCGS Alumni Coordinator Team</strong><br/>
          <a href="mailto:support@skillizee.io" style="color: #64748b; text-decoration: none;">support@skillizee.io</a>
        </p>
      </div>`;

      await sendEmail({
        to: recipientEmail,
        subject: subject || `Verify your CCGS Alumni Hub Account - ${recipientName}`,
        text: emailBody,
        html: formattedHtml
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Firestore API PATCH error: ', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}
