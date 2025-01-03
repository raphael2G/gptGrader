import mongoose from 'mongoose';
import { Course } from '../src/models/Course';
import { User } from '../src/models/User';
import { Assignment } from '../src/models/Assignment';
import { Submission } from '../src/models/Submission';
import { DiscrepancyReport } from '../src/models/DiscrepancyReport';

// Import seed data
import { courses } from './data/courses';
import { users } from './data/users';
import { assignments } from './data/assignments';
import { submissions } from './data/submissions';

// Environment setup
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MongoDB URI is undefined. Make sure your .env file contains MONGODB_URI');
}

// Map of collections and their corresponding seed data
const seedDataMap = [
  { model: Course, data: courses, name: 'courses' },
  { model: User, data: users, name: 'users' },
  { model: Assignment, data: assignments, name: 'assignments' }, // Add assignments when ready
  { model: Submission, data: submissions, name: 'submissions' }, // Add submissions when ready
  // { model: DiscrepancyReport, data: [], name: 'discrepancyReports' }, // Add discrepancy reports when ready
];

/**
 * Resets a single collection by dropping and inserting seed data.
 * @param {mongoose.Model} model - The Mongoose model to reset.
 * @param {Array} data - The seed data for the collection.
 * @param {string} name - The name of the collection.
 */
async function resetCollection(model: mongoose.Model<any>, data: any[], name: string) {
  try {
    console.log(`Resetting ${name}...`);
    await model.deleteMany({});
    if (data.length > 0) {
      await model.insertMany(data);
    }
    console.log(`${name} reset successfully!`);
  } catch (error) {
    console.error(`Error resetting ${name}:`, error);
    throw error;
  }
}

/**
 * Resets the entire database using the seed data.
 */
async function resetDatabase() {
  if (!MONGODB_URI) {
    console.error('MongoDB URI is undefined.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  try {
    for (const { model, data, name } of seedDataMap) {
      await resetCollection(model, data, name);
    }
    console.log('Database reset complete!');
  } catch (error) {
    console.error('Error resetting the database:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Execute the reset script
resetDatabase();
