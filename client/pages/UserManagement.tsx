import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole } from '@shared/types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Shield, 
  UserCheck, 
  UserX,
  Phone,
  Mail,
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Key,
  UserPlus,
  Trash2
} from 'lucide-react';

interface PendingAccount {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  requestedRole: UserRole;
  submittedDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  documents?: string[];
  notes?: string;
}

export default function UserManagement() {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const canManageUsers = hasRole(UserRole.SUPER_ADMIN);
  const canApproveAccounts = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD]);

  useEffect(() => {
    fetchUsers();
    fetchPendingAccounts();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    // Mock data - In production, fetch from API
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        password: '',
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
        password: '',
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
        password: '',
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
        password: '',
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
        password: '',
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
        password: '',
        role: UserRole.CITIZEN,
        fullName: 'Citizen Yohannes Bekele',
        email: 'citizen@example.com',
        phone: '+251-911-000-006',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      {
        id: '7',
        username: 'officer2',
        password: '',
        role: UserRole.PREVENTIVE_OFFICER,
        fullName: 'Officer Almaz Worku',
        email: 'officer2@wolaita-sodo.gov.et',
        phone: '+251-911-000-007',
        isActive: false,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      }
    ];

    setUsers(mockUsers);
    setIsLoading(false);
  };

  const fetchPendingAccounts = async () => {
    // Mock pending accounts data
    const mockPending: PendingAccount[] = [
      {
        id: 'P1',
        fullName: 'Officer Candidate Bereket Haile',
        username: 'bereket_h',
        email: 'bereket.haile@example.com',
        phone: '+251-911-000-100',
        requestedRole: UserRole.PREVENTIVE_OFFICER,
        submittedDate: new Date('2024-01-14'),
        status: 'pending',
        documents: ['police_certificate.pdf', 'training_completion.pdf'],
        notes: 'Recent police academy graduate with high scores'
      },
      {
        id: 'P2',
        fullName: 'Detective Trainee Meron Gebre',
        username: 'meron_g',
        email: 'meron.gebre@example.com',
        phone: '+251-911-000-101',
        requestedRole: UserRole.DETECTIVE_OFFICER,
        submittedDate: new Date('2024-01-12'),
        status: 'pending',
        documents: ['detective_certification.pdf', 'background_check.pdf'],
        notes: 'Specialized in cybercrime investigation'
      },
      {
        id: 'P3',
        fullName: 'Citizen Registration - Kebede Alemu',
        username: 'kebede_a',
        email: 'kebede.alemu@example.com',
        requestedRole: UserRole.CITIZEN,
        submittedDate: new Date('2024-01-16'),
        status: 'pending',
        notes: 'Standard citizen registration for crime reporting access'
      }
    ];

    setPendingAccounts(mockPending);
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // In production, call API to update user status
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleApproveAccount = async (accountId: string) => {
    try {
      // In production, call API to approve account
      setPendingAccounts(prev => prev.map(account => 
        account.id === accountId ? { ...account, status: 'approved' } : account
      ));
    } catch (error) {
      console.error('Error approving account:', error);
    }
  };

  const handleRejectAccount = async (accountId: string) => {
    try {
      // In production, call API to reject account
      setPendingAccounts(prev => prev.map(account => 
        account.id === accountId ? { ...account, status: 'rejected' } : account
      ));
    } catch (error) {
      console.error('Error rejecting account:', error);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'bg-crime-red text-white';
      case UserRole.POLICE_HEAD: return 'bg-crime-yellow text-crime-black';
      case UserRole.DETECTIVE_OFFICER: return 'bg-blue-500 text-white';
      case UserRole.PREVENTIVE_OFFICER: return 'bg-green-500 text-white';
      case UserRole.HR_MANAGER: return 'bg-purple-500 text-white';
      case UserRole.CITIZEN: return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === UserRole.SUPER_ADMIN).length,
    officers: users.filter(u => [UserRole.POLICE_HEAD, UserRole.DETECTIVE_OFFICER, UserRole.PREVENTIVE_OFFICER].includes(u.role)).length,
    citizens: users.filter(u => u.role === UserRole.CITIZEN).length,
    pendingApprovals: pendingAccounts.filter(p => p.status === 'pending').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-crime-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-crime-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-300">Comprehensive user administration and role management</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">{userStats.total}</h3>
              <p className="text-gray-600">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-2xl font-bold text-crime-black">{userStats.active}</h3>
              <p className="text-gray-600">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <h3 className="text-2xl font-bold text-crime-black">{userStats.inactive}</h3>
              <p className="text-gray-600">Inactive</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Settings className="w-8 h-8 mx-auto mb-2 text-crime-red" />
              <h3 className="text-2xl font-bold text-crime-black">{userStats.admins}</h3>
              <p className="text-gray-600">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">{userStats.officers}</h3>
              <p className="text-gray-600">Officers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <h3 className="text-2xl font-bold text-crime-black">{userStats.citizens}</h3>
              <p className="text-gray-600">Citizens</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-crime-yellow" />
              <h3 className="text-2xl font-bold text-crime-black">{userStats.pendingApprovals}</h3>
              <p className="text-gray-600">Pending</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Directory</TabsTrigger>
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Search & Filter Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                      <SelectItem value={UserRole.POLICE_HEAD}>Police Head</SelectItem>
                      <SelectItem value={UserRole.DETECTIVE_OFFICER}>Detective Officer</SelectItem>
                      <SelectItem value={UserRole.PREVENTIVE_OFFICER}>Preventive Officer</SelectItem>
                      <SelectItem value={UserRole.HR_MANAGER}>HR Manager</SelectItem>
                      <SelectItem value={UserRole.CITIZEN}>Citizen</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  {canManageUsers && (
                    <Button className="bg-crime-red hover:bg-crime-red-dark text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>User Directory</CardTitle>
                <CardDescription>
                  {filteredUsers.length} user(s) found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user_) => (
                    <div key={user_.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-crime-red rounded-full flex items-center justify-center">
                              <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-crime-black">{user_.fullName}</h3>
                              <p className="text-gray-600">@{user_.username}</p>
                            </div>
                            <Badge className={getRoleBadgeColor(user_.role)}>
                              {user_.role.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={user_.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {user_.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                              {user_.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            {user_.email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                {user_.email}
                              </div>
                            )}
                            {user_.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                {user_.phone}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Joined {new Date(user_.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {canManageUsers && (
                          <div className="flex items-center gap-4 ml-6">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={user_.isActive}
                                onCheckedChange={(checked) => handleToggleUserStatus(user_.id, checked)}
                              />
                              <span className="text-sm text-gray-600">Active</span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                <Key className="w-4 h-4 mr-1" />
                                Reset Password
                              </Button>
                              {user_.id !== user?.id && (
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
                      <p className="text-gray-500">Try adjusting your search and filter criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pending Account Approvals</CardTitle>
                    <CardDescription>Review and approve new account requests</CardDescription>
                  </div>
                  <Badge className="bg-crime-yellow text-crime-black">
                    {pendingAccounts.filter(p => p.status === 'pending').length} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingAccounts.map((account) => (
                    <div key={account.id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <UserPlus className="w-6 h-6 text-crime-red" />
                            <h3 className="text-lg font-semibold text-crime-black">{account.fullName}</h3>
                            <Badge className={getRoleBadgeColor(account.requestedRole)}>
                              {account.requestedRole.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={
                              account.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              account.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {account.status.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {account.email}
                            </div>
                            {account.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                {account.phone}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Submitted {new Date(account.submittedDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Settings className="w-4 h-4 mr-2" />
                              Username: {account.username}
                            </div>
                          </div>

                          {account.notes && (
                            <div className="bg-blue-50 p-3 rounded-lg mb-3">
                              <p className="text-sm text-blue-800">{account.notes}</p>
                            </div>
                          )}

                          {account.documents && account.documents.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">Submitted Documents:</p>
                              <div className="flex flex-wrap gap-2">
                                {account.documents.map((doc, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {doc}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {canApproveAccounts && account.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleApproveAccount(account.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRejectAccount(account.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {pendingAccounts.length === 0 && (
                    <div className="text-center py-12">
                      <UserPlus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No pending approvals</h3>
                      <p className="text-gray-500">All account requests have been processed</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.values(UserRole).map((role) => (
                    <div key={role} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-6 h-6 text-crime-red" />
                            <h3 className="text-lg font-semibold text-crime-black">
                              {role.replace('_', ' ').toUpperCase()}
                            </h3>
                            <Badge className={getRoleBadgeColor(role)}>
                              {users.filter(u => u.role === role).length} Users
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-4">
                            {role === UserRole.SUPER_ADMIN && 'Full system administration access and control'}
                            {role === UserRole.POLICE_HEAD && 'Senior police management with oversight responsibilities'}
                            {role === UserRole.DETECTIVE_OFFICER && 'Investigation specialist with case management access'}
                            {role === UserRole.PREVENTIVE_OFFICER && 'Patrol and crime prevention duties'}
                            {role === UserRole.HR_MANAGER && 'Human resources and personnel management'}
                            {role === UserRole.CITIZEN && 'Public access for crime reporting and tracking'}
                          </p>
                        </div>
                        {canManageUsers && (
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Permissions
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
