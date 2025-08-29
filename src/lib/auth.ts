import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { User, UserRole } from "./types";
import bcrypt from "bcryptjs";

const key = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function login(formData: FormData) {
  // Verify credentials and get the user
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const user = await verifyCredentials(username, password);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Create the session
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt({ user, expires });

  // Save the session in a cookie
  cookies().set("session", session, { expires, httpOnly: true });
}

export async function logout() {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const res = new Response(null, {
    status: 200,
    headers: {
      "Set-Cookie": `session=${await encrypt(parsed)}; Path=/; HttpOnly`,
    },
  });
  return res;
}

// Mock user database - replace with real database
const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewlMhVkRMV2gfZem", // secret123
    role: UserRole.SUPER_ADMIN,
    fullName: "System Administrator",
    email: "admin@police.gov",
    phone: "+1-234-567-8900",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    username: "police_head",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewlMhVkRMV2gfZem", // secret123
    role: UserRole.POLICE_HEAD,
    fullName: "Chief Johnson",
    email: "chief@police.gov",
    phone: "+1-234-567-8901",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    username: "hr_manager",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewlMhVkRMV2gfZem", // secret123
    role: UserRole.HR_MANAGER,
    fullName: "HR Manager Smith",
    email: "hr@police.gov",
    phone: "+1-234-567-8902",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    username: "detective",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewlMhVkRMV2gfZem", // secret123
    role: UserRole.DETECTIVE_OFFICER,
    fullName: "Detective Wilson",
    email: "detective@police.gov",
    phone: "+1-234-567-8903",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "5",
    username: "officer",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewlMhVkRMV2gfZem", // secret123
    role: UserRole.PREVENTIVE_OFFICER,
    fullName: "Officer Davis",
    email: "officer@police.gov",
    phone: "+1-234-567-8904",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "6",
    username: "citizen",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewlMhVkRMV2gfZem", // secret123
    role: UserRole.CITIZEN,
    fullName: "John Citizen",
    email: "citizen@example.com",
    phone: "+1-234-567-8905",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

async function verifyCredentials(
  username: string,
  password: string,
): Promise<User | null> {
  const user = mockUsers.find((u) => u.username === username);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  // Don't return the password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
}

export function hasRole(
  userRole: UserRole,
  requiredRoles: UserRole[],
): boolean {
  return requiredRoles.includes(userRole);
}

export function hasAnyRole(userRole: UserRole, roles: UserRole[]): boolean {
  return roles.includes(userRole);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  return session.user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();
  if (!hasRole(user.role, roles)) {
    throw new Error("Insufficient permissions");
  }
  return user;
}
