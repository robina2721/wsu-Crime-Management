import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole } from '@shared/types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  MapPin,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface StaffAssignment {
  id: string;
  officerId: string;
  officerName: string;
  assignment: string;
  location: string;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export default function StaffManagement() {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [newUserPhoto, setNewUserPhoto] = useState<File | null>(null);

  const canManageStaff = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD]);
  const canAssignStaff = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD]);

  useEffect(() => {
    fetchStaff();
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, roleFilter, statusFilter]);

  const fetchStaff = async () => {
    // Mock data - In production, fetch from API
    const mockStaff: User[] = [
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
        id: '7',
        username: 'officer2',
        password: '',
        role: UserRole.PREVENTIVE_OFFICER,
        fullName: 'Officer Almaz Worku',
        email: 'officer2@wolaita-sodo.gov.et',
        phone: '+251-911-000-007',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      {
        id: '8',
        username: 'detective2',
        password: '',
        role: UserRole.DETECTIVE_OFFICER,
        fullName: 'Detective Habtamu Desta',
        email: 'detective2@wolaita-sodo.gov.et',
        phone: '+251-911-000-008',
        isActive: false,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date()
      }
    ];
    setStaff(mockStaff);
    setIsLoading(false);
  };

  const fetchAssignments = async () => {
    // Mock assignments data
    const mockAssignments: StaffAssignment[] = [
      {
        id: '1',
        officerId: '3',
        officerName: 'Detective Sara Alemayehu',
        assignment: 'Theft Investigation - Market Street',
        location: 'Downtown Market Area',
        startTime: new Date('2024-01-16T08:00:00'),
        endTime: new Date('2024-01-16T18:00:00'),
        status: 'active',
        priority: 'high'
      },
      {
        id: '2',
        officerId: '4',
        officerName: 'Officer Mulugeta Kebede',
        assignment: 'Patrol Duty - North District',
        location: 'North District Roads',
        startTime: new Date('2024-01-16T06:00:00'),
        endTime: new Date('2024-01-16T14:00:00'),
        status: 'active',
        priority: 'medium'
      },
      {
        id: '3',
        officerId: '7',
        officerName: 'Officer Almaz Worku',
        assignment: 'Community Outreach Program',
        location: 'City Center',
        startTime: new Date('2024-01-16T09:00:00'),
        endTime: new Date('2024-01-16T17:00:00'),
        status: 'active',
        priority: 'low'
      }
    ];
    setAssignments(mockAssignments);
  };

  const filterStaff = () => {
    let filtered = [...staff];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => 
        statusFilter === 'active' ? member.isActive : !member.isActive
      );
    }

    setFilteredStaff(filtered);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.POLICE_HEAD: return 'bg-crime-red text-white';
      case UserRole.DETECTIVE_OFFICER: return 'bg-blue-500 text-white';
      case UserRole.PREVENTIVE_OFFICER: return 'bg-green-500 text-white';
      case UserRole.HR_MANAGER: return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-crime-red text-white';
      case 'medium': return 'bg-crime-yellow text-crime-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const staffStats = {
    total: staff.length,
    active: staff.filter(s => s.isActive).length,
    onDuty: assignments.filter(a => a.status === 'active').length,
    detectives: staff.filter(s => s.role === UserRole.DETECTIVE_OFFICER && s.isActive).length,
    officers: staff.filter(s => s.role === UserRole.PREVENTIVE_OFFICER && s.isActive).length
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
          <h1 className="text-3xl font-bold mb-2">Staff Management</h1>
          <p className="text-gray-300">Officer supervision, assignment, and workforce management</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">{staffStats.total}</h3>
              <p className="text-gray-600">Total Staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-2xl font-bold text-crime-black">{staffStats.active}</h3>
              <p className="text-gray-600">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-crime-yellow" />
              <h3 className="text-2xl font-bold text-crime-black">{staffStats.onDuty}</h3>
              <p className="text-gray-600">On Duty</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="text-2xl font-bold text-crime-black">{staffStats.detectives}</h3>
              <p className="text-gray-600">Detectives</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-crime-red" />
              <h3 className="text-2xl font-bold text-crime-black">{staffStats.officers}</h3>
              <p className="text-gray-600">Officers</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="staff" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="staff">Staff Directory</TabsTrigger>
            <TabsTrigger value="assignments">Active Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Search & Filter Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search staff..."
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
                      <SelectItem value={UserRole.POLICE_HEAD}>Police Head</SelectItem>
                      <SelectItem value={UserRole.DETECTIVE_OFFICER}>Detective Officer</SelectItem>
                      <SelectItem value={UserRole.PREVENTIVE_OFFICER}>Preventive Officer</SelectItem>
                      <SelectItem value={UserRole.HR_MANAGER}>HR Manager</SelectItem>
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

                  {canManageStaff && (
                    <Button className="bg-crime-red hover:bg-crime-red-dark text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Staff
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Staff List */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Directory</CardTitle>
                <CardDescription>
                  {filteredStaff.length} staff member(s) found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStaff.map((member) => (
                    <Card key={member.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-crime-red rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getRoleBadgeColor(member.role)}>
                              {member.role.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {member.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                              {member.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-crime-black mb-2">{member.fullName}</h3>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          {member.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {member.email}
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              {member.phone}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Joined {new Date(member.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {canManageStaff && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            {canAssignStaff && (
                              <Button size="sm" className="flex-1 bg-crime-yellow hover:bg-yellow-600 text-crime-black">
                                <UserCheck className="w-4 h-4 mr-1" />
                                Assign
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredStaff.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No staff found</h3>
                    <p className="text-gray-500">Try adjusting your search and filter criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Active Assignments</CardTitle>
                    <CardDescription>Current officer assignments and duties</CardDescription>
                  </div>
                  {canAssignStaff && (
                    <Button className="bg-crime-red hover:bg-crime-red-dark text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      New Assignment
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-crime-black">{assignment.assignment}</h3>
                            <Badge className={getAssignmentStatusColor(assignment.status)}>
                              {assignment.status === 'active' && <Activity className="w-3 h-3 mr-1" />}
                              {assignment.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {assignment.status === 'cancelled' && <XCircle className="w-3 h-3 mr-1" />}
                              {assignment.status.toUpperCase()}
                            </Badge>
                            <Badge className={getPriorityColor(assignment.priority)}>
                              {assignment.priority.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Shield className="w-4 h-4 mr-1" />
                              {assignment.officerName}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {assignment.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(assignment.startTime).toLocaleTimeString()} - {new Date(assignment.endTime).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>

                        {canAssignStaff && (
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            {assignment.status === 'active' && (
                              <Button variant="outline" size="sm">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Complete
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {assignments.length === 0 && (
                    <div className="text-center py-12">
                      <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No active assignments</h3>
                      <p className="text-gray-500">Create new assignments to manage staff duties</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
