/**
 * Consent Routes
 * Handles consent CRUD operations, shareable links, QR codes, and audit logs
 */

import { Router, type Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validation";
import QRCode from "qrcode";

const router = Router();

// Validation schemas
const createConsentSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientRole: z.enum(["doctor", "lab", "insurance", "family", "other"]),
  scopes: z.array(z.enum(["documents", "emergency", "insights", "timeline"])).min(1, "At least one scope is required"),
  durationType: z.enum(["24h", "7d", "custom"]),
  customExpiryDate: z.string().optional(), // ISO date string
  purpose: z.string().min(1, "Purpose is required"),
});

/**
 * POST /api/consents
 * Create new consent
 */
router.post(
  "/",
  requireAuth,
  validate(createConsentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const {
        recipientName,
        recipientRole,
        scopes,
        durationType,
        customExpiryDate,
        purpose,
      } = req.body;

      // Parse custom expiry date if provided
      let customExpiry: Date | undefined;
      if (durationType === "custom" && customExpiryDate) {
        customExpiry = new Date(customExpiryDate);
        if (isNaN(customExpiry.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid custom expiry date",
          });
        }
        // Ensure custom date is in the future
        if (customExpiry <= new Date()) {
          return res.status(400).json({
            success: false,
            message: "Custom expiry date must be in the future",
          });
        }
      }

      // Create consent
      const consent = await storage.createConsent(userId, {
        recipientName,
        recipientRole,
        scopes,
        durationType,
        customExpiryDate: customExpiry,
        purpose,
      });

      // Create audit log for grant action
      await storage.createAuditLog(consent.id, "grant", {
        userId,
        actorType: "user",
        details: {
          recipientName,
          recipientRole,
          scopes,
          durationType,
        },
      });

      res.status(201).json({
        success: true,
        consent,
      });
    } catch (error: any) {
      console.error("[Consents] Error creating consent:", error);
      next(error);
    }
  }
);

/**
 * GET /api/consents
 * List user's consents (filter by status)
 */
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const status = req.query.status as string | undefined;
    const filters = status ? { status } : undefined;

    const consents = await storage.getConsents(userId, filters);

    res.json({
      success: true,
      consents,
    });
  } catch (error: any) {
    console.error("[Consents] Error fetching consents:", error);
    next(error);
  }
});

/**
 * GET /api/consents/:id
 * Get consent details
 */
router.get("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;
    const consent = await storage.getConsent(id);

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: "Consent not found",
      });
    }

    // Verify ownership
    if (consent.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      consent,
    });
  } catch (error: any) {
    console.error("[Consents] Error fetching consent:", error);
    next(error);
  }
});

/**
 * DELETE /api/consents/:id
 * Revoke consent
 */
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;
    const consent = await storage.getConsent(id);

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: "Consent not found",
      });
    }

    // Verify ownership
    if (consent.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Revoke consent
    const revokedConsent = await storage.revokeConsent(id);

    // Create audit log for revoke action
    await storage.createAuditLog(id, "revoke", {
      userId,
      actorType: "user",
      details: {
        reason: "User revoked consent",
      },
    });

    res.json({
      success: true,
      consent: revokedConsent,
    });
  } catch (error: any) {
    console.error("[Consents] Error revoking consent:", error);
    next(error);
  }
});

/**
 * GET /api/consents/:id/audit
 * Get audit logs for consent
 */
router.get("/:id/audit", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;
    const consent = await storage.getConsent(id);

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: "Consent not found",
      });
    }

    // Verify ownership
    if (consent.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const auditLogs = await storage.getAuditLogs(id);

    res.json({
      success: true,
      logs: auditLogs,
    });
  } catch (error: any) {
    console.error("[Consents] Error fetching audit logs:", error);
    next(error);
  }
});

/**
 * GET /api/consents/share/:token/documents/:documentId/file
 * Public endpoint to get document file for a shared consent
 * MUST be defined before /share/:token to avoid route conflicts
 */
router.get("/share/:token/documents/:documentId/file", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, documentId } = req.params;

    const consent = await storage.getConsentByToken(token);

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: "Consent not found or invalid token",
      });
    }

    // Check if expired or revoked
    if (consent.status === "expired" || consent.status === "revoked") {
      return res.status(410).json({
        success: false,
        message: `This consent has been ${consent.status}`,
      });
    }

    // Check scopes
    const scopes = JSON.parse(consent.scopes) as string[];
    if (!scopes.includes("documents") && !scopes.includes("timeline")) {
      return res.status(403).json({
        success: false,
        message: "Documents are not accessible with this consent",
      });
    }

    // Get document
    const document = await storage.getDocument(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Verify document belongs to consent user
    if (document.userId !== consent.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get file URL (similar to documents route)
    // Import SupabaseStorageService for file access
    const { SupabaseStorageService } = await import("../services/supabaseStorage");
    
    if (document.fileUrl && document.fileUrl.includes("documents/")) {
      // Generate signed URL
      const signedUrl = await SupabaseStorageService.createSignedUrl(document.fileUrl, 3600);
      
      res.json({
        success: true,
        url: signedUrl,
        expiresIn: 3600,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "File not found",
      });
    }
  } catch (error: any) {
    console.error("[Consents] Error fetching shared document file:", error);
    next(error);
  }
});

