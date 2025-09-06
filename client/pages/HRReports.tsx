import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Award,
} from "lucide-react";
import {
  HRReport,
  HRReportType,
  HRReportStatus,
  ReportParameters,
  Department,
  OfficerRank,
} from "../../shared/types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";

export default function HRReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<HRReport[]>([]);
  const [selectedReportType, setSelectedReportType] =
    useState<HRReportType | null>(null);
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [reportParams, setReportParams] = useState<ReportParameters>({});
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/hr/reports");
        if (res.ok) {
          const d = await res.json();
          setReports(d.data.reports || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getReportTypeIcon = (type: HRReportType) => {
    switch (type) {
      case HRReportType.ATTENDANCE:
        return <FileText className="h-8 w-8 text-blue-600" />;
      case HRReportType.PERFORMANCE:
        return <TrendingUp className="h-8 w-8 text-green-600" />;
      case HRReportType.STAFFING_LEVELS:
        return <Users className="h-8 w-8 text-purple-600" />;
      case HRReportType.CERTIFICATION_STATUS:
        return <Award className="h-8 w-8 text-yellow-600" />;
      case HRReportType.PAYROLL:
        return <BarChart3 className="h-8 w-8 text-red-600" />;
      case HRReportType.TRAINING_COMPLETION:
        return <Activity className="h-8 w-8 text-indigo-600" />;
      case HRReportType.EMPLOYEE_DEMOGRAPHICS:
        return <PieChart className="h-8 w-8 text-pink-600" />;
      case HRReportType.DISCIPLINARY_ACTIONS:
        return <FileText className="h-8 w-8 text-orange-600" />;
      default:
        return <FileText className="h-8 w-8 text-gray-600" />;
    }
  };

  const handleGenerateReport = async (
    type: HRReportType,
    params: ReportParameters,
    title: string,
    description: string,
  ) => {
    setIsGenerating(true);
    setGeneratingProgress(0);
    try {
      const payload: any = { type, title, description, parameters: params };
      const res = await api.post("/hr/reports", payload);
      if (res.ok) {
        const d = await res.json();
        setReports((prev) => [d.data, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
    // Simulate progress locally while backend processes
    const interval = setInterval(() => {
      setGeneratingProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);
    setTimeout(() => {
      setGeneratingProgress(100);
      setIsGenerating(false);
    }, 4000);
    setShowNewReportForm(false);
    setSelectedReportType(null);
    setReportParams({});
  };

  const handleDownloadReport = (report: HRReport) => {
    const link = document.createElement("a");
    link.href = report.fileUrl || "#";
    link.download = `${report.title.replace(/\s+/g, "-")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                {getReportTypeIcon(HRReportType.ATTENDANCE)} HR Reports
              </h1>
              <p className="text-gray-600 mt-2">
                Generate and manage HR reports
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowNewReportForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                New Report
              </Button>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.values(HRReportType).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace("_", " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(HRReportStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-sm text-gray-600">{r.description}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadReport(r)}
                  >
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {showNewReportForm && (
          <Dialog open={showNewReportForm} onOpenChange={setShowNewReportForm}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Report Type</Label>
                  <select
                    className="w-full border rounded p-2"
                    value={selectedReportType || ""}
                    onChange={(e) =>
                      setSelectedReportType(e.target.value as HRReportType)
                    }
                  >
                    <option value="">Select type</option>
                    {Object.values(HRReportType).map((t) => (
                      <option key={t} value={t}>
                        {t.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={reportParams.title || ""}
                    onChange={(e) =>
                      setReportParams((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={reportParams.description || ""}
                    onChange={(e) =>
                      setReportParams((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    className="bg-red-600 text-white"
                    onClick={() =>
                      selectedReportType &&
                      handleGenerateReport(
                        selectedReportType,
                        reportParams,
                        reportParams.title || "Report",
                        reportParams.description || "",
                      )
                    }
                  >
                    Generate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewReportForm(false)}
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
  );
}
