import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, CrimeCategory, CrimeStatus, Priority } from '@shared/types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { 
  FileText, 
  Download, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Filter,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Search
} from 'lucide-react';
import { format } from 'date-fns';

interface ReportData {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  criticalCases: number;
  casesByCategory: Record<string, number>;
  casesByStatus: Record<string, number>;
  casesByPriority: Record<string, number>;
  monthlyTrends: Array<{ month: string; cases: number; resolved: number }>;
  officerPerformance: Array<{ name: string; assigned: number; resolved: number; efficiency: number }>;
  locationHotspots: Array<{ location: string; incidents: number; severity: string }>;
}

export default function ReportGeneration() {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportType, setReportType] = useState<string>('crime-summary');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerateAllReports = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD]);
  const canGenerateBasicReports = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD, UserRole.DETECTIVE_OFFICER]);

  useEffect(() => {
    fetchReportData();
  }, [dateFrom, dateTo, categoryFilter, statusFilter]);

  const fetchReportData = async () => {
    setIsLoading(true);
    // Mock data - In production, fetch from API with filters
    const mockData: ReportData = {
      totalCases: 156,
      activeCases: 23,
      resolvedCases: 98,
      criticalCases: 5,
      casesByCategory: {
        'Theft': 45,
        'Assault': 23,
        'Burglary': 19,
        'Fraud': 16,
        'Drug Offense': 14,
        'Vandalism': 12,
        'Domestic Violence': 11,
        'Traffic Violation': 9,
        'Other': 7
      },
      casesByStatus: {
        'Reported': 12,
        'Under Investigation': 8,
        'Assigned': 3,
        'Resolved': 98,
        'Closed': 32,
        'Rejected': 3
      },
      casesByPriority: {
        'Critical': 5,
        'High': 18,
        'Medium': 89,
        'Low': 44
      },
      monthlyTrends: [
        { month: 'Jan', cases: 23, resolved: 19 },
        { month: 'Feb', cases: 19, resolved: 16 },
        { month: 'Mar', cases: 25, resolved: 22 },
        { month: 'Apr', cases: 21, resolved: 18 },
        { month: 'May', cases: 28, resolved: 23 }
      ],
      officerPerformance: [
        { name: 'Detective Sara Alemayehu', assigned: 15, resolved: 12, efficiency: 80 },
        { name: 'Officer Mulugeta Kebede', assigned: 8, resolved: 7, efficiency: 87.5 },
        { name: 'Officer Almaz Worku', assigned: 6, resolved: 5, efficiency: 83.3 },
        { name: 'Detective Habtamu Desta', assigned: 12, resolved: 9, efficiency: 75 }
      ],
      locationHotspots: [
        { location: 'Downtown Market Area', incidents: 23, severity: 'High' },
        { location: 'North District', incidents: 18, severity: 'Medium' },
        { location: 'City Center', incidents: 15, severity: 'Medium' },
        { location: 'Residential Block 5', incidents: 12, severity: 'High' },
        { location: 'Industrial Zone', incidents: 8, severity: 'Low' }
      ]
    };

    setTimeout(() => {
      setReportData(mockData);
      setIsLoading(false);
    }, 1000);
  };

  const generateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      // In production, this would trigger actual report generation and download
      alert(`${reportType.replace('-', ' ').toUpperCase()} report generated successfully!`);
    }, 2000);
  };

  const reportTypes = [
    { value: 'crime-summary', label: 'Crime Summary Report', description: 'Overall crime statistics and trends' },
    { value: 'officer-performance', label: 'Officer Performance Report', description: 'Individual officer statistics and efficiency' },
    { value: 'location-analysis', label: 'Location Analysis Report', description: 'Crime hotspots and geographical analysis' },
    { value: 'category-breakdown', label: 'Category Breakdown Report', description: 'Crime types and category analysis' },
    { value: 'monthly-trends', label: 'Monthly Trends Report', description: 'Time-based crime pattern analysis' },
    { value: 'operational-summary', label: 'Operational Summary', description: 'Department operational overview' }
  ];

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
          <h1 className="text-3xl font-bold mb-2">Report Generation</h1>
          <p className="text-gray-300">Comprehensive reporting and analytics system</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Report Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Report Configuration
            </CardTitle>
            <CardDescription>Configure report parameters and filters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-crime-black mb-2 block">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-crime-black mb-2 block">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium text-crime-black mb-2 block">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium text-crime-black mb-2 block">Actions</label>
                <Button 
                  onClick={generateReport} 
                  disabled={isGenerating}
                  className="w-full bg-crime-red hover:bg-crime-red-dark text-white"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value={CrimeCategory.THEFT}>Theft</SelectItem>
                  <SelectItem value={CrimeCategory.ASSAULT}>Assault</SelectItem>
                  <SelectItem value={CrimeCategory.BURGLARY}>Burglary</SelectItem>
                  <SelectItem value={CrimeCategory.FRAUD}>Fraud</SelectItem>
                  <SelectItem value={CrimeCategory.DRUG_OFFENSE}>Drug Offense</SelectItem>
                  <SelectItem value={CrimeCategory.VANDALISM}>Vandalism</SelectItem>
                  <SelectItem value={CrimeCategory.DOMESTIC_VIOLENCE}>Domestic Violence</SelectItem>
                  <SelectItem value={CrimeCategory.TRAFFIC_VIOLATION}>Traffic Violation</SelectItem>
                  <SelectItem value={CrimeCategory.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
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

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
                <Button variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        {reportData && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="text-2xl font-bold text-crime-black">{reportData.totalCases}</h3>
                    <p className="text-gray-600">Total Cases</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-crime-yellow" />
                    <h3 className="text-2xl font-bold text-crime-black">{reportData.activeCases}</h3>
                    <p className="text-gray-600">Active Cases</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="text-2xl font-bold text-crime-black">{reportData.resolvedCases}</h3>
                    <p className="text-gray-600">Resolved Cases</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-crime-red" />
                    <h3 className="text-2xl font-bold text-crime-black">{reportData.criticalCases}</h3>
                    <p className="text-gray-600">Critical Cases</p>
                  </CardContent>
                </Card>
              </div>

              {/* Cases by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Cases by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(reportData.casesByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className="mr-3">{status}</Badge>
                          <span className="text-gray-600">{count} cases</span>
                        </div>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-crime-red h-2 rounded-full" 
                            style={{ width: `${(count / reportData.totalCases) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Crime Categories Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {Object.entries(reportData.casesByCategory).slice(0, 5).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-gray-700">{category}</span>
                          <div className="flex items-center">
                            <span className="text-crime-black font-semibold mr-3">{count}</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-crime-red h-2 rounded-full" 
                                style={{ width: `${(count / Math.max(...Object.values(reportData.casesByCategory))) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {Object.entries(reportData.casesByCategory).slice(5).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-gray-700">{category}</span>
                          <div className="flex items-center">
                            <span className="text-crime-black font-semibold mr-3">{count}</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-crime-yellow h-2 rounded-full" 
                                style={{ width: `${(count / Math.max(...Object.values(reportData.casesByCategory))) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Monthly Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.monthlyTrends.map((month) => (
                      <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="font-semibold text-crime-black w-12">{month.month}</span>
                          <div className="ml-4">
                            <div className="text-sm text-gray-600">Cases: {month.cases}</div>
                            <div className="text-sm text-gray-600">Resolved: {month.resolved}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-crime-black">
                            {Math.round((month.resolved / month.cases) * 100)}%
                          </div>
                          <div className="text-xs text-gray-500">Resolution Rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Officer Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.officerPerformance.map((officer, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-crime-black">{officer.name}</h4>
                          <Badge 
                            className={
                              officer.efficiency >= 85 ? 'bg-green-100 text-green-800' :
                              officer.efficiency >= 75 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {officer.efficiency}% Efficiency
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Assigned:</span>
                            <span className="ml-2 font-semibold">{officer.assigned}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Resolved:</span>
                            <span className="ml-2 font-semibold">{officer.resolved}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Pending:</span>
                            <span className="ml-2 font-semibold">{officer.assigned - officer.resolved}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Crime Location Hotspots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.locationHotspots.map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-crime-red mr-3" />
                          <div>
                            <h4 className="font-semibold text-crime-black">{location.location}</h4>
                            <p className="text-sm text-gray-600">{location.incidents} incidents reported</p>
                          </div>
                        </div>
                        <Badge 
                          className={
                            location.severity === 'High' ? 'bg-red-100 text-red-800' :
                            location.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {location.severity} Risk
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
