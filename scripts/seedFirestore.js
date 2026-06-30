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

// Helper to clear a collection in Firestore
async function deleteCollection(collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(query, resolve, reject) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function main() {
  console.log('Clearing Firestore collections...');
  await deleteCollection('users');
  await deleteCollection('alumni_profiles');
  await deleteCollection('student_profiles');
  await deleteCollection('mentorship_connections');
  await deleteCollection('events');
  await deleteCollection('widget_testimonials');

  console.log('Seeding CCGS Group Admin...');
  const adminUserRef = db.collection('users').doc('admin_ccgs');
  await adminUserRef.set({
    email: 'nldimsr@yopmail.com',
    name: 'CCGS Group Admin',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
  });

  const cchsAlumni = [
    { name: "Priya Singh", email: "priya.singh@cchsalumni.org", batch: 2012, program: "Science", company: "Google", role: "Software Engineer", industry: "Tech", country: "United Kingdom", city: "London", lat: 51.5074, lng: -0.1278, skills: "Go, Kubernetes, Cloud Architecture", isMentor: true, testimonial: "CCHS laid the foundation of my engineering career.", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120" },
    { name: "Dr. Aakash Sharma", email: "aakash.sharma@cchsalumni.org", batch: 2010, program: "Science", company: "AIIMS", role: "Cardiologist", industry: "Medicine", country: "India", city: "New Delhi", lat: 28.6139, lng: 77.209, skills: "Cardiology, Heart Surgery", isMentor: true, testimonial: "The discipline at school guided me through medical studies.", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120" },
    { name: "Rajat Verma", email: "rajat.verma@cchsalumni.org", batch: 2015, program: "Humanities", company: "Govt of Rajasthan", role: "IAS Officer", industry: "Civil Services", country: "India", city: "Jaipur", lat: 26.9124, lng: 75.7873, skills: "Public Policy, Administration", isMentor: false, testimonial: "School debates built my confidence in governance.", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120" },
    { name: "Neha Gupta", email: "neha.gupta@cchsalumni.org", batch: 2018, program: "Commerce", company: "EcoTech Solutions", role: "Founder & CEO", industry: "Entrepreneurship", country: "India", city: "Mumbai", lat: 19.076, lng: 72.8777, skills: "Sustainability, Business Strategy, Startups", isMentor: true, testimonial: "Building my startup was fueled by the support of our alumni.", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120" },
    { name: "Amit Patel", email: "amit.patel@cchsalumni.org", batch: 2011, program: "Science", company: "Microsoft", role: "Senior Principal Engineer", industry: "Tech", country: "United States", city: "Seattle", lat: 47.6062, lng: -122.3321, skills: "Distributed Systems, C#, Azure", isMentor: true, testimonial: "Our computer labs back in 2011 inspired me to code.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120" },
    { name: "Dr. Shruti Iyer", email: "shruti.iyer@cchsalumni.org", batch: 2013, program: "Science", company: "Fortis Healthcare", role: "Pediatrician", industry: "Medicine", country: "India", city: "Bangalore", lat: 12.9716, lng: 77.5946, skills: "Pediatrics, Child Nutrition", isMentor: true, testimonial: "Grateful to the teachers who mentored me.", avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=120" },
    { name: "Major Vikram Rathore", email: "vikram.rathore@cchsalumni.org", batch: 2009, program: "Science", company: "Indian Air Force", role: "Squadron Leader", industry: "Civil Services", country: "India", city: "Pune", lat: 18.5204, lng: 73.8567, skills: "Defense Strategy, Aviation", isMentor: false, testimonial: "Serving the nation started in the school NCC wing.", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120" },
    { name: "Siddharth Jain", email: "siddharth.jain@cchsalumni.org", batch: 2014, program: "Commerce", company: "FinLeap Ventures", role: "Co-Founder", industry: "Entrepreneurship", country: "Singapore", city: "Singapore", lat: 1.3521, lng: 103.8198, skills: "Fintech, Venture Capital", isMentor: true, testimonial: "Glad to help MBA and finance aspirants.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120" },
    { name: "Karan Johar", email: "karan.johar@cchsalumni.org", batch: 2016, program: "Science", company: "Adobe", role: "Director of Product Management", industry: "Tech", country: "United States", city: "San Jose", lat: 37.3382, lng: -121.8863, skills: "Product Lifecycle, Design Thinking", isMentor: true, testimonial: "Proud to represent CCHS on the global tech stage.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120" },
    { name: "Dr. Rohan Basu", email: "rohan.basu@cchsalumni.org", batch: 2011, program: "Science", company: "Tata Memorial", role: "Resident Oncologist", industry: "Medicine", country: "India", city: "Mumbai", lat: 19.076, lng: 72.8777, skills: "Oncology Research, Surgery", isMentor: true, testimonial: "The value of service was taught here.", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120" },
    { name: "Aditi Rao", email: "aditi.rao@cchsalumni.org", batch: 2017, program: "Commerce", company: "Income Tax Department", role: "Assistant Commissioner", industry: "Civil Services", country: "India", city: "Chennai", lat: 13.0827, lng: 80.2707, skills: "Tax Laws, Public Finance", isMentor: false, testimonial: "A dedicated foundation shapes your career.", avatar: "https://images.unsplash.com/photo-1534751516642-a131ffd107fd?auto=format&fit=crop&q=80&w=120" },
    { name: "Varun Mehta", email: "varun.mehta@cchsalumni.org", batch: 2015, program: "Commerce", company: "Zenith Capital", role: "Partner & Investor", industry: "Entrepreneurship", country: "United Arab Emirates", city: "Dubai", lat: 25.2048, lng: 55.2708, skills: "Private Equity, Scaleups", isMentor: true, testimonial: "Always connect back with your roots.", avatar: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=120" },
    { name: "Gaurav Sen", email: "gaurav.sen@cchsalumni.org", batch: 2013, program: "Science", company: "System Design Academy", role: "Lead Educator", industry: "Tech", country: "India", city: "Noida", lat: 28.5355, lng: 77.391, skills: "System Design, Microservices", isMentor: true, testimonial: "Happy to support student coding initiatives.", avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=120" },
    { name: "Meera Nair", email: "meera.nair@cchsalumni.org", batch: 2019, program: "Humanities", company: "BBC News", role: "Foreign Correspondent", industry: "Humanities", country: "United Kingdom", city: "London", lat: 51.5074, lng: -0.1278, skills: "Journalism, Media Relations", isMentor: false, testimonial: "Curiosity and storytelling were nurtured at CCHS.", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=120" },
    { name: "Akshay Kumar", email: "akshay.kumar@cchsalumni.org", batch: 2012, program: "Commerce", company: "Deloitte", role: "Consulting Director", industry: "Entrepreneurship", country: "Canada", city: "Toronto", lat: 43.6532, lng: -79.3832, skills: "Enterprise Consulting, Audits", isMentor: true, testimonial: "CCHS shaped my outlook toward global finance.", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120" }
  ];

  const ccwsAlumni = [
    { name: "Vikram Malhotra", email: "vikram.malhotra@ccwsalumni.org", batch: 2011, program: "Science", company: "Tesla", role: "Autopilot Systems Lead", industry: "Tech", country: "United States", city: "Palo Alto", lat: 37.4419, lng: -122.143, skills: "C++, Autonomous Driving, AI", isMentor: true, testimonial: "CCWS robotics club got me interested in vehicles.", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120" },
    { name: "Dr. Ananya Ray", email: "ananya.ray@ccwsalumni.org", batch: 2013, program: "Science", company: "Mayo Clinic", role: "Clinical Oncologist", industry: "Medicine", country: "United States", city: "Rochester", lat: 44.0234, lng: -92.4629, skills: "Oncology, Immunotherapy", isMentor: true, testimonial: "CCWS teachers pushed me to ask complex scientific questions.", avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=120" },
    { name: "Rohan Khanna", email: "rohan.khanna@ccwsalumni.org", batch: 2014, program: "Humanities", company: "Ministry of External Affairs", role: "Diplomatic Attache", industry: "Civil Services", country: "India", city: "New Delhi", lat: 28.6139, lng: 77.209, skills: "International Relations, Foreign Policy", isMentor: false, testimonial: "CCWS Model United Nations shaped my diplomatic career.", avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=120" },
    { name: "Tanya Sen", email: "tanya.sen@ccwsalumni.org", batch: 2016, program: "Commerce", company: "Organic Bloom", role: "Co-Founder & CEO", industry: "Entrepreneurship", country: "India", city: "Pune", lat: 18.5204, lng: 73.8567, skills: "E-Commerce, Sustainable Retail, Logistics", isMentor: true, testimonial: "The entrepreneurship fairs at school gave me real sales test cases.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120" },
    { name: "Abhishek Das", email: "abhishek.das@ccwsalumni.org", batch: 2012, program: "Science", company: "Meta", role: "Staff Software Engineer", industry: "Tech", country: "United States", city: "Menlo Park", lat: 37.453, lng: -122.1817, skills: "React, Web Performance, GraphQL", isMentor: true, testimonial: "Next-gen tech roots began in the CCWS computing club.", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=120" },
    { name: "Dr. Kabir Grover", email: "kabir.grover@ccwsalumni.org", batch: 2010, program: "Science", company: "Max Healthcare", role: "Pediatric Surgeon", industry: "Medicine", country: "India", city: "Mumbai", lat: 19.076, lng: 72.8777, skills: "Pediatric Surgery, Emergency Care", isMentor: true, testimonial: "My desire to serve the community was cultivated at CCWS.", avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120" },
    { name: "Kunal Kapoor", email: "kunal.kapoor@ccwsalumni.org", batch: 2015, program: "Humanities", company: "IPS Officer", role: "Superintendent of Police", industry: "Civil Services", country: "India", city: "Shimla", lat: 31.1048, lng: 77.1734, skills: "Law Enforcement, Crime Prevention", isMentor: false, testimonial: "Physical training and sports at CCWS laid my foundation.", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120" },
    { name: "Divya Reddy", email: "divya.reddy@ccwsalumni.org", batch: 2017, program: "Commerce", company: "Reddy Capital Partners", role: "Managing Director", industry: "Entrepreneurship", country: "India", city: "Hyderabad", lat: 17.385, lng: 78.4867, skills: "Angel Investing, Portfolio Analysis", isMentor: true, testimonial: "Finance classes at CCWS made numbers fun.", avatar: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&q=80&w=120" },
    { name: "Siddharth Goel", email: "siddharth.goel@ccwsalumni.org", batch: 2011, program: "Science", company: "Apple", role: "Principal Hardware Designer", industry: "Tech", country: "United States", city: "Cupertino", lat: 37.323, lng: -122.0322, skills: "Silicon Architecture, VLSI, Hardware Testing", isMentor: true, testimonial: "Grateful to CCWS labs for letting us experiment.", avatar: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&q=80&w=120" },
    { name: "Dr. Nidhi Shah", email: "nidhi.shah@ccwsalumni.org", batch: 2012, program: "Science", company: "NHS Trust", role: "General Practitioner", industry: "Medicine", country: "United Kingdom", city: "Manchester", lat: 53.4808, lng: -2.2426, skills: "GP Consultation, Family Medicine", isMentor: true, testimonial: "CCWS values of care and empathy shaped my medical practice.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120" },
    { name: "Aditya Nair", email: "aditya.nair@ccwsalumni.org", batch: 2018, program: "Commerce", company: "Ernst & Young", role: "Senior Tax Consultant", industry: "Civil Services", country: "United Kingdom", city: "London", lat: 51.5074, lng: -0.1278, skills: "Corporate Taxation, Auditing", isMentor: false, testimonial: "The strong mathematical foundation at CCWS helped my tax career.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" },
    { name: "Maya Joshi", email: "maya.joshi@ccwsalumni.org", batch: 2015, program: "Commerce", company: "Scale Ventures", role: "Managing Partner", industry: "Entrepreneurship", country: "Germany", city: "Berlin", lat: 52.52, lng: 13.405, skills: "Venture Financing, Incubators", isMentor: true, testimonial: "The alumni support structure is crucial for our group growth.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" },
    { name: "Zeeshan Ali", email: "zeeshan.ali@ccwsalumni.org", batch: 2013, program: "Science", company: "Stripe", role: "Lead Security Engineer", industry: "Tech", country: "Singapore", city: "Singapore", lat: 1.3521, lng: 103.8198, skills: "Network Security, Cryptography", isMentor: true, testimonial: "Shoutout to my math teachers at CCWS for the cryptography baseline.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120" },
    { name: "Pooja Hegde", email: "pooja.hegde@ccwsalumni.org", batch: 2019, program: "Humanities", company: "The New York Times", role: "Associate Editor", industry: "Humanities", country: "United States", city: "New York", lat: 40.7128, lng: -74.006, skills: "Editorial Design, Copywriting", isMentor: false, testimonial: "Creative writing courses at CCWS were stellar.", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=120" },
    { name: "Rohan Deshmukh", email: "rohan.deshmukh@ccwsalumni.org", batch: 2012, program: "Commerce", company: "KPMG", role: "Risk Advisory Partner", industry: "Entrepreneurship", country: "Australia", city: "Sydney", lat: -33.8688, lng: 151.2093, skills: "Business Risk Audit, Analytics", isMentor: true, testimonial: "CCWS alumni network helped me secure my first role in Australia.", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120" }
  ];

  const pendingAlumni = [
    { name: "Suresh Raina", email: "suresh.raina@yopmail.com", batch: 2022, program: "Commerce", company: "Infosys", role: "Systems Associate", industry: "Tech", country: "India", city: "Chennai", lat: 13.0827, lng: 80.2707, skills: "Java, Spring Boot", isMentor: false, school: "CCHS", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120" },
    { name: "Rohit Sharma", email: "rohit.sharma@yopmail.com", batch: 2021, program: "Science", company: "Tata Motors", role: "Graduate Engineer Trainee", industry: "Engineering", country: "India", city: "Pune", lat: 18.5204, lng: 73.8567, skills: "SolidWorks, CAD", isMentor: false, school: "CCWS", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120" }
  ];

  const seededCchsProfiles = [];
  console.log('Seeding CCHS verified alumni...');
  for (const item of cchsAlumni) {
    const userRef = db.collection('users').doc();
    const userId = userRef.id;
    await userRef.set({
      email: item.email,
      name: item.name,
      role: 'ALUMNI',
      avatarUrl: item.avatar,
    });

    const profileRef = db.collection('alumni_profiles').doc();
    const profileId = profileRef.id;
    const profileData = {
      id: profileId,
      userId,
      batch: item.batch,
      program: item.program,
      company: item.company,
      role: item.role,
      industry: item.industry,
      country: item.country,
      city: item.city,
      latitude: item.lat,
      longitude: item.lng,
      skills: item.skills,
      isMentor: item.isMentor,
      profileComplete: 90,
      school: "CCHS",
      isVerified: true,
      user: {
        id: userId,
        email: item.email,
        name: item.name,
        role: 'ALUMNI',
        avatarUrl: item.avatar
      }
    };
    await profileRef.set(profileData);
    seededCchsProfiles.push(profileData);

    const testimonialRef = db.collection('widget_testimonials').doc();
    await testimonialRef.set({
      id: testimonialRef.id,
      alumniProfileId: profileId,
      quote: item.testimonial,
      isApproved: true,
      alumni: profileData
    });
  }

  const seededCcwsProfiles = [];
  console.log('Seeding CCWS verified alumni...');
  for (const item of ccwsAlumni) {
    const userRef = db.collection('users').doc();
    const userId = userRef.id;
    await userRef.set({
      email: item.email,
      name: item.name,
      role: 'ALUMNI',
      avatarUrl: item.avatar,
    });

    const profileRef = db.collection('alumni_profiles').doc();
    const profileId = profileRef.id;
    const profileData = {
      id: profileId,
      userId,
      batch: item.batch,
      program: item.program,
      company: item.company,
      role: item.role,
      industry: item.industry,
      country: item.country,
      city: item.city,
      latitude: item.lat,
      longitude: item.lng,
      skills: item.skills,
      isMentor: item.isMentor,
      profileComplete: 85,
      school: "CCWS",
      isVerified: true,
      user: {
        id: userId,
        email: item.email,
        name: item.name,
        role: 'ALUMNI',
        avatarUrl: item.avatar
      }
    };
    await profileRef.set(profileData);
    seededCcwsProfiles.push(profileData);

    const testimonialRef = db.collection('widget_testimonials').doc();
    await testimonialRef.set({
      id: testimonialRef.id,
      alumniProfileId: profileId,
      quote: item.testimonial,
      isApproved: true,
      alumni: profileData
    });
  }

  console.log('Seeding pending alumni...');
  for (const item of pendingAlumni) {
    const userRef = db.collection('users').doc();
    const userId = userRef.id;
    await userRef.set({
      email: item.email,
      name: item.name,
      role: 'ALUMNI',
      avatarUrl: item.avatar,
    });

    const profileRef = db.collection('alumni_profiles').doc();
    const profileId = profileRef.id;
    const profileData = {
      id: profileId,
      userId,
      batch: item.batch,
      program: item.program,
      company: item.company,
      role: item.role,
      industry: item.industry,
      country: item.country,
      city: item.city,
      latitude: item.lat,
      longitude: item.lng,
      skills: item.skills,
      isMentor: item.isMentor,
      profileComplete: 40,
      school: item.school,
      isVerified: false,
      user: {
        id: userId,
        email: item.email,
        name: item.name,
        role: 'ALUMNI',
        avatarUrl: item.avatar
      }
    };
    await profileRef.set(profileData);
  }

  console.log('Seeding student profiles...');
  const studentData = [
    {
      email: 'aman.gupta@yopmail.com',
      name: 'Aman Gupta',
      batch: 2027,
      program: 'Science',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      preferences: [
        { careerChoice: 'Software Engineer', country: 'United Kingdom', preferenceOrder: 1 },
        { careerChoice: 'IAS Officer', country: 'India', preferenceOrder: 2 },
      ],
    },
    {
      email: 'neha.shah@yopmail.com',
      name: 'Neha Shah',
      batch: 2027,
      program: 'Commerce',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      preferences: [
        { careerChoice: 'Founder & CEO', country: 'United States', preferenceOrder: 1 },
        { careerChoice: 'Oncology', country: 'India', preferenceOrder: 2 },
      ],
    },
  ];

  const seededStudentProfiles = [];
  for (const item of studentData) {
    const userRef = db.collection('users').doc();
    const userId = userRef.id;
    await userRef.set({
      email: item.email,
      name: item.name,
      role: 'STUDENT',
      avatarUrl: item.avatarUrl,
    });

    const profileRef = db.collection('student_profiles').doc();
    const studentProfileId = profileRef.id;
    const studentProfileData = {
      id: studentProfileId,
      userId,
      batch: item.batch,
      program: item.program,
      user: {
        id: userId,
        email: item.email,
        name: item.name,
        role: 'STUDENT',
        avatarUrl: item.avatarUrl
      },
      preferences: item.preferences.map((p, idx) => ({
        id: `${studentProfileId}_pref_${idx}`,
        careerChoice: p.careerChoice,
        country: p.country,
        preferenceOrder: p.preferenceOrder
      }))
    };
    await profileRef.set(studentProfileData);
    seededStudentProfiles.push(studentProfileData);
  }

  console.log('Seeding mentorship requests...');
  const mentorship1Ref = db.collection('mentorship_connections').doc();
  await mentorship1Ref.set({
    id: mentorship1Ref.id,
    studentId: seededStudentProfiles[0].id,
    alumniId: seededCchsProfiles[0].id, // Priya Singh
    status: 'PENDING',
    notes: 'Hello Priya, I am looking to break into Software Engineering in Google. I would appreciate some guidance on my CV!',
    createdAt: new Date().toISOString(),
    student: seededStudentProfiles[0],
    alumni: seededCchsProfiles[0],
  });

  const mentorship2Ref = db.collection('mentorship_connections').doc();
  await mentorship2Ref.set({
    id: mentorship2Ref.id,
    studentId: seededStudentProfiles[1].id,
    alumniId: seededCcwsProfiles[0].id, // Vikram Malhotra
    status: 'ACCEPTED',
    notes: 'Hi Vikram, I am focusing on product and tech roles in electric vehicles. I would love to connect and learn about your career path.',
    createdAt: new Date().toISOString(),
    student: seededStudentProfiles[1],
    alumni: seededCcwsProfiles[0],
  });

  console.log('Seeding events...');
  const event1Ref = db.collection('events').doc();
  await event1Ref.set({
    id: event1Ref.id,
    title: 'Navigating Careers in Tech & Startups',
    description: 'Join Priya Singh (Google) and Tanya Sen (Organic Bloom) for a comprehensive panel discussion on starting your career in finance and tech.',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    location: 'Online Zoom',
    meetingUrl: 'https://zoom.us/j/mockmeetingid123',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
  });

  const event2Ref = db.collection('events').doc();
  await event2Ref.set({
    id: event2Ref.id,
    title: 'Entering the Global Tech Landscape',
    description: 'Learn from alumni settled in San Francisco, London, and Munich on how they cracked top companies.',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
    location: 'Online Google Meet',
    meetingUrl: 'https://meet.google.com/mock-meet-id',
    bannerUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800',
  });

  console.log('Database Seeding successfully completed on Cloud Firestore!');
}

main()
  .catch((e) => {
    console.error('Error during Firestore seeding:', e);
    process.exit(1);
  });
