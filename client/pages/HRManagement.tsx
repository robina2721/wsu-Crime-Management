import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Camera, 
  Upload,
  Download,
  Shield,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Star
} from 'lucide-react';
import {
  OfficerProfile,
  OfficerRank,
  Department,
  EmploymentStatus,
  CertificationStatus,
  DocumentType,
  Rating,
  UserRole,
  Certification,
  Document,
  PerformanceReview
} from '../../shared/types';

// Mock data for demonstration
const mockOfficers: OfficerProfile[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    personalInfo: {
      fullName: 'John Smith',
      dateOfBirth: new Date('1985-03-15'),
      nationalId: 'ID123456789',
      address: '123 Main St, City',
      phone: '+1-234-567-8901',
      email: 'john.smith@police.gov',
      emergencyContact: {
        name: 'Jane Smith',
        relationship: 'Spouse',
        phone: '+1-234-567-8902'
      }
    },
    professionalInfo: {
      badgeNumber: 'BADGE001',
      rank: OfficerRank.SERGEANT,
      department: Department.PATROL,
      startDate: new Date('2020-01-15'),
      status: EmploymentStatus.ACTIVE,
      supervisor: 'Captain Johnson',
      specializations: ['Traffic Control', 'Community Policing'],
      certifications: [
        {
          id: 'cert1',
          name: 'Basic Law Enforcement',
          issuingBody: 'Police Academy',
          issueDate: new Date('2020-01-01'),
          expiryDate: new Date('2025-01-01'),
          certificateNumber: 'BLE2020001',
          status: CertificationStatus.VALID
        }
      ]
    },
    photo: '/placeholder.svg',
    documents: [],
    performanceReviews: [],
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date(),
    createdBy: 'HR001'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    personalInfo: {
      fullName: 'Sarah Johnson',
      dateOfBirth: new Date('1990-07-22'),
      nationalId: 'ID987654321',
      address: '456 Oak Ave, City',
      phone: '+1-234-567-8903',
      email: 'sarah.johnson@police.gov',
      emergencyContact: {
        name: 'Michael Johnson',
        relationship: 'Brother',
        phone: '+1-234-567-8904'
      }
    },
    professionalInfo: {
      badgeNumber: 'BADGE002',
      rank: OfficerRank.DETECTIVE,
      department: Department.CRIMINAL_INVESTIGATION,
      startDate: new Date('2021-03-10'),
      status: EmploymentStatus.ACTIVE,
      supervisor: 'Lieutenant Brown',
      specializations: ['Fraud Investigation', 'Digital Forensics'],
      certifications: [
        {
          id: 'cert2',
          name: 'Digital Forensics',
          issuingBody: 'FBI Training Center',
          issueDate: new Date('2021-06-01'),
          expiryDate: new Date('2024-06-01'),
          certificateNumber: 'DF2021002',
          status: CertificationStatus.VALID
        }
      ]
    },
    photo: '/placeholder.svg',
    documents: [],
    performanceReviews: [],
    createdAt: new Date('2021-03-10'),
    updatedAt: new Date(),
    createdBy: 'HR001'
  }
];

