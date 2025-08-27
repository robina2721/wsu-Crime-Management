import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  Activity,
  MapPin,
  Clock,
  PhoneCall,
  Plus,
  Search,
  UserCheck,
  Settings,
  Database,
  BarChart3,
  Package,
  CheckCircle,
  UserPlus,
  Briefcase
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, hasRole, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div>Loading...</div>;
  }

  const isAdmin = hasRole(UserRole.SUPER_ADMIN);
  const isOfficer = hasAnyRole([UserRole.POLICE_HEAD, UserRole.PREVENTIVE_OFFICER, UserRole.DETECTIVE_OFFICER]);
  const isHR = hasRole(UserRole.HR_MANAGER);
  const isCitizen = hasRole(UserRole.CITIZEN);

  const quickStats = [
    { 
      title: 'Active Cases', 
      value: '24', 
      icon: FileText, 
      color: 'text-crime-red',
      bgColor: 'bg-red-50'
    },
    { 
      title: 'Critical Alerts', 
      value: '3', 
      icon: AlertTriangle, 
      color: 'text-crime-yellow',
      bgColor: 'bg-yellow-50'
    },
    { 
      title: 'Officers on Duty', 
      value: '18', 
      icon: Shield, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'Reports Today', 
      value: '7', 
      icon: TrendingUp, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
  ];

  const recentActivity = [
    { time: '10 min ago', action: 'New theft report filed', location: 'Downtown Area', type: 'high' },
    { time: '25 min ago', action: 'Case #2024-001 updated', location: 'North District', type: 'medium' },
    { time: '1 hour ago', action: 'Officer patrol assigned', location: 'Market Street', type: 'low' },
    { time: '2 hours ago', action: 'Evidence logged', location: 'Station #1', type: 'medium' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-crime-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-crime-red" />
              <div>
                <h1 className="text-xl font-bold">Crime Management System</h1>
                <p className="text-gray-300 text-sm">Wolaita Sodo City</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{user.fullName}</p>
                <p className="text-sm text-gray-300">{user.role.replace('_', ' ').toUpperCase()}</p>
              </div>
              <Button 
                onClick={logout}
                variant="outline"
                className="border-crime-red text-crime-red hover:bg-crime-red hover:text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-crime-black">
            Welcome back, {user.fullName}
          </h2>
          <p className="text-gray-600 mt-2">
            Here's what's happening in your jurisdiction today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="border-l-4 border-l-crime-red">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-crime-black">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-crime-black">Quick Actions</CardTitle>
                <CardDescription>Common tasks for your role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Super Admin Actions */}
                {isAdmin && (
                  <>
                    <Button
                      onClick={() => navigate('/case-management')}
                      className="w-full bg-crime-red hover:bg-crime-red-dark text-white justify-start"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Case Management
                    </Button>
                    <Button
                      onClick={() => navigate('/user-management')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      User Management
                    </Button>
                    <Button
                      onClick={() => navigate('/staff-management')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Staff Management
                    </Button>
                    <Button
                      onClick={() => navigate('/reports')}
                      className="w-full bg-crime-yellow hover:bg-yellow-600 text-crime-black justify-start"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Reports
                    </Button>
                    <Button
                      onClick={() => navigate('/asset-management')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Asset Management
                    </Button>
                    <Button
                      onClick={() => navigate('/system-config')}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white justify-start"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      System Configuration
                    </Button>
                  </>
                )}

                {/* Police Head Actions */}
                {hasRole(UserRole.POLICE_HEAD) && (
                  <>
                    <Button
                      onClick={() => navigate('/case-management')}
                      className="w-full bg-crime-red hover:bg-crime-red-dark text-white justify-start"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Case Management
                    </Button>
                    <Button
                      onClick={() => navigate('/staff-management')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Staff Supervision
                    </Button>
                    <Button
                      onClick={() => navigate('/reports')}
                      className="w-full bg-crime-yellow hover:bg-yellow-600 text-crime-black justify-start"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Reports
                    </Button>
                    <Button
                      onClick={() => navigate('/asset-management')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Asset Management
                    </Button>
                    <Button
                      onClick={() => navigate('/user-management')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Approve Officers
                    </Button>
                  </>
                )}

                {/* Detective Officer Actions */}
                {hasRole(UserRole.DETECTIVE_OFFICER) && (
                  <>
                    <Button
                      onClick={() => navigate('/my-cases')}
                      className="w-full bg-crime-red hover:bg-crime-red-dark text-white justify-start"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      My Cases
                    </Button>
                    <Button
                      onClick={() => navigate('/criminal-database')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Criminal Database
                    </Button>
                    <Button
                      onClick={() => navigate('/investigation-reports')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Investigation Reports
                    </Button>
                    <Button
                      onClick={() => navigate('/case-management')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Case Management
                    </Button>
                  </>
                )}

                {/* Preventive Officer Actions */}
                {hasRole(UserRole.PREVENTIVE_OFFICER) && (
                  <>
                    <Button
                      onClick={() => navigate('/incident-reports')}
                      className="w-full bg-crime-red hover:bg-crime-red-dark text-white justify-start"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Incident Reports
                    </Button>
                    <Button
                      onClick={() => navigate('/my-cases')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      My Cases
                    </Button>
                    <Button
                      onClick={() => navigate('/patrol-logs')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Patrol Logs
                    </Button>
                    <Button
                      onClick={() => navigate('/case-management')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Case Updates
                    </Button>
                  </>
                )}

                {/* HR Manager Actions */}
                {isHR && (
                  <>
                    <Button
                      onClick={() => navigate('/staff-management')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Staff Management
                    </Button>
                    <Button
                      onClick={() => navigate('/user-management')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Employee Accounts
                    </Button>
                    <Button
                      onClick={() => navigate('/reports')}
                      className="w-full bg-crime-yellow hover:bg-yellow-600 text-crime-black justify-start"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      HR Reports
                    </Button>
                  </>
                )}

                {/* Citizen Actions */}
                {isCitizen && (
                  <>
                    <Button className="w-full bg-crime-red hover:bg-crime-red-dark text-white justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      File Crime Report
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      My Reports
                    </Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white justify-start">
                      <Clock className="w-4 h-4 mr-2" />
                      Track Status
                    </Button>
                  </>
                )}

                {/* Emergency Contact - Always Available */}
                <div className="pt-2 border-t">
                  <Button variant="outline" className="w-full border-crime-red text-crime-red hover:bg-crime-red hover:text-white justify-start">
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Emergency: 911
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-crime-black flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'high' ? 'bg-crime-red' :
                        activity.type === 'medium' ? 'bg-crime-yellow' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-crime-black">{activity.action}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{activity.time}</span>
                          <span className="mx-2">•</span>
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{activity.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
