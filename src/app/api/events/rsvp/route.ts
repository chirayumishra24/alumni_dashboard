
import { firestore } from '@/lib/firebaseAdmin';
import { invalidateAlumniCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const responseType = searchParams.get('response'); // ACCEPTED or DECLINED

  if (!id || !responseType || !['ACCEPTED', 'DECLINED'].includes(responseType)) {
    return new Response(renderErrorHTML("Invalid RSVP Link", "The RSVP request contains missing or invalid parameters."), {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  try {
    const rsvpRef = firestore.collection('event_rsvps').doc(id);
    const rsvpDoc = await rsvpRef.get();

    if (!rsvpDoc.exists) {
      return new Response(renderErrorHTML("RSVP Record Not Found", "The RSVP record associated with this link does not exist."), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const rsvpData = rsvpDoc.data();
    if (!rsvpData) {
      return new Response(renderErrorHTML("Invalid RSVP Data", "The RSVP document contains invalid data."), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const eventDoc = await firestore.collection('events').doc(rsvpData.eventId).get();
    const eventData = eventDoc.data();
    const eventTitle = eventData?.title || 'the upcoming event';

    await rsvpRef.update({
      response: responseType,
      respondedAt: new Date().toISOString()
    });

    invalidateAlumniCache();

    return new Response(renderSuccessHTML(rsvpData.alumniName, eventTitle, responseType), {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('RSVP process error:', error);
    return new Response(renderErrorHTML("Server Error", "An unexpected error occurred while processing your RSVP."), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

function renderSuccessHTML(name: string, eventTitle: string, response: string) {
  const isAccepted = response === 'ACCEPTED';
  const themeColor = isAccepted ? '#10b981' : '#64748b';
  const bannerColor = isAccepted ? 'linear-gradient(to-r, #10b981, #059669)' : 'linear-gradient(to-r, #64748b, #475569)';
  
  const icon = isAccepted 
    ? `<svg style="width: 40px; height: 40px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>`
    : `<svg style="width: 40px; height: 40px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>`;

  const headerText = isAccepted ? "RSVP Accepted!" : "RSVP Declined";
  const descText = isAccepted 
    ? `Thank you! You have accepted the invitation to the event: <br/><strong style="color: #0f172a;">${eventTitle}</strong>`
    : `You have declined the invitation to the event: <br/><strong style="color: #0f172a;">${eventTitle}</strong>. If your availability changes, you can re-click the link in your email at any time.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerText}</title>
  <style>
    body {
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 16px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      max-width: 420px;
      width: 100%;
      background: white;
      border-radius: 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      position: relative;
      text-align: center;
      padding: 32px;
    }
    .top-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: ${bannerColor};
    }
    .icon-container {
      margin: 24px auto;
      height: 80px;
      width: 80px;
      border-radius: 50%;
      background-color: ${isAccepted ? '#ecfdf5' : '#f1f5f9'};
      color: ${themeColor};
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid ${isAccepted ? '#d1fae5' : '#e2e8f0'};
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 12px 0;
      letter-spacing: -0.025em;
    }
    p {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .btn {
      display: inline-block;
      width: 100%;
      background-color: #0f172a;
      color: white;
      font-weight: 700;
      text-decoration: none;
      padding: 14px;
      border-radius: 16px;
      font-size: 14px;
      box-sizing: border-box;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #1e293b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="top-bar"></div>
    <div class="icon-container">
      ${icon}
    </div>
    <h1>${headerText}</h1>
    <p>Dear <strong>${name}</strong>,</p>
    <p>${descText}</p>
    <a href="/" class="btn">Go to Homepage</a>
  </div>
</body>
</html>`;
}

function renderErrorHTML(title: string, message: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 16px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      max-width: 420px;
      width: 100%;
      background: white;
      border-radius: 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      position: relative;
      text-align: center;
      padding: 32px;
    }
    .top-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(to-r, #ef4444, #dc2626);
    }
    .icon-container {
      margin: 24px auto;
      height: 80px;
      width: 80px;
      border-radius: 50%;
      background-color: #fef2f2;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #fee2e2;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 12px 0;
      letter-spacing: -0.025em;
    }
    p {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .btn {
      display: inline-block;
      width: 100%;
      background-color: #0f172a;
      color: white;
      font-weight: 700;
      text-decoration: none;
      padding: 14px;
      border-radius: 16px;
      font-size: 14px;
      box-sizing: border-box;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #1e293b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="top-bar"></div>
    <div class="icon-container">
      <svg style="width: 40px; height: 40px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/" class="btn">Go to Homepage</a>
  </div>
</body>
</html>`;
}
