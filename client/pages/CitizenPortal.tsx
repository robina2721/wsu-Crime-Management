import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import {
  FileText,
  Plus,
  Eye,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Camera,
  Upload,
  MessageSquare,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Bell,
  Star,
  Map,
  Info,
} from "lucide-react";
import {
  CrimeReport,
  CrimeCategory,
  CrimeStatus,
  Priority,
  Witness,
  CitizenReportStatus,
  StatusUpdate,
} from "../../shared/types";
import { api } from "@/lib/api";

const mockReportStatuses: CitizenReportStatus[] = [];

export default function CitizenPortal() {
  const { user } = useAuth();
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [reportStatuses, setReportStatuses] = useState<CitizenReportStatus[]>(
    [],
  );
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [formData, setFormData] = useState<Partial<CrimeReport>>({});
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [contactTextById, setContactTextById] = useState<
    Record<string, string>
  >({});
  const [messagesById, setMessagesById] = useState<
    Record<
      string,
      {
        id: string;
        senderId: string;
        senderRole: string;
        message: string;
        createdAt: string | Date;
      }[]
    >
  >({});
  const [currentTab, setCurrentTab] = useState("incident");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await api.get("/crimes?reportedBy=me");
        const data = await res.json();
        if (res.ok && data.success) {
          const list = data.data.reports.map((r: any) => ({
            ...r,
            dateReported: new Date(r.dateReported),
            dateIncident: new Date(r.dateIncident),
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt),
          }));
          setReports(list);
        }
      } catch (e) {
        console.error("Failed to load reports", e);
      }
    };
    loadReports();
  }, []);

  useEffect(() => {
    // Subscribe to real-time crime updates for this user
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return;
    const url = `/api/realtime/crimes?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload?.type === "crime_update" && payload.data) {
          const r = payload.data;
          setReports((prev) => {
            const idx = prev.findIndex((x) => x.id === r.id);
            const normalized = {
              ...r,
              dateReported: new Date(r.dateReported),
              dateIncident: new Date(r.dateIncident),
              createdAt: new Date(r.createdAt),
              updatedAt: new Date(r.updatedAt),
            } as any;
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...normalized };
              return copy;
            }
            return [normalized, ...prev];
          });
        }
        if (payload?.type === "crime_message" && payload.data) {
          const { crimeId, message } = payload.data;
          setMessagesById((prev) => ({
            ...prev,
            [crimeId]: [message, ...(prev[crimeId] || [])],
          }));
        }
        if (payload?.type === "status_update" && payload.data) {
          const { crimeId, update } = payload.data;
          setReportStatuses((prev) => {
            const copy = [...prev];
            const idx = copy.findIndex((s) => s.reportId === crimeId);
            const upd = { ...update, timestamp: new Date(update.createdAt) };
            if (idx >= 0) {
              const cur = copy[idx];
              const hist = [
                {
                  status: upd.status,
                  timestamp: upd.timestamp,
                  updatedBy: upd.updatedBy,
                  notes: upd.notes,
                  isVisibleToCitizen: !!upd.isVisibleToCitizen,
                },
                ...(cur.statusHistory || []),
              ];
              copy[idx] = {
                ...cur,
                currentStatus: upd.status || cur.currentStatus,
                statusHistory: hist,
                lastUpdate: upd.timestamp,
              };
            }
            return copy;
          });
        }
      } catch {}
    };
    es.onerror = () => {
      /* auto-reconnect by browser */
    };
    return () => {
      es.close();
    };
  }, []);

  useEffect(() => {
    const loadStatusesAndMessages = async () => {
      try {
        const statusList: CitizenReportStatus[] = [] as any;
        const msgsMap: Record<string, any[]> = {};
        await Promise.all(
          reports.map(async (r) => {
            try {
              const sRes = await api.get(`/crimes/${r.id}/status`);
              if (sRes.ok) {
                const sData = await sRes.json();
                if (sData.success)
                  statusList.push({
                    ...sData.data,
                    lastUpdate: new Date(sData.data.lastUpdate),
                    estimatedResolution: sData.data.estimatedResolution
                      ? new Date(sData.data.estimatedResolution)
                      : undefined,
                    statusHistory: (sData.data.statusHistory || []).map(
                      (u: any) => ({ ...u, timestamp: new Date(u.timestamp) }),
                    ),
                  } as CitizenReportStatus);
              }
            } catch {}
            try {
              const mRes = await api.get(`/crimes/${r.id}/messages`);
              if (mRes.ok) {
                const mData = await mRes.json();
                if (mData.success) msgsMap[r.id] = mData.data.messages || [];
              }
            } catch {}
          }),
        );
        setReportStatuses(statusList);
        setMessagesById(msgsMap);
      } catch {}
    };
    if (reports.length) loadStatusesAndMessages();
  }, [reports]);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesCategory =
      filterCategory === "all" || report.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: CrimeStatus) => {
    const variants = {
      [CrimeStatus.REPORTED]: "secondary",
      [CrimeStatus.UNDER_INVESTIGATION]: "default",
      [CrimeStatus.ASSIGNED]: "outline",
      [CrimeStatus.RESOLVED]: "default",
      [CrimeStatus.CLOSED]: "outline",
      [CrimeStatus.REJECTED]: "destructive",
    };

    const icons = {
      [CrimeStatus.REPORTED]: <Clock className="h-3 w-3 mr-1" />,
      [CrimeStatus.UNDER_INVESTIGATION]: <RefreshCw className="h-3 w-3 mr-1" />,
      [CrimeStatus.ASSIGNED]: <User className="h-3 w-3 mr-1" />,
      [CrimeStatus.RESOLVED]: <CheckCircle className="h-3 w-3 mr-1" />,
      [CrimeStatus.CLOSED]: <CheckCircle className="h-3 w-3 mr-1" />,
      [CrimeStatus.REJECTED]: <XCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant={variants[status] as any} className="text-xs">
        {icons[status]}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Priority) => {
    const variants = {
      [Priority.LOW]: "outline",
      [Priority.MEDIUM]: "secondary",
      [Priority.HIGH]: "destructive",
      [Priority.CRITICAL]: "destructive",
    };

    return (
      <Badge variant={variants[priority] as any}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: CrimeCategory) => {
    const icons = {
      [CrimeCategory.THEFT]: "🔒",
      [CrimeCategory.ASSAULT]: "⚠️",
      [CrimeCategory.BURGLARY]: "🏠",
      [CrimeCategory.FRAUD]: "💳",
      [CrimeCategory.VANDALISM]: "🔨",
      [CrimeCategory.DRUG_OFFENSE]: "💊",
      [CrimeCategory.DOMESTIC_VIOLENCE]: "🏠",
      [CrimeCategory.TRAFFIC_VIOLATION]: "🚗",
      [CrimeCategory.OTHER]: "📋",
    };

    return icons[category] || "📋";
  };

  const handleSubmitReport = async (data: Partial<CrimeReport>) => {
    try {
      const payload = {
        title: data.title || "",
        description: data.description || "",
        category: data.category || CrimeCategory.OTHER,
        location: data.location || "",
        dateIncident: (data.dateIncident || new Date()).toString(),
        reportedBy: user?.id || "citizen",
        evidence: [],
        witnesses: witnesses,
      };
      const res = await api.post("/crimes", payload);
      if (res.ok) {
        const created = await res.json();
        const r = created.data;
        // Upload evidence files if any
        let uploadedEvidence: any[] = [];
        if (evidenceFiles.length) {
          try {
            const form = new FormData();
            evidenceFiles.forEach((f) => form.append("files", f));
            const upRes = await api.post(`/crimes/${r.id}/evidence`, form);
            if (upRes.ok) {
              const upData = await upRes.json();
              if (upData.success) uploadedEvidence = upData.data || [];
            }
          } catch {}
        }
        const normalized: CrimeReport = {
          ...r,
          dateReported: new Date(r.dateReported),
          dateIncident: new Date(r.dateIncident),
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
          evidence: (uploadedEvidence || []).map((e: any) => e.fileName) as any,
          witnesses: [],
        } as any;
        setReports((prev) => [normalized, ...prev]);
        setFormData({});
        setWitnesses([]);
        setEvidenceFiles([]);
        setShowNewReportForm(false);
      }
    } catch (e) {
      console.error("Failed to submit report", e);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    // Simulate upload delay
    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);

      const selected = Array.from(files);
      setEvidenceFiles((prev) => [...prev, ...selected]);
      const fileNames = selected.map((file) => file.name);
      setFormData((prev) => ({
        ...prev,
        evidence: [...(prev.evidence || []), ...fileNames],
      }));
    }, 2000);
  };

  const addWitness = () => {
    setWitnesses((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        phone: "",
        email: "",
        statement: "",
        reportId: "",
      },
    ]);
  };

  const updateWitness = (index: number, field: string, value: string) => {
    setWitnesses((prev) =>
      prev.map((witness, i) =>
        i === index ? { ...witness, [field]: value } : witness,
      ),
    );
  };

  const removeWitness = (index: number) => {
    setWitnesses((prev) => prev.filter((_, i) => i !== index));
  };

  const getReportStatus = (reportId: string) => {
    return reportStatuses.find((status) => status.reportId === reportId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-8 w-8 text-red-600" />
                Citizen Portal
              </h1>
              <p className="text-gray-600 mt-2">
                Submit and track your crime reports
              </p>
            </div>
            <Button
              onClick={() => setShowNewReportForm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Under Investigation</p>
                  <p className="text-2xl font-bold">
                    {
                      reports.filter(
                        (r) => r.status === CrimeStatus.UNDER_INVESTIGATION,
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold">
                    {
                      reports.filter((r) => r.status === CrimeStatus.RESOLVED)
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold">2 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.values(CrimeStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.values(CrimeCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {getCategoryIcon(category)}{" "}
                        {category.replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.map((report) => {
            const status = getReportStatus(report.id);
            return (
              <Card
                key={report.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-2xl mt-1">
                        {getCategoryIcon(report.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {report.title}
                          </h3>
                          {getStatusBadge(report.status)}
                          {getPriorityBadge(report.priority)}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {report.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{report.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {report.dateIncident.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                              Reported{" "}
                              {report.dateReported.toLocaleDateString()}
                            </span>
                          </div>
                          {status?.assignedOfficer && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="truncate">
                                {status.assignedOfficer.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {status?.estimatedResolution &&
                          report.status === CrimeStatus.UNDER_INVESTIGATION && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center gap-2 text-sm text-blue-700">
                                <Info className="h-4 w-4" />
                                <span>
                                  Estimated resolution:{" "}
                                  {status.estimatedResolution.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
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
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Report Details - {report.title}
                            </DialogTitle>
                            <DialogDescription>
                              Report ID: {report.id}
                            </DialogDescription>
                          </DialogHeader>
                          <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="details">Details</TabsTrigger>
                              <TabsTrigger value="status">
                                Status Tracking
                              </TabsTrigger>
                              <TabsTrigger value="contact">
                                Contact Officer
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="details" className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <Label>Category</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-lg">
                                      {getCategoryIcon(report.category)}
                                    </span>
                                    <span>
                                      {report.category
                                        .replace("_", " ")
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <Label>Priority</Label>
                                  <div className="mt-1">
                                    {getPriorityBadge(report.priority)}
                                  </div>
                                </div>
                                <div>
                                  <Label>Incident Date</Label>
                                  <p className="mt-1">
                                    {report.dateIncident.toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <Label>Reported Date</Label>
                                  <p className="mt-1">
                                    {report.dateReported.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <Label>Location</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>{report.location}</span>
                                </div>
                              </div>

                              <div>
                                <Label>Description</Label>
                                <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                                  {report.description}
                                </p>
                              </div>

                              {report.evidence &&
                                (report.evidence as any).length > 0 && (
                                  <div>
                                    <Label>Evidence</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      {(report.evidence as any).map((ev: any, index: number) => {
                                        const name = typeof ev === "string" ? ev : ev.fileName;
                                        const type = typeof ev === "string" ? "" : ev.fileType || "";
                                        const isImg = type.startsWith("image/") || name.match(/\.(png|jpg|jpeg|gif|webp)$/i);
                                        const isVideo = type.startsWith("video/") || name.match(/\.(mp4|webm|ogg)$/i);
                                        return (
                                          <div key={index} className="p-2 border rounded">
                                            {isImg ? (
                                              <img src={name} alt={`evidence-${index}`} className="h-24 w-full object-cover rounded" />
                                            ) : isVideo ? (
                                              <video src={name} controls className="h-24 w-full rounded" />
                                            ) : (
                                              <div className="flex items-center gap-2">
                                                <Camera className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm truncate">{name}</span>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                              {report.witnesses &&
                                report.witnesses.length > 0 && (
                                  <div>
                                    <Label>Witnesses</Label>
                                    <div className="space-y-2 mt-2">
                                      {report.witnesses.map(
                                        (witness, index) => (
                                          <div
                                            key={index}
                                            className="p-3 border rounded"
                                          >
                                            <p className="font-medium">
                                              {witness.name}
                                            </p>
                                            {witness.phone && (
                                              <p className="text-sm text-gray-600">
                                                {witness.phone}
                                              </p>
                                            )}
                                            {witness.email && (
                                              <p className="text-sm text-gray-600">
                                                {witness.email}
                                              </p>
                                            )}
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                            </TabsContent>
                            <TabsContent value="status" className="space-y-6">
                              {status && (
                                <div>
                                  <div className="flex items-center justify-between mb-4">
                                    <div>
                                      <h3 className="font-semibold">
                                        Current Status
                                      </h3>
                                      <div className="mt-1">
                                        {getStatusBadge(status.currentStatus)}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-600">
                                        Last Updated
                                      </p>
                                      <p className="font-medium">
                                        {status.lastUpdate.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-3">
                                      Status History
                                    </h4>
                                    <div className="space-y-4">
                                      {status.statusHistory.map(
                                        (update, index) => (
                                          <div
                                            key={index}
                                            className="flex gap-4"
                                          >
                                            <div className="flex flex-col items-center">
                                              <div
                                                className={`w-3 h-3 rounded-full ${
                                                  index === 0
                                                    ? "bg-red-500"
                                                    : "bg-gray-300"
                                                }`}
                                              />
                                              {index <
                                                status.statusHistory.length -
                                                  1 && (
                                                <div className="w-px h-8 bg-gray-300 mt-2" />
                                              )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                              <div className="flex items-center gap-2 mb-1">
                                                {getStatusBadge(update.status)}
                                                <span className="text-sm text-gray-500">
                                                  by {update.updatedBy}
                                                </span>
                                              </div>
                                              <p className="text-sm text-gray-600 mb-1">
                                                {update.timestamp.toLocaleString()}
                                              </p>
                                              {update.notes && (
                                                <p className="text-sm">
                                                  {update.notes}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </TabsContent>
                            <TabsContent value="contact" className="space-y-6">
                              {status?.assignedOfficer ? (
                                <div>
                                  <div className="flex items-center gap-4 mb-4">
                                    <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                                      <User className="h-8 w-8 text-gray-600" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-lg">
                                        {status.assignedOfficer.name}
                                      </h3>
                                      <p className="text-gray-600">
                                        {status.assignedOfficer.badgeNumber}
                                      </p>
                                    </div>
                                  </div>

                                  {status.assignedOfficer.contactInfo && (
                                    <Alert>
                                      <Info className="h-4 w-4" />
                                      <AlertDescription>
                                        {status.assignedOfficer.contactInfo}
                                      </AlertDescription>
                                    </Alert>
                                  )}

                                  {status.canProvideUpdates && (
                                    <div className="space-y-4">
                                      <div>
                                        <Label
                                          htmlFor={`additionalInfo-${report.id}`}
                                        >
                                          Provide Additional Information
                                        </Label>
                                        <Textarea
                                          id={`additionalInfo-${report.id}`}
                                          placeholder="Any additional information or updates regarding this incident..."
                                          className="mt-1"
                                          value={
                                            contactTextById[report.id] || ""
                                          }
                                          onChange={(e) =>
                                            setContactTextById((prev) => ({
                                              ...prev,
                                              [report.id]: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Conversation</Label>
                                        <div className="max-h-40 overflow-y-auto border rounded p-2 bg-white">
                                          {(messagesById[report.id] || [])
                                            .slice()
                                            .reverse()
                                            .map((m, idx) => (
                                              <div
                                                key={m.id || idx}
                                                className="text-sm mb-2"
                                              >
                                                <span className="font-medium">
                                                  {m.senderRole}:
                                                </span>{" "}
                                                {m.message}
                                                <span className="text-xs text-gray-500 ml-2">
                                                  {new Date(
                                                    m.createdAt,
                                                  ).toLocaleString()}
                                                </span>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                      <Button
                                        className="bg-red-600 hover:bg-red-700"
                                        type="button"
                                        onClick={async () => {
                                          const msg = (
                                            contactTextById[report.id] || ""
                                          ).trim();
                                          if (!msg) return;
                                          try {
                                            const res = await api.post(
                                              `/crimes/${report.id}/messages`,
                                              { message: msg },
                                            );
                                            if (res.ok) {
                                              const data = await res.json();
                                              if (data.success) {
                                                setMessagesById((prev) => ({
                                                  ...prev,
                                                  [report.id]: [
                                                    data.data,
                                                    ...(prev[report.id] || []),
                                                  ],
                                                }));
                                                setContactTextById((prev) => ({
                                                  ...prev,
                                                  [report.id]: "",
                                                }));
                                              }
                                            }
                                          } catch {}
                                        }}
                                      >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Submit Update
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No Officer Assigned
                                  </h3>
                                  <p className="text-gray-600">
                                    This report is pending assignment to an
                                    investigating officer.
                                  </p>
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* New Report Form Dialog */}
        <Dialog open={showNewReportForm} onOpenChange={setShowNewReportForm}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Crime Report</DialogTitle>
              <DialogDescription>
                Provide details about the incident you wish to report
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (currentTab !== "review") {
                  setCurrentTab("review");
                  return;
                }
                handleSubmitReport(formData);
              }}
            >
              <Tabs
                value={currentTab}
                onValueChange={setCurrentTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="incident">Incident Details</TabsTrigger>
                  <TabsTrigger value="evidence">
                    Evidence & Witnesses
                  </TabsTrigger>
                  <TabsTrigger value="review">Review & Submit</TabsTrigger>
                </TabsList>
                <TabsContent value="incident" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Incident Title *</Label>
                      <Input
                        id="title"
                        required
                        value={formData.title || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Brief description of the incident"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category || ""}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: value as CrimeCategory,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(CrimeCategory).map((category) => (
                            <SelectItem key={category} value={category}>
                              {getCategoryIcon(category)}{" "}
                              {category.replace("_", " ").toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateIncident">Date of Incident *</Label>
                      <Input
                        id="dateIncident"
                        type="datetime-local"
                        required
                        value={
                          formData.dateIncident?.toISOString().slice(0, 16) ||
                          ""
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dateIncident: new Date(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority || Priority.MEDIUM}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            priority: value as Priority,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(Priority).map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      required
                      value={formData.location || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="Address or description of the location"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      required
                      rows={6}
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Provide a detailed description of what happened, including dates, times, people involved, and any other relevant information..."
                    />
                  </div>
                </TabsContent>
                <TabsContent value="evidence" className="space-y-6">
                  <div>
                    <Label>Upload Evidence</Label>
                    <div className="flex items-center justify-center w-full mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            Click to upload photos, videos, or documents
                          </p>
                          <p className="text-xs text-gray-400">
                            Max file size: 10MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*,video/*"
                          onChange={(e) => {
                            if (e.target.files) {
                              handleFileUpload(e.target.files);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {isUploading && (
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                          <span>Uploading files...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}

                    {evidenceFiles.length > 0 && (
                      <div className="mt-4">
                        <Label>Uploaded Files</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {evidenceFiles.map((file, index) => (
                            <div key={index} className="p-2 border rounded">
                              {file.type.startsWith("image/") ? (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="h-24 w-full object-cover rounded"
                                />
                              ) : (
                                <video
                                  src={URL.createObjectURL(file)}
                                  controls
                                  className="h-24 w-full rounded"
                                />
                              )}
                              <p className="text-xs mt-1 truncate">
                                {file.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Witnesses</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addWitness}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Witness
                      </Button>
                    </div>
                    {witnesses.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No witnesses added
                      </p>
                    ) : (
                      <div className="space-y-4 mt-4">
                        {witnesses.map((witness, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-medium">
                                  Witness {index + 1}
                                </h4>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeWitness(index)}
                                >
                                  Remove
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Name</Label>
                                  <Input
                                    value={witness.name}
                                    onChange={(e) =>
                                      updateWitness(
                                        index,
                                        "name",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Witness name"
                                  />
                                </div>
                                <div>
                                  <Label>Phone</Label>
                                  <Input
                                    value={witness.phone || ""}
                                    onChange={(e) =>
                                      updateWitness(
                                        index,
                                        "phone",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Phone number"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label>Email</Label>
                                  <Input
                                    type="email"
                                    value={witness.email || ""}
                                    onChange={(e) =>
                                      updateWitness(
                                        index,
                                        "email",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Email address"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label>Statement</Label>
                                  <Textarea
                                    value={witness.statement}
                                    onChange={(e) =>
                                      updateWitness(
                                        index,
                                        "statement",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="What did this witness see or know about the incident?"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="review" className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">
                      Review Your Report
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Title</Label>
                          <p className="mt-1">
                            {formData.title || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <Label>Category</Label>
                          <p className="mt-1">
                            {formData.category
                              ? `${getCategoryIcon(formData.category)} ${formData.category.replace("_", " ").toUpperCase()}`
                              : "Not selected"}
                          </p>
                        </div>
                        <div>
                          <Label>Date of Incident</Label>
                          <p className="mt-1">
                            {formData.dateIncident
                              ? formData.dateIncident.toLocaleString()
                              : "Not provided"}
                          </p>
                        </div>
                        <div>
                          <Label>Priority</Label>
                          <p className="mt-1">
                            {formData.priority || Priority.MEDIUM}
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label>Location</Label>
                        <p className="mt-1">
                          {formData.location || "Not provided"}
                        </p>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <p className="mt-1 whitespace-pre-wrap">
                          {formData.description || "Not provided"}
                        </p>
                      </div>

                      <div>
                        <Label>Evidence Files</Label>
                        <p className="mt-1">
                          {formData.evidence && formData.evidence.length > 0
                            ? `${formData.evidence.length} files uploaded`
                            : "No files uploaded"}
                        </p>
                      </div>

                      <div>
                        <Label>Witnesses</Label>
                        <p className="mt-1">
                          {witnesses.length > 0
                            ? `${witnesses.length} witnesses added`
                            : "No witnesses added"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      By submitting this report, you confirm that the
                      information provided is accurate to the best of your
                      knowledge. You will receive a report ID and can track the
                      status of your report through this portal.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewReportForm(false);
                    setFormData({});
                    setWitnesses([]);
                    setEvidenceFiles([]);
                  }}
                >
                  Cancel
                </Button>
                {currentTab === "review" && (
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    Submit Report
                  </Button>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No reports found
              </h3>
              <p className="text-gray-600 mb-4">
                You haven't submitted any reports yet or no reports match your
                search criteria.
              </p>
              <Button
                onClick={() => setShowNewReportForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit Your First Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
