import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import authenticationRoutes from "./routes/authenticationRoute.js";
import cors from "cors";
import MongoStore from "connect-mongo";

const PORT = process.env.PORT || 5000;
const mongoUrl = process.env.MONGO_URL;
const app = express();

app.use(express.json());

// FIXED: Proper CORS configuration for credentials
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // Live Server URL
    credentials: true, // This is crucial for cookies/sessions
    optionsSuccessStatus: 200,
  })
);

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

// session configuration with MongoDB store
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUrl,
      collectionName: "sessions", // Optional: specify collection name
    }),
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true, // Prevent XSS
      sameSite: "lax", // Add this for better cookie handling
    },
  })
);

// session debugging middleware (remove or comment out in production)
app.use((req, res, next) => {
  console.log("=== SESSION DEBUG ===");
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  console.log("Cookies:", req.headers.cookie);
  console.log("====================");
  next();
});

app.use("/", authenticationRoutes);

connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
