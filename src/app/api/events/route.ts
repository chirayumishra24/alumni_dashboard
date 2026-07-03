import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { sendEventInvitationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const eventsSnap = await firestore.collection('events').get();
    const events = eventsSnap.docs.map((doc: QueryDocumentSnapshot) => doc.data());
    return NextResponse.json(events);
  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, eventDate, location, meetingUrl, bannerUrl } = body;

    if (!title || !description || !eventDate || !location) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 });
    }

    const eventRef = firestore.collection('events').doc();
    const eventData = {
      id: eventRef.id,
      title,
      description,
      eventDate,
      location,
      meetingUrl: meetingUrl || null,
      bannerUrl: bannerUrl || null,
      invitationsSentAt: null,
      createdAt: new Date().toISOString(),
    };

    await eventRef.set(eventData);
    return NextResponse.json({ success: true, event: eventData });
  } catch (error) {
    console.error('Events POST error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, eventId, schoolFilter } = body;

    if (action !== 'sendInvitations') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    const eventRef = firestore.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const eventData = eventDoc.data();
    if (!eventData) {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 });
    }

    const alumniRef = firestore.collection('alumni_profiles');
    let alumniQuery = alumniRef.where('isVerified', '==', true);
    if (schoolFilter && schoolFilter !== 'All') {
      alumniQuery = alumniQuery.where('school', '==', schoolFilter);
    }
    const alumniSnap = await alumniQuery.get();

    if (alumniSnap.empty) {
      return NextResponse.json({ success: true, sentCount: 0, message: 'No verified alumni found matching criteria' });
    }

    const origin = new URL(request.url).origin;
    let sentCount = 0;

    interface RsvpDocQueueItem {
      rsvpData: {
        id: string;
        eventId: string;
        alumniProfileId: string;
        alumniName: string;
        alumniEmail: string;
        alumniSchool: string;
        response: string;
        respondedAt: string | null;
        sentAt: string;
      };
      email: string;
      name: string;
    }

    const batch = firestore.batch();
    const rsvpDocs: RsvpDocQueueItem[] = [];

    alumniSnap.docs.forEach((doc: QueryDocumentSnapshot) => {
      const alumni = doc.data();
      const rsvpRef = firestore.collection('event_rsvps').doc();
      const rsvpId = rsvpRef.id;

      const rsvpData = {
        id: rsvpId,
        eventId,
        alumniProfileId: alumni.id,
        alumniName: alumni.user.name,
        alumniEmail: alumni.user.email,
        alumniSchool: alumni.school,
        response: 'PENDING',
        respondedAt: null,
        sentAt: new Date().toISOString(),
      };

      batch.set(rsvpRef, rsvpData);
      rsvpDocs.push({
        rsvpData,
        email: alumni.user.email,
        name: alumni.user.name,
      });
    });

    await batch.commit();

    for (const rsvp of rsvpDocs) {
      try {
        const acceptUrl = `${origin}/api/events/rsvp?id=${rsvp.rsvpData.id}&response=ACCEPTED`;
        const declineUrl = `${origin}/api/events/rsvp?id=${rsvp.rsvpData.id}&response=DECLINED`;

        await sendEventInvitationEmail({
          toEmail: rsvp.email,
          name: rsvp.name,
          eventTitle: eventData.title,
          eventDescription: eventData.description,
          eventDate: eventData.eventDate,
          eventLocation: eventData.location,
          acceptUrl,
          declineUrl,
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send event invite to ${rsvp.email}:`, err);
      }
    }

    await eventRef.update({
      invitationsSentAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, sentCount });
  } catch (error) {
    console.error('Events PATCH error:', error);
    return NextResponse.json({ error: 'Failed to send invitations' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    await firestore.collection('events').doc(eventId).delete();

    const rsvpsQuery = await firestore.collection('event_rsvps')
      .where('eventId', '==', eventId)
      .get();

    if (!rsvpsQuery.empty) {
      const batch = firestore.batch();
      rsvpsQuery.docs.forEach((doc: QueryDocumentSnapshot) => batch.delete(doc.ref));
      await batch.commit();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Events DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
