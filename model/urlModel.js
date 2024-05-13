import dontenv from "dotenv";
dontenv.config();
import mongoose from "mongoose";

try {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} catch (error) {
  console.log(error);
}

const urlSchema = new mongoose.Schema({
  short_url: String,
  originalUrl: String,
  requestCount: Number,
});

export const Url = mongoose.model("Url", urlSchema);
