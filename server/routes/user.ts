/**
 * User Profile Routes
 * Handles user profile, onboarding, and settings
 */

import { Router, type Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/user/profile
 * Get current user profile
 */
router.get("/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    const user = await storage.getUser(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Parse settings JSON
    const settings = user.settings ? JSON.parse(user.settings) : {};

    res.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        address: user.address,
        settings,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/user/profile
 * Update user profile
 */
const updateProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  dateOfBirth: z.string().optional(), // ISO date string
  gender: z.enum(["male", "female", "other"]).optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
});

router.put(
  "/profile",
  validate(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const updateData: any = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.dateOfBirth !== undefined)
        updateData.dateOfBirth = new Date(data.dateOfBirth);
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.bloodGroup !== undefined) updateData.bloodGroup = data.bloodGroup;
      if (data.address !== undefined) updateData.address = data.address;

      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
      const updated = await storage.updateUserProfile(req.userId, updateData);

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          dateOfBirth: updated.dateOfBirth,
          gender: updated.gender,
          bloodGroup: updated.bloodGroup,
          address: updated.address,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/user/onboarding
 * Complete onboarding and save user preferences
 */
const onboardingSchema = z.object({
  language: z.enum(["en", "hi"]).optional(),
  guidedMode: z.boolean().optional(),
  name: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
});

router.post(
  "/onboarding",
  validate(onboardingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure userId is set
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const data = req.body;
      const updateData: any = {
        onboardingCompleted: true,
      };

      // Update profile fields if provided
      if (data.name !== undefined) updateData.name = data.name;
      if (data.dateOfBirth !== undefined)
        updateData.dateOfBirth = new Date(data.dateOfBirth);
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.bloodGroup !== undefined) updateData.bloodGroup = data.bloodGroup;
      if (data.address !== undefined) updateData.address = data.address;

      // Update settings
      if (data.language !== undefined || data.guidedMode !== undefined) {
        await storage.updateUserSettings(req.userId, {
          language: data.language,
          guidedMode: data.guidedMode,
        });
      }

      // Update profile
      const updated = await storage.updateUserProfile(req.userId, updateData);

      if (!updated) {
        return res.status(500).json({
          success: false,
          message: "Failed to update user profile",
        });
      }

      res.json({
        success: true,
        message: "Onboarding completed successfully",
        user: {
          id: updated.id,
          onboardingCompleted: updated.onboardingCompleted,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/user/settings
 * Update user settings (language, guided mode, etc.)
 */
const updateSettingsSchema = z.object({
  language: z.enum(["en", "hi"]).optional(),
  guidedMode: z.boolean().optional(),
});

router.put(
  "/settings",
  validate(updateSettingsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
      const updated = await storage.updateUserSettings(req.userId, req.body);

      const settings = updated.settings ? JSON.parse(updated.settings) : {};

      res.json({
        success: true,
        message: "Settings updated successfully",
        settings,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

