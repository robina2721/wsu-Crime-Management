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
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
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
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  FileText,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Phone,
} from "lucide-react";
import {
  StaffSchedule,
  ShiftType,
  ScheduleStatus,
  AssignmentType,
  OfficerRank,
  Department,
  EmploymentStatus,
  Assignment,
} from "../../shared/types";

// Mock data for demonstration
const mockOfficers = [
  {
    id: "1",
    name: "John Smith",
    badgeNumber: "BADGE001",
    rank: OfficerRank.SERGEANT,
    department: Department.PATROL,
    status: EmploymentStatus.ACTIVE,
    phone: "+1-234-567-8901",
    photo: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    badgeNumber: "BADGE002",
    rank: OfficerRank.DETECTIVE,
    department: Department.CRIMINAL_INVESTIGATION,
    status: EmploymentStatus.ACTIVE,
    phone: "+1-234-567-8903",
    photo: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Mike Davis",
    badgeNumber: "BADGE003",
    rank: OfficerRank.CONSTABLE,
    department: Department.TRAFFIC,
    status: EmploymentStatus.ACTIVE,
    phone: "+1-234-567-8905",
    photo: "/placeholder.svg",
  },
  {
    id: "4",
    name: "Emily Brown",
    badgeNumber: "BADGE004",
    rank: OfficerRank.LIEUTENANT,
    department: Department.PATROL,
    status: EmploymentStatus.ACTIVE,
    phone: "+1-234-567-8907",
    photo: "/placeholder.svg",
  },
];

