import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { firestore } from '@/lib/firebaseAdmin';
import { invalidateAlumniCache } from '@/lib/cache';
import { ADMIN_SESSION_COOKIE, getAdminSessionToken } from '@/lib/adminSession';
import { sendMentorScheduledEmail, sendStudentScheduledEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function isAdminSessionValid() {
  return cookies().get(ADMIN_SESSION_COOKIE)?.value === getAdminSessionToken();
}

function parseHttpsUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:') {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function parseFutureDate(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
    return null;
  }
  return date.toISOString();
}

export async function POST(request: Request) {
  if (!isAdminSessionValid()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { connectionId, scheduledAt, meetingUrl, meetingPlatform } = body;

    if (typeof connectionId !== 'string' || !connectionId.trim()) {
      return NextResponse.json({ error: 'Missing connectionId' }, { status: 400 });
    }

    const normalizedDate = parseFutureDate(scheduledAt);
    if (!normalizedDate) {
      return NextResponse.json({ error: 'scheduledAt must be a valid future date/time' }, { status: 400 });
    }

    const normalizedUrl = parseHttpsUrl(meetingUrl);
    if (!normalizedUrl) {
      return NextResponse.json({ error: 'meetingUrl must be a valid HTTPS URL' }, { status: 400 });
    }

    const normalizedPlatform = typeof meetingPlatform === 'string' && meetingPlatform.trim()
      ? meetingPlatform.trim()
      : 'Online Meeting';

    const connectionRef = firestore.collection('mentorship_connections').doc(connectionId.trim());
    const connectionDoc = await connectionRef.get();

    if (!connectionDoc.exists) {
      return NextResponse.json({ error: 'Mentorship connection not found' }, { status: 404 });
    }

    const connection = connectionDoc.data();
    if (!connection) {
      return NextResponse.json({ error: 'Invalid mentorship connection data' }, { status: 400 });
    }

    if (!['PENDING', 'ACCEPTED'].includes(connection.status)) {
      return NextResponse.json({ error: `Cannot schedule a ${connection.status} mentorship request` }, { status: 409 });
    }

    const studentEmail = connection.student?.user?.email;
    const mentorEmail = connection.alumni?.user?.email;

    if (!studentEmail || !mentorEmail) {
      return NextResponse.json({ error: 'Student or mentor email is missing' }, { status: 400 });
    }

    const scheduledBy = process.env.ADMIN_USER_ID || 'admin_ccgs';
    const updateData = {
      status: 'SCHEDULED',
      scheduledAt: normalizedDate,
      meetingUrl: normalizedUrl,
      meetingPlatform: normalizedPlatform,
      scheduledBy,
      updatedAt: new Date().toISOString(),
    };

    await connectionRef.update(updateData);
    const updated = {
      ...connection,
      ...updateData,
    };

    const [mentorEmailResult, studentEmailResult] = await Promise.all([
      sendMentorScheduledEmail({
        toEmail: mentorEmail,
        mentorName: connection.alumni?.user?.name || 'Mentor',
        studentName: connection.student?.user?.name || 'Student',
        studentBatch: connection.student?.batch || '',
        studentProgram: connection.student?.program || '',
        scheduledAt: normalizedDate,
        meetingUrl: normalizedUrl,
        meetingPlatform: normalizedPlatform,
        notes: connection.notes,
      }),
      sendStudentScheduledEmail({
        toEmail: studentEmail,
        studentName: connection.student?.user?.name || 'Student',
        mentorName: connection.alumni?.user?.name || 'Mentor',
        mentorCompany: connection.alumni?.company,
        mentorRole: connection.alumni?.role,
        mentorBatch: connection.alumni?.batch || '',
        scheduledAt: normalizedDate,
        meetingUrl: normalizedUrl,
        meetingPlatform: normalizedPlatform,
      }),
    ]);

    invalidateAlumniCache();

    return NextResponse.json({
      success: true,
      connection: updated,
      emails: {
        mentor: mentorEmailResult,
        student: studentEmailResult,
      },
    });
  } catch (error) {
    console.error('Mentorship schedule POST error:', error);
    return NextResponse.json({ error: 'Failed to schedule mentorship call' }, { status: 500 });
  }
}
