import mongoose from "mongoose"

const Schema = mongoose.Schema

const dataSchema = new Schema({
  text: {
    type: String,
    required: true
  }
})
export default mongoose.model('Data', dataSchema)