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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { StaffSchedule, ShiftType, ScheduleStatus, AssignmentType, OfficerRank, Department, EmploymentStatus } from "../../shared/types";

export default function StaffScheduling() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [showNewScheduleForm, setShowNewScheduleForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<StaffSchedule | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterShift, setFilterShift] = useState<string>("all");
  const [formData, setFormData] = useState<Partial<StaffSchedule>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const r1 = await api.get('/staff-schedules');
        if (r1.ok) {
          const d = await r1.json();
          setSchedules(d.data.schedules.map((s: any) => ({ ...s })));
        }
        const r2 = await api.get('/officers');
        if (r2.ok) {
          const d2 = await r2.json();
          setOfficers(d2.data.officers || []);
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

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

  const getSchedulesForDate = (date: Date) => schedules.filter(s => s.startDate ? new Date(s.startDate).toDateString() === date.toDateString() : false);

  const getShiftIcon = (shift: ShiftType) => {
    switch (shift) {
      case ShiftType.MORNING: return "🌅";
      case ShiftType.AFTERNOON: return "☀️";
      case ShiftType.NIGHT: return "🌙";
      case ShiftType.OVERTIME: return "⏰";
      default: return "⏰";
    }
  };

  const handleCreateSchedule = async (data: Partial<StaffSchedule>) => {
    try {
      const officer = officers.find(o => o.id === data.officerId);
      const payload = { ...data, officerName: officer?.personalInfo?.fullName || officer?.fullName };
      const res = await api.post('/staff-schedules', payload);
      if (res.ok) {
        const d = await res.json();
        setSchedules(prev => [d.data, ...prev]);
        setFormData({});
        setShowNewScheduleForm(false);
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateSchedule = async (scheduleId: string, updates: Partial<StaffSchedule>) => {
    try {
      const res = await api.put(`/staff-schedules/${scheduleId}`, updates);
      if (res.ok) {
        const d = await res.json();
        setSchedules(prev => prev.map(s => s.id === d.data.id ? d.data : s));
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const res = await api.delete(`/staff-schedules/${scheduleId}`);
      if (res.ok) setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    } catch (e) { console.error(e); }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 7 : -7));
    setSelectedDate(newDate);
  };

  const weekDates = getWeekDates(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><CalendarIcon className="h-8 w-8 text-red-600" />Staff Scheduling</h1>
              <p className="text-gray-600 mt-2">Manage officer schedules, shifts, and assignments</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}>{viewMode === 'week' ? 'Month View' : 'Week View'}</Button>
              <Button onClick={() => setShowNewScheduleForm(true)} className="bg-red-600 hover:bg-red-700"><Plus className="h-4 w-4 mr-2" />New Schedule</Button>
            </div>
          </div>
        </div>

        <Card className="mb-6"><CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Select value={filterDepartment} onValueChange={setFilterDepartment}><SelectTrigger className="w-48"><SelectValue placeholder="Filter by Department" /></SelectTrigger><SelectContent><SelectItem value="all">All Departments</SelectItem>{Object.values(Department).map(d => <SelectItem key={d} value={d}>{d.replace('_',' ').toUpperCase()}</SelectItem>)}</SelectContent></Select>
            <Select value={filterShift} onValueChange={setFilterShift}><SelectTrigger className="w-48"><SelectValue placeholder="Filter by Shift" /></SelectTrigger><SelectContent><SelectItem value="all">All Shifts</SelectItem>{Object.values(ShiftType).map(s => <SelectItem key={s} value={s}>{getShiftIcon(s)} {s.replace('_',' ').toUpperCase()}</SelectItem>)}</SelectContent></Select>
            <div className="ml-auto flex gap-2"><Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button><Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-2" />Import</Button></div>
          </div>
        </CardContent></Card>

        <Card className="mb-6"><CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigateWeek('prev')}><ChevronLeft className="h-4 w-4" /></Button>
              <div className="font-medium">Week of {weekDates[0].toLocaleDateString()}</div>
              <Button variant="outline" onClick={() => navigateWeek('next')}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Today</Button>
            </div>
          </div>
        </CardContent></Card>

        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((d) => (
            <div key={d.toDateString()} className="bg-white p-3 rounded">
              <div className="font-medium mb-2">{d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              <div className="space-y-2">
                {getSchedulesForDate(d).map((s) => (
                  <div key={s.id} className="border p-2 rounded">
                    <div className="text-sm font-semibold">{s.officerName}</div>
                    <div className="text-xs text-gray-600">{new Date(s.startDate).toLocaleTimeString()} - {new Date(s.endDate).toLocaleTimeString()}</div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedSchedule(s)}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteSchedule(s.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* New Schedule Dialog */}
        {showNewScheduleForm && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow max-w-2xl w-full">
              <h3 className="text-lg font-semibold mb-4">New Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Officer</Label>
                  <Select value={formData.officerId || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, officerId: v }))}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {officers.map(o => <SelectItem key={o.id} value={o.id}>{o.personalInfo?.fullName || o.fullName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Shift</Label>
                  <Select value={formData.shift || ShiftType.MORNING} onValueChange={(v) => setFormData(prev => ({ ...prev, shift: v }))}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(ShiftType).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start</Label>
                  <Input type="datetime-local" value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0,16) : ''} onChange={(e) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))} />
                </div>
                <div>
                  <Label>End</Label>
                  <Input type="datetime-local" value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0,16) : ''} onChange={(e) => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button className="bg-red-600 text-white" onClick={() => handleCreateSchedule(formData)}>Create</Button>
                <Button variant="outline" onClick={() => setShowNewScheduleForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