export default function HRManagement() {
  const { user } = useAuth();
  const [officers, setOfficers] = useState<OfficerProfile[]>(mockOfficers);
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewEmployeeForm, setShowNewEmployeeForm] = useState(false);
  const [formData, setFormData] = useState<Partial<OfficerProfile>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = officer.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         officer.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         officer.professionalInfo.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || officer.professionalInfo.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || officer.professionalInfo.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handlePhotoUpload = async (officerId: string, file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
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
      
      // Update officer photo
      setOfficers(prev => prev.map(officer => 
        officer.id === officerId 
          ? { ...officer, photo: URL.createObjectURL(file) }
          : officer
      ));
    }, 2000);
  };

  const handleCreateEmployee = (data: Partial<OfficerProfile>) => {
    const newOfficer: OfficerProfile = {
      id: Date.now().toString(),
      employeeId: data.employeeId || `EMP${String(officers.length + 1).padStart(3, '0')}`,
      personalInfo: {
        fullName: data.personalInfo?.fullName || '',
        dateOfBirth: data.personalInfo?.dateOfBirth || new Date(),
        nationalId: data.personalInfo?.nationalId || '',
        address: data.personalInfo?.address || '',
        phone: data.personalInfo?.phone || '',
        email: data.personalInfo?.email || '',
        emergencyContact: data.personalInfo?.emergencyContact || {
          name: '',
          relationship: '',
          phone: ''
        }
      },
      professionalInfo: {
        badgeNumber: data.professionalInfo?.badgeNumber || `BADGE${String(officers.length + 1).padStart(3, '0')}`,
        rank: data.professionalInfo?.rank || OfficerRank.CONSTABLE,
        department: data.professionalInfo?.department || Department.PATROL,
        startDate: data.professionalInfo?.startDate || new Date(),
        status: EmploymentStatus.ACTIVE,
        specializations: data.professionalInfo?.specializations || [],
        certifications: data.professionalInfo?.certifications || []
      },
      documents: [],
      performanceReviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user?.id || 'HR001'
    };

    setOfficers(prev => [...prev, newOfficer]);
    setFormData({});
    setShowNewEmployeeForm(false);
  };

  const getStatusBadge = (status: EmploymentStatus) => {
    const variants = {
      [EmploymentStatus.ACTIVE]: 'default',
      [EmploymentStatus.INACTIVE]: 'secondary',
      [EmploymentStatus.SUSPENDED]: 'destructive',
      [EmploymentStatus.TERMINATED]: 'destructive',
      [EmploymentStatus.RETIRED]: 'secondary',
      [EmploymentStatus.ON_LEAVE]: 'outline'
    };
    
    return <Badge variant={variants[status] as any}>{status.replace('_', ' ')}</Badge>;
  };

  const getCertificationStatusIcon = (status: CertificationStatus) => {
    switch (status) {
      case CertificationStatus.VALID:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case CertificationStatus.EXPIRED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case CertificationStatus.SUSPENDED:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case CertificationStatus.REVOKED:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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
                <Users className="h-8 w-8 text-red-600" />
                HR Management
              </h1>
              <p className="text-gray-600 mt-2">Manage employee profiles, registration, and documentation</p>
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

        {/* Search and Filters */}
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
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {Object.values(Department).map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept.replace('_', ' ').toUpperCase()}
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
                    {Object.values(EmploymentStatus).map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Officers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOfficers.map((officer) => (
            <Card key={officer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={officer.photo} />
                        <AvatarFallback>
                          {officer.personalInfo.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute -bottom-2 -right-2 h-6 w-6 p-0 rounded-full bg-white border-2 border-gray-200"
                          >
                            <Camera className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Officer Photo</DialogTitle>
                            <DialogDescription>
                              Upload a new photo for {officer.personalInfo.fullName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-500">Click to upload photo</p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handlePhotoUpload(officer.id, file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            {isUploading && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Uploading...</span>
                                  <span>{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} />
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{officer.personalInfo.fullName}</h3>
                      <p className="text-sm text-gray-600">{officer.employeeId}</p>
                      <p className="text-sm text-gray-600">{officer.professionalInfo.badgeNumber}</p>
                    </div>
                  </div>
                  {getStatusBadge(officer.professionalInfo.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span>{officer.professionalInfo.rank.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{officer.professionalInfo.department.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{officer.personalInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{officer.personalInfo.phone}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {officer.professionalInfo.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center">
                        {getCertificationStatusIcon(cert.status)}
                      </div>
                    ))}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Officer Profile - {officer.personalInfo.fullName}</DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="personal">Personal</TabsTrigger>
                          <TabsTrigger value="professional">Professional</TabsTrigger>
                          <TabsTrigger value="certifications">Certifications</TabsTrigger>
                          <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>
                        <TabsContent value="personal" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Full Name</Label>
                              <Input value={officer.personalInfo.fullName} readOnly />
                            </div>
                            <div>
                              <Label>Date of Birth</Label>
                              <Input value={officer.personalInfo.dateOfBirth.toLocaleDateString()} readOnly />
                            </div>
                            <div>
                              <Label>National ID</Label>
                              <Input value={officer.personalInfo.nationalId} readOnly />
                            </div>
                            <div>
                              <Label>Phone</Label>
                              <Input value={officer.personalInfo.phone} readOnly />
                            </div>
                            <div className="col-span-2">
                              <Label>Email</Label>
                              <Input value={officer.personalInfo.email} readOnly />
                            </div>
                            <div className="col-span-2">
                              <Label>Address</Label>
                              <Textarea value={officer.personalInfo.address} readOnly />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Emergency Contact</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Name</Label>
                                <Input value={officer.personalInfo.emergencyContact.name} readOnly />
                              </div>
                              <div>
                                <Label>Relationship</Label>
                                <Input value={officer.personalInfo.emergencyContact.relationship} readOnly />
                              </div>
                              <div>
                                <Label>Phone</Label>
                                <Input value={officer.personalInfo.emergencyContact.phone} readOnly />
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="professional" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Badge Number</Label>
                              <Input value={officer.professionalInfo.badgeNumber} readOnly />
                            </div>
                            <div>
                              <Label>Rank</Label>
                              <Input value={officer.professionalInfo.rank.replace('_', ' ').toUpperCase()} readOnly />
                            </div>
                            <div>
                              <Label>Department</Label>
                              <Input value={officer.professionalInfo.department.replace('_', ' ').toUpperCase()} readOnly />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input value={officer.professionalInfo.startDate.toLocaleDateString()} readOnly />
                            </div>
                            <div>
                              <Label>Status</Label>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(officer.professionalInfo.status)}
                              </div>
                            </div>
                            <div>
                              <Label>Supervisor</Label>
                              <Input value={officer.professionalInfo.supervisor || 'Not assigned'} readOnly />
                            </div>
                          </div>
                          <div>
                            <Label>Specializations</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {officer.professionalInfo.specializations.map((spec, index) => (
                                <Badge key={index} variant="outline">{spec}</Badge>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="certifications" className="space-y-4">
                          <div className="space-y-4">
                            {officer.professionalInfo.certifications.map((cert, index) => (
                              <Card key={index}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Award className="h-4 w-4 text-yellow-500" />
                                        <h4 className="font-semibold">{cert.name}</h4>
                                        {getCertificationStatusIcon(cert.status)}
                                      </div>
                                      <p className="text-sm text-gray-600 mb-1">Issued by: {cert.issuingBody}</p>
                                      <p className="text-sm text-gray-600 mb-1">Certificate #: {cert.certificateNumber}</p>
                                      <div className="flex gap-4 text-sm">
                                        <span>Issued: {cert.issueDate.toLocaleDateString()}</span>
                                        {cert.expiryDate && (
                                          <span>Expires: {cert.expiryDate.toLocaleDateString()}</span>
                                        )}
                                      </div>
                                    </div>
                                    <Badge variant={cert.status === CertificationStatus.VALID ? 'default' : 'destructive'}>
                                      {cert.status}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="documents" className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Documents</h4>
                            <Button size="sm" variant="outline">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Document
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {officer.documents.length === 0 ? (
                              <p className="text-gray-500 text-center py-4">No documents uploaded</p>
                            ) : (
                              officer.documents.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                    <div>
                                      <p className="font-medium">{doc.fileName}</p>
                                      <p className="text-sm text-gray-500">{doc.type.replace('_', ' ').toUpperCase()}</p>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* New Employee Form Dialog */}
        <Dialog open={showNewEmployeeForm} onOpenChange={setShowNewEmployeeForm}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Employee</DialogTitle>
              <DialogDescription>
                Create a new employee profile with personal and professional information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateEmployee(formData);
            }}>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="personal">Personal Information</TabsTrigger>
                  <TabsTrigger value="professional">Professional Information</TabsTrigger>
                </TabsList>
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        required
                        value={formData.personalInfo?.fullName || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            fullName: e.target.value
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        required
                        value={formData.personalInfo?.dateOfBirth?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            dateOfBirth: new Date(e.target.value)
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nationalId">National ID *</Label>
                      <Input
                        id="nationalId"
                        required
                        value={formData.personalInfo?.nationalId || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            nationalId: e.target.value
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        required
                        value={formData.personalInfo?.phone || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            phone: e.target.value
                          }
                        }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.personalInfo?.email || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            email: e.target.value
                          }
                        }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        required
                        value={formData.personalInfo?.address || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            address: e.target.value
                          }
                        }))}
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Emergency Contact</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="emergencyName">Name *</Label>
                        <Input
                          id="emergencyName"
                          required
                          value={formData.personalInfo?.emergencyContact?.name || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: {
                              ...prev.personalInfo,
                              emergencyContact: {
                                ...prev.personalInfo?.emergencyContact,
                                name: e.target.value
                              }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyRelationship">Relationship *</Label>
                        <Input
                          id="emergencyRelationship"
                          required
                          value={formData.personalInfo?.emergencyContact?.relationship || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: {
                              ...prev.personalInfo,
                              emergencyContact: {
                                ...prev.personalInfo?.emergencyContact,
                                relationship: e.target.value
                              }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyPhone">Phone *</Label>
                        <Input
                          id="emergencyPhone"
                          required
                          value={formData.personalInfo?.emergencyContact?.phone || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: {
                              ...prev.personalInfo,
                              emergencyContact: {
                                ...prev.personalInfo?.emergencyContact,
                                phone: e.target.value
                              }
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="professional" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="badgeNumber">Badge Number *</Label>
                      <Input
                        id="badgeNumber"
                        required
                        value={formData.professionalInfo?.badgeNumber || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          professionalInfo: {
                            ...prev.professionalInfo,
                            badgeNumber: e.target.value
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rank">Rank *</Label>
                      <Select
                        value={formData.professionalInfo?.rank || ''}
                        onValueChange={(value) => setFormData(prev => ({
                          ...prev,
                          professionalInfo: {
                            ...prev.professionalInfo,
                            rank: value as OfficerRank
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rank" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(OfficerRank).map(rank => (
                            <SelectItem key={rank} value={rank}>
                              {rank.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select
                        value={formData.professionalInfo?.department || ''}
                        onValueChange={(value) => setFormData(prev => ({
                          ...prev,
                          professionalInfo: {
                            ...prev.professionalInfo,
                            department: value as Department
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(Department).map(dept => (
                            <SelectItem key={dept} value={dept}>
                              {dept.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        required
                        value={formData.professionalInfo?.startDate?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          professionalInfo: {
                            ...prev.professionalInfo,
                            startDate: new Date(e.target.value)
                          }
                        }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="supervisor">Supervisor</Label>
                      <Input
                        id="supervisor"
                        value={formData.professionalInfo?.supervisor || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          professionalInfo: {
                            ...prev.professionalInfo,
                            supervisor: e.target.value
                          }
                        }))}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewEmployeeForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Create Employee
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {filteredOfficers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No officers found</h3>
              <p className="text-gray-600 mb-4">No officers match your current search criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterDepartment('all');
                  setFilterStatus('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
