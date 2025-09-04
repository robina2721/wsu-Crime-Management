import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CrimeReport, CrimeStatus, CrimeCategory, Priority, UserRole } from '@shared/types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Search,
  Filter,
  Eye,
  Edit,
  UserCheck,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Plus
} from 'lucide-react';
import { api } from '@/lib/api';

export default function CaseManagement() {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [cases, setCases] = useState<CrimeReport[]>([]);
  const [filteredCases, setFilteredCases] = useState<CrimeReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeCase, setActiveCase] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageFiles, setMessageFiles] = useState<File[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [officers, setOfficers] = useState<any[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<string>("");

  const canManageAllCases = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD]);
  const canAssignCases = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD, UserRole.DETECTIVE_OFFICER]);

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const fetchCases = async () => {
    try {
      const response = await api.get('/crimes');
      const data = await response.json();
      if (data.success) {
        setCases(data.data.reports);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = [...cases];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(case_ => 
        case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.category === categoryFilter);
    }

    setFilteredCases(filtered);
  };

  const handleStatusUpdate = async (caseId: string, newStatus: CrimeStatus) => {
    try {
      const response = await api.put(`/crimes/${caseId}`, { status: newStatus });

      if (response.ok) {
        await fetchCases();
      }
    } catch (error) {
      console.error('Error updating case status:', error);
    }
  };

  const handleAssignCase = async (caseId: string, officerId: string) => {
    try {
      const response = await api.put(`/crimes/${caseId}`, { assignedTo: officerId });

      if (response.ok) {
        await fetchCases();
      }
    } catch (error) {
      console.error('Error assigning case:', error);
    }
  };

  const getStatusBadgeColor = (status: CrimeStatus) => {
    switch (status) {
      case CrimeStatus.REPORTED: return 'bg-blue-100 text-blue-800';
      case CrimeStatus.UNDER_INVESTIGATION: return 'bg-yellow-100 text-yellow-800';
      case CrimeStatus.ASSIGNED: return 'bg-purple-100 text-purple-800';
      case CrimeStatus.RESOLVED: return 'bg-green-100 text-green-800';
      case CrimeStatus.CLOSED: return 'bg-gray-100 text-gray-800';
      case CrimeStatus.REJECTED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL: return 'bg-red-500 text-white';
      case Priority.HIGH: return 'bg-crime-red text-white';
      case Priority.MEDIUM: return 'bg-crime-yellow text-crime-black';
      case Priority.LOW: return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: CrimeStatus) => {
    switch (status) {
      case CrimeStatus.REPORTED: return <Clock className="w-4 h-4" />;
      case CrimeStatus.UNDER_INVESTIGATION: return <Search className="w-4 h-4" />;
      case CrimeStatus.ASSIGNED: return <UserCheck className="w-4 h-4" />;
      case CrimeStatus.RESOLVED: return <CheckCircle className="w-4 h-4" />;
      case CrimeStatus.CLOSED: return <XCircle className="w-4 h-4" />;
      case CrimeStatus.REJECTED: return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const caseStats = {
    total: filteredCases.length,
    active: filteredCases.filter(c => [CrimeStatus.REPORTED, CrimeStatus.UNDER_INVESTIGATION, CrimeStatus.ASSIGNED].includes(c.status)).length,
    resolved: filteredCases.filter(c => c.status === CrimeStatus.RESOLVED).length,
    critical: filteredCases.filter(c => c.priority === Priority.CRITICAL).length
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
          <h1 className="text-3xl font-bold mb-2">Case Management</h1>
          <p className="text-gray-300">Comprehensive case tracking and management system</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">{caseStats.total}</h3>
              <p className="text-gray-600">Total Cases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-crime-yellow" />
              <h3 className="text-2xl font-bold text-crime-black">{caseStats.active}</h3>
              <p className="text-gray-600">Active Cases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-2xl font-bold text-crime-black">{caseStats.resolved}</h3>
              <p className="text-gray-600">Resolved Cases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-crime-red" />
              <h3 className="text-2xl font-bold text-crime-black">{caseStats.critical}</h3>
              <p className="text-gray-600">Critical Cases</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Search & Filter Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={CrimeStatus.REPORTED}>Reported</SelectItem>
                  <SelectItem value={CrimeStatus.UNDER_INVESTIGATION}>Under Investigation</SelectItem>
                  <SelectItem value={CrimeStatus.ASSIGNED}>Assigned</SelectItem>
                  <SelectItem value={CrimeStatus.RESOLVED}>Resolved</SelectItem>
                  <SelectItem value={CrimeStatus.CLOSED}>Closed</SelectItem>
                  <SelectItem value={CrimeStatus.REJECTED}>Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value={Priority.CRITICAL}>Critical</SelectItem>
                  <SelectItem value={Priority.HIGH}>High</SelectItem>
                  <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={Priority.LOW}>Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value={CrimeCategory.THEFT}>Theft</SelectItem>
                  <SelectItem value={CrimeCategory.ASSAULT}>Assault</SelectItem>
                  <SelectItem value={CrimeCategory.BURGLARY}>Burglary</SelectItem>
                  <SelectItem value={CrimeCategory.FRAUD}>Fraud</SelectItem>
                  <SelectItem value={CrimeCategory.VANDALISM}>Vandalism</SelectItem>
                  <SelectItem value={CrimeCategory.DRUG_OFFENSE}>Drug Offense</SelectItem>
                  <SelectItem value={CrimeCategory.DOMESTIC_VIOLENCE}>Domestic Violence</SelectItem>
                  <SelectItem value={CrimeCategory.TRAFFIC_VIOLATION}>Traffic Violation</SelectItem>
                  <SelectItem value={CrimeCategory.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>

              {canManageAllCases && (
                <Button className="bg-crime-red hover:bg-crime-red-dark text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Case
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <Card>
          <CardHeader>
            <CardTitle>Cases Overview</CardTitle>
            <CardDescription>
              {filteredCases.length} case(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCases.map((case_) => (
                <div key={case_.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-crime-black">{case_.title}</h3>
                        <Badge className={getStatusBadgeColor(case_.status)}>
                          {getStatusIcon(case_.status)}
                          <span className="ml-1">{case_.status.replace('_', ' ').toUpperCase()}</span>
                        </Badge>
                        <Badge className={getPriorityBadgeColor(case_.priority)}>
                          {case_.priority.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{case_.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(case_.dateReported).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {case_.location}
                        </div>
                        {case_.assignedTo && (
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            Officer #{case_.assignedTo}
                          </div>
                        )}
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {case_.category.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      
                      {canManageAllCases && (
                        <>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          
                          {!case_.assignedTo && canAssignCases && (
                            <Button 
                              size="sm" 
                              className="bg-crime-yellow hover:bg-yellow-600 text-crime-black"
                              onClick={() => handleAssignCase(case_.id, user?.id || '')}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Assign
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {canManageAllCases && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Quick Actions:</span>
                        <div className="flex gap-2">
                          {case_.status !== CrimeStatus.UNDER_INVESTIGATION && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(case_.id, CrimeStatus.UNDER_INVESTIGATION)}
                            >
                              Start Investigation
                            </Button>
                          )}
                          {case_.status !== CrimeStatus.RESOLVED && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(case_.id, CrimeStatus.RESOLVED)}
                            >
                              Mark Resolved
                            </Button>
                          )}
                          {case_.status !== CrimeStatus.CLOSED && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(case_.id, CrimeStatus.CLOSED)}
                            >
                              Close Case
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredCases.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No cases found</h3>
                  <p className="text-gray-500">Try adjusting your search and filter criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
