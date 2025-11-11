/**
 * Emergency Routes
 * Handles emergency card CRUD operations and QR code generation
 */

import { Router, type Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { generateQRToken, generateQRCodeDataURL, generateEmergencyCardURL } from "../services/qrCodeService";

const router = Router();

// Validation schema for emergency card data
const emergencyCardSchema = z.object({
  patientName: z.string().min(1, "Patient name is required").max(100, "Name must be less than 100 characters"),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  currentMedications: z.string().optional(),
  age: z.number().int().positive().max(150).optional(),
  address: z.string().optional(),
});

/**
 * GET /api/emergency/card
 * Get current user's emergency card data
 * Requires authentication
 */
router.get("/card", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const emergencyCard = await storage.getEmergencyCard(req.userId);

    if (!emergencyCard) {
      return res.json({
        success: true,
        card: null,
        message: "No emergency card found. Create one to get started.",
      });
    }

    // Generate QR code URL
    const qrUrl = generateEmergencyCardURL(emergencyCard.qrCodeToken, req);
    const qrCodeDataURL = await generateQRCodeDataURL(qrUrl);

    res.json({
      success: true,
      card: {
        id: emergencyCard.id,
        patientName: emergencyCard.patientName,
        bloodGroup: emergencyCard.bloodGroup,
        allergies: emergencyCard.allergies,
        chronicConditions: emergencyCard.chronicConditions,
        currentMedications: emergencyCard.currentMedications,
        age: emergencyCard.age,
        address: emergencyCard.address,
        qrCodeToken: emergencyCard.qrCodeToken,
        qrCodeDataURL,
        qrUrl,
        updatedAt: emergencyCard.updatedAt,
        createdAt: emergencyCard.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/emergency/card
 * Create or update emergency card data
 * Requires authentication
 */
router.put(
  "/card",
  requireAuth,
  validate(emergencyCardSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const data = req.body;

      // Check if emergency card exists
      const existing = await storage.getEmergencyCard(req.userId);
      let qrCodeToken = existing?.qrCodeToken;

      // Generate new token if card doesn't exist
      if (!qrCodeToken) {
        qrCodeToken = generateQRToken();
      }

      // Create or update emergency card
      const emergencyCard = await storage.createOrUpdateEmergencyCard(req.userId, {
        patientName: data.patientName,
        bloodGroup: data.bloodGroup,
        allergies: data.allergies,
        chronicConditions: data.chronicConditions,
        currentMedications: data.currentMedications,
        age: data.age,
        address: data.address,
        qrCodeToken,
      });

      // Generate QR code
      const qrUrl = generateEmergencyCardURL(emergencyCard.qrCodeToken, req);
      const qrCodeDataURL = await generateQRCodeDataURL(qrUrl);

      res.json({
        success: true,
        message: existing ? "Emergency card updated successfully" : "Emergency card created successfully",
        card: {
          id: emergencyCard.id,
          patientName: emergencyCard.patientName,
          bloodGroup: emergencyCard.bloodGroup,
          allergies: emergencyCard.allergies,
          chronicConditions: emergencyCard.chronicConditions,
          currentMedications: emergencyCard.currentMedications,
          age: emergencyCard.age,
          address: emergencyCard.address,
          qrCodeToken: emergencyCard.qrCodeToken,
          qrCodeDataURL,
          qrUrl,
          updatedAt: emergencyCard.updatedAt,
          createdAt: emergencyCard.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/emergency/qr/:token
 * Public endpoint to view emergency card via QR token
 * No authentication required
 */
router.get("/qr/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "QR token is required",
      });
    }

    const emergencyCard = await storage.getEmergencyCardByToken(token);

    if (!emergencyCard) {
      return res.status(404).json({
        success: false,
        message: "Emergency card not found",
      });
    }

    // Return emergency card data (public access)
    res.json({
      success: true,
      card: {
        patientName: emergencyCard.patientName,
        bloodGroup: emergencyCard.bloodGroup,
        allergies: emergencyCard.allergies,
        chronicConditions: emergencyCard.chronicConditions,
        currentMedications: emergencyCard.currentMedications,
        age: emergencyCard.age,
        address: emergencyCard.address,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/emergency/qr-image/:token
 * Get QR code image for a token
 * No authentication required
 */
router.get("/qr-image/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "QR token is required",
      });
    }

    // Verify token exists
    const emergencyCard = await storage.getEmergencyCardByToken(token);

    if (!emergencyCard) {
      return res.status(404).json({
        success: false,
        message: "Emergency card not found",
      });
    }

    // Generate QR code
    const qrUrl = generateEmergencyCardURL(token, req);
    const qrCodeDataURL = await generateQRCodeDataURL(qrUrl);

    res.json({
      success: true,
      qrCodeDataURL,
      qrUrl,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

