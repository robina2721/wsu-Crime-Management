import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  InvestigationReport,
  ReportType,
  ReportStatus,
  Interview,
  IntervieweeType,
  TimelineEvent,
  UserRole,
} from "@shared/types";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Download,
  Users,
  MessageSquare,
  Activity,
  Scale,
  Paperclip,
} from "lucide-react";

export default function InvestigationReports() {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [reports, setReports] = useState<InvestigationReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<InvestigationReport[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] =
    useState<InvestigationReport | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newReport, setNewReport] = useState({
    caseId: "",
    title: "",
    reportType: ReportType.PRELIMINARY,
    summary: "",
    findings: "",
    recommendations: "",
  });

  const canCreateReports = hasAnyRole([
    UserRole.DETECTIVE_OFFICER,
    UserRole.POLICE_HEAD,
    UserRole.SUPER_ADMIN,
  ]);
  const canViewAllReports = hasAnyRole([
    UserRole.POLICE_HEAD,
    UserRole.SUPER_ADMIN,
  ]);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, typeFilter, statusFilter]);

  const fetchReports = async () => {
    // Mock data - In production, fetch from API
    const mockReports: InvestigationReport[] = [
      {
        id: "IR-001",
        caseId: "1",
        title: "Preliminary Investigation - Market Street Theft",
        investigatorId: "3",
        investigatorName: "Detective Sara Alemayehu",
        reportType: ReportType.PRELIMINARY,
        summary:
          "Initial investigation into theft of mobile devices from Market Street vendor. Multiple witnesses interviewed, security footage reviewed.",
        findings:
          "Evidence suggests organized theft ring targeting mobile vendors. Suspect identified through witness statements and CCTV footage. Pattern matches previous similar incidents in area.",
        recommendations:
          "Continue surveillance of suspect. Interview additional witnesses. Coordinate with vendors to implement security measures.",
        evidence: [],
        interviews: [
          {
            id: "INT-001",
            intervieweeType: IntervieweeType.WITNESS,
            intervieweeName: "Kebede Alemu",
            date: new Date("2024-01-16T14:00:00"),
            location: "Police Station",
            duration: 45,
            summary:
              "Witness observed suspect acting suspiciously around vendor stalls",
            keyPoints: [
              "Suspect was wearing dark jacket",
              "Approached multiple stalls",
              "Left quickly after theft",
            ],
            conductedBy: "Detective Sara Alemayehu",
          },
          {
            id: "INT-002",
            intervieweeType: IntervieweeType.VICTIM,
            intervieweeName: "Meron Tadesse (Vendor)",
            date: new Date("2024-01-16T15:30:00"),
            location: "Market Street",
            duration: 30,
            summary: "Victim provided details of stolen items and timeline",
            keyPoints: [
              "3 smartphones stolen",
              "Theft occurred around 2:00 PM",
              "No previous security incidents",
            ],
            conductedBy: "Detective Sara Alemayehu",
          },
        ],
        timeline: [
          {
            id: "TL-001",
            date: new Date("2024-01-15T14:00:00"),
            event: "Theft reported by vendor",
            location: "Market Street",
            source: "Victim statement",
            verified: true,
          },
          {
            id: "TL-002",
            date: new Date("2024-01-15T14:15:00"),
            event: "Police arrived on scene",
            location: "Market Street",
            source: "Police log",
            verified: true,
          },
          {
            id: "TL-003",
            date: new Date("2024-01-15T15:00:00"),
            event: "Initial witness statements taken",
            location: "Market Street",
            source: "Officer report",
            verified: true,
          },
        ],
        status: ReportStatus.SUBMITTED,
        createdAt: new Date("2024-01-16T16:00:00"),
        submittedAt: new Date("2024-01-16T18:00:00"),
      },
      {
        id: "IR-002",
        caseId: "2",
        title: "Progress Report - Domestic Violence Investigation",
        investigatorId: "3",
        investigatorName: "Detective Sara Alemayehu",
        reportType: ReportType.PROGRESS,
        summary:
          "Ongoing investigation into domestic violence case. Additional evidence collected, interviews with family members conducted.",
        findings:
          "Pattern of escalating violence documented. Medical records support victim statements. Suspect has history of similar incidents.",
        recommendations:
          "Recommend filing formal charges. Victim safety plan implemented. Continued monitoring required.",
        evidence: [],
        interviews: [
          {
            id: "INT-003",
            intervieweeType: IntervieweeType.VICTIM,
            intervieweeName: "Protected Identity",
            date: new Date("2024-01-16T10:00:00"),
            location: "Safe Location",
            duration: 90,
            summary: "Detailed account of incidents over past 6 months",
            keyPoints: [
              "Escalating threats",
              "Physical violence documented",
              "Fear for personal safety",
            ],
            conductedBy: "Detective Sara Alemayehu",
          },
        ],
        timeline: [
          {
            id: "TL-004",
            date: new Date("2024-01-16T08:00:00"),
            event: "Medical examination completed",
            location: "Hospital",
            source: "Medical report",
            verified: true,
          },
        ],
        status: ReportStatus.APPROVED,
        createdAt: new Date("2024-01-16T12:00:00"),
        submittedAt: new Date("2024-01-16T16:00:00"),
        approvedAt: new Date("2024-01-16T20:00:00"),
        approvedBy: "Chief Inspector Dawit Tadesse",
      },
      {
        id: "IR-003",
        caseId: "3",
        title: "Final Report - Vehicle Break-in Investigation",
        investigatorId: "8",
        investigatorName: "Detective Habtamu Desta",
        reportType: ReportType.FINAL,
        summary:
          "Completed investigation into vehicle break-in at City Center parking lot. Suspect identified and arrested.",
        findings:
          "Security footage revealed suspect identity. Physical evidence linked suspect to multiple similar crimes. Stolen items recovered.",
        recommendations:
          "Case ready for prosecution. Recommend enhanced security measures at parking facilities.",
        evidence: [],
        interviews: [],
        timeline: [],
        status: ReportStatus.DRAFT,
        createdAt: new Date("2024-01-17T09:00:00"),
      },
    ];

    setReports(mockReports);
    setIsLoading(false);
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.investigatorName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((report) => report.reportType === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    // If user is detective, only show their own reports unless they can view all
    if (hasRole(UserRole.DETECTIVE_OFFICER) && !canViewAllReports) {
      filtered = filtered.filter(
        (report) => report.investigatorId === user?.id,
      );
    }

    setFilteredReports(filtered);
  };

  const handleCreateReport = async () => {
    if (!user) return;

    const report: InvestigationReport = {
      id: `IR-${String(reports.length + 1).padStart(3, "0")}`,
      caseId: newReport.caseId,
      title: newReport.title,
      investigatorId: user.id,
      investigatorName: user.fullName,
      reportType: newReport.reportType,
      summary: newReport.summary,
      findings: newReport.findings,
      recommendations: newReport.recommendations,
      evidence: [],
      interviews: [],
      timeline: [],
      status: ReportStatus.DRAFT,
      createdAt: new Date(),
    };

    setReports((prev) => [report, ...prev]);
    setIsCreateDialogOpen(false);
    setNewReport({
      caseId: "",
      title: "",
      reportType: ReportType.PRELIMINARY,
      summary: "",
      findings: "",
      recommendations: "",
    });
  };

  const getStatusBadgeColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.DRAFT:
        return "bg-gray-100 text-gray-800";
      case ReportStatus.SUBMITTED:
        return "bg-blue-100 text-blue-800";
      case ReportStatus.UNDER_REVIEW:
        return "bg-yellow-100 text-yellow-800";
      case ReportStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case ReportStatus.REJECTED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeBadgeColor = (type: ReportType) => {
    switch (type) {
      case ReportType.PRELIMINARY:
        return "bg-blue-500 text-white";
      case ReportType.PROGRESS:
        return "bg-yellow-500 text-white";
      case ReportType.FINAL:
        return "bg-green-500 text-white";
      case ReportType.SUPPLEMENTAL:
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const reportStats = {
    total: filteredReports.length,
    draft: filteredReports.filter((r) => r.status === ReportStatus.DRAFT)
      .length,
    submitted: filteredReports.filter(
      (r) => r.status === ReportStatus.SUBMITTED,
    ).length,
    approved: filteredReports.filter((r) => r.status === ReportStatus.APPROVED)
      .length,
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Investigation Reports</h1>
              <p className="text-gray-300">
                Create and manage detailed investigation reports
              </p>
            </div>
            {canCreateReports && (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-crime-red hover:bg-crime-red-dark text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Investigation Report</DialogTitle>
                    <DialogDescription>
                      Document your investigation findings and recommendations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="caseId">Case ID</Label>
                        <Input
                          id="caseId"
                          value={newReport.caseId}
                          onChange={(e) =>
                            setNewReport((prev) => ({
                              ...prev,
                              caseId: e.target.value,
                            }))
                          }
                          placeholder="e.g., CASE-001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reportType">Report Type</Label>
                        <Select
                          value={newReport.reportType}
                          onValueChange={(value) =>
                            setNewReport((prev) => ({
                              ...prev,
                              reportType: value as ReportType,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ReportType.PRELIMINARY}>
                              Preliminary
                            </SelectItem>
                            <SelectItem value={ReportType.PROGRESS}>
                              Progress
                            </SelectItem>
                            <SelectItem value={ReportType.FINAL}>
                              Final
                            </SelectItem>
                            <SelectItem value={ReportType.SUPPLEMENTAL}>
                              Supplemental
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Report Title</Label>
                      <Input
                        id="title"
                        value={newReport.title}
                        onChange={(e) =>
                          setNewReport((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Brief title describing the investigation"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="summary">Summary</Label>
                      <Textarea
                        id="summary"
                        value={newReport.summary}
                        onChange={(e) =>
                          setNewReport((prev) => ({
                            ...prev,
                            summary: e.target.value,
                          }))
                        }
                        placeholder="Brief overview of the investigation..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="findings">Findings</Label>
                      <Textarea
                        id="findings"
                        value={newReport.findings}
                        onChange={(e) =>
                          setNewReport((prev) => ({
                            ...prev,
                            findings: e.target.value,
                          }))
                        }
                        placeholder="Detailed findings from the investigation..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recommendations">Recommendations</Label>
                      <Textarea
                        id="recommendations"
                        value={newReport.recommendations}
                        onChange={(e) =>
                          setNewReport((prev) => ({
                            ...prev,
                            recommendations: e.target.value,
                          }))
                        }
                        placeholder="Recommendations for next steps..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleCreateReport}
                        className="bg-crime-red hover:bg-crime-red-dark text-white"
                      >
                        Create Report
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {reportStats.total}
              </h3>
              <p className="text-gray-600">Total Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Edit className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {reportStats.draft}
              </h3>
              <p className="text-gray-600">Draft</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {reportStats.submitted}
              </h3>
              <p className="text-gray-600">Submitted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {reportStats.approved}
              </h3>
              <p className="text-gray-600">Approved</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Search & Filter Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={ReportType.PRELIMINARY}>
                    Preliminary
                  </SelectItem>
                  <SelectItem value={ReportType.PROGRESS}>Progress</SelectItem>
                  <SelectItem value={ReportType.FINAL}>Final</SelectItem>
                  <SelectItem value={ReportType.SUPPLEMENTAL}>
                    Supplemental
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={ReportStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={ReportStatus.SUBMITTED}>
                    Submitted
                  </SelectItem>
                  <SelectItem value={ReportStatus.UNDER_REVIEW}>
                    Under Review
                  </SelectItem>
                  <SelectItem value={ReportStatus.APPROVED}>
                    Approved
                  </SelectItem>
                  <SelectItem value={ReportStatus.REJECTED}>
                    Rejected
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Investigation Reports</CardTitle>
            <CardDescription>
              {filteredReports.length} report(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-crime-red" />
                        <h3 className="text-lg font-semibold text-crime-black">
                          {report.title}
                        </h3>
                        <Badge className={getTypeBadgeColor(report.reportType)}>
                          {report.reportType.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusBadgeColor(report.status)}>
                          {report.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-gray-600 mb-3">{report.summary}</p>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Scale className="w-4 h-4 mr-1" />
                          Case: {report.caseId}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {report.investigatorName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {report.interviews.length} Interview(s)
                        </div>
                      </div>

                      {report.submittedAt && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="text-blue-800">
                              Submitted:{" "}
                              {new Date(
                                report.submittedAt,
                              ).toLocaleDateString()}
                              {report.approvedAt &&
                                ` • Approved: ${new Date(report.approvedAt).toLocaleDateString()}`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>

                      {(report.investigatorId === user?.id ||
                        canViewAllReports) && (
                        <>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No reports found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search and filter criteria
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Details Dialog */}
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Investigation Report Details
              </DialogTitle>
              <DialogDescription>
                Complete investigation report information
              </DialogDescription>
            </DialogHeader>

            {selectedReport && (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="interviews">Interviews</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="evidence">Evidence</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {selectedReport.title}
                      </CardTitle>
                      <CardDescription>
                        Case: {selectedReport.caseId} • Type:{" "}
                        {selectedReport.reportType} • Status:{" "}
                        {selectedReport.status}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Summary</h4>
                        <p className="text-gray-700">
                          {selectedReport.summary}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Findings</h4>
                        <p className="text-gray-700">
                          {selectedReport.findings}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Recommendations</h4>
                        <p className="text-gray-700">
                          {selectedReport.recommendations}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="interviews" className="space-y-4">
                  <div className="space-y-4">
                    {selectedReport.interviews.map((interview) => (
                      <Card key={interview.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-crime-black">
                              {interview.intervieweeName}
                            </h4>
                            <Badge variant="outline">
                              {interview.intervieweeType
                                .replace("_", " ")
                                .toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <span className="font-medium">Date:</span>
                              <div>{interview.date.toLocaleDateString()}</div>
                            </div>
                            <div>
                              <span className="font-medium">Location:</span>
                              <div>{interview.location}</div>
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span>
                              <div>{interview.duration} minutes</div>
                            </div>
                          </div>
                          <div className="mb-3">
                            <span className="font-medium">Summary:</span>
                            <p className="text-gray-700 mt-1">
                              {interview.summary}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Key Points:</span>
                            <ul className="list-disc list-inside mt-1 text-gray-700">
                              {interview.keyPoints.map((point, index) => (
                                <li key={index}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {selectedReport.interviews.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No interviews recorded
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <div className="space-y-4">
                    {selectedReport.timeline.map((event) => (
                      <Card key={event.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-crime-black">
                              {event.event}
                            </h4>
                            <Badge
                              className={
                                event.verified
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {event.verified ? "Verified" : "Unverified"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Date/Time:</span>
                              <div>{event.date.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="font-medium">Location:</span>
                              <div>{event.location || "Not specified"}</div>
                            </div>
                            <div>
                              <span className="font-medium">Source:</span>
                              <div>{event.source}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {selectedReport.timeline.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No timeline events recorded
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="evidence" className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    <Paperclip className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>
                      Evidence management integration would be implemented here
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
