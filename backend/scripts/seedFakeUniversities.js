const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const User = require('../src/models/User');
const UniversityProfile = require('../src/models/UniversityProfile');

const universities = [
  {
    email: 'admissions@northbridge-university.test',
    password: '12345678',
    profile: {
      universityName: 'Northbridge University',
      country: 'United Kingdom',
      description: 'Top university focused on engineering and computer science.',
      requirements: 'GPA 3.4+, English B2+, project portfolio preferred.',
      isVerified: true,
    },
  },
  {
    email: 'admissions@eurotech-institute.test',
    password: '12345678',
    profile: {
      universityName: 'EuroTech Institute',
      country: 'Germany',
      description: 'Applied technology programs with strong industry internships.',
      requirements: 'GPA 3.2+, motivation letter, 1 recommendation.',
      isVerified: true,
    },
  },
  {
    email: 'admissions@pacific-state-college.test',
    password: '12345678',
    profile: {
      universityName: 'Pacific State College',
      country: 'Canada',
      description: 'International-friendly programs in AI, data, and business.',
      requirements: 'GPA 3.0+, English B1+, interview after pre-selection.',
      isVerified: true,
    },
  },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(uri);

  for (const item of universities) {
    let user = await User.findOne({ email: item.email.toLowerCase() }).select('+password');

    if (!user) {
      user = await User.create({
        role: 'university',
        email: item.email.toLowerCase(),
        password: item.password,
        isVerified: true,
      });
    }

    await UniversityProfile.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id, ...item.profile },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${universities.length} fake universities`);
  await mongoose.disconnect();
}

run()
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  });
