import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PatrolLog, ShiftType, PatrolStatus, PatrolActivity, ActivityType, UserRole } from '@shared/types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { 
  Shield, 
  Plus, 
  Clock, 
  MapPin, 
  Car, 
  Play, 
  Pause, 
  Square,
  Calendar,
  Route,
  Activity,
  CheckCircle,
  AlertTriangle,
  Coffee,
  FileText,
  User
} from 'lucide-react';

export default function PatrolLogs() {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [patrols, setPatrols] = useState<PatrolLog[]>([]);
  const [filteredPatrols, setFilteredPatrols] = useState<PatrolLog[]>([]);
  const [activePatrol, setActivePatrol] = useState<PatrolLog | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newPatrol, setNewPatrol] = useState({
    shift: ShiftType.MORNING,
    route: '',
    area: '',
    vehicleId: '',
    mileageStart: 0,
    notes: ''
  });
  const [newActivity, setNewActivity] = useState({
    activity: '',
    location: '',
    description: '',
    type: ActivityType.PATROL
  });

  const canCreatePatrols = hasAnyRole([UserRole.PREVENTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]);
  const canViewAllPatrols = hasAnyRole([UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]);

  useEffect(() => {
    fetchPatrols();
  }, []);

  useEffect(() => {
    filterPatrols();
  }, [patrols]);

  const fetchPatrols = async () => {
    // Mock data - In production, fetch from API
    const mockPatrols: PatrolLog[] = [
      {
        id: 'PL-001',
        officerId: '4',
        officerName: 'Officer Mulugeta Kebede',
        shift: ShiftType.MORNING,
        startTime: new Date('2024-01-16T06:00:00'),
        endTime: new Date('2024-01-16T14:00:00'),
        route: 'Downtown-Market-North District',
        area: 'Central Business District',
        status: PatrolStatus.COMPLETED,
        activities: [
          {
            id: 'PA-001',
            time: new Date('2024-01-16T06:30:00'),
            activity: 'Started patrol route',
            location: 'Police Station',
            type: ActivityType.PATROL
          },
          {
            id: 'PA-002',
            time: new Date('2024-01-16T08:00:00'),
            activity: 'Checkpoint setup',
            location: 'Main Street & 1st Ave',
            description: 'Traffic checkpoint for morning rush hour',
            type: ActivityType.CHECKPOINT
          },
          {
            id: 'PA-003',
            time: new Date('2024-01-16T10:30:00'),
            activity: 'Coffee break',
            location: 'Patrol Unit',
            type: ActivityType.BREAK
          },
          {
            id: 'PA-004',
            time: new Date('2024-01-16T12:00:00'),
            activity: 'Incident response',
            location: 'Market Street',
            description: 'Responded to suspicious vehicle report',
            type: ActivityType.RESPONSE
          }
        ],
        incidents: ['INC-001'],
        notes: 'Routine patrol completed. One incident response required.',
        mileageStart: 45230,
        mileageEnd: 45298,
        vehicleId: 'PV-001',
        createdAt: new Date('2024-01-16T06:00:00'),
        updatedAt: new Date('2024-01-16T14:15:00')
      },
      {
        id: 'PL-002',
        officerId: '7',
        officerName: 'Officer Almaz Worku',
        shift: ShiftType.AFTERNOON,
        startTime: new Date('2024-01-16T14:00:00'),
        endTime: new Date('2024-01-16T22:00:00'),
        route: 'Residential-Parks-Shopping District',
        area: 'North & East Districts',
        status: PatrolStatus.COMPLETED,
        activities: [
          {
            id: 'PA-005',
            time: new Date('2024-01-16T14:30:00'),
            activity: 'Park patrol',
            location: 'Central Park',
            type: ActivityType.PATROL
          },
          {
            id: 'PA-006',
            time: new Date('2024-01-16T16:00:00'),
            activity: 'Community engagement',
            location: 'Shopping Center',
            description: 'Interacted with local business owners',
            type: ActivityType.OTHER
          },
          {
            id: 'PA-007',
            time: new Date('2024-01-16T19:30:00'),
            activity: 'Noise complaint response',
            location: 'Residential Block 5',
            description: 'Responded to noise complaint, issued warning',
            type: ActivityType.RESPONSE
          }
        ],
        incidents: ['INC-002'],
        notes: 'Good community interaction. Resolved noise complaint peacefully.',
        mileageStart: 52100,
        mileageEnd: 52175,
        vehicleId: 'PV-002',
        createdAt: new Date('2024-01-16T14:00:00'),
        updatedAt: new Date('2024-01-16T22:10:00')
      },
      {
        id: 'PL-003',
        officerId: '4',
        officerName: 'Officer Mulugeta Kebede',
        shift: ShiftType.MORNING,
        startTime: new Date('2024-01-17T06:00:00'),
        route: 'Industrial-Highway-Outskirts',
        area: 'Industrial Zone & Highway',
        status: PatrolStatus.ACTIVE,
        activities: [
          {
            id: 'PA-008',
            time: new Date('2024-01-17T06:30:00'),
            activity: 'Started patrol',
            location: 'Police Station',
            type: ActivityType.PATROL
          },
          {
            id: 'PA-009',
            time: new Date('2024-01-17T08:15:00'),
            activity: 'Highway patrol',
            location: 'Highway 1, Mile 15',
            description: 'Monitoring speed and traffic violations',
            type: ActivityType.PATROL
          }
        ],
        notes: 'Currently on duty',
        mileageStart: 45298,
        vehicleId: 'PV-001',
        createdAt: new Date('2024-01-17T06:00:00'),
        updatedAt: new Date('2024-01-17T08:15:00')
      }
    ];

    setPatrols(mockPatrols);
    
    // Find active patrol for current user
    const activePatrolForUser = mockPatrols.find(
      p => p.officerId === user?.id && p.status === PatrolStatus.ACTIVE
    );
    setActivePatrol(activePatrolForUser || null);
    
    setIsLoading(false);
  };

  const filterPatrols = () => {
    let filtered = [...patrols];

    // If user is preventive officer, only show their own patrols
    if (hasRole(UserRole.PREVENTIVE_OFFICER) && !canViewAllPatrols) {
      filtered = filtered.filter(patrol => patrol.officerId === user?.id);
    }

    setFilteredPatrols(filtered);
  };

  const handleStartPatrol = async () => {
    if (!user) return;

    const patrol: PatrolLog = {
      id: `PL-${String(patrols.length + 1).padStart(3, '0')}`,
      officerId: user.id,
      officerName: user.fullName,
      shift: newPatrol.shift,
      startTime: new Date(),
      route: newPatrol.route,
      area: newPatrol.area,
      status: PatrolStatus.ACTIVE,
      activities: [{
        id: 'PA-START',
        time: new Date(),
        activity: 'Patrol started',
        location: 'Police Station',
        type: ActivityType.PATROL
      }],
      notes: newPatrol.notes,
      mileageStart: newPatrol.mileageStart,
      vehicleId: newPatrol.vehicleId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPatrols(prev => [patrol, ...prev]);
    setActivePatrol(patrol);
    setIsCreateDialogOpen(false);
    setNewPatrol({
      shift: ShiftType.MORNING,
      route: '',
      area: '',
      vehicleId: '',
      mileageStart: 0,
      notes: ''
    });
  };

  const handleEndPatrol = async () => {
    if (!activePatrol) return;

    const mileageEnd = prompt('Enter ending mileage:', '');
    if (!mileageEnd) return;

    const updatedPatrol = {
      ...activePatrol,
      endTime: new Date(),
      status: PatrolStatus.COMPLETED,
      mileageEnd: parseInt(mileageEnd),
      activities: [
        ...activePatrol.activities,
        {
          id: `PA-END-${Date.now()}`,
          time: new Date(),
          activity: 'Patrol completed',
          location: 'Police Station',
          type: ActivityType.PATROL
        }
      ],
      updatedAt: new Date()
    };

    setPatrols(prev => prev.map(p => p.id === activePatrol.id ? updatedPatrol : p));
    setActivePatrol(null);
  };

  const handleAddActivity = async () => {
    if (!activePatrol) return;

    const activity: PatrolActivity = {
      id: `PA-${Date.now()}`,
      time: new Date(),
      activity: newActivity.activity,
      location: newActivity.location,
      description: newActivity.description,
      type: newActivity.type
    };

    const updatedPatrol = {
      ...activePatrol,
      activities: [...activePatrol.activities, activity],
      updatedAt: new Date()
    };

    setPatrols(prev => prev.map(p => p.id === activePatrol.id ? updatedPatrol : p));
    setActivePatrol(updatedPatrol);
    setIsActivityDialogOpen(false);
    setNewActivity({
      activity: '',
      location: '',
      description: '',
      type: ActivityType.PATROL
    });
  };

  const getStatusBadgeColor = (status: PatrolStatus) => {
    switch (status) {
      case PatrolStatus.SCHEDULED: return 'bg-blue-100 text-blue-800';
      case PatrolStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case PatrolStatus.COMPLETED: return 'bg-gray-100 text-gray-800';
      case PatrolStatus.SUSPENDED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftBadgeColor = (shift: ShiftType) => {
    switch (shift) {
      case ShiftType.MORNING: return 'bg-yellow-100 text-yellow-800';
      case ShiftType.AFTERNOON: return 'bg-orange-100 text-orange-800';
      case ShiftType.NIGHT: return 'bg-purple-100 text-purple-800';
      case ShiftType.OVERTIME: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.CHECKPOINT: return Shield;
      case ActivityType.PATROL: return Route;
      case ActivityType.RESPONSE: return AlertTriangle;
      case ActivityType.BREAK: return Coffee;
      case ActivityType.REPORT: return FileText;
      default: return Activity;
    }
  };

  const calculatePatrolDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const duration = Math.floor((end.getTime() - startTime.getTime()) / (1000 * 60 * 60));
    return `${duration}h`;
  };

  const patrolStats = {
    total: filteredPatrols.length,
    active: filteredPatrols.filter(p => p.status === PatrolStatus.ACTIVE).length,
    completed: filteredPatrols.filter(p => p.status === PatrolStatus.COMPLETED).length,
    totalHours: filteredPatrols
      .filter(p => p.endTime)
      .reduce((total, p) => {
        const duration = (p.endTime!.getTime() - p.startTime.getTime()) / (1000 * 60 * 60);
        return total + duration;
      }, 0)
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
              <h1 className="text-3xl font-bold mb-2">Patrol Logs</h1>
              <p className="text-gray-300">Track patrol activities and duty logs</p>
            </div>
            <div className="flex gap-3">
              {activePatrol && (
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-800 px-3 py-1">
                    <Activity className="w-4 h-4 mr-1" />
                    On Patrol: {calculatePatrolDuration(activePatrol.startTime)}
                  </Badge>
                  <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-crime-yellow hover:bg-yellow-600 text-crime-black">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Activity
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Patrol Activity</DialogTitle>
                        <DialogDescription>
                          Log a new activity for your current patrol
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="activity">Activity</Label>
                            <Input
                              id="activity"
                              value={newActivity.activity}
                              onChange={(e) => setNewActivity(prev => ({ ...prev, activity: e.target.value }))}
                              placeholder="What did you do?"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="activityLocation">Location</Label>
                            <Input
                              id="activityLocation"
                              value={newActivity.location}
                              onChange={(e) => setNewActivity(prev => ({ ...prev, location: e.target.value }))}
                              placeholder="Where?"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="activityType">Activity Type</Label>
                          <Select 
                            value={newActivity.type} 
                            onValueChange={(value) => setNewActivity(prev => ({ ...prev, type: value as ActivityType }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={ActivityType.PATROL}>Patrol</SelectItem>
                              <SelectItem value={ActivityType.CHECKPOINT}>Checkpoint</SelectItem>
                              <SelectItem value={ActivityType.RESPONSE}>Response</SelectItem>
                              <SelectItem value={ActivityType.BREAK}>Break</SelectItem>
                              <SelectItem value={ActivityType.REPORT}>Report</SelectItem>
                              <SelectItem value={ActivityType.OTHER}>Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="activityDescription">Description (Optional)</Label>
                          <Textarea
                            id="activityDescription"
                            value={newActivity.description}
                            onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Additional details..."
                            rows={2}
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button onClick={handleAddActivity} className="bg-crime-red hover:bg-crime-red-dark text-white">
                            Add Activity
                          </Button>
                          <Button variant="outline" onClick={() => setIsActivityDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    onClick={handleEndPatrol}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    End Patrol
                  </Button>
                </div>
              )}
              
              {canCreatePatrols && !activePatrol && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-crime-red hover:bg-crime-red-dark text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Start Patrol
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Start New Patrol</DialogTitle>
                      <DialogDescription>
                        Begin a new patrol duty log
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="shift">Shift</Label>
                          <Select 
                            value={newPatrol.shift} 
                            onValueChange={(value) => setNewPatrol(prev => ({ ...prev, shift: value as ShiftType }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={ShiftType.MORNING}>Morning (6AM-2PM)</SelectItem>
                              <SelectItem value={ShiftType.AFTERNOON}>Afternoon (2PM-10PM)</SelectItem>
                              <SelectItem value={ShiftType.NIGHT}>Night (10PM-6AM)</SelectItem>
                              <SelectItem value={ShiftType.OVERTIME}>Overtime</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="vehicle">Vehicle ID</Label>
                          <Input
                            id="vehicle"
                            value={newPatrol.vehicleId}
                            onChange={(e) => setNewPatrol(prev => ({ ...prev, vehicleId: e.target.value }))}
                            placeholder="e.g., PV-001"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="route">Patrol Route</Label>
                          <Input
                            id="route"
                            value={newPatrol.route}
                            onChange={(e) => setNewPatrol(prev => ({ ...prev, route: e.target.value }))}
                            placeholder="e.g., Downtown-Market-North"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="area">Area</Label>
                          <Input
                            id="area"
                            value={newPatrol.area}
                            onChange={(e) => setNewPatrol(prev => ({ ...prev, area: e.target.value }))}
                            placeholder="e.g., Central Business District"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mileage">Starting Mileage</Label>
                        <Input
                          id="mileage"
                          type="number"
                          value={newPatrol.mileageStart}
                          onChange={(e) => setNewPatrol(prev => ({ ...prev, mileageStart: parseInt(e.target.value) || 0 }))}
                          placeholder="Vehicle odometer reading"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="patrolNotes">Notes (Optional)</Label>
                        <Textarea
                          id="patrolNotes"
                          value={newPatrol.notes}
                          onChange={(e) => setNewPatrol(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any additional information for this patrol..."
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleStartPatrol} className="bg-crime-red hover:bg-crime-red-dark text-white">
                          Start Patrol
                        </Button>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
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
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">{patrolStats.total}</h3>
              <p className="text-gray-600">Total Patrols</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-2xl font-bold text-crime-black">{patrolStats.active}</h3>
              <p className="text-gray-600">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <h3 className="text-2xl font-bold text-crime-black">{patrolStats.completed}</h3>
              <p className="text-gray-600">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-crime-yellow" />
              <h3 className="text-2xl font-bold text-crime-black">{Math.round(patrolStats.totalHours)}h</h3>
              <p className="text-gray-600">Total Hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Patrol Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>Patrol History</CardTitle>
            <CardDescription>
              {filteredPatrols.length} patrol log(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPatrols.map((patrol) => (
                <div key={patrol.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-crime-red" />
                        <h3 className="text-lg font-semibold text-crime-black">{patrol.route}</h3>
                        <Badge className={getStatusBadgeColor(patrol.status)}>
                          {patrol.status.toUpperCase()}
                        </Badge>
                        <Badge className={getShiftBadgeColor(patrol.shift)}>
                          {patrol.shift.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {patrol.officerName}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {patrol.area}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(patrol.startTime).toLocaleString()}
                          {patrol.endTime && ` - ${new Date(patrol.endTime).toLocaleString()}`}
                        </div>
                        <div className="flex items-center">
                          <Car className="w-4 h-4 mr-1" />
                          {patrol.vehicleId || 'On Foot'}
                        </div>
                      </div>

                      {patrol.notes && (
                        <p className="text-gray-600 mb-3">{patrol.notes}</p>
                      )}

                      <div className="border-t pt-4">
                        <h4 className="font-medium text-crime-black mb-3">Activities ({patrol.activities.length})</h4>
                        <div className="space-y-2">
                          {patrol.activities.slice(0, 3).map((activity) => {
                            const ActivityIcon = getActivityIcon(activity.type);
                            return (
                              <div key={activity.id} className="flex items-center text-sm">
                                <ActivityIcon className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-gray-600">{new Date(activity.time).toLocaleTimeString()}</span>
                                <span className="mx-2">•</span>
                                <span className="text-crime-black">{activity.activity}</span>
                                <span className="mx-2">•</span>
                                <span className="text-gray-600">{activity.location}</span>
                              </div>
                            );
                          })}
                          {patrol.activities.length > 3 && (
                            <div className="text-sm text-gray-500">
                              + {patrol.activities.length - 3} more activities
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      {patrol.endTime && (
                        <div className="text-right text-sm">
                          <div className="font-semibold text-crime-black">
                            {calculatePatrolDuration(patrol.startTime, patrol.endTime)}
                          </div>
                          <div className="text-gray-500">Duration</div>
                        </div>
                      )}
                      
                      {patrol.mileageStart !== undefined && patrol.mileageEnd && (
                        <div className="text-right text-sm">
                          <div className="font-semibold text-crime-black">
                            {patrol.mileageEnd - patrol.mileageStart} mi
                          </div>
                          <div className="text-gray-500">Distance</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredPatrols.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No patrol logs found</h3>
                  <p className="text-gray-500">Start your first patrol to begin logging activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
