import { RequestHandler } from "express";
import { LoginRequest, LoginResponse, User, UserRole } from "../../shared/types";

// Mock database - In production, use a real database like PlanetScale/MySQL
const users: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123', // In production, use hashed passwords
    role: UserRole.SUPER_ADMIN,
    fullName: 'System Administrator',
    email: 'admin@wolaita-sodo.gov.et',
    phone: '+251-911-000-001',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    username: 'police_head',
    password: 'police123',
    role: UserRole.POLICE_HEAD,
    fullName: 'Chief Inspector Dawit Tadesse',
    email: 'chief@wolaita-sodo.gov.et',
    phone: '+251-911-000-002',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '3',
    username: 'detective',
    password: 'detective123',
    role: UserRole.DETECTIVE_OFFICER,
    fullName: 'Detective Sara Alemayehu',
    email: 'detective@wolaita-sodo.gov.et',
    phone: '+251-911-000-003',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '4',
    username: 'officer',
    password: 'officer123',
    role: UserRole.PREVENTIVE_OFFICER,
    fullName: 'Officer Mulugeta Kebede',
    email: 'officer@wolaita-sodo.gov.et',
    phone: '+251-911-000-004',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '5',
    username: 'hr_manager',
    password: 'hr123',
    role: UserRole.HR_MANAGER,
    fullName: 'HR Manager Hanan Mohammed',
    email: 'hr@wolaita-sodo.gov.et',
    phone: '+251-911-000-005',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '6',
    username: 'citizen',
    password: 'citizen123',
    role: UserRole.CITIZEN,
    fullName: 'Citizen Yohannes Bekele',
    email: 'citizen@example.com',
    phone: '+251-911-000-006',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
];

export const handleLogin: RequestHandler = (req, res) => {
  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      const response: LoginResponse = {
        success: false,
        message: 'Username and password are required'
      };
      return res.status(400).json(response);
    }

    // Find user by username
    const user = users.find(u => u.username === username && u.isActive);

    if (!user || user.password !== password) {
      const response: LoginResponse = {
        success: false,
        message: 'Invalid credentials'
      };
      return res.status(401).json(response);
    }

    // Generate a simple token (in production, use JWT)
    const token = `token_${user.id}_${Date.now()}`;

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response: LoginResponse = {
      success: true,
      user: userWithoutPassword as User,
      token,
      message: 'Login successful'
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    const response: LoginResponse = {
      success: false,
      message: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

export const handleLogout: RequestHandler = (req, res) => {
  // In a real implementation, you would invalidate the token
  res.json({ success: true, message: 'Logged out successfully' });
};

export const handleGetProfile: RequestHandler = (req, res) => {
  // In a real implementation, you would verify the token and get user info
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  // Simple token validation (in production, use proper JWT validation)
  const token = authHeader.replace('Bearer ', '');
  const userId = token.split('_')[1];
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
};
