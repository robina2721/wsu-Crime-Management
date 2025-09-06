import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  CriminalRecord,
  RiskLevel,
  Conviction,
  ArrestRecord,
  Warrant,
  WarrantStatus,
  WarrantType,
  UserRole,
  CrimeCategory,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Search,
  Filter,
  User,
  AlertTriangle,
  Shield,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Eye,
  Plus,
  Users,
  Gavel,
  Clock,
  Database,
  Camera,
  Fingerprint,
  Scale,
} from "lucide-react";

export default function CriminalDatabase() {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [criminals, setCriminals] = useState<CriminalRecord[]>([]);
  const [filteredCriminals, setFilteredCriminals] = useState<CriminalRecord[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCriminal, setSelectedCriminal] =
    useState<CriminalRecord | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [newRecord, setNewRecord] = useState<any>({
    fullName: "",
    dateOfBirth: "",
    nationalId: "",
    address: "",
    phone: "",
    aliases: "",
    heightCm: "",
    weightKg: "",
    eyeColor: "",
    hairColor: "",
    riskLevel: RiskLevel.LOW,
    isActive: true,
    photo: null as File | null,
  });

  const canAccessDatabase = hasAnyRole([
    UserRole.DETECTIVE_OFFICER,
    UserRole.POLICE_HEAD,
    UserRole.SUPER_ADMIN,
  ]);
  const canModifyRecords = hasAnyRole([
    UserRole.DETECTIVE_OFFICER,
    UserRole.POLICE_HEAD,
    UserRole.SUPER_ADMIN,
  ]);

  useEffect(() => {
    if (canAccessDatabase) {
      fetchCriminals();
    }
  }, []);

  useEffect(() => {
    filterCriminals();
  }, [criminals, searchTerm, riskFilter, statusFilter]);

  const fetchCriminals_MOCK = async () => {
    // Mock data - In production, fetch from secure criminal database API
    const mockCriminals: CriminalRecord[] = [
      {
        id: "CR-001",
        personalInfo: {
          fullName: "John Doe",
          aliases: ["Johnny D", "JD"],
          dateOfBirth: new Date("1985-03-15"),
          nationalId: "ETH-123456789",
          address: "Unknown - Last known: Block 8, Apt 15",
          phone: "+251-911-555-0101",
          photo: "/api/photos/criminal-001.jpg",
        },
        physicalDescription: {
          height: 175,
          weight: 80,
          eyeColor: "Brown",
          hairColor: "Black",
          distinguishingMarks: [
            "Scar on left forearm",
            "Tattoo on right shoulder",
          ],
        },
        criminalHistory: {
          convictions: [
            {
              id: "CV-001",
              crimeType: CrimeCategory.THEFT,
              description: "Grand theft auto - stole vehicle from parking lot",
              date: new Date("2023-05-20"),
              sentence: "18 months imprisonment",
              court: "Wolaita Sodo District Court",
              caseNumber: "WSC-2023-456",
            },
            {
              id: "CV-002",
              crimeType: CrimeCategory.BURGLARY,
              description: "Breaking and entering residential property",
              date: new Date("2022-11-10"),
              sentence: "12 months imprisonment, 2 years probation",
              court: "Wolaita Sodo District Court",
              caseNumber: "WSC-2022-789",
            },
          ],
          arrests: [
            {
              id: "AR-001",
              date: new Date("2024-01-10"),
              charges: ["Suspected theft", "Possession of stolen goods"],
              arrestingOfficer: "Detective Sara Alemayehu",
              location: "Downtown Market Area",
              disposition: "Released on bail",
            },
          ],
          warrants: [
            {
              id: "WR-001",
              type: WarrantType.ARREST,
              issueDate: new Date("2023-12-15"),
              issuingCourt: "Wolaita Sodo District Court",
              charges: ["Failure to appear", "Probation violation"],
              status: WarrantStatus.ACTIVE,
            },
          ],
          associates: ["CR-003", "CR-005"],
        },
        riskLevel: RiskLevel.MEDIUM,
        isActive: true,
        lastUpdated: new Date("2024-01-16"),
        updatedBy: "Detective Sara Alemayehu",
      },
      {
        id: "CR-002",
        personalInfo: {
          fullName: "Maria Santos",
          aliases: ["Mary S"],
          dateOfBirth: new Date("1990-07-22"),
          nationalId: "ETH-987654321",
          address: "Residential Block 12, Apt 7B",
          phone: "+251-911-555-0202",
        },
        physicalDescription: {
          height: 165,
          weight: 60,
          eyeColor: "Green",
          hairColor: "Blonde",
          distinguishingMarks: ["Small scar above left eyebrow"],
        },
        criminalHistory: {
          convictions: [
            {
              id: "CV-003",
              crimeType: CrimeCategory.FRAUD,
              description: "Credit card fraud and identity theft",
              date: new Date("2023-08-30"),
              sentence: "2 years imprisonment, 5 years probation",
              court: "Federal Court of Ethiopia",
              caseNumber: "FC-2023-112",
            },
          ],
          arrests: [],
          warrants: [],
          associates: [],
        },
        riskLevel: RiskLevel.LOW,
        isActive: false,
        lastUpdated: new Date("2023-09-01"),
        updatedBy: "Detective Habtamu Desta",
      },
      {
        id: "CR-003",
        personalInfo: {
          fullName: "Ahmed Hassan",
          aliases: ["Big A", "Hassan"],
          dateOfBirth: new Date("1982-12-05"),
          nationalId: "ETH-456789123",
          address: "Unknown - Wanted",
          phone: "Unknown",
        },
        physicalDescription: {
          height: 185,
          weight: 95,
          eyeColor: "Brown",
          hairColor: "Black",
          distinguishingMarks: [
            "Large tattoo across back",
            "Gold tooth (front left)",
          ],
        },
        criminalHistory: {
          convictions: [
            {
              id: "CV-004",
              crimeType: CrimeCategory.ASSAULT,
              description: "Aggravated assault with deadly weapon",
              date: new Date("2021-03-18"),
              sentence: "5 years imprisonment",
              court: "Wolaita Sodo District Court",
              caseNumber: "WSC-2021-234",
            },
          ],
          arrests: [
            {
              id: "AR-002",
              date: new Date("2023-11-20"),
              charges: ["Armed robbery", "Assault"],
              arrestingOfficer: "Officer Mulugeta Kebede",
              location: "North District",
              disposition: "Escaped custody",
            },
          ],
          warrants: [
            {
              id: "WR-002",
              type: WarrantType.ARREST,
              issueDate: new Date("2023-11-21"),
              issuingCourt: "Wolaita Sodo District Court",
              charges: ["Armed robbery", "Assault", "Escape from custody"],
              status: WarrantStatus.ACTIVE,
            },
          ],
          associates: ["CR-001", "CR-004"],
        },
        riskLevel: RiskLevel.HIGH,
        isActive: true,
        lastUpdated: new Date("2023-11-21"),
        updatedBy: "Detective Sara Alemayehu",
      },
    ];

    setCriminals(mockCriminals);
    setIsLoading(false);
  };

  const fetchCriminals = async () => {
    try {
      const res = await api.get("/criminals");
      const data = await res.json();
      if (data.success) {
        const normalized = (data.data.criminals || []).map((c: any) => ({
          ...c,
          personalInfo: {
            ...c.personalInfo,
            dateOfBirth: c.personalInfo?.dateOfBirth
              ? new Date(c.personalInfo.dateOfBirth)
              : null,
          },
        }));
        setCriminals(normalized);
      }
    } catch (e) {
      console.error("Failed to load criminal records", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCriminals = () => {
    let filtered = [...criminals];

    if (searchTerm) {
      filtered = filtered.filter(
        (criminal) =>
          criminal.personalInfo.fullName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          criminal.personalInfo.aliases?.some((alias) =>
            alias.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          criminal.personalInfo.nationalId
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (riskFilter !== "all") {
      filtered = filtered.filter(
        (criminal) => criminal.riskLevel === riskFilter,
      );
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((criminal) => criminal.isActive === isActive);
    }

    setFilteredCriminals(filtered);
  };

  const getRiskBadgeColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.CRITICAL:
        return "bg-red-500 text-white";
      case RiskLevel.HIGH:
        return "bg-crime-red text-white";
      case RiskLevel.MEDIUM:
        return "bg-crime-yellow text-crime-black";
      case RiskLevel.LOW:
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const criminalStats = {
    total: criminals.length,
    active: criminals.filter((c) => c.isActive).length,
    highRisk: criminals.filter(
      (c) =>
        c.riskLevel === RiskLevel.HIGH || c.riskLevel === RiskLevel.CRITICAL,
    ).length,
    activeWarrants: criminals.reduce((count, criminal) => {
      return (
        count +
        criminal.criminalHistory.warrants.filter(
          (w) => w.status === WarrantStatus.ACTIVE,
        ).length
      );
    }, 0),
  };

  if (!canAccessDatabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-crime-red" />
            <h2 className="text-2xl font-bold text-crime-black mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You don't have permission to access the criminal database.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold mb-2">Criminal Database</h1>
              <p className="text-gray-300">
                Secure access to criminal records and investigations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-red-100 text-red-800 px-3 py-1">
                <Shield className="w-4 h-4 mr-1" />
                Classified Access
              </Badge>
              {canModifyRecords && (
                <Button
                  className="bg-crime-red hover:bg-crime-red-dark text-white"
                  onClick={() => setIsAddOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
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
              <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {criminalStats.total}
              </h3>
              <p className="text-gray-600">Total Records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {criminalStats.active}
              </h3>
              <p className="text-gray-600">Active Cases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-crime-red" />
              <h3 className="text-2xl font-bold text-crime-black">
                {criminalStats.highRisk}
              </h3>
              <p className="text-gray-600">High Risk</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Gavel className="w-8 h-8 mx-auto mb-2 text-crime-yellow" />
              <h3 className="text-2xl font-bold text-crime-black">
                {criminalStats.activeWarrants}
              </h3>
              <p className="text-gray-600">Active Warrants</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search Criminal Records
            </CardTitle>
            <CardDescription>
              Search by name, alias, or national ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search criminals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value={RiskLevel.CRITICAL}>Critical</SelectItem>
                  <SelectItem value={RiskLevel.HIGH}>High</SelectItem>
                  <SelectItem value={RiskLevel.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={RiskLevel.LOW}>Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Criminal Records List */}
        <Card>
          <CardHeader>
            <CardTitle>Criminal Records</CardTitle>
            <CardDescription>
              {filteredCriminals.length} record(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCriminals.map((criminal) => (
                <div
                  key={criminal.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 flex-1">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {criminal.personalInfo.photo ? (
                          <img
                            src={criminal.personalInfo.photo}
                            alt="Criminal photo"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-crime-black">
                            {criminal.personalInfo.fullName}
                          </h3>
                          <Badge
                            className={getRiskBadgeColor(criminal.riskLevel)}
                          >
                            {criminal.riskLevel.toUpperCase()} RISK
                          </Badge>
                          <Badge
                            className={
                              criminal.isActive
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {criminal.isActive ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                          {criminal.criminalHistory.warrants.some(
                            (w) => w.status === WarrantStatus.ACTIVE,
                          ) && (
                            <Badge className="bg-crime-red text-white">
                              <Gavel className="w-3 h-3 mr-1" />
                              WARRANT
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Age:</span>
                            <div>
                              {criminal.personalInfo.dateOfBirth
                                ? calculateAge(
                                    criminal.personalInfo.dateOfBirth,
                                  )
                                : "Unknown"}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">National ID:</span>
                            <div>
                              {criminal.personalInfo.nationalId || "Unknown"}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Convictions:</span>
                            <div>
                              {criminal.criminalHistory.convictions.length}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Last Updated:</span>
                            <div>
                              {new Date(
                                criminal.lastUpdated,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {criminal.personalInfo.aliases &&
                          criminal.personalInfo.aliases.length > 0 && (
                            <div className="mb-3">
                              <span className="text-sm font-medium text-gray-700">
                                Known Aliases:{" "}
                              </span>
                              {criminal.personalInfo.aliases.map(
                                (alias, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="mr-1 text-xs"
                                  >
                                    {alias}
                                  </Badge>
                                ),
                              )}
                            </div>
                          )}

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {criminal.personalInfo.address && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {criminal.personalInfo.address}
                            </div>
                          )}
                          {criminal.personalInfo.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {criminal.personalInfo.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const res = await api.get(
                              `/criminals/${criminal.id}`,
                            );
                            const data = await res.json();
                            if (data.success) {
                              setSelectedCriminal({
                                ...data.data,
                                personalInfo: {
                                  ...data.data.personalInfo,
                                  dateOfBirth: data.data.personalInfo
                                    ?.dateOfBirth
                                    ? new Date(
                                        data.data.personalInfo.dateOfBirth,
                                      )
                                    : null,
                                },
                              });
                              setIsDetailsDialogOpen(true);
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>

                      {canModifyRecords && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(criminal.id);
                            setEditRecord({
                              fullName: criminal.personalInfo.fullName || "",
                              dateOfBirth: criminal.personalInfo.dateOfBirth
                                ? new Date(criminal.personalInfo.dateOfBirth)
                                    .toISOString()
                                    .slice(0, 10)
                                : "",
                              nationalId:
                                criminal.personalInfo.nationalId || "",
                              address: criminal.personalInfo.address || "",
                              phone: criminal.personalInfo.phone || "",
                              aliases: (
                                criminal.personalInfo.aliases || []
                              ).join(", "),
                              heightCm:
                                criminal.physicalDescription.height || "",
                              weightKg:
                                criminal.physicalDescription.weight || "",
                              eyeColor:
                                criminal.physicalDescription.eyeColor || "",
                              hairColor:
                                criminal.physicalDescription.hairColor || "",
                              riskLevel: criminal.riskLevel,
                              isActive: criminal.isActive,
                            });
                            setIsEditOpen(true);
                          }}
                        >
                          <Fingerprint className="w-4 h-4 mr-1" />
                          Update
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredCriminals.length === 0 && (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No records found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Criminal Details Dialog */}
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Criminal Record Details
              </DialogTitle>
              <DialogDescription>
                Detailed information and criminal history
              </DialogDescription>
            </DialogHeader>

            {selectedCriminal && (
              <Tabs defaultValue="personal" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="convictions">Convictions</TabsTrigger>
                  <TabsTrigger value="arrests">Arrests</TabsTrigger>
                  <TabsTrigger value="warrants">Warrants</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedCriminal.personalInfo.photo && (
                          <div className="mb-3">
                            <img
                              src={selectedCriminal.personalInfo.photo}
                              alt="Criminal"
                              className="w-40 h-40 object-cover rounded"
                            />
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Full Name:</span>
                          <div>{selectedCriminal.personalInfo.fullName}</div>
                        </div>
                        <div>
                          <span className="font-medium">Date of Birth:</span>
                          <div>
                            {selectedCriminal.personalInfo.dateOfBirth?.toLocaleDateString() ||
                              "Unknown"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">National ID:</span>
                          <div>
                            {selectedCriminal.personalInfo.nationalId ||
                              "Unknown"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Address:</span>
                          <div>
                            {selectedCriminal.personalInfo.address || "Unknown"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span>
                          <div>
                            {selectedCriminal.personalInfo.phone || "Unknown"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Risk Level:</span>
                          <div>
                            <Badge
                              className={getRiskBadgeColor(
                                selectedCriminal.riskLevel,
                              )}
                            >
                              {selectedCriminal.riskLevel.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Physical Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="font-medium">Height:</span>
                          <div>
                            {selectedCriminal.physicalDescription.height
                              ? `${selectedCriminal.physicalDescription.height} cm`
                              : "Unknown"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Weight:</span>
                          <div>
                            {selectedCriminal.physicalDescription.weight
                              ? `${selectedCriminal.physicalDescription.weight} kg`
                              : "Unknown"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Eye Color:</span>
                          <div>
                            {selectedCriminal.physicalDescription.eyeColor ||
                              "Unknown"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Hair Color:</span>
                          <div>
                            {selectedCriminal.physicalDescription.hairColor ||
                              "Unknown"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">
                            Distinguishing Marks:
                          </span>
                          <div>
                            {selectedCriminal.physicalDescription.distinguishingMarks?.map(
                              (mark, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="mr-1 mb-1 text-xs"
                                >
                                  {mark}
                                </Badge>
                              ),
                            ) || "None recorded"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="convictions" className="space-y-4">
                  <div className="space-y-4">
                    {selectedCriminal.criminalHistory.convictions.map(
                      (conviction) => (
                        <Card key={conviction.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-crime-black">
                                {conviction.description}
                              </h4>
                              <Badge className="bg-crime-red text-white">
                                {conviction.crimeType
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Date:</span>
                                <div>
                                  {conviction.date.toLocaleDateString()}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Sentence:</span>
                                <div>{conviction.sentence}</div>
                              </div>
                              <div>
                                <span className="font-medium">Court:</span>
                                <div>{conviction.court}</div>
                              </div>
                            </div>
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Case Number:</span>{" "}
                              {conviction.caseNumber}
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )}
                    {selectedCriminal.criminalHistory.convictions.length ===
                      0 && (
                      <div className="text-center py-8 text-gray-500">
                        No convictions on record
                      </div>
                    )}

                    {canModifyRecords && (
                      <div className="border-t pt-4 space-y-2">
                        <div className="font-semibold">Add Conviction</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            placeholder="Crime Type"
                            onChange={(e: any) =>
                              ((window as any)._cvType = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Date"
                            type="date"
                            onChange={(e: any) =>
                              ((window as any)._cvDate = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Court"
                            onChange={(e: any) =>
                              ((window as any)._cvCourt = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Case Number"
                            onChange={(e: any) =>
                              ((window as any)._cvCase = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Sentence"
                            onChange={(e: any) =>
                              ((window as any)._cvSentence = e.target.value)
                            }
                            className="md:col-span-2"
                          />
                          <Input
                            placeholder="Description"
                            onChange={(e: any) =>
                              ((window as any)._cvDesc = e.target.value)
                            }
                            className="md:col-span-3"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (!selectedCriminal) return;
                              const payload: any = {
                                crimeType: (window as any)._cvType || undefined,
                                date: (window as any)._cvDate || undefined,
                                court: (window as any)._cvCourt || undefined,
                                caseNumber:
                                  (window as any)._cvCase || undefined,
                                sentence:
                                  (window as any)._cvSentence || undefined,
                                description:
                                  (window as any)._cvDesc || undefined,
                              };
                              const res = await api.post(
                                `/criminals/${selectedCriminal.id}/convictions`,
                                payload,
                              );
                              if (res.ok) {
                                const d = await (
                                  await api.get(
                                    `/criminals/${selectedCriminal.id}`,
                                  )
                                ).json();
                                if (d.success) setSelectedCriminal(d.data);
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="arrests" className="space-y-4">
                  <div className="space-y-4">
                    {selectedCriminal.criminalHistory.arrests.map((arrest) => (
                      <Card key={arrest.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-crime-black">
                              Arrest - {arrest.date.toLocaleDateString()}
                            </h4>
                            <Badge variant="outline">
                              {arrest.disposition}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">
                                Arresting Officer:
                              </span>
                              <div>{arrest.arrestingOfficer}</div>
                            </div>
                            <div>
                              <span className="font-medium">Location:</span>
                              <div>{arrest.location}</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="font-medium">Charges:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {arrest.charges.map((charge, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {charge}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {selectedCriminal.criminalHistory.arrests.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No arrest records found
                      </div>
                    )}

                    {canModifyRecords && (
                      <div className="border-t pt-4 space-y-2">
                        <div className="font-semibold">Add Arrest</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            placeholder="Date"
                            type="date"
                            onChange={(e: any) =>
                              ((window as any)._arDate = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Disposition"
                            onChange={(e: any) =>
                              ((window as any)._arDisp = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Arresting Officer"
                            onChange={(e: any) =>
                              ((window as any)._arOfficer = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Location"
                            onChange={(e: any) =>
                              ((window as any)._arLoc = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Charges (comma separated)"
                            onChange={(e: any) =>
                              ((window as any)._arCharges = e.target.value)
                            }
                            className="md:col-span-2"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (!selectedCriminal) return;
                              const charges = ((window as any)._arCharges || "")
                                .split(",")
                                .map((s: string) => s.trim())
                                .filter(Boolean);
                              const payload: any = {
                                date: (window as any)._arDate || undefined,
                                disposition:
                                  (window as any)._arDisp || undefined,
                                arrestingOfficer:
                                  (window as any)._arOfficer || undefined,
                                location: (window as any)._arLoc || undefined,
                                charges,
                              };
                              const res = await api.post(
                                `/criminals/${selectedCriminal.id}/arrests`,
                                payload,
                              );
                              if (res.ok) {
                                const d = await (
                                  await api.get(
                                    `/criminals/${selectedCriminal.id}`,
                                  )
                                ).json();
                                if (d.success) setSelectedCriminal(d.data);
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="warrants" className="space-y-4">
                  <div className="space-y-4">
                    {selectedCriminal.criminalHistory.warrants.map(
                      (warrant) => (
                        <Card key={warrant.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-crime-black">
                                {warrant.type.replace("_", " ").toUpperCase()}{" "}
                                Warrant
                              </h4>
                              <Badge
                                className={
                                  warrant.status === WarrantStatus.ACTIVE
                                    ? "bg-red-100 text-red-800"
                                    : warrant.status === WarrantStatus.EXECUTED
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                }
                              >
                                {warrant.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Issue Date:</span>
                                <div>
                                  {warrant.issueDate.toLocaleDateString()}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">
                                  Issuing Court:
                                </span>
                                <div>{warrant.issuingCourt}</div>
                              </div>
                            </div>
                            {warrant.expiryDate && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">
                                  Expiry Date:
                                </span>{" "}
                                {warrant.expiryDate.toLocaleDateString()}
                              </div>
                            )}
                            <div className="mt-3">
                              <span className="font-medium">Charges:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {warrant.charges.map((charge, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {charge}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )}
                    {selectedCriminal.criminalHistory.warrants.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No active warrants
                      </div>
                    )}

                    {canModifyRecords && (
                      <div className="border-t pt-4 space-y-2">
                        <div className="font-semibold">Add Warrant</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            placeholder="Type (arrest/search)"
                            onChange={(e: any) =>
                              ((window as any)._waType = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Status (active/executed)"
                            onChange={(e: any) =>
                              ((window as any)._waStatus = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Issuing Court"
                            onChange={(e: any) =>
                              ((window as any)._waCourt = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Issue Date"
                            type="date"
                            onChange={(e: any) =>
                              ((window as any)._waIssue = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Expiry Date"
                            type="date"
                            onChange={(e: any) =>
                              ((window as any)._waExpiry = e.target.value)
                            }
                          />
                          <Input
                            placeholder="Charges (comma separated)"
                            onChange={(e: any) =>
                              ((window as any)._waCharges = e.target.value)
                            }
                            className="md:col-span-2"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (!selectedCriminal) return;
                              const charges = ((window as any)._waCharges || "")
                                .split(",")
                                .map((s: string) => s.trim())
                                .filter(Boolean);
                              const payload: any = {
                                type: (window as any)._waType || undefined,
                                status: (window as any)._waStatus || undefined,
                                issuingCourt:
                                  (window as any)._waCourt || undefined,
                                issueDate:
                                  (window as any)._waIssue || undefined,
                                expiryDate:
                                  (window as any)._waExpiry || undefined,
                                charges,
                              };
                              const res = await api.post(
                                `/criminals/${selectedCriminal.id}/warrants`,
                                payload,
                              );
                              if (res.ok) {
                                const d = await (
                                  await api.get(
                                    `/criminals/${selectedCriminal.id}`,
                                  )
                                ).json();
                                if (d.success) setSelectedCriminal(d.data);
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {canModifyRecords && (
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Criminal Record</DialogTitle>
              <DialogDescription>
                Admins can upload a photo. Supported: .jpg, .jpeg, .png, .gif,
                .webp
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm">Full Name</label>
                <Input
                  value={newRecord.fullName}
                  onChange={(e) =>
                    setNewRecord((r) => ({ ...r, fullName: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm">Date of Birth</label>
                <Input
                  type="date"
                  value={newRecord.dateOfBirth}
                  onChange={(e) =>
                    setNewRecord((r) => ({ ...r, dateOfBirth: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm">National ID</label>
                <Input
                  value={newRecord.nationalId}
                  onChange={(e) =>
                    setNewRecord((r) => ({ ...r, nationalId: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm">Address</label>
                <Input
                  value={newRecord.address}
                  onChange={(e) =>
                    setNewRecord((r) => ({ ...r, address: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm">Phone</label>
                <Input
                  value={newRecord.phone}
                  onChange={(e) =>
                    setNewRecord((r) => ({ ...r, phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm">Risk Level</label>
                <Select
                  value={newRecord.riskLevel}
                  onValueChange={(v) =>
                    setNewRecord((r) => ({ ...r, riskLevel: v as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RiskLevel.LOW}>Low</SelectItem>
                    <SelectItem value={RiskLevel.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={RiskLevel.HIGH}>High</SelectItem>
                    <SelectItem value={RiskLevel.CRITICAL}>Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Status</label>
                <Select
                  value={newRecord.isActive ? "active" : "inactive"}
                  onValueChange={(v) =>
                    setNewRecord((r) => ({ ...r, isActive: v === "active" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Aliases (comma separated)</label>
                <Input
                  value={newRecord.aliases}
                  onChange={(e) =>
                    setNewRecord((r) => ({ ...r, aliases: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm">Height (cm)</label>
                <Input
                  type="number"
                  value={newRecord.heightCm}
                  onChange={(e) =>
                    setNewRecord((r) => ({ ...r, heightCm: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm">Weight (kg)</label>
                <Input
                  type="number"
                  value={newRecord.weightKg}
                  onChange={(e) =>
                    setNewRecord((r) => ({ ...r, weightKg: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm">Eye Color</label>
                <Input
                  value={newRecord.eyeColor}
                  onChange={(e) =>
                    setNewRecord((r) => ({ ...r, eyeColor: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm">Hair Color</label>
                <Input
                  value={newRecord.hairColor}
                  onChange={(e) =>
                    setNewRecord((r) => ({ ...r, hairColor: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewRecord((r) => ({
                      ...r,
                      photo: e.target.files?.[0] || null,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const fd = new FormData();
                    fd.append("fullName", newRecord.fullName);
                    if (newRecord.dateOfBirth)
                      fd.append("dateOfBirth", newRecord.dateOfBirth);
                    if (newRecord.nationalId)
                      fd.append("nationalId", newRecord.nationalId);
                    if (newRecord.address)
                      fd.append("address", newRecord.address);
                    if (newRecord.phone) fd.append("phone", newRecord.phone);
                    if (newRecord.aliases)
                      fd.append("aliases", newRecord.aliases);
                    if (newRecord.heightCm)
                      fd.append("heightCm", String(newRecord.heightCm));
                    if (newRecord.weightKg)
                      fd.append("weightKg", String(newRecord.weightKg));
                    if (newRecord.eyeColor)
                      fd.append("eyeColor", newRecord.eyeColor);
                    if (newRecord.hairColor)
                      fd.append("hairColor", newRecord.hairColor);
                    fd.append("riskLevel", newRecord.riskLevel as any);
                    fd.append("isActive", String(newRecord.isActive));
                    if (newRecord.photo) fd.append("photo", newRecord.photo);
                    const res = await api.post("/criminals", fd);
                    if (res.ok) {
                      setIsAddOpen(false);
                      setNewRecord({
                        fullName: "",
                        dateOfBirth: "",
                        nationalId: "",
                        address: "",
                        phone: "",
                        riskLevel: RiskLevel.LOW,
                        isActive: true,
                        photo: null,
                      });
                      await fetchCriminals();
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {canModifyRecords && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Criminal Record</DialogTitle>
              <DialogDescription>
                Update personal info and physical description
              </DialogDescription>
            </DialogHeader>
            {editRecord && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm">Full Name</label>
                  <Input
                    value={editRecord.fullName}
                    onChange={(e) =>
                      setEditRecord((r: any) => ({
                        ...r,
                        fullName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Date of Birth</label>
                  <Input
                    type="date"
                    value={editRecord.dateOfBirth}
                    onChange={(e) =>
                      setEditRecord((r: any) => ({
                        ...r,
                        dateOfBirth: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">National ID</label>
                  <Input
                    value={editRecord.nationalId}
                    onChange={(e) =>
                      setEditRecord((r: any) => ({
                        ...r,
                        nationalId: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm">Address</label>
                  <Input
                    value={editRecord.address}
                    onChange={(e) =>
                      setEditRecord((r: any) => ({
                        ...r,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Phone</label>
                  <Input
                    value={editRecord.phone}
                    onChange={(e) =>
                      setEditRecord((r: any) => ({
                        ...r,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Aliases (comma separated)</label>
                  <Input
                    value={editRecord.aliases}
                    onChange={(e) =>
                      setEditRecord((r: any) => ({
                        ...r,
                        aliases: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Height (cm)</label>
                  <Input
                    type="number"
                    value={editRecord.heightCm}
                    onChange={(e) =>
                      setEditRecord((r: any) => ({
                        ...r,
                        heightCm: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Weight (kg)</label>
                  <Input
                    type="number"
                    value={editRecord.weightKg}
                    onChange={(e) =>
                      setEditRecord((r: any) => ({
                        ...r,
                        weightKg: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Eye Color</label>
                  <Input
                    value={editRecord.eyeColor}
                    onChange={(e) =>
                      setEditRecord((r: any) => ({
                        ...r,
                        eyeColor: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Hair Color</label>
                  <Input
                    value={editRecord.hairColor}
                    onChange={(e) =>
                      setEditRecord((r: any) => ({
                        ...r,
                        hairColor: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Risk Level</label>
                  <Select
                    value={editRecord.riskLevel}
                    onValueChange={(v) =>
                      setEditRecord((r: any) => ({ ...r, riskLevel: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={RiskLevel.LOW}>Low</SelectItem>
                      <SelectItem value={RiskLevel.MEDIUM}>Medium</SelectItem>
                      <SelectItem value={RiskLevel.HIGH}>High</SelectItem>
                      <SelectItem value={RiskLevel.CRITICAL}>
                        Critical
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm">Status</label>
                  <Select
                    value={editRecord.isActive ? "active" : "inactive"}
                    onValueChange={(v) =>
                      setEditRecord((r: any) => ({
                        ...r,
                        isActive: v === "active",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (!editingId || !editRecord) return;
                    const payload: any = {
                      fullName: editRecord.fullName,
                      dateOfBirth: editRecord.dateOfBirth || null,
                      nationalId: editRecord.nationalId || null,
                      address: editRecord.address || null,
                      phone: editRecord.phone || null,
                      aliases: editRecord.aliases,
                      heightCm: editRecord.heightCm
                        ? Number(editRecord.heightCm)
                        : null,
                      weightKg: editRecord.weightKg
                        ? Number(editRecord.weightKg)
                        : null,
                      eyeColor: editRecord.eyeColor || null,
                      hairColor: editRecord.hairColor || null,
                      riskLevel: editRecord.riskLevel,
                      isActive: !!editRecord.isActive,
                    };
                    const res = await api.put(
                      `/criminals/${editingId}`,
                      payload,
                    );
                    if (res.ok) {
                      setIsEditOpen(false);
                      setEditingId(null);
                      setEditRecord(null);
                      await fetchCriminals();
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
