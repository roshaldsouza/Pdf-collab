import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import meRoutes from "./routes/me";
import path from "path";
import documentRoutes from "./routes/documents";
import shareRoutes from "./routes/shares";
import commentRoutes from "./routes/comments";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "API running 🚀" });
});
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/shares", shareRoutes);
app.use("/auth", authRoutes);
app.use("/me", meRoutes);
app.use("/documents", documentRoutes);
app.use("/comments", commentRoutes);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
