const { initializeApp, cert } = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

const db = getFirestore();

async function addTestAlumni() {
  try {
    console.log('Adding test verified CCHS alumnus...');

    // 1. Create User
    const userRef = db.collection('users').doc('user_rohan_sharma');
    const userData = {
      id: 'user_rohan_sharma',
      email: 'rohan.sharma@cchs.edu.in',
      name: 'Rohan Sharma',
      role: 'ALUMNI',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
    };
    await userRef.set(userData);

    // 2. Create Alumni Profile (Verified)
    const profileRef = db.collection('alumni_profiles').doc('profile_rohan_sharma');
    const profileData = {
      id: 'profile_rohan_sharma',
      userId: 'user_rohan_sharma',
      batch: 2020,
      program: 'Commerce',
      school: 'CCHS',
      company: 'Google',
      role: 'Product Manager',
      industry: 'Product Management',
      country: 'India',
      city: 'Delhi',
      skills: 'Product Strategy, Agile, SQL',
      isVerified: true,
      isMentor: true,
      profileComplete: 90,
      user: userData
    };
    await profileRef.set(profileData);

    // 3. Create approved testimonial
    const testimonialRef = db.collection('widget_testimonials').doc('testimonial_rohan_sharma');
    await testimonialRef.set({
      id: 'testimonial_rohan_sharma',
      alumniProfileId: 'profile_rohan_sharma',
      quote: 'The guidance I received here shaped my career path at Google.',
      isApproved: true,
      alumni: profileData
    });

    console.log('Successfully inserted Rohan Sharma (CCHS, 2020, Product Manager, Google) as verified!');
  } catch (error) {
    console.error('Error inserting test alumni:', error);
  }
}

addTestAlumni();
