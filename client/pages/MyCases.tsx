import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CrimeReport, CrimeStatus, CrimeCategory, Priority, UserRole } from '@shared/types';
import { EvidenceManager } from '../components/EvidenceManager';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  FileText, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  User, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Calendar,
  Shield,
  Camera,
  MessageSquare,
  Activity,
  Users,
  Play,
  Pause,
  Archive
} from 'lucide-react';

export default function MyCases() {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [cases, setCases] = useState<CrimeReport[]>([]);
  const [filteredCases, setFilteredCases] = useState<CrimeReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<CrimeReport | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const canViewCases = hasAnyRole([UserRole.DETECTIVE_OFFICER, UserRole.PREVENTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]);
  const canUpdateCases = hasAnyRole([UserRole.DETECTIVE_OFFICER, UserRole.PREVENTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]);

  useEffect(() => {
    if (canViewCases) {
      fetchMyCases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, statusFilter, priorityFilter]);

  const fetchMyCases = async () => {
    try {
      const res = await api.get('/crimes?assignedTo=me&limit=50&offset=0');
      if (!res.ok) throw new Error('Failed to load cases');
      const data = await res.json();
      const reports: CrimeReport[] = (data?.data?.reports || []).map((r: any) => ({
        ...r,
        dateReported: new Date(r.dateReported),
        dateIncident: new Date(r.dateIncident),
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt)
      }));
      setCases(reports);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = [...cases];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.priority === priorityFilter);
    }

    setFilteredCases(filtered);
  };

  const handleStatusUpdate = async (caseId: string, newStatus: CrimeStatus) => {
    try {
      const res = await api.put(`/crimes/${caseId}`, { status: newStatus });
      if (!res.ok) throw new Error('Failed to update status');
      // Refresh list to reflect changes
      await fetchMyCases();
    } catch (error) {
      console.error('Error updating case status:', error);
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
      case CrimeStatus.REPORTED: return Clock;
      case CrimeStatus.UNDER_INVESTIGATION: return Search;
      case CrimeStatus.ASSIGNED: return User;
      case CrimeStatus.RESOLVED: return CheckCircle;
      case CrimeStatus.CLOSED: return Archive;
      case CrimeStatus.REJECTED: return AlertTriangle;
      default: return FileText;
    }
  };

  const caseStats = {
    total: cases.length,
    active: cases.filter(c => [CrimeStatus.ASSIGNED, CrimeStatus.UNDER_INVESTIGATION].includes(c.status)).length,
    resolved: cases.filter(c => c.status === CrimeStatus.RESOLVED).length,
    critical: cases.filter(c => c.priority === Priority.CRITICAL).length,
    high: cases.filter(c => c.priority === Priority.HIGH).length
  };

  if (!canViewCases) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-crime-red" />
            <h2 className="text-2xl font-bold text-crime-black mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view case assignments.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Cases</h1>
              <p className="text-gray-300">Cases assigned to you for investigation and resolution</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-crime-yellow text-crime-black px-3 py-1">
                <Activity className="w-4 h-4 mr-1" />
                {caseStats.active} Active Cases
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">{caseStats.total}</h3>
              <p className="text-gray-600">Total Assigned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-crime-yellow" />
              <h3 className="text-2xl font-bold text-crime-black">{caseStats.active}</h3>
              <p className="text-gray-600">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-2xl font-bold text-crime-black">{caseStats.resolved}</h3>
              <p className="text-gray-600">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <h3 className="text-2xl font-bold text-crime-black">{caseStats.critical}</h3>
              <p className="text-gray-600">Critical</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-crime-red" />
              <h3 className="text-2xl font-bold text-crime-black">{caseStats.high}</h3>
              <p className="text-gray-600">High Priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter My Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={CrimeStatus.ASSIGNED}>Assigned</SelectItem>
                  <SelectItem value={CrimeStatus.UNDER_INVESTIGATION}>Under Investigation</SelectItem>
                  <SelectItem value={CrimeStatus.RESOLVED}>Resolved</SelectItem>
                  <SelectItem value={CrimeStatus.CLOSED}>Closed</SelectItem>
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
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <div className="space-y-6">
          {filteredCases.map((case_) => {
            const StatusIcon = getStatusIcon(case_.status);
            
            return (
              <Card key={case_.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="w-5 h-5 text-crime-red" />
                        <h3 className="text-xl font-semibold text-crime-black">{case_.title}</h3>
                        <Badge className={getStatusBadgeColor(case_.status)}>
                          {case_.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityBadgeColor(case_.priority)}>
                          {case_.priority.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{case_.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {case_.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Reported: {new Date(case_.dateReported).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Incident: {new Date(case_.dateIncident).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Camera className="w-4 h-4 mr-1" />
                          {case_.evidence?.length || 0} Evidence
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 mb-4">
                        <Dialog 
                          open={isDetailsDialogOpen && selectedCase?.id === case_.id} 
                          onOpenChange={(open) => {
                            setIsDetailsDialogOpen(open);
                            if (!open) setSelectedCase(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedCase(case_)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Case Details: {case_.title}
                              </DialogTitle>
                              <DialogDescription>
                                Complete case information and evidence
                              </DialogDescription>
                            </DialogHeader>
                            
                            <Tabs defaultValue="overview" className="space-y-4">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                                <TabsTrigger value="notes">Notes</TabsTrigger>
                              </TabsList>

                              <TabsContent value="overview" className="space-y-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Case Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="font-medium">Case ID:</span>
                                        <div>{case_.id}</div>
                                      </div>
                                      <div>
                                        <span className="font-medium">Category:</span>
                                        <div>{case_.category.replace('_', ' ')}</div>
                                      </div>
                                      <div>
                                        <span className="font-medium">Status:</span>
                                        <div>
                                          <Badge className={getStatusBadgeColor(case_.status)}>
                                            {case_.status.replace('_', ' ').toUpperCase()}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-medium">Priority:</span>
                                        <div>
                                          <Badge className={getPriorityBadgeColor(case_.priority)}>
                                            {case_.priority.toUpperCase()}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-medium">Location:</span>
                                        <div>{case_.location}</div>
                                      </div>
                                      <div>
                                        <span className="font-medium">Date Reported:</span>
                                        <div>{new Date(case_.dateReported).toLocaleString()}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="font-medium">Description:</span>
                                      <p className="mt-1 text-gray-700">{case_.description}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>

                              <TabsContent value="evidence" className="space-y-4">
                                <EvidenceManager caseId={case_.id} title="Case Evidence" />
                              </TabsContent>

                              <TabsContent value="notes" className="space-y-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Investigation Notes</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-center py-8 text-gray-500">
                                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                      <p>Investigation notes feature would be implemented here</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>

                        {canUpdateCases && (
                          <>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            
                            {case_.status === CrimeStatus.ASSIGNED && (
                              <Button 
                                size="sm" 
                                className="bg-crime-yellow hover:bg-yellow-600 text-crime-black"
                                onClick={() => handleStatusUpdate(case_.id, CrimeStatus.UNDER_INVESTIGATION)}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Start Investigation
                              </Button>
                            )}
                            
                            {case_.status === CrimeStatus.UNDER_INVESTIGATION && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleStatusUpdate(case_.id, CrimeStatus.RESOLVED)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark Resolved
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-500">
                        Last Updated
                      </div>
                      <div className="font-medium text-crime-black">
                        {new Date(case_.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredCases.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No cases found</h3>
                <p className="text-gray-500">
                  {cases.length === 0 
                    ? "You don't have any assigned cases yet" 
                    : "Try adjusting your filter criteria"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
