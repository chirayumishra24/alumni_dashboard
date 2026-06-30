import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Disable Static Optimization for this Route to ensure dynamic SQLite fetches work correctly
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [alumni, students, mentorships, events, widgets] = await Promise.all([
      prisma.alumniProfile.findMany({
        include: {
          user: true,
          widgetLauds: true,
        },
      }),
      prisma.studentProfile.findMany({
        include: {
          user: true,
          preferences: {
            orderBy: {
              preferenceOrder: 'asc',
            },
          },
        },
      }),
      prisma.mentorship.findMany({
        include: {
          student: {
            include: { user: true },
          },
          alumni: {
            include: { user: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.event.findMany({
        orderBy: {
          eventDate: 'asc',
        },
      }),
      prisma.widgetSpeak.findMany({
        include: {
          alumni: {
            include: { user: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      alumni,
      students,
      mentorships,
      events,
      widgets,
    });
  } catch (error) {
    console.error('API GET error: ', error);
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
      const existing = await prisma.mentorship.findFirst({
        where: { studentId, alumniId },
      });
      if (existing) {
        return NextResponse.json({ error: 'Request already exists' }, { status: 400 });
      }

      const connection = await prisma.mentorship.create({
        data: {
          studentId,
          alumniId,
          notes,
          status: 'PENDING',
        },
        include: {
          student: { include: { user: true } },
          alumni: { include: { user: true } },
        },
      });
      return NextResponse.json({ success: true, connection });
    }

    if (action === 'updatePreferences') {
      const { studentProfileId, preferences } = payload; // preferences: Array<{careerChoice: string, country: string}>

      // Clear existing preferences
      await prisma.careerPreference.deleteMany({
        where: { studentProfileId },
      });

      // Insert new preferences
      const created = await Promise.all(
        preferences.map((pref: { careerChoice: string; country: string }, idx: number) =>
          prisma.careerPreference.create({
            data: {
              studentProfileId,
              careerChoice: pref.careerChoice,
              country: pref.country,
              preferenceOrder: idx + 1,
            },
          })
        )
      );

      return NextResponse.json({ success: true, preferences: created });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API POST error: ', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, id, status, isApproved } = body;

    if (action === 'updateMentorshipStatus') {
      const updated = await prisma.mentorship.update({
        where: { id },
        data: { status },
        include: {
          student: { include: { user: true } },
          alumni: { include: { user: true } },
        },
      });
      return NextResponse.json({ success: true, connection: updated });
    }

    if (action === 'updateWidgetApproval') {
      const updated = await prisma.widgetSpeak.update({
        where: { id },
        data: { isApproved },
      });
      return NextResponse.json({ success: true, widget: updated });
    }

    if (action === 'verifyAlumni') {
      const updated = await prisma.alumniProfile.update({
        where: { id },
        data: { isVerified: true, profileComplete: 80 },
      });
      return NextResponse.json({ success: true, profile: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API PATCH error: ', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}
