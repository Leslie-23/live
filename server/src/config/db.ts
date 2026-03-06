import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI!;
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 10000, // 10s
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB connected → ${uri}`);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}
