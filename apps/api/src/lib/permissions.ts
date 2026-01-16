import { prisma } from "./prisma";

export async function getUserRoleForDocument(userId: string, documentId: string) {
  const share = await prisma.documentShare.findUnique({
    where: {
      documentId_userId: { documentId, userId },
    },
  });

  return share?.role || null;
}

export function canView(role: string) {
  return role === "OWNER" || role === "EDITOR" || role === "VIEWER";
}

export function canEdit(role: string) {
  return role === "OWNER" || role === "EDITOR";
}

export function isOwner(role: string) {
  return role === "OWNER";
}
