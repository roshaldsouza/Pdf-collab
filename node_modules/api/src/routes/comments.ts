import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { getUserRoleForDocument, canEdit, canView } from "../lib/permissions";

const router = Router();

const createSchema = z.object({
  documentId: z.string(),
  pageNumber: z.number().int().min(1),
  x: z.number(),
  y: z.number(),
  message: z.string().min(1).max(1000),
});

// Create comment (OWNER/EDITOR only)
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { documentId, pageNumber, x, y, message } = parsed.data;

  const role = await getUserRoleForDocument(String(req.userId), documentId);

  if (!role || !canEdit(role)) {
    return res.status(403).json({ error: "No permission to comment" });
  }

  const comment = await prisma.comment.create({
    data: {
      documentId,
      userId: req.userId!,
      pageNumber,
      x,
      y,
      message,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  res.status(201).json({ comment });
});

// List comments (OWNER/EDITOR/VIEWER)
router.get("/:documentId", requireAuth, async (req: AuthRequest, res) => {
    const documentId = String(req.params.documentId);
    const userId = String(req.userId);
  
    const role = await getUserRoleForDocument(userId, documentId);
  
    if (!role || !canView(role)) {
      return res.status(403).json({ error: "No permission to view comments" });
    }
  
    const comments = await prisma.comment.findMany({
      where: { documentId },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  
    res.json({ comments });
  });
  

export default router;