const mockSchedules: StaffSchedule[] = [
  {
    id: "1",
    officerId: "1",
    officerName: "John Smith",
    shift: ShiftType.MORNING,
    startDate: new Date("2024-01-15T08:00:00"),
    endDate: new Date("2024-01-15T16:00:00"),
    assignment: {
      type: AssignmentType.PATROL,
      location: "Downtown District",
      description: "Regular patrol duties in downtown area",
      supervisorId: "4",
    },
    status: ScheduleStatus.CONFIRMED,
    notes: "Regular patrol shift",
    createdBy: "HR001",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    officerId: "2",
    officerName: "Sarah Johnson",
    shift: ShiftType.AFTERNOON,
    startDate: new Date("2024-01-15T12:00:00"),
    endDate: new Date("2024-01-15T20:00:00"),
    assignment: {
      type: AssignmentType.INVESTIGATION,
      location: "Police Headquarters",
      description: "Fraud investigation case review",
      supervisorId: "4",
    },
    status: ScheduleStatus.SCHEDULED,
    notes: "Case #2024-001 investigation",
    createdBy: "HR001",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    officerId: "3",
    officerName: "Mike Davis",
    shift: ShiftType.NIGHT,
    startDate: new Date("2024-01-15T20:00:00"),
    endDate: new Date("2024-01-16T04:00:00"),
    assignment: {
      type: AssignmentType.TRAFFIC_CONTROL,
      location: "Highway 101",
      description: "Night traffic patrol and enforcement",
      supervisorId: "4",
    },
    status: ScheduleStatus.CONFIRMED,
    notes: "DUI checkpoint planned",
    createdBy: "HR001",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
];

export default function StaffScheduling() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<StaffSchedule[]>(mockSchedules);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [showNewScheduleForm, setShowNewScheduleForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<StaffSchedule | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterShift, setFilterShift] = useState<string>("all");
  const [formData, setFormData] = useState<Partial<StaffSchedule>>({});

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.startDate);
      return scheduleDate.toDateString() === date.toDateString();
    });
  };

  const getStatusBadge = (status: ScheduleStatus) => {
    const variants = {
      [ScheduleStatus.SCHEDULED]: "secondary",
      [ScheduleStatus.CONFIRMED]: "default",
      [ScheduleStatus.CANCELLED]: "destructive",
      [ScheduleStatus.COMPLETED]: "outline",
    };

    const icons = {
      [ScheduleStatus.SCHEDULED]: <Clock className="h-3 w-3 mr-1" />,
      [ScheduleStatus.CONFIRMED]: <CheckCircle className="h-3 w-3 mr-1" />,
      [ScheduleStatus.CANCELLED]: <XCircle className="h-3 w-3 mr-1" />,
      [ScheduleStatus.COMPLETED]: <CheckCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant={variants[status] as any} className="text-xs">
        {icons[status]}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getShiftIcon = (shift: ShiftType) => {
    switch (shift) {
      case ShiftType.MORNING:
        return "🌅";
      case ShiftType.AFTERNOON:
        return "☀️";
      case ShiftType.NIGHT:
        return "🌙";
      case ShiftType.OVERTIME:
        return "⏰";
      default:
        return "⏰";
    }
  };

  const handleCreateSchedule = (data: Partial<StaffSchedule>) => {
    const newSchedule: StaffSchedule = {
      id: Date.now().toString(),
      officerId: data.officerId || "",
      officerName:
        mockOfficers.find((o) => o.id === data.officerId)?.name || "",
      shift: data.shift || ShiftType.MORNING,
      startDate: data.startDate || new Date(),
      endDate: data.endDate || new Date(),
      assignment: data.assignment || {
        type: AssignmentType.PATROL,
        location: "",
        description: "",
      },
      status: ScheduleStatus.SCHEDULED,
      notes: data.notes || "",
      createdBy: user?.id || "HR001",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSchedules((prev) => [...prev, newSchedule]);
    setFormData({});
    setShowNewScheduleForm(false);
  };

  const handleUpdateSchedule = (
    scheduleId: string,
    updates: Partial<StaffSchedule>,
  ) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId
          ? { ...schedule, ...updates, updatedAt: new Date() }
          : schedule,
      ),
    );
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules((prev) =>
      prev.filter((schedule) => schedule.id !== scheduleId),
    );
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 7 : -7));
    setSelectedDate(newDate);
  };

  const weekDates = getWeekDates(selectedDate);
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesDepartment =
      filterDepartment === "all" ||
      mockOfficers.find((o) => o.id === schedule.officerId)?.department ===
        filterDepartment;
    const matchesShift =
      filterShift === "all" || schedule.shift === filterShift;

    return matchesDepartment && matchesShift;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="h-8 w-8 text-red-600" />
                Staff Scheduling
              </h1>
              <p className="text-gray-600 mt-2">
                Manage officer schedules, shifts, and assignments
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  setViewMode(viewMode === "week" ? "month" : "week")
                }
              >
                {viewMode === "week" ? "Month View" : "Week View"}
              </Button>
              <Button
                onClick={() => setShowNewScheduleForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-4">
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
                <Select value={filterShift} onValueChange={setFilterShift}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    {Object.values(ShiftType).map((shift) => (
                      <SelectItem key={shift} value={shift}>
                        {getShiftIcon(shift)}{" "}
                        {shift.replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Navigation */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => navigateWeek("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {weekDates[0].toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}{" "}
                -{" "}
                {weekDates[6].toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>
              <Button variant="outline" onClick={() => navigateWeek("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-7 gap-4 mb-6">
          {weekDates.map((date, index) => {
            const daySchedules = getSchedulesForDate(date).filter(
              (schedule) => {
                const matchesDepartment =
                  filterDepartment === "all" ||
                  mockOfficers.find((o) => o.id === schedule.officerId)
                    ?.department === filterDepartment;
                const matchesShift =
                  filterShift === "all" || schedule.shift === filterShift;
                return matchesDepartment && matchesShift;
              },
            );

            const isToday = date.toDateString() === new Date().toDateString();
            const dayNames = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ];

            return (
              <Card
                key={index}
                className={`${isToday ? "ring-2 ring-red-500" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">
                      {dayNames[date.getDay()]}
                    </p>
                    <p
                      className={`text-lg font-bold ${isToday ? "text-red-600" : "text-gray-900"}`}
                    >
                      {date.getDate()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {daySchedules.map((schedule) => {
                      const officer = mockOfficers.find(
                        (o) => o.id === schedule.officerId,
                      );
                      return (
                        <Dialog key={schedule.id}>
                          <DialogTrigger asChild>
                            <div className="p-2 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-xs">
                                  {getShiftIcon(schedule.shift)}
                                </div>
                                <span className="text-xs font-medium truncate">
                                  {schedule.officerName}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 mb-1">
                                {schedule.startDate.toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}{" "}
                                -{" "}
                                {schedule.endDate.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <div className="text-xs text-gray-500 truncate mb-1">
                                {schedule.assignment.location}
                              </div>
                              {getStatusBadge(schedule.status)}
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Schedule Details</DialogTitle>
                              <DialogDescription>
                                {schedule.officerName} -{" "}
                                {schedule.startDate.toLocaleDateString()}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={officer?.photo} />
                                  <AvatarFallback>
                                    {schedule.officerName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">
                                    {schedule.officerName}
                                  </h3>
                                  <p className="text-gray-600">
                                    {officer?.badgeNumber}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Shield className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">
                                      {officer?.rank
                                        .replace("_", " ")
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">
                                      {officer?.phone}
                                    </span>
                                  </div>
                                </div>
                                {getStatusBadge(schedule.status)}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Shift Type</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span>{getShiftIcon(schedule.shift)}</span>
                                    <span>
                                      {schedule.shift
                                        .replace("_", " ")
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <Label>Assignment Type</Label>
                                  <p className="mt-1">
                                    {schedule.assignment.type
                                      .replace("_", " ")
                                      .toUpperCase()}
                                  </p>
                                </div>
                                <div>
                                  <Label>Start Time</Label>
                                  <p className="mt-1">
                                    {schedule.startDate.toLocaleString(
                                      "en-US",
                                      {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <Label>End Time</Label>
                                  <p className="mt-1">
                                    {schedule.endDate.toLocaleString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <Label>Location</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>{schedule.assignment.location}</span>
                                </div>
                              </div>

                              <div>
                                <Label>Assignment Description</Label>
                                <p className="mt-1 text-gray-600">
                                  {schedule.assignment.description}
                                </p>
                              </div>

                              {schedule.notes && (
                                <div>
                                  <Label>Notes</Label>
                                  <p className="mt-1 text-gray-600">
                                    {schedule.notes}
                                  </p>
                                </div>
                              )}

                              <div className="flex justify-between items-center pt-4 border-t">
                                <div className="text-sm text-gray-500">
                                  Created:{" "}
                                  {schedule.createdAt.toLocaleDateString()}
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (
                                        schedule.status ===
                                        ScheduleStatus.SCHEDULED
                                      ) {
                                        handleUpdateSchedule(schedule.id, {
                                          status: ScheduleStatus.CONFIRMED,
                                        });
                                      } else if (
                                        schedule.status ===
                                        ScheduleStatus.CONFIRMED
                                      ) {
                                        handleUpdateSchedule(schedule.id, {
                                          status: ScheduleStatus.COMPLETED,
                                        });
                                      }
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {schedule.status ===
                                    ScheduleStatus.SCHEDULED
                                      ? "Confirm"
                                      : schedule.status ===
                                          ScheduleStatus.CONFIRMED
                                        ? "Complete"
                                        : "Completed"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      );
                    })}
                    {daySchedules.length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        No schedules
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Officers</p>
                  <p className="text-2xl font-bold">{mockOfficers.length}</p>
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
                  <p className="text-sm text-gray-600">Confirmed Shifts</p>
                  <p className="text-2xl font-bold">
                    {
                      schedules.filter(
                        (s) => s.status === ScheduleStatus.CONFIRMED,
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
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Schedules</p>
                  <p className="text-2xl font-bold">
                    {
                      schedules.filter(
                        (s) => s.status === ScheduleStatus.SCHEDULED,
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
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conflicts</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Schedule Form Dialog */}
        <Dialog
          open={showNewScheduleForm}
          onOpenChange={setShowNewScheduleForm}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Schedule</DialogTitle>
              <DialogDescription>
                Assign an officer to a shift and location
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateSchedule(formData);
              }}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="officer">Officer *</Label>
                    <Select
                      value={formData.officerId || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, officerId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select officer" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockOfficers.map((officer) => (
                          <SelectItem key={officer.id} value={officer.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={officer.photo} />
                                <AvatarFallback>
                                  {officer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {officer.name} ({officer.badgeNumber})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shift">Shift Type *</Label>
                    <Select
                      value={formData.shift || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          shift: value as ShiftType,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ShiftType).map((shift) => (
                          <SelectItem key={shift} value={shift}>
                            {getShiftIcon(shift)}{" "}
                            {shift.replace("_", " ").toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date & Time *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      required
                      value={
                        formData.startDate?.toISOString().slice(0, 16) || ""
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDate: new Date(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date & Time *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      required
                      value={formData.endDate?.toISOString().slice(0, 16) || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endDate: new Date(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignmentType">Assignment Type *</Label>
                    <Select
                      value={formData.assignment?.type || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          assignment: {
                            ...prev.assignment,
                            type: value as AssignmentType,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(AssignmentType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace("_", " ").toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      required
                      value={formData.assignment?.location || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          assignment: {
                            ...prev.assignment,
                            location: e.target.value,
                          },
                        }))
                      }
                      placeholder="Enter assignment location"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Assignment Description *</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.assignment?.description || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        assignment: {
                          ...prev.assignment,
                          description: e.target.value,
                        },
                      }))
                    }
                    placeholder="Describe the assignment duties and responsibilities"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Additional notes or instructions"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewScheduleForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Create Schedule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
