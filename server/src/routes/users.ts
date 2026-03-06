import { Router, Response } from "express";
import { protect, AuthRequest } from "../middleware/auth";
import { User } from "../models/User";

const router = Router();

// All /api/users routes require auth
router.use(protect);

// ── POST /api/users/onboarding ────────────────────────────────────────────────

router.post("/onboarding", async (req: AuthRequest, res: Response): Promise<void> => {
  const { username, birthDate, gender, traits, humorStyle, communicationStyle } = req.body;

  if (!username || !birthDate || !gender || !traits?.length || !humorStyle || !communicationStyle) {
    res.status(400).json({ message: "All onboarding fields are required" });
    return;
  }

  // Check username isn't taken by someone else
  const taken = await User.findOne({ username, _id: { $ne: req.user!._id } });
  if (taken) {
    res.status(409).json({ message: "Username already taken" });
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.user!._id,
    {
      username,
      birthDate,
      gender,
      personalityBaseline: { traits, humorStyle, communicationStyle },
      onboardingComplete: true,
    },
    { new: true }
  );

  res.json({
    _id: user!._id,
    fullName: user!.fullName,
    username: user!.username,
    email: user!.email,
    birthDate: user!.birthDate,
    gender: user!.gender,
    personalityBaseline: user!.personalityBaseline,
    onboardingComplete: user!.onboardingComplete,
  });
});

// ── GET /api/users/profile ────────────────────────────────────────────────────

router.get("/profile", (req: AuthRequest, res: Response): void => {
  res.json(req.user);
});

export default router;
