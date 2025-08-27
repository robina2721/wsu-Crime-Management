# Crime Management System - Wolaita Sodo City

A comprehensive, full-stack crime management system designed for Wolaita Sodo City Police Department. Built with React, TypeScript, Express, and modern web technologies.

![Crime Management System](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Express](https://img.shields.io/badge/Express-5-green)

## 🚀 Features

### Core Functionality
- **Multi-Role Authentication**: Support for Super Admin, Police Head, HR Manager, Detective Officer, Preventive Officer, and Citizens
- **Crime Reporting**: Comprehensive crime report filing and tracking system
- **Case Management**: Advanced case tracking and assignment capabilities
- **Dashboard Analytics**: Real-time statistics and activity monitoring
- **Role-Based Access Control**: Secure access based on user roles and permissions

### Technical Features
- **Modern UI**: Built with React 18 + TypeScript + TailwindCSS
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Live dashboard with activity monitoring
- **Secure Authentication**: Token-based authentication system
- **RESTful API**: Well-structured API endpoints for all operations
- **Type Safety**: Full TypeScript implementation across frontend and backend

## 🎨 Design System

The application uses a carefully crafted color scheme that reflects the seriousness and professionalism of law enforcement:

- **Primary Black**: Deep, authoritative black for headers and primary text
- **Alert Red**: Strategic red for critical alerts, actions, and crime-related indicators
- **Warning Yellow**: Professional yellow for warnings, pending items, and notifications
- **Supporting Colors**: Complementary grays and whites for balance and readability

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **React Router 6** - SPA routing with protected routes
- **TailwindCSS 3** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful, consistent icons
- **Vite** - Fast build tool and dev server

### Backend
- **Express.js** - Minimal and flexible Node.js web framework
- **TypeScript** - Type-safe server development
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Development Tools
- **PNPM** - Fast, disk space efficient package manager
- **Vitest** - Unit testing framework
- **ESLint + Prettier** - Code linting and formatting
- **Hot Reload** - Both client and server hot reloading

## 📦 Installation & Setup

### Prerequisites
- Node.js 18 or higher
- PNPM (recommended) or npm

### 1. Clone the Repository
```bash
git clone <repository-url>
cd crime-management-system
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Security (In production, use strong secrets)
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# Database (When connecting to PlanetScale or other DB)
DATABASE_URL=your-database-connection-string

# Optional: Custom ping message
PING_MESSAGE=Crime Management System API
```

### 4. Start Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:8080`

## 🔐 Default Login Credentials

The system comes with pre-configured users for testing:

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Super Admin | `admin` | `admin123` | Full system access |
| Police Head | `police_head` | `police123` | Senior police management |
| Detective Officer | `detective` | `detective123` | Investigation specialist |
| Preventive Officer | `officer` | `officer123` | Patrol and prevention |
| HR Manager | `hr_manager` | `hr123` | Human resources |
| Citizen | `citizen` | `citizen123` | Public reporting access |

⚠️ **Security Note**: Change these credentials in production!

## 🗄️ Database Setup (Production)

### Option 1: PlanetScale (Recommended)
1. Create a PlanetScale account at [planetscale.com](https://planetscale.com)
2. Create a new database named `crime_management`
3. Get your connection string from the dashboard
4. Update the `DATABASE_URL` in your `.env` file
5. Run migrations to set up tables

### Option 2: Local MySQL/PostgreSQL
1. Install MySQL or PostgreSQL locally
2. Create a database named `crime_management`
3. Update the connection string in `.env`
4. Set up the database schema

### Database Schema
The system requires the following main tables:
- `users` - User accounts and roles
- `crime_reports` - Crime incident reports
- `cases` - Investigation cases
- `assignments` - Officer assignments
- `evidence` - Evidence tracking
- `witnesses` - Witness information

## 🚀 Deployment

### Production Build
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

### Deploy to Cloud Platforms

#### Netlify
1. Connect your repository to Netlify
2. Set build command: `pnpm build`
3. Set publish directory: `dist/spa`
4. Deploy!

#### Vercel
1. Connect your repository to Vercel
2. Vercel will automatically detect the configuration
3. Deploy!

#### Traditional Server
1. Build the application: `pnpm build`
2. Upload the `dist` folder to your server
3. Run: `node dist/server/node-build.mjs`

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm typecheck
```

## 📁 Project Structure

```
crime-management-system/
├── client/                 # React frontend
│   ├── components/        # UI components
│   │   └── ui/           # Reusable UI components
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Route components
│   └── lib/              # Utility functions
├── server/                # Express backend
│   ├── routes/           # API route handlers
│   └── index.ts          # Server setup
├── shared/                # Shared types and interfaces
│   └── types.ts          # TypeScript definitions
└── public/               # Static assets
```

## 🔧 Configuration

### Tailwind Customization
The design system is configured in `tailwind.config.ts` and `client/global.css`. Key color variables:

```css
/* Crime Management Colors */
--crime-black: 0 0% 8%;          /* Deep black */
--crime-red: 0 84% 50%;          /* Alert red */
--crime-yellow: 48 98% 50%;      /* Warning yellow */
--crime-red-dark: 0 75% 35%;     /* Dark red variant */
--crime-yellow-light: 48 95% 70%; /* Light yellow variant */
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

#### Crime Management
- `GET /api/crimes` - List crime reports (with filters)
- `GET /api/crimes/:id` - Get specific crime report
- `POST /api/crimes` - Create new crime report
- `PUT /api/crimes/:id` - Update crime report
- `DELETE /api/crimes/:id` - Delete crime report

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation at `/docs`

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic authentication system
- ✅ Crime reporting functionality
- ✅ Role-based dashboard
- ✅ Responsive design

### Phase 2 (Planned)
- [ ] Advanced search and filtering
- [ ] File upload for evidence
- [ ] Email notifications
- [ ] Report generation (PDF)
- [ ] Mobile app companion

### Phase 3 (Future)
- [ ] GIS mapping integration
- [ ] AI-powered crime prediction
- [ ] Integration with external systems
- [ ] Advanced analytics dashboard

---

**Wolaita Sodo City Police Department** © 2024
Crime Management System - Keeping our community safe through technology.
