import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Checkbox } from '../components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Settings, 
  Calendar,
  Users, 
  TrendingUp,
  BarChart3,
  PieChart,
  FileDown,
  Eye,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  MapPin,
  Shield,
  Activity
} from 'lucide-react';
import {
  HRReport,
  HRReportType,
  HRReportStatus,
  ReportParameters,
  Department,
  OfficerRank,
  EmploymentStatus,
  Rating
} from '../../shared/types';

// Mock data for demonstration
const mockReports: HRReport[] = [
  {
    id: '1',
    type: HRReportType.ATTENDANCE,
    title: 'Monthly Attendance Report - December 2023',
    description: 'Comprehensive attendance analysis for all departments',
    parameters: {
      dateRange: {
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-12-31')
      },
      departments: [Department.PATROL, Department.CRIMINAL_INVESTIGATION],
      includeInactive: false
    },
    generatedBy: 'HR001',
    generatedAt: new Date('2024-01-05'),
    fileUrl: '/reports/attendance-dec-2023.pdf',
    status: HRReportStatus.COMPLETED
  },
  {
    id: '2',
    type: HRReportType.PERFORMANCE,
    title: 'Quarterly Performance Review Summary',
    description: 'Performance evaluation summary for Q4 2023',
    parameters: {
      dateRange: {
        startDate: new Date('2023-10-01'),
        endDate: new Date('2023-12-31')
      },
      ranks: [OfficerRank.SERGEANT, OfficerRank.LIEUTENANT],
      includeInactive: false
    },
    generatedBy: 'HR001',
    generatedAt: new Date('2024-01-10'),
    fileUrl: '/reports/performance-q4-2023.pdf',
    status: HRReportStatus.COMPLETED
  },
  {
    id: '3',
    type: HRReportType.CERTIFICATION_STATUS,
    title: 'Certification Expiry Report',
    description: 'Upcoming certification renewals and expired certificates',
    parameters: {
      dateRange: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30')
      },
      includeInactive: false
    },
    generatedBy: 'HR001',
    generatedAt: new Date('2024-01-15'),
    status: HRReportStatus.GENERATING
  }
];

const reportTemplates = [
  {
    type: HRReportType.ATTENDANCE,
    title: 'Attendance Report',
    description: 'Track officer attendance, absences, and leave patterns',
    icon: <Calendar className="h-8 w-8 text-blue-600" />,
    color: 'blue'
  },
  {
    type: HRReportType.PERFORMANCE,
    title: 'Performance Report',
    description: 'Performance evaluations and ratings analysis',
    icon: <TrendingUp className="h-8 w-8 text-green-600" />,
    color: 'green'
  },
  {
    type: HRReportType.STAFFING_LEVELS,
    title: 'Staffing Report',
    description: 'Department staffing levels and deployment analysis',
    icon: <Users className="h-8 w-8 text-purple-600" />,
    color: 'purple'
  },
  {
    type: HRReportType.CERTIFICATION_STATUS,
    title: 'Certification Report',
    description: 'Track certification status and renewal requirements',
    icon: <Award className="h-8 w-8 text-yellow-600" />,
    color: 'yellow'
  },
  {
    type: HRReportType.PAYROLL,
    title: 'Payroll Report',
    description: 'Payroll summary and compensation analysis',
    icon: <BarChart3 className="h-8 w-8 text-red-600" />,
    color: 'red'
  },
  {
    type: HRReportType.TRAINING_COMPLETION,
    title: 'Training Report',
    description: 'Training completion rates and compliance tracking',
    icon: <Activity className="h-8 w-8 text-indigo-600" />,
    color: 'indigo'
  },
  {
    type: HRReportType.EMPLOYEE_DEMOGRAPHICS,
    title: 'Demographics Report',
    description: 'Employee demographics and diversity metrics',
    icon: <PieChart className="h-8 w-8 text-pink-600" />,
    color: 'pink'
  },
  {
    type: HRReportType.DISCIPLINARY_ACTIONS,
    title: 'Disciplinary Report',
    description: 'Disciplinary actions and policy compliance tracking',
    icon: <Shield className="h-8 w-8 text-orange-600" />,
    color: 'orange'
  }
];

