import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { upload } from "../lib/upload";
import { canView, getUserRoleForDocument } from "../lib/permissions";

const router = Router();

// Upload PDF
// Upload PDF
router.post(
    "/upload",
    requireAuth,
    upload.single("file"),
    async (req: AuthRequest, res) => {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
      const title = (req.body.title as string) || req.file.originalname;
  
      const doc = await prisma.document.create({
        data: {
          ownerId: req.userId!,
          title,
          fileUrl: `/uploads/${req.file.filename}`,
          fileName: req.file.originalname,
          fileSize: req.file.size,
        },
      });
  
      // ✅ ADD THIS (owner share entry)
      await prisma.documentShare.create({
        data: {
          documentId: doc.id,
          userId: req.userId!,
          role: "OWNER",
        },
      });
  
      res.status(201).json({ document: doc });
    }
  );
  

// List user documents (dashboard)
router.get("/", requireAuth, async (req: AuthRequest, res) => {
    const shares = await prisma.documentShare.findMany({
      where: { userId: req.userId },
      include: { document: true },
      orderBy: { createdAt: "desc" },
    });
  
    const documents = shares.map((s: { role: string; document: any }) => ({
      ...s.document,
      myRole: s.role,
    }));
  
    res.json({ documents });
  });
  
// Get single document (secure)
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
    const documentId = String(req.params.id);
    const userId = String(req.userId);
  
    const role = await getUserRoleForDocument(userId, documentId);
  
    if (!role || !canView(role)) {
      return res.status(403).json({ error: "No permission to access this document" });
    }
  
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });
  
    if (!doc) return res.status(404).json({ error: "Document not found" });
  
    res.json({ document: doc, myRole: role });
  });
  
export default router;
