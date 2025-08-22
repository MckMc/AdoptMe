import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  name: { type:String, required:true },
  species: { type:String, required:true },
  birthDate: { type: Date, required:true },
  adopted: { type:Boolean, default:false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref:'User', default: null },
  image: { type: String, default: null },
  description: { type: String, default: '' }

}, { timestamps:true });

export const PetModel = mongoose.model('Pet', petSchema);
