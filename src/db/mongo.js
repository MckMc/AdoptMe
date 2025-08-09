import 'dotenv/config';
import mongoose from 'mongoose';

export async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('MongoDB conectado');
}
