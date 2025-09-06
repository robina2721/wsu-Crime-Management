import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "@/lib/api";
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
import { Checkbox } from "../components/ui/checkbox";
import {
  MessageSquare,
  Plus,
  Eye,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Settings,
  Star,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Upload,
  Download,
  Flag,
  Heart,
  Lightbulb,
  MessageCircle,
  Info,
} from "lucide-react";
import type {
  CitizenFeedback as CitizenFeedbackType,
  FeedbackType,
  FeedbackCategory,
  FeedbackStatus,
  Priority,
} from "../../shared/types";

// Using real data via API

export default function CitizenFeedback() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<CitizenFeedbackType[]>([]);
  const [showNewFeedbackForm, setShowNewFeedbackForm] = useState(false);
  const [selectedFeedback, setSelectedFeedback] =
    useState<CitizenFeedbackType | null>(null);
  const [formData, setFormData] = useState<Partial<CitizenFeedbackType>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [formData, setFormData] = useState<Partial<CitizenFeedback>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseById, setResponseById] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/feedback");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const list: CitizenFeedbackType[] = (data.data.feedback || []).map(
              (f: any) => ({
                ...f,
                respondedAt: f.respondedAt
                  ? new Date(f.respondedAt)
                  : undefined,
                submittedAt: new Date(f.submittedAt),
                updatedAt: new Date(f.updatedAt),
              }),
            );
            setFeedback(list);
          }
        }
      } catch {}
    };
    load();
  }, []);

  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch =
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" || item.feedbackType === filterType;
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;

    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: FeedbackStatus) => {
    const variants = {
      [FeedbackStatus.SUBMITTED]: "secondary",
      [FeedbackStatus.UNDER_REVIEW]: "default",
      [FeedbackStatus.INVESTIGATING]: "outline",
      [FeedbackStatus.RESOLVED]: "default",
      [FeedbackStatus.CLOSED]: "outline",
    };

    const icons = {
      [FeedbackStatus.SUBMITTED]: <Clock className="h-3 w-3 mr-1" />,
      [FeedbackStatus.UNDER_REVIEW]: <RefreshCw className="h-3 w-3 mr-1" />,
      [FeedbackStatus.INVESTIGATING]: <Search className="h-3 w-3 mr-1" />,
      [FeedbackStatus.RESOLVED]: <CheckCircle className="h-3 w-3 mr-1" />,
      [FeedbackStatus.CLOSED]: <CheckCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant={variants[status] as any} className="text-xs">
        {icons[status]}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getTypeIcon = (type: FeedbackType) => {
    const icons = {
      [FeedbackType.COMPLAINT]: <ThumbsDown className="h-5 w-5 text-red-500" />,
      [FeedbackType.SUGGESTION]: (
        <Lightbulb className="h-5 w-5 text-yellow-500" />
      ),
      [FeedbackType.COMPLIMENT]: <Heart className="h-5 w-5 text-green-500" />,
      [FeedbackType.INQUIRY]: <HelpCircle className="h-5 w-5 text-blue-500" />,
      [FeedbackType.SERVICE_REQUEST]: (
        <Settings className="h-5 w-5 text-purple-500" />
      ),
    };

    return icons[type] || <MessageCircle className="h-5 w-5 text-gray-500" />;
  };

  const getTypeColor = (type: FeedbackType) => {
    const colors = {
      [FeedbackType.COMPLAINT]: "bg-red-50 border-red-200",
      [FeedbackType.SUGGESTION]: "bg-yellow-50 border-yellow-200",
      [FeedbackType.COMPLIMENT]: "bg-green-50 border-green-200",
      [FeedbackType.INQUIRY]: "bg-blue-50 border-blue-200",
      [FeedbackType.SERVICE_REQUEST]: "bg-purple-50 border-purple-200",
    };

    return colors[type] || "bg-gray-50 border-gray-200";
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

  const handleSubmitFeedback = async (data: Partial<CitizenFeedback>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        subject: data.subject || "",
        message: data.message || "",
        feedbackType: data.feedbackType || FeedbackType.INQUIRY,
        category: data.category || FeedbackCategory.GENERAL,
        relatedCaseId: data.relatedCaseId,
        priority: data.priority || Priority.MEDIUM,
        isAnonymous: data.isAnonymous || false,
        email: data.email,
        phone: data.phone,
      };
      const res = await api.post("/feedback", payload);
      if (res.ok) {
        const created = await res.json();
        if (created.success) {
          const f = created.data;
          const normalized: CitizenFeedback = {
            ...f,
            respondedAt: f.respondedAt ? new Date(f.respondedAt) : undefined,
            submittedAt: new Date(f.submittedAt),
            updatedAt: new Date(f.updatedAt),
          };
          setFeedback((prev) => [normalized, ...prev]);
          setFormData({});
          setShowNewFeedbackForm(false);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypeOptions = [
    {
      value: FeedbackType.COMPLAINT,
      label: "Complaint",
      description: "Report issues or concerns about police services",
      icon: <ThumbsDown className="h-5 w-5 text-red-500" />,
    },
    {
      value: FeedbackType.SUGGESTION,
      label: "Suggestion",
      description: "Propose improvements to police services",
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
    },
    {
      value: FeedbackType.COMPLIMENT,
      label: "Compliment",
      description: "Praise officers or services",
      icon: <Heart className="h-5 w-5 text-green-500" />,
    },
    {
      value: FeedbackType.INQUIRY,
      label: "Inquiry",
      description: "Ask questions about police services or procedures",
      icon: <HelpCircle className="h-5 w-5 text-blue-500" />,
    },
    {
      value: FeedbackType.SERVICE_REQUEST,
      label: "Service Request",
      description: "Request specific police services",
      icon: <Settings className="h-5 w-5 text-purple-500" />,
    },
  ];

  const canRespond =
    user &&
    ["super_admin", "police_head", "hr_manager"].includes(user.role as any);

  const respondToFeedback = async (item: CitizenFeedback) => {
    const text = (responseById[item.id] || "").trim();
    if (!text) return;
    const res = await api.post(`/feedback/${item.id}/respond`, {
      response: text,
      status: FeedbackStatus.UNDER_REVIEW,
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const f = data.data;
        const normalized: CitizenFeedback = {
          ...f,
          respondedAt: f.respondedAt ? new Date(f.respondedAt) : undefined,
          submittedAt: new Date(f.submittedAt),
          updatedAt: new Date(f.updatedAt),
        };
        setFeedback((prev) =>
          prev.map((fb) => (fb.id === item.id ? normalized : fb)),
        );
        setResponseById((prev) => ({ ...prev, [item.id]: "" }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-red-600" />
                Citizen Feedback
              </h1>
              <p className="text-gray-600 mt-2">
                Share your feedback, suggestions, and compliments with us
              </p>
            </div>
            <Button
              onClick={() => setShowNewFeedbackForm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Submit Feedback
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold">{feedback.length}</p>
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
                  <p className="text-sm text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold">
                    {
                      feedback.filter(
                        (f) =>
                          f.status === FeedbackStatus.UNDER_REVIEW ||
                          f.status === FeedbackStatus.INVESTIGATING,
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
                      feedback.filter(
                        (f) => f.status === FeedbackStatus.RESOLVED,
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
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold">3 days</p>
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
                    placeholder="Search feedback..."
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
                    {Object.values(FeedbackType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace("_", " ").toUpperCase()}
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
                    {Object.values(FeedbackStatus).map((status) => (
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
                    {Object.values(FeedbackCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <div className="space-y-6">
          {filteredFeedback.map((item) => (
            <Card
              key={item.id}
              className={`hover:shadow-lg transition-shadow ${getTypeColor(item.feedbackType)}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getTypeIcon(item.feedbackType)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.subject}
                        </h3>
                        {getStatusBadge(item.status)}
                        {getPriorityBadge(item.priority)}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {item.message}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>
                            {item.isAnonymous ? "Anonymous" : item.citizenName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{item.submittedAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flag className="h-4 w-4 text-gray-400" />
                          <span>
                            {item.category.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        {item.relatedCaseId && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span>Case: {item.relatedCaseId}</span>
                          </div>
                        )}
                      </div>

                      {item.response && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MessageCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-blue-800 font-medium">
                                Response from {item.respondedBy}
                              </p>
                              <p className="text-sm text-blue-700 mt-1">
                                {item.response}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                {item.respondedAt?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {canRespond && (
                        <div className="mt-3 space-y-2">
                          <Label>Respond</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Type response..."
                              value={responseById[item.id] || ""}
                              onChange={(e) =>
                                setResponseById((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                            />
                            <Button
                              size="sm"
                              onClick={() => respondToFeedback(item)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
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
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getTypeIcon(item.feedbackType)}
                            {item.subject}
                          </DialogTitle>
                          <DialogDescription>
                            Feedback ID: {item.id}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">
                                {item.isAnonymous
                                  ? "Anonymous Feedback"
                                  : item.citizenName}
                              </h3>
                              {!item.isAnonymous && (
                                <div className="text-sm text-gray-600">
                                  {item.email && <p>{item.email}</p>}
                                  {item.phone && <p>{item.phone}</p>}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(item.status)}
                              {getPriorityBadge(item.priority)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Feedback Type</Label>
                              <div className="flex items-center gap-2 mt-1">
                                {getTypeIcon(item.feedbackType)}
                                <span>
                                  {item.feedbackType
                                    .replace("_", " ")
                                    .toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <Label>Category</Label>
                              <p className="mt-1">
                                {item.category.replace("_", " ").toUpperCase()}
                              </p>
                            </div>
                            <div>
                              <Label>Priority</Label>
                              <div className="mt-1">
                                {getPriorityBadge(item.priority)}
                              </div>
                            </div>
                            <div>
                              <Label>Submitted Date</Label>
                              <p className="mt-1">
                                {item.submittedAt.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {item.relatedCaseId && (
                            <div>
                              <Label>Related Case</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <span>{item.relatedCaseId}</span>
                              </div>
                            </div>
                          )}

                          <div>
                            <Label>Message</Label>
                            <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                              {item.message}
                            </p>
                          </div>

                          {item.attachments && item.attachments.length > 0 && (
                            <div>
                              <Label>Attachments</Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {item.attachments.map((attachment, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 border rounded"
                                  >
                                    <FileText className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm truncate">
                                      {attachment}
                                    </span>
                                    <Button variant="outline" size="sm">
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.response && (
                            <div>
                              <Label>Official Response</Label>
                              <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-medium text-blue-800 mb-1">
                                      Response from {item.respondedBy}
                                    </p>
                                    <p className="text-blue-700 mb-2">
                                      {item.response}
                                    </p>
                                    <p className="text-sm text-blue-600">
                                      {item.respondedAt?.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* New Feedback Form Dialog */}
        <Dialog
          open={showNewFeedbackForm}
          onOpenChange={setShowNewFeedbackForm}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Feedback</DialogTitle>
              <DialogDescription>
                Share your thoughts, suggestions, or concerns with us
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitFeedback(formData);
              }}
            >
              <Tabs defaultValue="type" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="type">Feedback Type</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="contact">Contact Info</TabsTrigger>
                </TabsList>
                <TabsContent value="type" className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">
                      What type of feedback would you like to provide?
                    </Label>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                      {feedbackTypeOptions.map((option) => (
                        <Card
                          key={option.value}
                          className={`cursor-pointer transition-all ${
                            formData.feedbackType === option.value
                              ? "ring-2 ring-red-500 bg-red-50"
                              : "hover:shadow-md"
                          }`}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              feedbackType: option.value,
                            }))
                          }
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {option.icon}
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">
                                  {option.label}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {option.description}
                                </p>
                              </div>
                              {formData.feedbackType === option.value && (
                                <CheckCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        required
                        value={formData.subject || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            subject: e.target.value,
                          }))
                        }
                        placeholder="Brief summary of your feedback"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category || ""}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: value as FeedbackCategory,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(FeedbackCategory).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.replace("_", " ").toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <div>
                      <Label htmlFor="relatedCaseId">
                        Related Case ID (Optional)
                      </Label>
                      <Input
                        id="relatedCaseId"
                        value={formData.relatedCaseId || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            relatedCaseId: e.target.value,
                          }))
                        }
                        placeholder="e.g., CASE-001"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Please provide detailed information about your feedback..."
                    />
                  </div>

                  <div>
                    <Label>Attach Files (Optional)</Label>
                    <div className="flex items-center justify-center w-full mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            Click to upload supporting documents
                          </p>
                          <p className="text-xs text-gray-400">
                            Max file size: 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files) {
                              const fileNames = Array.from(e.target.files).map(
                                (file) => file.name,
                              );
                              setFormData((prev) => ({
                                ...prev,
                                attachments: [
                                  ...(prev.attachments || []),
                                  ...fileNames,
                                ],
                              }));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="contact" className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="anonymous"
                      checked={formData.isAnonymous || false}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isAnonymous: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="anonymous" className="text-sm font-medium">
                      Submit feedback anonymously
                    </Label>
                  </div>

                  {formData.isAnonymous ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Your feedback will be submitted anonymously. We will not
                        be able to contact you for follow-up questions or
                        provide direct responses.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || user?.email || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="your.email@example.com"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          We'll use this to respond to your feedback
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone || user?.phone || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="+1-234-567-8900"
                        />
                      </div>
                    </div>
                  )}

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      We typically respond to feedback within 3-5 business days.
                      For urgent matters, please contact us directly at (555)
                      123-4567.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewFeedbackForm(false);
                    setFormData({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={
                    isSubmitting ||
                    !formData.feedbackType ||
                    !formData.subject ||
                    !formData.message
                  }
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {filteredFeedback.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No feedback found
              </h3>
              <p className="text-gray-600 mb-4">
                You haven't submitted any feedback yet or no feedback matches
                your search criteria.
              </p>
              <Button
                onClick={() => setShowNewFeedbackForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit Your First Feedback
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
