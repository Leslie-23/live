import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

// ── Helpers ────────────────────────────────────────────────────────────────────

function signToken(id: string): string {
  // Cast needed: @types/jsonwebtoken uses ms's StringValue, not plain string
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "30d") as unknown as number,
  });
}

function userPayload(user: IUser) {
  return {
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    birthDate: user.birthDate,
    gender: user.gender,
    personalityBaseline: user.personalityBaseline,
    onboardingComplete: user.onboardingComplete,
  };
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    res.status(400).json({ message: "fullName, email and password are required" });
    return;
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409).json({ message: "Email already registered" });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ fullName, email, password: hashed });

  res.status(201).json({
    token: signToken(String(user._id)),
    user: userPayload(user),
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  res.json({
    token: signToken(String(user._id)),
    user: userPayload(user),
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

router.get("/me", protect, (req: AuthRequest, res: Response): void => {
  res.json(userPayload(req.user!));
});

export default router;
