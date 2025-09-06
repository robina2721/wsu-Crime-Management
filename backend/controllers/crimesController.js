import {
  listCrimes,
  getCrime,
  createCrime,
  updateCrime,
  deleteCrime,
} from "../../backend/models/crimeModel.js";
import {
  createEvidenceForCrime,
  createWitnessesForCrime,
  getEvidenceByCrime,
  getWitnessesByCrime,
  addStatusUpdate,
  getStatusUpdatesByCrime,
  addCrimeMessage,
  getCrimeMessagesWithAttachments,
  addCrimeMessageAttachment,
  getActiveCaseCountsForOfficers,
} from "../../backend/models/crimeModel.js";
import { listUsers, findUserById } from "../../backend/models/userModel.js";
import {
  notifyCrimeUpdate,
  notifyCrimeMessage,
  notifyStatusUpdate,
} from "../../backend/controllers/realtimeController.js";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getAuthUserId(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const parts = token.split("_");
  return parts.length >= 2 ? parts[1] : null;
}

async function getAuthUser(req) {
  const id = getAuthUserId(req);
  if (!id) return null;
  return await findUserById(id);
}

// List crimes
export async function listHandler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const reportedBy = searchParams.get("reportedBy") || undefined;
    const assignedTo = searchParams.get("assignedTo") || undefined;
    const reports = await listCrimes({ status, category, priority, reportedBy, assignedTo }, limit, offset);
    return NextResponse.json({ success: true, data: { reports, total: reports.length, limit, offset } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

// Get single crime with evidence & witnesses
export async function getHandler(req, params) {
  try {
    const report = await getCrime(params.id);
    if (!report) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    let evidence = await getEvidenceByCrime(report.id).catch(() => []);
    let witnesses = await getWitnessesByCrime(report.id).catch(() => []);
    return NextResponse.json({ success: true, data: { ...report, evidence, witnesses } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

// Create crime
export async function createHandler(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const required = ["title", "description", "category", "location", "dateIncident"];
    for (const k of required) if (!body[k]) return NextResponse.json({ success: false, error: `Missing: ${k}` }, { status: 400 });
    const created = await createCrime({ title: body.title, description: body.description, category: body.category, priority: body.priority || 'medium', location: body.location, dateIncident: body.dateIncident, reportedBy: user.id });
    if (Array.isArray(body.witnesses) && body.witnesses.length) await createWitnessesForCrime(created.id, body.witnesses).catch(() => {});
    if (Array.isArray(body.evidence) && body.evidence.length) await createEvidenceForCrime(created.id, body.evidence, { uploadedBy: user.id }).catch(() => {});
    const evidence = await getEvidenceByCrime(created.id).catch(() => []);
    const witnesses = await getWitnessesByCrime(created.id).catch(() => []);
    const payload = { ...created, evidence, witnesses };
    notifyCrimeUpdate(payload);
    return NextResponse.json({ success: true, data: payload }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

// Update crime
export async function updateHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const current = await getCrime(params.id);
    if (!current) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    const isSupervisor = new Set(["detective_officer","police_head","super_admin"]).has(user.role);
    if (Object.prototype.hasOwnProperty.call(body, 'assignedTo') && !isSupervisor) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    if (user.role === 'preventive_officer' && current.assignedTo !== user.id) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const updates = { ...body };
    if (Object.prototype.hasOwnProperty.call(updates, 'assignedTo') && !Object.prototype.hasOwnProperty.call(updates, 'status')) updates.status = 'assigned';
    const updated = await updateCrime(params.id, updates);
    if (Object.prototype.hasOwnProperty.call(body, 'status')) {
      const upd = await addStatusUpdate(params.id, { status: body.status, notes: body.notes, updatedBy: user.id, isVisibleToCitizen: body.isVisibleToCitizen !== false }).catch(() => null);
      if (upd) notifyStatusUpdate(params.id, upd, { reportedBy: updated.reportedBy, assignedTo: updated.assignedTo });
    }
    notifyCrimeUpdate(updated);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

// Messages list
export async function listMessagesHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const report = await getCrime(params.id);
    if (!report) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const isReporter = report.reportedBy === user.id;
    const isAssigned = report.assignedTo === user.id;
    const isSupervisor = new Set(['detective_officer','police_head','super_admin']).has(user.role);
    if (!(isReporter || isAssigned || isSupervisor)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const messages = await getCrimeMessagesWithAttachments(report.id, 100, 0);
    return NextResponse.json({ success: true, data: { messages, total: messages.length } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes("SQL Server not configured") ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

// Create message (with optional files) - recipient inferred (reporter <-> assigned officer)
export async function createMessageHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const report = await getCrime(params.id);
    if (!report) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const isReporter = report.reportedBy === user.id;
    const isAssigned = report.assignedTo === user.id;
    const isSupervisor = new Set(['detective_officer','police_head','super_admin']).has(user.role);
    if (!(isReporter || isAssigned || isSupervisor)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const contentType = req.headers.get('content-type') || '';
    let messageText = '';
    let files = [];
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const m = form.get('message');
      messageText = typeof m === 'string' ? m : '';
      files = form.getAll('files').filter((f) => typeof f !== 'string');
    } else {
      const body = await req.json().catch(() => ({}));
      messageText = body.message || '';
    }

    if (!messageText) return NextResponse.json({ success: false, error: 'Message required' }, { status: 400 });
    const createdMsg = await addCrimeMessage(report.id, { senderId: user.id, senderRole: user.role, message: messageText });
    const saved = [];
    if (files.length) {
      const dir = path.join(process.cwd(), 'public', 'uploads', 'messages', report.id);
      fs.mkdirSync(dir, { recursive: true });
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`.replace(/\s+/g, '_');
        const filePath = path.join(dir, safeName);
        fs.writeFileSync(filePath, buffer);
        const relUrl = `/uploads/messages/${report.id}/${safeName}`;
        const att = await addCrimeMessageAttachment(createdMsg.id, report.id, { fileName: relUrl, fileType: file.type || null });
        saved.push(att);
      }
    }
    createdMsg.attachments = saved;
    // determine recipient
    const recipientId = user.id === report.reportedBy ? report.assignedTo : report.reportedBy;
    try { notifyCrimeMessage(report.id, { ...createdMsg, reportedBy: report.reportedBy, assignedTo: report.assignedTo, recipientId }); } catch {}
    return NextResponse.json({ success: true, data: createdMsg, message: 'Message sent' }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes('SQL Server not configured') ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

// Upload evidence files
export async function uploadEvidenceHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const report = await getCrime(params.id);
    if (!report) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) return NextResponse.json({ success: false, error: 'Content-Type must be multipart/form-data' }, { status: 400 });
    const form = await req.formData();
    const files = form.getAll('files').filter((f) => typeof f !== 'string');
    if (!files.length) return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 });
    const dir = path.join(process.cwd(), 'public', 'uploads', 'evidence', report.id);
    fs.mkdirSync(dir, { recursive: true });
    const payload = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`.replace(/\s+/g, '_');
      const filePath = path.join(dir, safeName);
      fs.writeFileSync(filePath, buffer);
      const relUrl = `/uploads/evidence/${report.id}/${safeName}`;
      payload.push({ fileName: relUrl, fileType: file.type || null, description: null });
    }
    const saved = await createEvidenceForCrime(report.id, payload, { uploadedBy: user.id });
    try { notifyCrimeUpdate({ ...report, evidence: await getEvidenceByCrime(report.id) }); } catch {}
    return NextResponse.json({ success: true, data: saved, message: 'Evidence uploaded' }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes('SQL Server not configured') ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

// list active officers (for assignment)
export async function listActiveOfficersHandler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const roleFilters = ['preventive_officer','detective_officer'];
    const officers = [];
    for (const role of roleFilters) {
      const rows = await listUsers(limit, offset, { role, isActive: true });
      officers.push(...rows);
    }
    const ids = officers.map(u => u.id);
    const activeCounts = await getActiveCaseCountsForOfficers(ids);
    const items = officers.map(u => ({ id: u.id, name: u.fullName || u.username, role: u.role, activeCases: activeCounts[u.id] || 0 }));
    return NextResponse.json({ success: true, data: { officers: items, total: items.length, limit, offset } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes('SQL Server not configured') ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

// contact officer explicitly (recipient param optional)
export async function contactOfficerHandler(req, params) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const report = await getCrime(params.id);
    if (!report) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const contentType = req.headers.get('content-type') || '';
    let messageText = '';
    let files = [];
    let recipientId = null;

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const m = form.get('message');
      messageText = typeof m === 'string' ? m : '';
      recipientId = form.get('recipientId') || null;
      files = form.getAll('files').filter((f) => typeof f !== 'string');
    } else {
      const body = await req.json().catch(() => ({}));
      messageText = body.message || '';
      recipientId = body.recipientId || null;
    }

    if (!recipientId) recipientId = user.id === report.reportedBy ? report.assignedTo : report.reportedBy;
    if (!recipientId) return NextResponse.json({ success: false, error: 'No recipient available' }, { status: 400 });

    const isReporter = report.reportedBy === user.id;
    const isAssigned = report.assignedTo === user.id;
    const isSupervisor = new Set(['detective_officer','police_head','super_admin']).has(user.role);
    if (!(isReporter || isAssigned || isSupervisor)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const createdMsg = await addCrimeMessage(report.id, { senderId: user.id, senderRole: user.role, message: messageText || '' });
    const saved = [];
    if (files.length) {
      const dir = path.join(process.cwd(), 'public', 'uploads', 'messages', report.id);
      fs.mkdirSync(dir, { recursive: true });
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`.replace(/\s+/g, '_');
        const filePath = path.join(dir, safeName);
        fs.writeFileSync(filePath, buffer);
        const relUrl = `/uploads/messages/${report.id}/${safeName}`;
        const att = await addCrimeMessageAttachment(createdMsg.id, report.id, { fileName: relUrl, fileType: file.type || null });
        saved.push(att);
      }
    }
    createdMsg.attachments = saved;
    try { notifyCrimeMessage(report.id, { ...createdMsg, reportedBy: report.reportedBy, assignedTo: report.assignedTo, recipientId }); } catch {}
    return NextResponse.json({ success: true, data: createdMsg, message: 'Message sent' }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = msg.includes('SQL Server not configured') ? 503 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
