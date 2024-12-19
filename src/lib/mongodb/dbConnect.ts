import mongoose from 'mongoose';



if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

interface Connection {
  isConnected?: number;
}

const connection: Connection = {}

async function dbConnect() {
  try {
    if (connection.isConnected) {
      return;
    }

    const db = await mongoose.connect(process.env.MONGODB_URI!);
    connection.isConnected = db.connections[0].readyState;
    
    console.log('MongoDB Connected');

  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect;