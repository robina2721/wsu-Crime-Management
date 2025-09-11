import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
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
  MapPin,
  Calendar,
  Clock,
  User,
  Camera,
  Upload,
  MessageSquare,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  CrimeReport,
  CrimeCategory,
  CrimeStatus,
  Priority,
  Witness,
  CitizenReportStatus,
  IncidentReport,
  IncidentType,
  IncidentStatus,
} from "../../shared/types";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function CitizenPortal() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [activeSection, setActiveSection] = useState<"crimes" | "incidents">(
    "crimes",
  );
  const [reportType, setReportType] = useState<"crime" | "incident">("crime");

  // Crimes state
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
  const [submissionStatus, setSubmissionStatus] = useState<null | {
    type: "success" | "error";
    message: string;
  }>(null);

  const steps = React.useMemo(
    () =>
      reportType === "crime"
        ? ["incident", "evidence", "review"]
        : ["incident", "review"],
    [reportType],
  );
  const stepIndex = steps.indexOf(currentTab);
  const stepProgress = Math.round(((stepIndex + 1) / steps.length) * 100);
  const goNext = () =>
    setCurrentTab(steps[Math.min(stepIndex + 1, steps.length - 1)]);
  const goPrev = () => setCurrentTab(steps[Math.max(stepIndex - 1, 0)]);

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("crime_report_draft");
      if (raw) {
        const d = JSON.parse(raw);
        if (d) {
          if (d.formData) setFormData(d.formData);
          if (Array.isArray(d.witnesses)) setWitnesses(d.witnesses);
          if (d.currentTab) setCurrentTab(d.currentTab);
          if (d.reportType) setReportType(d.reportType);
          // evidenceFiles cannot be restored (files are not persisted); keep names in formData.evidence
          if (d.formData && d.formData.evidence) {
            setFormData((prev) => ({ ...prev, evidence: d.formData.evidence }));
          }
        }
      }
    } catch (e) {}
  }, []);

  // Persist draft whenever these change
  useEffect(() => {
    try {
      const draft = {
        formData: { ...formData },
        witnesses: [...witnesses],
        currentTab,
        reportType,
      };
      localStorage.setItem("crime_report_draft", JSON.stringify(draft));
    } catch (e) {}
  }, [formData, witnesses, currentTab, reportType]);

  // Incidents state
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [incidentTypeFilter, setIncidentTypeFilter] = useState<string>("all");
  const [incidentStatusFilter, setIncidentStatusFilter] =
    useState<string>("all");

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
    const loadIncidents = async () => {
      try {
        const res = await api.get("/incidents?reportedBy=me");
        const data = await res.json();
        if (res.ok && data.success) {
          const list = (data.data?.incidents || data.data || []).map(
            (i: any) => ({
              ...i,
              dateOccurred: new Date(i.dateOccurred),
              createdAt: new Date(i.createdAt),
              updatedAt: new Date(i.updatedAt),
            }),
          );
          setIncidents(list);
        }
      } catch (e) {
        console.error("Failed to load incidents", e);
      }
    };
    loadReports();
    loadIncidents();
  }, []);

  useEffect(() => {
    // Subscribe to real-time crime updates for this user
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return;

    const crimesEs = new EventSource(
      `/api/realtime/crimes?token=${encodeURIComponent(token)}`,
    );
    crimesEs.onmessage = (e) => {
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
              copy[idx] = { ...copy[idx], ...normalized } as any;
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
              } as any;
            }
            return copy;
          });
        }
      } catch {}
    };
    crimesEs.onerror = () => {};

    const incidentsEs = new EventSource(
      `/api/realtime/incidents?token=${encodeURIComponent(token)}`,
    );
    incidentsEs.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload?.type === "incident_update") {
          const ev = payload.data;
          const inc = ev.incident || ev;
          setIncidents((prev) => {
            const idx = prev.findIndex((x) => x.id === inc.id);
            const normalized: IncidentReport = {
              ...inc,
              dateOccurred: new Date(inc.dateOccurred),
              createdAt: new Date(inc.createdAt),
              updatedAt: new Date(inc.updatedAt),
            } as any;
            if (ev.type === "deleted")
              return prev.filter((x) => x.id !== inc.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...normalized } as any;
              return copy;
            }
            // Only add if created by this user
            if (normalized.reportedBy === user?.id)
              return [normalized, ...prev];
            return prev;
          });
        }
      } catch {}
    };
    incidentsEs.onerror = () => {};

    return () => {
      crimesEs.close();
      incidentsEs.close();
    };
  }, [user?.id]);

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

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      incidentStatusFilter === "all" ||
      incident.status === incidentStatusFilter;
    const matchesType =
      incidentTypeFilter === "all" ||
      incident.incidentType === incidentTypeFilter;
    const matchesOwner = incident.reportedBy === user?.id;
    return matchesOwner && matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: CrimeStatus) => {
    const variants: Record<CrimeStatus, any> = {
      [CrimeStatus.REPORTED]: "secondary",
      [CrimeStatus.UNDER_INVESTIGATION]: "default",
      [CrimeStatus.ASSIGNED]: "outline",
      [CrimeStatus.RESOLVED]: "default",
      [CrimeStatus.CLOSED]: "outline",
      [CrimeStatus.REJECTED]: "destructive",
    } as const;

    const icons: Record<CrimeStatus, React.ReactNode> = {
      [CrimeStatus.REPORTED]: <Clock className="h-3 w-3 mr-1" />,
      [CrimeStatus.UNDER_INVESTIGATION]: <RefreshCw className="h-3 w-3 mr-1" />,
      [CrimeStatus.ASSIGNED]: <User className="h-3 w-3 mr-1" />,
      [CrimeStatus.RESOLVED]: <CheckCircle className="h-3 w-3 mr-1" />,
      [CrimeStatus.CLOSED]: <CheckCircle className="h-3 w-3 mr-1" />,
      [CrimeStatus.REJECTED]: <XCircle className="h-3 w-3 mr-1" />,
    } as const;

    return (
      <Badge variant={variants[status] as any} className="text-xs">
        {icons[status]}
        {t(`status.${status}`, status.replace("_", " "))}
      </Badge>
    );
  };

  const getIncidentStatusBadge = (status: IncidentStatus) => {
    const cls = (s: IncidentStatus) => {
      switch (s) {
        case IncidentStatus.REPORTED:
          return "bg-blue-100 text-blue-800";
        case IncidentStatus.INVESTIGATING:
          return "bg-yellow-100 text-yellow-800";
        case IncidentStatus.ESCALATED:
          return "bg-red-600 text-white";
        case IncidentStatus.RESOLVED:
          return "bg-green-100 text-green-800";
        case IncidentStatus.CLOSED:
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };
    return (
      <span className={`text-xs px-2 py-1 rounded ${cls(status)}`}>
        {t(`incidentStatus.${status}`, status)}
      </span>
    );
  };

  const getPriorityBadge = (priority: Priority) => {
    const variants = {
      [Priority.LOW]: "outline",
      [Priority.MEDIUM]: "secondary",
      [Priority.HIGH]: "destructive",
      [Priority.CRITICAL]: "destructive",
    } as const;

    return (
      <Badge variant={variants[priority] as any}>
        {t(`priority.${priority}`, priority.toUpperCase())}
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
    } as const;

    return icons[category] || "📋";
  };

  const handleSubmitReport = async () => {
    if (reportType === "crime") {
      const data = formData;
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
            evidence: (uploadedEvidence || []).map(
              (e: any) => e.fileName,
            ) as any,
            witnesses: [],
          } as any;
          setReports((prev) => [normalized, ...prev]);
          setFormData({});
          setWitnesses([]);
          setEvidenceFiles([]);
          localStorage.removeItem("crime_report_draft");
          setSubmissionStatus({
            type: "success",
            message:
              "Your Report Is Successfully Submmited Stay in Touch For Update",
          });
          toast({
            title: "Success",
            description:
              "Your Report Is Successfully Submmited Stay in Touch For Update",
          });
        } else {
          setSubmissionStatus({
            type: "error",
            message: "Failed to submit report",
          });
        }
      } catch (e) {
        console.error("Failed to submit report", e);
      }
    } else {
      // Incident report
      try {
        const payload = {
          title: (formData as any).title || "",
          description: (formData as any).description || "",
          incidentType:
            ((formData as any).incidentType as any) ||
            IncidentType.PATROL_OBSERVATION,
          severity: (formData as any).priority || Priority.LOW,
          location: (formData as any).location || "",
          dateOccurred: (
            (formData as any).dateIncident || new Date()
          ).toString(),
          followUpRequired: false,
        };
        const res = await api.post("/incidents", payload);
        if (!res.ok) return;
        const data = await res.json();
        const r = data.data;
        const created: IncidentReport = {
          ...r,
          dateOccurred: new Date(r.dateOccurred),
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        };
        setIncidents((prev) => [created, ...prev]);
        setFormData({});
        setWitnesses([]);
        setEvidenceFiles([]);
        localStorage.removeItem("crime_report_draft");
        setSubmissionStatus({
          type: "success",
          message:
            "Your Report Is Successfully Submmited Stay in Touch For Update",
        });
        toast({
          title: "Success",
          description:
            "Your Report Is Successfully Submmited Stay in Touch For Update",
        });
        setTimeout(() => {
          setShowNewReportForm(false);
          setReportType("incident");
          setSubmissionStatus(null);
        }, 1200);
      } catch (e) {
        console.error("Failed to create incident", e);
        setSubmissionStatus({
          type: "error",
          message: "Failed to submit incident",
        });
      }
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

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
                {t("citizen.title", "Citizen Portal")}
              </h1>
              <p className="text-gray-600 mt-2">{t("citizen.subtitle")}</p>
            </div>
            <Dialog
              open={showNewReportForm}
              onOpenChange={setShowNewReportForm}
            >
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("citizen.reportButton", "New Report")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {reportType === "crime"
                      ? t("dialog.submitCrimeReportTitle")
                      : t("dialog.submitIncidentReportTitle")}
                  </DialogTitle>
                  <DialogDescription>
                    {reportType === "crime"
                      ? t("dialog.submitCrimeReportDesc")
                      : t("dialog.submitIncidentReportDesc")}
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (currentTab !== "review") {
                      setCurrentTab("review");
                      return;
                    }
                    handleSubmitReport();
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="md:col-span-1">
                      <Label>Type</Label>
                      <Select
                        value={reportType}
                        onValueChange={(v) => setReportType(v as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crime">Crime Report</SelectItem>
                          <SelectItem value="incident">
                            Incident Report
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Step {stepIndex + 1} of {steps.length}
                    </span>
                  </div>
                  <Progress value={stepProgress} className="mb-4" />
                  <Tabs
                    value={currentTab}
                    onValueChange={setCurrentTab}
                    className="w-full"
                  >
                    <TabsContent value="incident" className="space-y-4">
                      {reportType === "crime" ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="title">
                                {t("crime.form.title")}
                              </Label>
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
                                placeholder={t(
                                  "crime.form.placeholder.title",
                                  "Brief description of the incident",
                                )}
                              />
                            </div>
                            <div>
                              <Label htmlFor="category">
                                {t("crime.form.category")}
                              </Label>
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
                                  <SelectValue
                                    placeholder={t("filters.category")}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(CrimeCategory).map(
                                    (category) => (
                                      <SelectItem
                                        key={category}
                                        value={category}
                                      >
                                        {getCategoryIcon(category)}{" "}
                                        {t(
                                          `category.${category}`,
                                          category
                                            .replace("_", " ")
                                            .toUpperCase(),
                                        )}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="dateIncident">
                                {t("crime.form.date")}
                              </Label>
                              <Input
                                id="dateIncident"
                                type="datetime-local"
                                required
                                value={
                                  formData.dateIncident
                                    ?.toISOString()
                                    .slice(0, 16) || ""
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
                              <Label htmlFor="priority">
                                {t("crime.form.priority")}
                              </Label>
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
                                      {t(
                                        `priority.${priority}`,
                                        priority.toUpperCase(),
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="location">
                              {t("crime.form.location")}
                            </Label>
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
                              placeholder={t(
                                "crime.form.placeholder.location",
                                "Address or description of the location",
                              )}
                            />
                          </div>

                          <div>
                            <Label htmlFor="description">
                              {t("crime.form.description")}
                            </Label>
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
                              placeholder={t(
                                "crime.form.placeholder.description",
                                "Provide a detailed description...",
                              )}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="title">
                                {t("incident.form.title")}
                              </Label>
                              <Input
                                id="title"
                                required
                                value={(formData as any).title || ""}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                placeholder={t(
                                  "crime.form.placeholder.title",
                                  "Brief description of the incident",
                                )}
                              />
                            </div>
                            <div>
                              <Label htmlFor="type">
                                {t("incident.form.type")}
                              </Label>
                              <Select
                                value={
                                  (formData as any).incidentType ||
                                  IncidentType.PATROL_OBSERVATION
                                }
                                onValueChange={(value) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    incidentType: value as IncidentType,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(IncidentType).map((typ) => (
                                    <SelectItem key={typ} value={typ}>
                                      {t(`incidentType.${typ}`, typ)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="dateOccurred">
                                {t("incident.form.dateOccurred")}
                              </Label>
                              <Input
                                id="dateOccurred"
                                type="datetime-local"
                                required
                                value={((formData as any)
                                  .dateIncident instanceof Date
                                  ? (formData as any).dateIncident
                                  : (formData as any).dateIncident
                                    ? new Date((formData as any).dateIncident)
                                    : new Date()
                                )
                                  .toISOString()
                                  .slice(0, 16)}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    dateIncident: new Date(e.target.value),
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="severity">
                                {t("incident.form.severity")}
                              </Label>
                              <Select
                                value={
                                  (formData as any).priority || Priority.LOW
                                }
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
                                      {t(
                                        `priority.${priority}`,
                                        priority.toUpperCase(),
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="location">
                              {t("incident.form.location")}
                            </Label>
                            <Input
                              id="location"
                              required
                              value={(formData as any).location || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  location: e.target.value,
                                }))
                              }
                              placeholder={t(
                                "crime.form.placeholder.location",
                                "Address or description of the location",
                              )}
                            />
                          </div>

                          <div>
                            <Label htmlFor="description">
                              {t("incident.form.description")}
                            </Label>
                            <Textarea
                              id="description"
                              required
                              rows={6}
                              value={(formData as any).description || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              placeholder={t(
                                "crime.form.placeholder.description",
                                "Provide a detailed description...",
                              )}
                            />
                          </div>
                        </>
                      )}
                    </TabsContent>

                    {reportType === "crime" && (
                      <TabsContent value="evidence" className="space-y-6">
                        <div>
                          <Label>{t("general.uploadEvidence")}</Label>
                          <div className="flex items-center justify-center w-full mt-2">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">
                                  {t("general.clickToUpload")}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {t("general.maxFileSize")}
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
                                <span>{t("general.uploadingFiles")}</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <Progress value={uploadProgress} />
                            </div>
                          )}

                          {evidenceFiles.length > 0 && (
                            <div className="mt-4">
                              <Label>{t("general.evidenceFiles")}</Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {evidenceFiles.map((file, index) => (
                                  <div
                                    key={index}
                                    className="p-2 border rounded"
                                  >
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

                          {/* If draft contains evidence filenames but files are not attached, prompt to reattach */}
                          {!evidenceFiles.length &&
                            formData.evidence &&
                            formData.evidence.length && (
                              <div className="mt-4 p-3 rounded bg-yellow-50 text-yellow-800">
                                Saved evidence placeholders detected:{" "}
                                {formData.evidence.join(", ")}. Please re-attach
                                files to include them with submission.
                              </div>
                            )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <Label>{t("general.witnesses")}</Label>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addWitness}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {t("general.addWitness")}
                            </Button>
                          </div>
                          {witnesses.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                              {t("general.noWitnesses", "No witnesses added")}
                            </p>
                          ) : (
                            <div className="space-y-4 mt-4">
                              {witnesses.map((witness, index) => (
                                <Card key={index}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-medium">
                                        {t("general.witnesses")} {index + 1}
                                      </h4>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeWitness(index)}
                                      >
                                        {t("general.remove")}
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
                    )}

                    <TabsContent value="review" className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-4">
                          {t("tabs.review")}
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Title</Label>
                              <p className="mt-1">
                                {(formData as any).title ||
                                  t("general.notProvided")}
                              </p>
                            </div>
                            <div>
                              <Label>{t("general.category")}</Label>
                              <p className="mt-1">
                                {reportType === "crime"
                                  ? formData.category
                                    ? `${getCategoryIcon(formData.category)} ${t(`category.${formData.category}`, (formData.category as any).replace("_", " ").toUpperCase())}`
                                    : t("general.notSelected")
                                  : (formData as any).incidentType
                                    ? t(
                                        `incidentType.${(formData as any).incidentType}`,
                                      )
                                    : t("general.notSelected")}
                              </p>
                            </div>
                            <div>
                              <Label>
                                {reportType === "crime"
                                  ? t("crime.form.date")
                                  : t("incident.form.dateOccurred")}
                              </Label>
                              <p className="mt-1">
                                {formData.dateIncident
                                  ? formData.dateIncident.toLocaleString()
                                  : t("general.notProvided")}
                              </p>
                            </div>
                            <div>
                              <Label>{t("general.priority")}</Label>
                              <p className="mt-1">
                                {reportType === "crime"
                                  ? (formData.priority &&
                                      t(`priority.${formData.priority}`)) ||
                                    t("priority.medium", "MEDIUM")
                                  : ((formData as any).priority &&
                                      t(
                                        `priority.${(formData as any).priority}`,
                                      )) ||
                                    t("priority.low", "LOW")}
                              </p>
                            </div>
                          </div>

                          <div>
                            <Label>{t("general.location")}</Label>
                            <p className="mt-1">
                              {(formData as any).location ||
                                t("general.notProvided")}
                            </p>
                          </div>

                          <div>
                            <Label>{t("general.description")}</Label>
                            <p className="mt-1 whitespace-pre-wrap">
                              {(formData as any).description ||
                                t("general.notProvided")}
                            </p>
                          </div>

                          {reportType === "crime" && (
                            <>
                              <div>
                                <Label>{t("general.evidenceFiles")}</Label>
                                <p className="mt-1">
                                  {formData.evidence &&
                                  formData.evidence.length > 0
                                    ? `${formData.evidence.length} files uploaded`
                                    : t("general.noFilesUploaded")}
                                </p>
                              </div>

                              <div>
                                <Label>{t("general.witnesses")}</Label>
                                <p className="mt-1">
                                  {witnesses.length > 0
                                    ? `${witnesses.length} ${t("general.witnesses").toLowerCase()} ${t("general.added", "added")}`
                                    : t(
                                        "general.noWitnesses",
                                        "No witnesses added",
                                      )}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          {t(
                            "review.disclaimer",
                            "By submitting this report, you confirm that the information provided is accurate to the best of your knowledge. You will receive a report ID and can track the status of your report through this portal.",
                          )}
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-between gap-4 mt-6 pt-6 border-t">
                    <div>
                      {stepIndex > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={goPrev}
                        >
                          Previous
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowNewReportForm(false);
                        }}
                      >
                        {t("general.cancel")}
                      </Button>
                      {currentTab !== "review" ? (
                        <Button
                          type="button"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={goNext}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {t("general.submitReport")}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* submission feedback */}
                  {submissionStatus && (
                    <div
                      className={`mt-4 p-3 rounded ${submissionStatus.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                    >
                      {submissionStatus.message}
                    </div>
                  )}
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Section Switch */}
        <Tabs
          value={activeSection}
          onValueChange={(v) => setActiveSection(v as any)}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="crimes">{t("citizen.tabs.crimes")}</TabsTrigger>
            <TabsTrigger value="incidents">
              {t("citizen.tabs.incidents")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("stats.totalReports")}
                  </p>
                  <p className="text-2xl font-bold">
                    {activeSection === "crimes"
                      ? reports.length
                      : filteredIncidents.length}
                  </p>
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
                  <p className="text-sm text-gray-600">
                    {t("stats.underInvestigation")}
                  </p>
                  <p className="text-2xl font-bold">
                    {activeSection === "crimes"
                      ? reports.filter(
                          (r) => r.status === CrimeStatus.UNDER_INVESTIGATION,
                        ).length
                      : filteredIncidents.filter(
                          (i) => i.status === IncidentStatus.INVESTIGATING,
                        ).length}
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
                  <p className="text-sm text-gray-600">{t("stats.resolved")}</p>
                  <p className="text-2xl font-bold">
                    {activeSection === "crimes"
                      ? reports.filter((r) => r.status === CrimeStatus.RESOLVED)
                          .length
                      : filteredIncidents.filter(
                          (i) => i.status === IncidentStatus.RESOLVED,
                        ).length}
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
                  <p className="text-sm text-gray-600">
                    {t("stats.avgResponse")}
                  </p>
                  <p className="text-2xl font-bold">
                    2 {t("stats.days", "days")}
                  </p>
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
                    placeholder={t("search.placeholder", "Search...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                {activeSection === "crimes" ? (
                  <>
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={t("filters.status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("filters.allStatuses")}
                        </SelectItem>
                        {Object.values(CrimeStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(
                              `status.${status}`,
                              status.replace("_", " ").toUpperCase(),
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filterCategory}
                      onValueChange={setFilterCategory}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={t("filters.category")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("filters.allCategories")}
                        </SelectItem>
                        {Object.values(CrimeCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {getCategoryIcon(category)}{" "}
                            {t(
                              `category.${category}`,
                              category.replace("_", " ").toUpperCase(),
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Select
                      value={incidentStatusFilter}
                      onValueChange={setIncidentStatusFilter}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={t("filters.status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("filters.allStatuses")}
                        </SelectItem>
                        {Object.values(IncidentStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {t(`incidentStatus.${status}`, status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={incidentTypeFilter}
                      onValueChange={setIncidentTypeFilter}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={t("filters.type")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("filters.allTypes")}
                        </SelectItem>
                        {Object.values(IncidentType).map((typ) => (
                          <SelectItem key={typ} value={typ}>
                            {t(`incidentType.${typ}`, typ)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lists */}
        {activeSection === "crimes" ? (
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
                              <span className="truncate">
                                {report.location}
                              </span>
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
                                {t("general.reportedDate")}{" "}
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
                            report.status ===
                              CrimeStatus.UNDER_INVESTIGATION && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-blue-700">
                                  <Info className="h-4 w-4" />
                                  <span>
                                    {t("general.estimatedResolution")}:{" "}
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
                            <Button variant="outline" size="sm" className={!status?.assignedOfficer ? "hidden" : undefined}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t("general.viewDetails")}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {t("general.reportDetails")} - {report.title}
                              </DialogTitle>
                              <DialogDescription>
                                {t("general.reportId")}: {report.id}
                              </DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="details">
                                  {t("tabs.details")}
                                </TabsTrigger>
                                <TabsTrigger value="status">
                                  {t("tabs.status")}
                                </TabsTrigger>
                                <TabsTrigger value="contact">
                                  {t("tabs.contact")}
                                </TabsTrigger>
                              </TabsList>
                              <TabsContent
                                value="details"
                                className="space-y-6"
                              >
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <Label>{t("general.category")}</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-lg">
                                        {getCategoryIcon(report.category)}
                                      </span>
                                      <span>
                                        {t(
                                          `category.${report.category}`,
                                          report.category
                                            .replace("_", " ")
                                            .toUpperCase(),
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>{t("general.priority")}</Label>
                                    <div className="mt-1">
                                      {getPriorityBadge(report.priority)}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>{t("general.incidentDate")}</Label>
                                    <p className="mt-1">
                                      {report.dateIncident.toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>{t("general.reportedDate")}</Label>
                                    <p className="mt-1">
                                      {report.dateReported.toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <Label>{t("general.location")}</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{report.location}</span>
                                  </div>
                                </div>

                                <div>
                                  <Label>{t("general.description")}</Label>
                                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                                    {report.description}
                                  </p>
                                </div>

                                {report.evidence &&
                                  (report.evidence as any).length > 0 && (
                                    <div>
                                      <Label>{t("general.evidence")}</Label>
                                      <div className="grid grid-cols-2 gap-2 mt-2">
                                        {(report.evidence as any).map(
                                          (ev: any, index: number) => {
                                            const name =
                                              typeof ev === "string"
                                                ? ev
                                                : ev.fileName;
                                            const type =
                                              typeof ev === "string"
                                                ? ""
                                                : ev.fileType || "";
                                            const isImg =
                                              type.startsWith("image/") ||
                                              name.match(
                                                /\.(png|jpg|jpeg|gif|webp)$/i,
                                              );
                                            const isVideo =
                                              type.startsWith("video/") ||
                                              name.match(/\.(mp4|webm|ogg)$/i);
                                            return (
                                              <div
                                                key={index}
                                                className="p-2 border rounded"
                                              >
                                                {isImg ? (
                                                  <img
                                                    src={name}
                                                    alt={`evidence-${index}`}
                                                    className="h-24 w-full object-cover rounded"
                                                  />
                                                ) : isVideo ? (
                                                  <video
                                                    src={name}
                                                    controls
                                                    className="h-24 w-full rounded"
                                                  />
                                                ) : (
                                                  <div className="flex items-center gap-2">
                                                    <Camera className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm truncate">
                                                      {name}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {report.witnesses &&
                                  report.witnesses.length > 0 && (
                                    <div>
                                      <Label>{t("general.witnesses")}</Label>
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
                                          {t("general.currentStatus")}
                                        </h3>
                                        <div className="mt-1">
                                          {getStatusBadge(status.currentStatus)}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm text-gray-600">
                                          {t("general.lastUpdated")}
                                        </p>
                                        <p className="font-medium">
                                          {status.lastUpdate.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-3">
                                        {t("general.statusHistory")}
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
                                                  className={`w-3 h-3 rounded-full ${index === 0 ? "bg-red-500" : "bg-gray-300"}`}
                                                />
                                                {index <
                                                  status.statusHistory.length -
                                                    1 && (
                                                  <div className="w-px h-8 bg-gray-300 mt-2" />
                                                )}
                                              </div>
                                              <div className="flex-1 pb-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                  {getStatusBadge(
                                                    update.status as CrimeStatus,
                                                  )}
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
                              <TabsContent
                                value="contact"
                                className="space-y-6"
                              >
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
                                            {t("general.provideAdditionalInfo")}
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
                                          <Label>
                                            {t("general.conversation")}
                                          </Label>
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
                                                      ...(prev[report.id] ||
                                                        []),
                                                    ],
                                                  }));
                                                  setContactTextById(
                                                    (prev) => ({
                                                      ...prev,
                                                      [report.id]: "",
                                                    }),
                                                  );
                                                }
                                              }
                                            } catch {}
                                          }}
                                        >
                                          <MessageSquare className="h-4 w-4 mr-2" />
                                          {t("general.submitUpdate")}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-8">
                                    <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                      {t("general.noOfficerAssigned")}
                                    </h3>
                                    <p className="text-gray-600">
                                      {t("general.pendingAssignment")}
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
        ) : (
          <div className="space-y-6">
            {filteredIncidents.map((inc) => (
              <Card key={inc.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {inc.title}
                        </h3>
                        {getIncidentStatusBadge(inc.status)}
                        {getPriorityBadge(inc.severity)}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {inc.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{inc.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {new Date(inc.dateOccurred).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-gray-400" />
                          <span>
                            {t(
                              `incidentType.${inc.incidentType}`,
                              inc.incidentType,
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{inc.reporterName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty */}
        {activeSection === "crimes" && filteredReports.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("empty.noReports")}
              </h3>
              <p className="text-gray-600 mb-4">{t("empty.noReportsDesc")}</p>
              <Button
                onClick={() => setShowNewReportForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("empty.submitFirst")}
              </Button>
            </CardContent>
          </Card>
        )}

        {activeSection === "incidents" && filteredIncidents.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("empty.noReports")}
              </h3>
              <p className="text-gray-600 mb-4">{t("empty.noReportsDesc")}</p>
              <Button
                onClick={() => {
                  setReportType("incident");
                  setShowNewReportForm(true);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("empty.submitFirst")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
