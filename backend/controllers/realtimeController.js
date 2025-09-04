import { NextResponse } from "next/server";
import { findUserById } from "../../backend/models/userModel.js";

const subscribersByUser = new Map(); // userId => Set<Response>

function getAuthUserIdFromToken(token) {
  if (!token) return null;
  const parts = token.split("_");
  return parts.length >= 2 ? parts[1] : null;
}

export async function crimesStreamHandler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenParam = searchParams.get("token");
    const headerToken = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    const token = tokenParam || headerToken || "";
    const userId = getAuthUserIdFromToken(token);
    if (!userId)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const user = await findUserById(userId);
    if (!user)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        function sendEvent(data) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        }
        // Register subscriber
        const subs = subscribersByUser.get(userId) || new Set();
        const subscriber = { send: sendEvent };
        subs.add(subscriber);
        subscribersByUser.set(userId, subs);

        // Send hello and keepalive
        sendEvent({ type: "connected", time: Date.now() });
        const keepalive = setInterval(
          () => sendEvent({ type: "ping", time: Date.now() }),
          25000,
        );

        // Cleanup on close
        controller._cleanup = () => {
          clearInterval(keepalive);
          const s = subscribersByUser.get(userId);
          if (s) {
            s.delete(subscriber);
            if (s.size === 0) subscribersByUser.delete(userId);
          }
        };
      },
      cancel() {},
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export function notifyCrimeUpdate(crime) {
  try {
    const recipients = new Set();
    if (crime?.reportedBy) recipients.add(crime.reportedBy);
    if (crime?.assignedTo) recipients.add(crime.assignedTo);
    for (const userId of recipients) {
      const subs = subscribersByUser.get(userId);
      if (!subs || subs.size === 0) continue;
      for (const sub of subs) {
        try {
          sub.send({ type: "crime_update", data: crime });
        } catch {}
      }
    }
  } catch {}
}

export function notifyCrimeMessage(crimeId, message) {
  try {
    const recipients = new Set();
    if (message?.senderId) recipients.add(message.senderId);
    if (message?.recipientId) recipients.add(message.recipientId);
    // also notify reporter and assigned (if provided on message)
    if (message?.reportedBy) recipients.add(message.reportedBy);
    if (message?.assignedTo) recipients.add(message.assignedTo);
    for (const userId of recipients) {
      const subs = subscribersByUser.get(userId);
      if (!subs || subs.size === 0) continue;
      for (const sub of subs) {
        try {
          sub.send({ type: "crime_message", data: { crimeId, message } });
        } catch {}
      }
    }
  } catch {}
}

export function notifyStatusUpdate(crimeId, update, audience) {
  try {
    const recipients = new Set();
    if (audience?.reportedBy) recipients.add(audience.reportedBy);
    if (audience?.assignedTo) recipients.add(audience.assignedTo);
    for (const userId of recipients) {
      const subs = subscribersByUser.get(userId);
      if (!subs || subs.size === 0) continue;
      for (const sub of subs) {
        try {
          sub.send({ type: "status_update", data: { crimeId, update } });
        } catch {}
      }
    }
  } catch {}
}

export async function incidentsStreamHandler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenParam = searchParams.get("token");
    const headerToken = req.headers.get("authorization")?.replace("Bearer ", "");
    const token = tokenParam || headerToken || "";
    const userId = getAuthUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const user = await findUserById(userId);
    if (!user)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        function sendEvent(data) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }
        const subs = subscribersByUser.get(userId) || new Set();
        const subscriber = { send: sendEvent };
        subs.add(subscriber);
        subscribersByUser.set(userId, subs);
        sendEvent({ type: "connected", time: Date.now() });
        const keepalive = setInterval(() => sendEvent({ type: "ping", time: Date.now() }), 25000);
        controller._cleanup = () => {
          clearInterval(keepalive);
          const s = subscribersByUser.get(userId);
          if (s) {
            s.delete(subscriber);
            if (s.size === 0) subscribersByUser.delete(userId);
          }
        };
      },
      cancel() {},
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export function notifyIncidentUpdate(incident) {
  try {
    for (const subs of subscribersByUser.values()) {
      if (!subs || subs.size === 0) continue;
      for (const sub of subs) {
        try {
          sub.send({ type: "incident_update", data: incident });
        } catch {}
      }
    }
  } catch {}
}
