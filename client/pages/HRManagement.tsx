import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
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
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Alert } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Settings,
  Camera,
} from "lucide-react";
import {
  OfficerProfile,
  OfficerRank,
  Department,
  EmploymentStatus,
  CertificationStatus,
} from "../../shared/types";

export default function HRManagement() {
  const { user } = useAuth();
  const [officers, setOfficers] = useState<any[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showNewEmployeeForm, setShowNewEmployeeForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/officers");
        if (res.ok) {
          const d = await res.json();
          setOfficers(d.data.officers.map((o: any) => ({ ...o })));
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const filteredOfficers = officers.filter((officer) => {
    const matchesSearch =
      officer.personalInfo.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      officer.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.professionalInfo.badgeNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesDepartment =
      filterDepartment === "all" ||
      officer.professionalInfo.department === filterDepartment;
    const matchesStatus =
      filterStatus === "all" ||
      officer.professionalInfo.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handlePhotoUpload = async (officerId: string, file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result);
      try {
        await api.put(`/officers/${officerId}`, { photo: dataUrl });
        setOfficers((prev) =>
          prev.map((o) => (o.id === officerId ? { ...o, photo: dataUrl } : o)),
        );
      } catch (e) {
        console.error(e);
      }
      setIsUploading(false);
      setUploadProgress(100);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateEmployee = async (data: Partial<OfficerProfile>) => {
    try {
      const payload = {
        personalInfo: data.personalInfo,
        professionalInfo: data.professionalInfo,
        photo: data.photo,
      };
      const res = await api.post("/officers", payload);
      if (res.ok) {
        const d = await res.json();
        setOfficers((prev) => [d.data, ...prev]);
        setFormData({});
        setShowNewEmployeeForm(false);
      }
    } catch (e) {
      console.error("Failed to create officer", e);
    }
  };

  const getStatusBadge = (status: EmploymentStatus) => {
    const variants: any = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive",
      terminated: "destructive",
      retired: "secondary",
      on_leave: "outline",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {String(status).replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-8 w-8 text-red-600" />
                HR Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage employee profiles, registration, and documentation
              </p>
            </div>
            <Button
              onClick={() => setShowNewEmployeeForm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Employee
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, employee ID, or badge number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select
                  value={filterDepartment}
                  onValueChange={setFilterDepartment}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {Object.values(Department).map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept.replace("_", " ").toUpperCase()}
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
                    {Object.values(EmploymentStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {String(status).replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOfficers.map((officer) => (
            <Card
              key={officer.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={officer.photo} />
                      <AvatarFallback>
                        {officer.personalInfo.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-crime-black">
                        {officer.personalInfo.fullName}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {officer.professionalInfo.badgeNumber} •{" "}
                        {officer.employeeId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(officer.professionalInfo.status)}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {officer.personalInfo.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {officer.personalInfo.phone}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {officer.professionalInfo.startDate?.toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Supervisor: {officer.professionalInfo.supervisor}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handlePhotoUpload(officer.id, f);
                      }}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* New Employee Dialog */}
        {showNewEmployeeForm && (
          <Dialog
            open={showNewEmployeeForm}
            onOpenChange={(v) => setShowNewEmployeeForm(v)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={formData.personalInfo?.fullName || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          personalInfo: {
                            ...(prev.personalInfo || {}),
                            fullName: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={formData.personalInfo?.email || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          personalInfo: {
                            ...(prev.personalInfo || {}),
                            email: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Badge Number</Label>
                    <Input
                      value={formData.professionalInfo?.badgeNumber || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          professionalInfo: {
                            ...(prev.professionalInfo || {}),
                            badgeNumber: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Select
                      value={
                        formData.professionalInfo?.department ||
                        Department.PATROL
                      }
                      onValueChange={(v) =>
                        setFormData((prev) => ({
                          ...prev,
                          professionalInfo: {
                            ...(prev.professionalInfo || {}),
                            department: v,
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Department).map((d) => (
                          <SelectItem key={d} value={d}>
                            {d.replace("_", " ").toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    className="bg-crime-red text-white"
                    onClick={() => handleCreateEmployee(formData)}
                  >
                    Add Employee
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewEmployeeForm(false);
                      setFormData({});
                    }}
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
