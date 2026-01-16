import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { getUserRoleForDocument, isOwner } from "../lib/permissions";

const router = Router();

const shareSchema = z.object({
  documentId: z.string(),
  email: z.string().email(),
  role: z.enum(["EDITOR", "VIEWER"]),
});

// Owner shares doc to another user
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = shareSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { documentId, email, role } = parsed.data;

  const myRole = await getUserRoleForDocument(req.userId!, documentId);
  if (!myRole || !isOwner(myRole)) {
    return res.status(403).json({ error: "Only owner can share" });
  }

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) return res.status(404).json({ error: "User not found" });

  const share = await prisma.documentShare.upsert({
    where: {
      documentId_userId: { documentId, userId: targetUser.id },
    },
    update: { role },
    create: {
      documentId,
      userId: targetUser.id,
      role,
    },
  });

  res.json({ share });
});

export default router;
