import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGO_URL
  ?? `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PASS)}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=AdoptMe`;

export async function connectMongo() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('Mongo connected:', uri.replace(/:[^@]+@/, ':***@'));
}
