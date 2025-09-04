import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  IncidentReport,
  IncidentType,
  IncidentStatus,
  Priority,
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
  FileText,
  Plus,
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
  Users,
} from "lucide-react";
import { api } from "@/lib/api";

export default function IncidentReports() {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<IncidentReport[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    incidentType: IncidentType.PATROL_OBSERVATION,
    severity: Priority.LOW,
    location: "",
    dateOccurred: new Date().toISOString().slice(0, 16),
    followUpRequired: false,
  });

  const canCreateIncidents = hasAnyRole([
    UserRole.PREVENTIVE_OFFICER,
    UserRole.DETECTIVE_OFFICER,
    UserRole.POLICE_HEAD,
  ]);
  const canManageAllIncidents = hasAnyRole([
    UserRole.SUPER_ADMIN,
    UserRole.POLICE_HEAD,
    UserRole.DETECTIVE_OFFICER,
  ]);

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) return;
    const es = new EventSource(`/api/realtime/incidents?token=${encodeURIComponent(token)}`);
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload?.type === 'incident_update') {
          const ev = payload.data;
          const inc = ev.incident || ev;
          setIncidents(prev => {
            const idx = prev.findIndex(x => x.id === inc.id);
            const normalized: IncidentReport = { ...inc, dateOccurred: new Date(inc.dateOccurred), createdAt: new Date(inc.createdAt), updatedAt: new Date(inc.updatedAt) };
            if (ev.type === 'deleted') return prev.filter(x => x.id !== inc.id);
            if (idx >= 0) { const copy = [...prev]; copy[idx] = { ...copy[idx], ...normalized }; return copy; }
            return [normalized, ...prev];
          });
        }
      } catch {}
    };
    es.onerror = () => {};
    return () => { es.close(); };
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [incidents, searchTerm, typeFilter, statusFilter]);

  const fetchIncidents = async () => {
    try {
      const res = await api.get("/incidents");
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
      } else {
        setIncidents([]);
      }
    } catch (e) {
      console.error("Failed to load incidents", e);
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterIncidents = () => {
    let filtered = [...incidents];

    if (searchTerm) {
      filtered = filtered.filter(
        (incident) =>
          incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          incident.location.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (incident) => incident.incidentType === typeFilter,
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (incident) => incident.status === statusFilter,
      );
    }

    // If user is preventive officer, only show their own reports
    if (hasRole(UserRole.PREVENTIVE_OFFICER) && !canManageAllIncidents) {
      filtered = filtered.filter(
        (incident) => incident.reportedBy === user?.id,
      );
    }

    setFilteredIncidents(filtered);
  };

  const handleCreateIncident = async () => {
    if (!user) return;

    try {
      const payload = {
        title: newIncident.title,
        description: newIncident.description,
        incidentType: newIncident.incidentType,
        severity: newIncident.severity,
        location: newIncident.location,
        dateOccurred: newIncident.dateOccurred,
        followUpRequired: newIncident.followUpRequired,
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
      setIsCreateDialogOpen(false);
      setNewIncident({
        title: "",
        description: "",
        incidentType: IncidentType.PATROL_OBSERVATION,
        severity: Priority.LOW,
        location: "",
        dateOccurred: new Date().toISOString().slice(0, 16),
        followUpRequired: false,
      });
    } catch (e) {
      console.error("Failed to create incident", e);
    }
  };

  const getStatusBadgeColor = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.REPORTED:
        return "bg-blue-100 text-blue-800";
      case IncidentStatus.INVESTIGATING:
        return "bg-yellow-100 text-yellow-800";
      case IncidentStatus.ESCALATED:
        return "bg-crime-red text-white";
      case IncidentStatus.RESOLVED:
        return "bg-green-100 text-green-800";
      case IncidentStatus.CLOSED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityBadgeColor = (severity: Priority) => {
    switch (severity) {
      case Priority.CRITICAL:
        return "bg-red-500 text-white";
      case Priority.HIGH:
        return "bg-crime-red text-white";
      case Priority.MEDIUM:
        return "bg-crime-yellow text-crime-black";
      case Priority.LOW:
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getTypeIcon = (type: IncidentType) => {
    switch (type) {
      case IncidentType.PATROL_OBSERVATION:
        return Shield;
      case IncidentType.SUSPICIOUS_ACTIVITY:
        return AlertTriangle;
      case IncidentType.TRAFFIC_INCIDENT:
        return MapPin;
      case IncidentType.EMERGENCY_RESPONSE:
        return AlertTriangle;
      case IncidentType.CITIZEN_COMPLAINT:
        return Users;
      default:
        return FileText;
    }
  };

  const incidentStats = {
    total: filteredIncidents.length,
    reported: filteredIncidents.filter(
      (i) => i.status === IncidentStatus.REPORTED,
    ).length,
    investigating: filteredIncidents.filter(
      (i) => i.status === IncidentStatus.INVESTIGATING,
    ).length,
    resolved: filteredIncidents.filter(
      (i) => i.status === IncidentStatus.RESOLVED,
    ).length,
    followUpRequired: filteredIncidents.filter((i) => i.followUpRequired)
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
              <h1 className="text-3xl font-bold mb-2">Incident Reports</h1>
              <p className="text-gray-300">
                Create and manage incident reports and observations
              </p>
            </div>
            {canCreateIncidents && (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-crime-red hover:bg-crime-red-dark text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Incident Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Incident Report</DialogTitle>
                    <DialogDescription>
                      Document a new incident or observation from your patrol
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Incident Title</Label>
                        <Input
                          id="title"
                          value={newIncident.title}
                          onChange={(e) =>
                            setNewIncident((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Brief description of incident"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newIncident.location}
                          onChange={(e) =>
                            setNewIncident((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          placeholder="Incident location"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Incident Type</Label>
                        <Select
                          value={newIncident.incidentType}
                          onValueChange={(value) =>
                            setNewIncident((prev) => ({
                              ...prev,
                              incidentType: value as IncidentType,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={IncidentType.PATROL_OBSERVATION}>
                              Patrol Observation
                            </SelectItem>
                            <SelectItem value={IncidentType.CITIZEN_COMPLAINT}>
                              Citizen Complaint
                            </SelectItem>
                            <SelectItem value={IncidentType.TRAFFIC_INCIDENT}>
                              Traffic Incident
                            </SelectItem>
                            <SelectItem
                              value={IncidentType.SUSPICIOUS_ACTIVITY}
                            >
                              Suspicious Activity
                            </SelectItem>
                            <SelectItem value={IncidentType.PROPERTY_DAMAGE}>
                              Property Damage
                            </SelectItem>
                            <SelectItem value={IncidentType.NOISE_COMPLAINT}>
                              Noise Complaint
                            </SelectItem>
                            <SelectItem value={IncidentType.PUBLIC_DISTURBANCE}>
                              Public Disturbance
                            </SelectItem>
                            <SelectItem value={IncidentType.EMERGENCY_RESPONSE}>
                              Emergency Response
                            </SelectItem>
                            <SelectItem value={IncidentType.OTHER}>
                              Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="severity">Severity</Label>
                        <Select
                          value={newIncident.severity}
                          onValueChange={(value) =>
                            setNewIncident((prev) => ({
                              ...prev,
                              severity: value as Priority,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={Priority.LOW}>Low</SelectItem>
                            <SelectItem value={Priority.MEDIUM}>
                              Medium
                            </SelectItem>
                            <SelectItem value={Priority.HIGH}>High</SelectItem>
                            <SelectItem value={Priority.CRITICAL}>
                              Critical
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOccurred">Date/Time Occurred</Label>
                        <Input
                          id="dateOccurred"
                          type="datetime-local"
                          value={newIncident.dateOccurred}
                          onChange={(e) =>
                            setNewIncident((prev) => ({
                              ...prev,
                              dateOccurred: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Detailed Description</Label>
                      <Textarea
                        id="description"
                        value={newIncident.description}
                        onChange={(e) =>
                          setNewIncident((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Provide detailed description of the incident..."
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="followUp"
                        checked={newIncident.followUpRequired}
                        onChange={(e) =>
                          setNewIncident((prev) => ({
                            ...prev,
                            followUpRequired: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="followUp">
                        Follow-up investigation required
                      </Label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleCreateIncident}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {incidentStats.total}
              </h3>
              <p className="text-gray-600">Total Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {incidentStats.reported}
              </h3>
              <p className="text-gray-600">Reported</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-crime-yellow" />
              <h3 className="text-2xl font-bold text-crime-black">
                {incidentStats.investigating}
              </h3>
              <p className="text-gray-600">Investigating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {incidentStats.resolved}
              </h3>
              <p className="text-gray-600">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-crime-red" />
              <h3 className="text-2xl font-bold text-crime-black">
                {incidentStats.followUpRequired}
              </h3>
              <p className="text-gray-600">Follow-up Required</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Search & Filter Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Incident Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={IncidentType.PATROL_OBSERVATION}>
                    Patrol Observation
                  </SelectItem>
                  <SelectItem value={IncidentType.CITIZEN_COMPLAINT}>
                    Citizen Complaint
                  </SelectItem>
                  <SelectItem value={IncidentType.TRAFFIC_INCIDENT}>
                    Traffic Incident
                  </SelectItem>
                  <SelectItem value={IncidentType.SUSPICIOUS_ACTIVITY}>
                    Suspicious Activity
                  </SelectItem>
                  <SelectItem value={IncidentType.PROPERTY_DAMAGE}>
                    Property Damage
                  </SelectItem>
                  <SelectItem value={IncidentType.NOISE_COMPLAINT}>
                    Noise Complaint
                  </SelectItem>
                  <SelectItem value={IncidentType.PUBLIC_DISTURBANCE}>
                    Public Disturbance
                  </SelectItem>
                  <SelectItem value={IncidentType.EMERGENCY_RESPONSE}>
                    Emergency Response
                  </SelectItem>
                  <SelectItem value={IncidentType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={IncidentStatus.REPORTED}>
                    Reported
                  </SelectItem>
                  <SelectItem value={IncidentStatus.INVESTIGATING}>
                    Investigating
                  </SelectItem>
                  <SelectItem value={IncidentStatus.ESCALATED}>
                    Escalated
                  </SelectItem>
                  <SelectItem value={IncidentStatus.RESOLVED}>
                    Resolved
                  </SelectItem>
                  <SelectItem value={IncidentStatus.CLOSED}>Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Reports</CardTitle>
            <CardDescription>
              {filteredIncidents.length} incident(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIncidents.map((incident) => {
                const TypeIcon = getTypeIcon(incident.incidentType);

                return (
                  <div
                    key={incident.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <TypeIcon className="w-5 h-5 text-crime-red" />
                          <h3 className="text-lg font-semibold text-crime-black">
                            {incident.title}
                          </h3>
                          <Badge
                            className={getStatusBadgeColor(incident.status)}
                          >
                            {incident.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge
                            className={getSeverityBadgeColor(incident.severity)}
                          >
                            {incident.severity.toUpperCase()}
                          </Badge>
                          {incident.followUpRequired && (
                            <Badge className="bg-crime-yellow text-crime-black">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Follow-up Required
                            </Badge>
                          )}
                        </div>

                        <p className="text-gray-600 mb-3">
                          {incident.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {incident.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(incident.dateOccurred).toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {incident.reporterName}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Reported:{" "}
                            {new Date(incident.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {incident.relatedCaseId && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center text-sm">
                              <FileText className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="text-blue-800">
                                Related to Case:{" "}
                                <strong>#{incident.relatedCaseId}</strong>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>

                        {(incident.reportedBy === user?.id ||
                          canManageAllIncidents) && (
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}

                        <Button
                          size="sm"
                          className="bg-crime-yellow hover:bg-yellow-600 text-crime-black"
                        >
                          <Camera className="w-4 h-4 mr-1" />
                          Add Evidence
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredIncidents.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No incidents found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search and filter criteria
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
