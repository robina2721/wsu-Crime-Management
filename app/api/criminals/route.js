import { createFromParsed, listHandler, requireAdmin } from "../../../backend/controllers/criminalsController.js";
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

async function saveFile(file, filenameBase) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "criminals");
  await fs.mkdir(uploadsDir, { recursive: true });
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = path.extname(file.name) || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext.toLowerCase()) ? ext.toLowerCase() : ".jpg";
  const filename = `${filenameBase}${safeExt}`;
  const finalPath = path.join(uploadsDir, filename);
  await fs.writeFile(finalPath, buffer);
  return `/uploads/criminals/${filename}`;
}

export async function GET(req) {
  return listHandler(req);
}

export async function POST(req) {
  const { error, user } = await requireAdmin(req);
  if (error) return error;

  const form = await req.formData();
  const fullName = form.get("fullName");
  const dateOfBirth = form.get("dateOfBirth");
  const nationalId = form.get("nationalId");
  const address = form.get("address");
  const phone = form.get("phone");
  const riskLevel = form.get("riskLevel") || "low";
  const isActive = (form.get("isActive") || "true") === "true";
  const aliases = form.get("aliases");
  const heightCm = form.get("heightCm");
  const weightKg = form.get("weightKg");
  const eyeColor = form.get("eyeColor");
  const hairColor = form.get("hairColor");
  const photo = form.get("photo");

  if (!fullName) return NextResponse.json({ success: false, error: "Missing fullName" }, { status: 400 });

  let photoPath = null;
  if (photo && typeof photo === "object" && "arrayBuffer" in photo) {
    const ext = path.extname(photo.name).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      return NextResponse.json({ success: false, error: "Unsupported file type" }, { status: 400 });
    }
    const base = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    photoPath = await saveFile(photo, base);
  }

  const payload = {
    fullName: String(fullName),
    dateOfBirth: dateOfBirth ? String(dateOfBirth) : null,
    nationalId: nationalId ? String(nationalId) : null,
    address: address ? String(address) : null,
    phone: phone ? String(phone) : null,
    riskLevel: String(riskLevel),
    isActive: !!isActive,
    aliases: aliases ? String(aliases).split(",").map(s => s.trim()).filter(Boolean) : [],
    heightCm: heightCm ? Number(heightCm) : null,
    weightKg: weightKg ? Number(weightKg) : null,
    eyeColor: eyeColor ? String(eyeColor) : null,
    hairColor: hairColor ? String(hairColor) : null,
    photoPath,
  };
  return createFromParsed(user, payload);
}
