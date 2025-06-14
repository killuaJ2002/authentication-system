import express from "express";
import AuthUser from "../models/AuthUser.js";
import bcrypt from "bcrypt";

const router = express.Router();
const saltRounds = 10;

// signup route
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
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
    res.status(201).json({ message: "New user created" });
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
    res.status(200).json({ message: "login successful" });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