/**
 * GET /api/consents/share/:token/documents
 * Public endpoint to get documents for a shared consent
 * MUST be defined before /share/:token to avoid route conflicts
 */
router.get("/share/:token/documents", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    const consent = await storage.getConsentByToken(token);

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: "Consent not found or invalid token",
      });
    }

    // Check if expired or revoked
    if (consent.status === "expired") {
      return res.status(410).json({
        success: false,
        message: "This consent has expired",
      });
    }

    if (consent.status === "revoked") {
      return res.status(410).json({
        success: false,
        message: "This consent has been revoked",
      });
    }

    // Get user's documents
    const documents = await storage.getDocumentsByUserId(consent.userId);

    // Filter documents based on scopes
    const scopes = JSON.parse(consent.scopes) as string[];
    let accessibleDocuments = documents;

    // If scopes don't include 'documents' or 'timeline', return empty
    if (!scopes.includes("documents") && !scopes.includes("timeline")) {
      accessibleDocuments = [];
    }

    // Return documents without sensitive info
    const sanitizedDocuments = accessibleDocuments.map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      provider: doc.provider,
      date: doc.date,
      fileType: doc.fileType,
      createdAt: doc.createdAt,
    }));

    res.json({
      success: true,
      documents: sanitizedDocuments,
    });
  } catch (error: any) {
    console.error("[Consents] Error fetching shared documents:", error);
    next(error);
  }
});

/**
 * GET /api/consents/share/:token
 * Public endpoint to access shared consent (no auth required)
 */
router.get("/share/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    const consent = await storage.getConsentByToken(token);

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: "Consent not found or invalid token",
      });
    }

    // Check if expired or revoked
    if (consent.status === "expired") {
      return res.status(410).json({
        success: false,
        message: "This consent has expired",
        consent: {
          id: consent.id,
          status: consent.status,
          expiresAt: consent.expiresAt,
        },
      });
    }

    if (consent.status === "revoked") {
      return res.status(410).json({
        success: false,
        message: "This consent has been revoked",
        consent: {
          id: consent.id,
          status: consent.status,
          revokedAt: consent.revokedAt,
        },
      });
    }

    // Create audit log for access
    await storage.createAuditLog(consent.id, "access", {
      actorId: req.ip || "unknown",
      actorType: "recipient",
      details: {
        ip: req.ip,
        userAgent: req.get("user-agent"),
      },
    });

    // Return consent without sensitive user info
    res.json({
      success: true,
      consent: {
        id: consent.id,
        recipientName: consent.recipientName,
        recipientRole: consent.recipientRole,
        scopes: JSON.parse(consent.scopes),
        purpose: consent.purpose,
        expiresAt: consent.expiresAt,
        createdAt: consent.createdAt,
      },
    });
  } catch (error: any) {
    console.error("[Consents] Error accessing shared consent:", error);
    next(error);
  }
});

/**
 * GET /api/consents/:id/qr
 * Generate QR code for consent shareable link
 */
router.get("/:id/qr", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;
    const consent = await storage.getConsent(id);

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: "Consent not found",
      });
    }

    // Verify ownership
    if (consent.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Generate shareable URL
    // Priority: FRONTEND_URL env var > Cloudflare tunnel detection > localhost
    let baseUrl = process.env.FRONTEND_URL;
    
    if (!baseUrl) {
      // Try to detect Cloudflare tunnel URL from environment or use localhost
      // For production, FRONTEND_URL should be set explicitly
      baseUrl = process.env.CLOUDFLARE_TUNNEL_URL || "http://localhost:3000";
    }
    
    // Ensure URL doesn't end with slash
    baseUrl = baseUrl.replace(/\/$/, '');
    const shareableUrl = `${baseUrl}/share/${consent.shareableToken}`;

    // Generate QR code
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(shareableUrl, {
        width: 300,
        margin: 2,
      });

      res.json({
        success: true,
        qrCode: qrCodeDataUrl,
        shareableUrl,
      });
    } catch (qrError: any) {
      console.error("[Consents] Error generating QR code:", qrError);
      return res.status(500).json({
        success: false,
        message: "Failed to generate QR code",
      });
    }
  } catch (error: any) {
    console.error("[Consents] Error fetching QR code:", error);
    next(error);
  }
});

export default router;

