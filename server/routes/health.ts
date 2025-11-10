/**
 * Health Insights Routes
 * Handles AI-powered health insights and summaries
 */

import { Router, type Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { OpenAIService } from "../services/openaiService";

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/health/insights
 * Get overall health summary based on all user documents
 */
router.get("/insights", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    console.log(`[Health Insights] Fetching health summary for user ${userId}`);

    // Get all user documents
    const documents = await storage.getDocumentsByUserId(userId);
    
    if (!documents || documents.length === 0) {
      return res.json({
        success: true,
        insight: {
          status: "good",
          message: "No documents available. Upload lab reports to get started with AI health insights.",
        },
      });
    }

    // Filter documents that have extracted text
    const documentsWithText = documents
      .filter((doc: any) => doc.extractedText && doc.extractedText.trim().length > 0)
      .map((doc: any) => ({
        type: doc.type,
        extractedText: doc.extractedText || "",
        date: doc.date ? new Date(doc.date).toISOString() : undefined,
        title: doc.title,
      }));

    if (documentsWithText.length === 0) {
      return res.json({
        success: true,
        insight: {
          status: "good",
          message: "Documents uploaded but no text extracted yet. Please wait for processing to complete.",
        },
      });
    }

    // Generate health summary using OpenAI
    const summary = await OpenAIService.generateHealthSummary(documentsWithText);

    res.json({
      success: true,
      insight: summary,
    });
  } catch (error: any) {
    console.error("[Health Insights] Error generating health summary:", error);
    next(error);
  }
});

export default router;

