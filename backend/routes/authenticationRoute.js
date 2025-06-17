import express from "express";
import AuthUser from "../models/AuthUser.js";
import bcrypt from "bcrypt";

const router = express.Router();
const saltRounds = 10;

// middleware to check if the user is authenticated
const requireAuth = (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    return next();
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
};

// signup route
router.post("/signup", async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Check if all required fields are present
  if (!email || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ message: "email, password, and confirmPassword are required" });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Password and confirm password do not match" });
  }

  try {
    if (await AuthUser.findOne({ email })) {
      return res.status(409).json({ message: "email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newAuthUser = new AuthUser({
      email,
      password: hashedPassword,
    });
    await newAuthUser.save();

    // Create session after successful signup (auto-login)
    req.session.userId = newAuthUser._id;
    req.session.userEmail = newAuthUser.email;
    req.session.isLoggedIn = true;

    console.log("✅ New user created and logged in:", email);
    console.log("📝 Session created:", req.sessionID);

    res.status(201).json({
      message: "New user created and logged in",
      user: {
        id: newAuthUser._id,
        email: newAuthUser.email,
      },
    });
  } catch (error) {
    console.log("error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

//login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }
  try {
    const existingUser = await AuthUser.findOne({ email });
    const validPassword = existingUser
      ? await bcrypt.compare(password, existingUser.password)
      : await bcrypt.compare(
          password,
          "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
        ); // Fake hash to maintain timing to prevent timing attacks

    if (!existingUser || !validPassword) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    //creating session
    req.session.userId = existingUser._id;
    req.session.userEmail = existingUser.email;
    req.session.isLoggedIn = true;

    console.log("✅ User logged in:", email);
    console.log("📝 Session created:", req.sessionID);

    res.status(200).json({
      message: "login successful",
      user: {
        id: existingUser._id,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// logout route
router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.status(400).json({ message: "No session found" });
  }
  req.session.destroy((err) => {
    if (err) {
      console.log("❌ Logout error:", err.message);
      return res.status(500).json({ message: "logout failed" });
    }

    res.clearCookie("connect.sid"); // Default session cookie name
    console.log("✅ User logged out successfully");
    res.status(200).json({ message: "logged out successfully" });
  });
});

// check session status
router.get("/session-status", (req, res) => {
  if (req.session && req.session.isLoggedIn) {
    res.status(200).json({
      isLoggedIn: true,
      user: {
        id: req.session.userId,
        email: req.session.userEmail,
      },
      sessionId: req.sessionID,
    });
  } else {
    res.status(200).json({
      isLoggedIn: false,
      // Don't include sessionID here
    });
  }
});

//protected route
router.get("/protected", requireAuth, (req, res) => {
  res.status(200).json({
    message: "protected route is accessed",
    user: {
      id: req.session.userId,
      email: req.session.userEmail,
    },
  });
});

// NEW: Get all sessions (for debugging - remove in production)
router.get("/debug/sessions", async (req, res) => {
  try {
    // This requires access to the sessions collection
    const sessions = await mongoose.connection.db
      .collection("sessions")
      .find({})
      .toArray();
    res.json({
      totalSessions: sessions.length,
      sessions: sessions.map((s) => ({
        id: s._id,
        expires: s.expires,
        session: JSON.parse(s.session),
      })),
    });
  } catch (error) {
    console.log("❌ Debug sessions error:", error.message);
    res.status(500).json({ message: "Error fetching sessions" });
  }
});
export default router;
