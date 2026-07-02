import { firestore } from '@/lib/firebaseAdmin';
import { invalidateAlumniCache } from '@/lib/cache';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams.id;

  if (!id) {
    return renderError("Invalid Request", "No verification ID was provided in the link.");
  }

  try {
    const profileRef = firestore.collection('alumni_profiles').doc(id);
    const doc = await profileRef.get();

    if (!doc.exists) {
      return renderError("Profile Not Found", "The alumni profile associated with this verification link does not exist.");
    }

    const data = doc.data();
    if (!data) {
      return renderError("Invalid Profile Data", "The alumni profile document contains invalid or empty data.");
    }

    // Update isEmailVerified to true
    await profileRef.update({ isEmailVerified: true });

    // Also update associated widget testimonial if it exists
    const testimonialsQuery = await firestore
      .collection('widget_testimonials')
      .where('alumniProfileId', '==', id)
      .limit(1)
      .get();
    
    if (!testimonialsQuery.empty) {
      const testDoc = testimonialsQuery.docs[0];
      const testData = testDoc.data();
      if (testData && testData.alumni) {
        testData.alumni.isEmailVerified = true;
        await testDoc.ref.update({ alumni: testData.alumni });
      }
    }

    // Invalidate the cache to ensure the updated status propagates
    invalidateAlumniCache();

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-450 via-teal-400 to-emerald-500"></div>
          
          <div className="mx-auto my-6 h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Email Verified!</h1>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Dear <strong className="text-slate-800">{data.user?.name}</strong>, your email address has been successfully verified for the <span className="font-semibold text-slate-850 text-slate-800">{data.school} Alumni Hub</span>.
          </p>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            Your registration is now submitted to the school coordinator. You will receive an email once the coordinator approves and activates your profile on the school website directory.
          </p>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-block w-full bg-slate-900 hover:bg-slate-850 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-md active:scale-95 text-sm"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Verification error:", err);
    return renderError("Server Error", "An unexpected error occurred during verification. Please try again later.");
  }
}

function renderError(title: string, message: string) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 to-red-500"></div>
        
        <div className="mx-auto my-6 h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          {message}
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-block w-full bg-slate-900 hover:bg-slate-850 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-md active:scale-95 text-sm"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
