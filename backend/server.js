import express from "express";
import mongoose from "mongoose";
import authenticationRoutes from "./routes/authenticationRoute.js";
import cors from "cors";
const PORT = process.env.PORT || 5000;
const mongoUrl = process.env.MONGO_URL;
const app = express();

app.use(express.json());
app.use(cors());

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit if DB connection fails
  }
};

app.use("/", authenticationRoutes);

connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