export default function HRReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<HRReport[]>(mockReports);
  const [selectedReportType, setSelectedReportType] = useState<HRReportType | null>(null);
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reportParams, setReportParams] = useState<ReportParameters>({});
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: HRReportStatus) => {
    const variants = {
      [HRReportStatus.GENERATING]: 'secondary',
      [HRReportStatus.COMPLETED]: 'default',
      [HRReportStatus.FAILED]: 'destructive'
    };
    
    const icons = {
      [HRReportStatus.GENERATING]: <RefreshCw className="h-3 w-3 mr-1 animate-spin" />,
      [HRReportStatus.COMPLETED]: <CheckCircle className="h-3 w-3 mr-1" />,
      [HRReportStatus.FAILED]: <XCircle className="h-3 w-3 mr-1" />
    };
    
    return (
      <Badge variant={variants[status] as any} className="text-xs">
        {icons[status]}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getReportTypeIcon = (type: HRReportType) => {
    const template = reportTemplates.find(t => t.type === type);
    return template?.icon || <FileText className="h-8 w-8 text-gray-600" />;
  };

  const handleGenerateReport = async (type: HRReportType, params: ReportParameters, title: string, description: string) => {
    setIsGenerating(true);
    setGeneratingProgress(0);
    
    // Simulate report generation progress
    const interval = setInterval(() => {
      setGeneratingProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    const newReport: HRReport = {
      id: Date.now().toString(),
      type,
      title,
      description,
      parameters: params,
      generatedBy: user?.id || 'HR001',
      generatedAt: new Date(),
      status: HRReportStatus.GENERATING
    };

    setReports(prev => [newReport, ...prev]);
    setShowNewReportForm(false);
    setSelectedReportType(null);
    setReportParams({});

    // Simulate completion
    setTimeout(() => {
      setGeneratingProgress(100);
      setIsGenerating(false);
      
      // Update report status to completed
      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { 
              ...report, 
              status: HRReportStatus.COMPLETED,
              fileUrl: `/reports/${type}-${Date.now()}.pdf`
            }
          : report
      ));
    }, 4000);
  };

  const handleDownloadReport = (report: HRReport) => {
    // Simulate file download
    const link = document.createElement('a');
    link.href = report.fileUrl || '#';
    link.download = `${report.title.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderReportForm = () => {
    if (!selectedReportType) return null;

    const template = reportTemplates.find(t => t.type === selectedReportType);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {template?.icon}
          <div>
            <h3 className="text-lg font-semibold">{template?.title}</h3>
            <p className="text-gray-600">{template?.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reportTitle">Report Title *</Label>
            <Input
              id="reportTitle"
              placeholder="Enter report title"
              value={reportParams.title || ''}
              onChange={(e) => setReportParams(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="reportDescription">Description</Label>
            <Input
              id="reportDescription"
              placeholder="Enter report description"
              value={reportParams.description || ''}
              onChange={(e) => setReportParams(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={reportParams.dateRange?.startDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => setReportParams(prev => ({
                ...prev,
                dateRange: {
                  ...prev.dateRange,
                  startDate: new Date(e.target.value)
                }
              }))}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              value={reportParams.dateRange?.endDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => setReportParams(prev => ({
                ...prev,
                dateRange: {
                  ...prev.dateRange,
                  endDate: new Date(e.target.value)
                }
              }))}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>Departments</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.values(Department).map(dept => (
                <div key={dept} className="flex items-center space-x-2">
                  <Checkbox
                    id={dept}
                    checked={(reportParams.departments || []).includes(dept)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setReportParams(prev => ({
                          ...prev,
                          departments: [...(prev.departments || []), dept]
                        }));
                      } else {
                        setReportParams(prev => ({
                          ...prev,
                          departments: (prev.departments || []).filter(d => d !== dept)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={dept} className="text-sm">
                    {dept.replace('_', ' ').toUpperCase()}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Ranks</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {Object.values(OfficerRank).map(rank => (
                <div key={rank} className="flex items-center space-x-2">
                  <Checkbox
                    id={rank}
                    checked={(reportParams.ranks || []).includes(rank)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setReportParams(prev => ({
                          ...prev,
                          ranks: [...(prev.ranks || []), rank]
                        }));
                      } else {
                        setReportParams(prev => ({
                          ...prev,
                          ranks: (prev.ranks || []).filter(r => r !== rank)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={rank} className="text-sm">
                    {rank.replace('_', ' ').toUpperCase()}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeInactive"
              checked={reportParams.includeInactive || false}
              onCheckedChange={(checked) => setReportParams(prev => ({
                ...prev,
                includeInactive: checked as boolean
              }))}
            />
            <Label htmlFor="includeInactive">Include inactive employees</Label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-8 w-8 text-red-600" />
                HR Reports
              </h1>
              <p className="text-gray-600 mt-2">Generate and manage human resources reports</p>
            </div>
            <Button 
              onClick={() => setShowNewReportForm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.values(HRReportType).map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.values(HRReportStatus).map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generation Progress */}
        {isGenerating && (
          <Alert className="mb-6">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating report...</span>
                  <span>{generatingProgress}%</span>
                </div>
                <Progress value={generatingProgress} />
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getReportTypeIcon(report.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-gray-600 mb-3">{report.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <p className="font-medium">{report.type.replace('_', ' ').toUpperCase()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Generated:</span>
                          <p className="font-medium">{report.generatedAt.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Period:</span>
                          <p className="font-medium">
                            {report.parameters.dateRange ? 
                              `${report.parameters.dateRange.startDate.toLocaleDateString()} - ${report.parameters.dateRange.endDate.toLocaleDateString()}` :
                              'Not specified'
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Departments:</span>
                          <p className="font-medium">
                            {report.parameters.departments ? 
                              `${report.parameters.departments.length} selected` :
                              'All'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Report Details</DialogTitle>
                          <DialogDescription>{report.title}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="flex items-start gap-4">
                            {getReportTypeIcon(report.type)}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                              <p className="text-gray-600 mb-4">{report.description}</p>
                              <div className="flex items-center gap-2 mb-4">
                                {getStatusBadge(report.status)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Report Type</Label>
                              <p className="mt-1">{report.type.replace('_', ' ').toUpperCase()}</p>
                            </div>
                            <div>
                              <Label>Generated By</Label>
                              <p className="mt-1">{report.generatedBy}</p>
                            </div>
                            <div>
                              <Label>Generated Date</Label>
                              <p className="mt-1">{report.generatedAt.toLocaleString()}</p>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <div className="mt-1">
                                {getStatusBadge(report.status)}
                              </div>
                            </div>
                          </div>
                          
                          {report.parameters.dateRange && (
                            <div>
                              <Label>Date Range</Label>
                              <p className="mt-1">
                                {report.parameters.dateRange.startDate.toLocaleDateString()} - {' '}
                                {report.parameters.dateRange.endDate.toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          
                          {report.parameters.departments && report.parameters.departments.length > 0 && (
                            <div>
                              <Label>Departments</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {report.parameters.departments.map(dept => (
                                  <Badge key={dept} variant="outline">
                                    {dept.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {report.parameters.ranks && report.parameters.ranks.length > 0 && (
                            <div>
                              <Label>Ranks</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {report.parameters.ranks.map(rank => (
                                  <Badge key={rank} variant="outline">
                                    {rank.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end gap-2 pt-4 border-t">
                            {report.status === HRReportStatus.COMPLETED && (
                              <Button onClick={() => handleDownloadReport(report)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Report
                              </Button>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {report.status === HRReportStatus.COMPLETED && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* New Report Dialog */}
        <Dialog open={showNewReportForm} onOpenChange={setShowNewReportForm}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Select a report type and configure parameters
              </DialogDescription>
            </DialogHeader>
            
            {!selectedReportType ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Select Report Type</h3>
                <div className="grid grid-cols-2 gap-4">
                  {reportTemplates.map((template) => (
                    <Card 
                      key={template.type}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedReportType(template.type)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {template.icon}
                          <div>
                            <h4 className="font-semibold text-lg mb-2">{template.title}</h4>
                            <p className="text-gray-600 text-sm">{template.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleGenerateReport(
                  selectedReportType,
                  reportParams,
                  reportParams.title || `${selectedReportType.replace('_', ' ').toUpperCase()} Report`,
                  reportParams.description || `Generated ${selectedReportType.replace('_', ' ')} report`
                );
              }}>
                {renderReportForm()}
                
                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setSelectedReportType(null)}
                  >
                    Back to Templates
                  </Button>
                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowNewReportForm(false);
                        setSelectedReportType(null);
                        setReportParams({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!reportParams.dateRange?.startDate || !reportParams.dateRange?.endDate}
                    >
                      Generate Report
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600 mb-4">No reports match your current search criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
