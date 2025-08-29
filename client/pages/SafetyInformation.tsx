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
import {
  Shield,
  Phone,
  Search,
  Filter,
  Download,
  Eye,
  ExternalLink,
  Home,
  Car,
  Smartphone,
  Globe,
  Users,
  AlertTriangle,
  Heart,
  MapPin,
  Clock,
  FileText,
  Video,
  Link,
  Star,
  Calendar,
  User,
  Info,
  Bookmark,
  Share,
  TrendingUp,
  CheckCircle,
  BookOpen,
  HeadphonesIcon,
  Monitor,
} from "lucide-react";
import {
  SafetyInformation,
  SafetyCategory,
  Priority,
  ResourceType,
  SafetyResource,
  EmergencyContact,
  EmergencyType,
} from "../../shared/types";

// Mock data for demonstration
const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: "1",
    name: "Emergency Services (Police, Fire, Medical)",
    type: EmergencyType.POLICE,
    phoneNumber: "911",
    description:
      "Call for immediate emergency assistance requiring police, fire, or medical response",
    isActive: true,
    priority: 1,
    availableHours: "24/7",
    location: "Nationwide",
  },
  {
    id: "2",
    name: "Police Non-Emergency",
    type: EmergencyType.POLICE,
    phoneNumber: "(555) 123-4567",
    description:
      "For non-urgent police matters, reports, and general inquiries",
    isActive: true,
    priority: 2,
    availableHours: "24/7",
  },
  {
    id: "3",
    name: "Fire Department Non-Emergency",
    type: EmergencyType.FIRE,
    phoneNumber: "(555) 123-4568",
    description: "For non-urgent fire department inquiries and inspections",
    isActive: true,
    priority: 3,
    availableHours: "Mon-Fri 8AM-5PM",
  },
  {
    id: "4",
    name: "Poison Control Center",
    type: EmergencyType.POISON_CONTROL,
    phoneNumber: "1-800-222-1222",
    description: "For poison emergencies and information",
    isActive: true,
    priority: 4,
    availableHours: "24/7",
    location: "National",
  },
  {
    id: "5",
    name: "Crisis Mental Health Hotline",
    type: EmergencyType.MENTAL_HEALTH,
    phoneNumber: "1-800-273-8255",
    description: "For mental health crisis support and suicide prevention",
    isActive: true,
    priority: 5,
    availableHours: "24/7",
    location: "National",
  },
  {
    id: "6",
    name: "Domestic Violence Hotline",
    type: EmergencyType.DOMESTIC_VIOLENCE,
    phoneNumber: "1-800-799-7233",
    description: "Confidential support for domestic violence survivors",
    isActive: true,
    priority: 6,
    availableHours: "24/7",
    location: "National",
  },
];

const mockSafetyInfo: SafetyInformation[] = [
  {
    id: "1",
    title: "Home Security Basics",
    category: SafetyCategory.HOME_SECURITY,
    content:
      "Protect your home and family with these essential security measures. A secure home starts with good habits and basic security equipment.",
    tips: [
      "Always lock doors and windows when leaving home",
      "Install deadbolt locks on all exterior doors",
      "Use motion-sensor lights around your property",
      "Keep valuables out of sight from windows",
      "Consider a security system or cameras",
      "Get to know your neighbors",
      "Trim bushes and trees that could hide intruders",
      "Never leave spare keys in obvious hiding places",
    ],
    resources: [
      {
        title: "Home Security Checklist PDF",
        type: ResourceType.PDF,
        downloadUrl: "/resources/home-security-checklist.pdf",
        description: "Comprehensive checklist for securing your home",
      },
      {
        title: "Security System Buyer's Guide",
        type: ResourceType.ARTICLE,
        url: "https://example.com/security-guide",
        description: "How to choose the right security system for your home",
      },
    ],
    isPublished: true,
    publishedAt: new Date("2024-01-01"),
    lastUpdated: new Date("2024-01-15"),
    updatedBy: "Safety Team",
    priority: Priority.HIGH,
    tags: ["home", "security", "prevention", "safety"],
  },
  {
    id: "2",
    title: "Personal Safety While Walking",
    category: SafetyCategory.PERSONAL_SAFETY,
    content:
      "Stay safe while walking, jogging, or traveling on foot in your community.",
    tips: [
      "Stay alert and aware of your surroundings",
      "Walk confidently and purposefully",
      "Avoid walking alone at night when possible",
      "Stick to well-lit, populated areas",
      "Trust your instincts if something feels wrong",
      "Keep your phone charged and accessible",
      "Don't wear headphones or talk on phone in isolated areas",
      "Carry a whistle or personal alarm",
      "Let someone know your route and expected arrival time",
    ],
    resources: [
      {
        title: "Personal Safety App",
        type: ResourceType.APP,
        url: "https://example.com/safety-app",
        description: "Download our free personal safety app with GPS tracking",
      },
      {
        title: "Self-Defense Class Schedule",
        type: ResourceType.WEBSITE,
        url: "https://example.com/self-defense",
        description: "Local self-defense classes and workshops",
      },
    ],
    isPublished: true,
    publishedAt: new Date("2024-01-05"),
    lastUpdated: new Date("2024-01-10"),
    updatedBy: "Safety Team",
    priority: Priority.HIGH,
    tags: ["personal", "walking", "safety", "awareness"],
  },
  {
    id: "3",
    title: "Cyber Security for Everyone",
    category: SafetyCategory.CYBER_SECURITY,
    content: "Protect yourself from online threats, scams, and identity theft.",
    tips: [
      "Use strong, unique passwords for each account",
      "Enable two-factor authentication when available",
      "Be cautious of suspicious emails and links",
      "Keep software and apps updated",
      "Use secure Wi-Fi networks",
      "Regularly monitor bank and credit card statements",
      "Be careful what you share on social media",
      "Use reputable antivirus software",
      "Back up important data regularly",
    ],
    resources: [
      {
        title: "Password Manager Guide",
        type: ResourceType.VIDEO,
        url: "https://example.com/password-video",
        description: "Learn how to use password managers effectively",
      },
      {
        title: "Phishing Scam Examples",
        type: ResourceType.PDF,
        downloadUrl: "/resources/phishing-examples.pdf",
        description: "Real examples of phishing attempts to watch out for",
      },
    ],
    isPublished: true,
    publishedAt: new Date("2024-01-08"),
    lastUpdated: new Date("2024-01-12"),
    updatedBy: "Cyber Crimes Unit",
    priority: Priority.MEDIUM,
    tags: ["cyber", "internet", "scams", "identity"],
  },
  {
    id: "4",
    title: "Traffic Safety Guidelines",
    category: SafetyCategory.TRAFFIC_SAFETY,
    content:
      "Stay safe on the roads as a driver, passenger, cyclist, or pedestrian.",
    tips: [
      "Always wear your seatbelt",
      "Never drive under the influence",
      "Avoid distracted driving (texting, eating, etc.)",
      "Follow speed limits and traffic signs",
      "Use turn signals and check blind spots",
      "Maintain safe following distance",
      "Be extra cautious in bad weather",
      "Wear helmets when cycling or motorcycling",
      "Make yourself visible to drivers when walking",
    ],
    resources: [
      {
        title: "Defensive Driving Course",
        type: ResourceType.WEBSITE,
        url: "https://example.com/defensive-driving",
        description: "Enroll in our certified defensive driving course",
      },
      {
        title: "Traffic Laws Handbook",
        type: ResourceType.PDF,
        downloadUrl: "/resources/traffic-laws.pdf",
        description: "Complete guide to local traffic laws and regulations",
      },
    ],
    isPublished: true,
    publishedAt: new Date("2024-01-12"),
    lastUpdated: new Date("2024-01-12"),
    updatedBy: "Traffic Division",
    priority: Priority.HIGH,
    tags: ["traffic", "driving", "safety", "roads"],
  },
  {
    id: "5",
    title: "Emergency Preparedness",
    category: SafetyCategory.EMERGENCY_PREPAREDNESS,
    content:
      "Be prepared for natural disasters and emergencies with proper planning.",
    tips: [
      "Create an emergency plan with your family",
      "Build an emergency kit with supplies for 72 hours",
      "Know evacuation routes in your area",
      "Keep important documents in a waterproof container",
      "Have a battery-powered or hand-crank radio",
      "Store extra water (1 gallon per person per day)",
      "Include medications in your emergency kit",
      "Identify safe rooms in your home",
      "Practice your emergency plan regularly",
    ],
    resources: [
      {
        title: "Emergency Kit Checklist",
        type: ResourceType.PDF,
        downloadUrl: "/resources/emergency-kit.pdf",
        description: "Complete list of items for your emergency kit",
      },
      {
        title: "Local Emergency Alerts",
        type: ResourceType.WEBSITE,
        url: "https://example.com/alerts",
        description: "Sign up for local emergency alerts and notifications",
      },
    ],
    isPublished: true,
    publishedAt: new Date("2024-01-15"),
    lastUpdated: new Date("2024-01-15"),
    updatedBy: "Emergency Management",
    priority: Priority.CRITICAL,
    tags: ["emergency", "preparedness", "disaster", "planning"],
  },
];

export default function SafetyInformation() {
  const { user } = useAuth();
  const [safetyInfo, setSafetyInfo] =
    useState<SafetyInformation[]>(mockSafetyInfo);
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >(mockEmergencyContacts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedInfo, setSelectedInfo] = useState<SafetyInformation | null>(
    null,
  );
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);

  const filteredSafetyInfo = safetyInfo.filter((info) => {
    const matchesSearch =
      info.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesCategory =
      filterCategory === "all" || info.category === filterCategory;

    return matchesSearch && matchesCategory && info.isPublished;
  });

  const getCategoryIcon = (category: SafetyCategory) => {
    const icons = {
      [SafetyCategory.CRIME_PREVENTION]: <Shield className="h-5 w-5" />,
      [SafetyCategory.HOME_SECURITY]: <Home className="h-5 w-5" />,
      [SafetyCategory.PERSONAL_SAFETY]: <User className="h-5 w-5" />,
      [SafetyCategory.CYBER_SECURITY]: <Smartphone className="h-5 w-5" />,
      [SafetyCategory.TRAFFIC_SAFETY]: <Car className="h-5 w-5" />,
      [SafetyCategory.EMERGENCY_PREPAREDNESS]: (
        <AlertTriangle className="h-5 w-5" />
      ),
      [SafetyCategory.COMMUNITY_PROGRAMS]: <Users className="h-5 w-5" />,
      [SafetyCategory.AWARENESS_CAMPAIGNS]: <TrendingUp className="h-5 w-5" />,
    };

    return icons[category] || <FileText className="h-5 w-5" />;
  };

  const getCategoryColor = (category: SafetyCategory) => {
    const colors = {
      [SafetyCategory.CRIME_PREVENTION]:
        "bg-red-50 border-red-200 text-red-700",
      [SafetyCategory.HOME_SECURITY]:
        "bg-blue-50 border-blue-200 text-blue-700",
      [SafetyCategory.PERSONAL_SAFETY]:
        "bg-green-50 border-green-200 text-green-700",
      [SafetyCategory.CYBER_SECURITY]:
        "bg-purple-50 border-purple-200 text-purple-700",
      [SafetyCategory.TRAFFIC_SAFETY]:
        "bg-orange-50 border-orange-200 text-orange-700",
      [SafetyCategory.EMERGENCY_PREPAREDNESS]:
        "bg-yellow-50 border-yellow-200 text-yellow-700",
      [SafetyCategory.COMMUNITY_PROGRAMS]:
        "bg-indigo-50 border-indigo-200 text-indigo-700",
      [SafetyCategory.AWARENESS_CAMPAIGNS]:
        "bg-pink-50 border-pink-200 text-pink-700",
    };

    return colors[category] || "bg-gray-50 border-gray-200 text-gray-700";
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

  const getResourceIcon = (type: ResourceType) => {
    const icons = {
      [ResourceType.ARTICLE]: <FileText className="h-4 w-4" />,
      [ResourceType.VIDEO]: <Video className="h-4 w-4" />,
      [ResourceType.PDF]: <Download className="h-4 w-4" />,
      [ResourceType.WEBSITE]: <Globe className="h-4 w-4" />,
      [ResourceType.HOTLINE]: <Phone className="h-4 w-4" />,
      [ResourceType.APP]: <Smartphone className="h-4 w-4" />,
    };

    return icons[type] || <Link className="h-4 w-4" />;
  };

  const getEmergencyTypeIcon = (type: EmergencyType) => {
    const icons = {
      [EmergencyType.POLICE]: <Shield className="h-6 w-6 text-blue-600" />,
      [EmergencyType.FIRE]: <AlertTriangle className="h-6 w-6 text-red-600" />,
      [EmergencyType.MEDICAL]: <Heart className="h-6 w-6 text-red-600" />,
      [EmergencyType.AMBULANCE]: <Heart className="h-6 w-6 text-red-600" />,
      [EmergencyType.DISASTER_RESPONSE]: (
        <AlertTriangle className="h-6 w-6 text-orange-600" />
      ),
      [EmergencyType.POISON_CONTROL]: (
        <AlertTriangle className="h-6 w-6 text-purple-600" />
      ),
      [EmergencyType.MENTAL_HEALTH]: (
        <Heart className="h-6 w-6 text-green-600" />
      ),
      [EmergencyType.DOMESTIC_VIOLENCE]: (
        <Shield className="h-6 w-6 text-purple-600" />
      ),
    };

    return icons[type] || <Phone className="h-6 w-6 text-gray-600" />;
  };

  const toggleBookmark = (infoId: string) => {
    setBookmarkedItems((prev) =>
      prev.includes(infoId)
        ? prev.filter((id) => id !== infoId)
        : [...prev, infoId],
    );
  };

  const handleResourceClick = (resource: SafetyResource) => {
    if (resource.downloadUrl) {
      // Simulate file download
      const link = document.createElement("a");
      link.href = resource.downloadUrl;
      link.download = resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (resource.url) {
      window.open(resource.url, "_blank");
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
                <Shield className="h-8 w-8 text-red-600" />
                Safety Information
              </h1>
              <p className="text-gray-600 mt-2">
                Public safety resources, tips, and emergency contacts
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="safety-tips" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="safety-tips">
              Safety Tips & Resources
            </TabsTrigger>
            <TabsTrigger value="emergency-contacts">
              Emergency Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="safety-tips" className="space-y-6">
            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search safety information..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Select
                      value={filterCategory}
                      onValueChange={setFilterCategory}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.values(SafetyCategory).map((category) => (
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

            {/* Safety Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSafetyInfo.map((info) => (
                <Card
                  key={info.id}
                  className={`hover:shadow-lg transition-shadow ${getCategoryColor(info.category)} border-l-4`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(info.category)}
                        <span className="text-sm font-medium">
                          {info.category.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(info.priority)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(info.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Bookmark
                            className={`h-4 w-4 ${
                              bookmarkedItems.includes(info.id)
                                ? "fill-current text-yellow-500"
                                : "text-gray-400"
                            }`}
                          />
                        </Button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {info.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {info.content}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Quick Tips:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {info.tips.slice(0, 3).map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">{tip}</span>
                            </li>
                          ))}
                          {info.tips.length > 3 && (
                            <li className="text-blue-600 text-sm">
                              +{info.tips.length - 3} more tips...
                            </li>
                          )}
                        </ul>
                      </div>

                      {info.resources.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Resources:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {info.resources
                              .slice(0, 2)
                              .map((resource, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {getResourceIcon(resource.type)}
                                  <span className="ml-1">{resource.type}</span>
                                </Badge>
                              ))}
                            {info.resources.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{info.resources.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{info.lastUpdated.toLocaleDateString()}</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getCategoryIcon(info.category)}
                              {info.title}
                            </DialogTitle>
                            <DialogDescription>
                              {info.category.replace("_", " ").toUpperCase()} •
                              Updated {info.lastUpdated.toLocaleDateString()}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {getPriorityBadge(info.priority)}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {info.tags.map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold text-lg mb-2">
                                Overview
                              </h3>
                              <p className="text-gray-700">{info.content}</p>
                            </div>

                            <div>
                              <h3 className="font-semibold text-lg mb-3">
                                Safety Tips
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {info.tips.map((tip, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2 p-2 bg-green-50 rounded"
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-green-800">
                                      {tip}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {info.resources.length > 0 && (
                              <div>
                                <h3 className="font-semibold text-lg mb-3">
                                  Additional Resources
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {info.resources.map((resource, index) => (
                                    <Card
                                      key={index}
                                      className="hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                      <CardContent
                                        className="p-4"
                                        onClick={() =>
                                          handleResourceClick(resource)
                                        }
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            {getResourceIcon(resource.type)}
                                          </div>
                                          <div className="flex-1">
                                            <h4 className="font-medium text-sm mb-1">
                                              {resource.title}
                                            </h4>
                                            <p className="text-xs text-gray-600 mb-2">
                                              {resource.description}
                                            </p>
                                            <div className="flex items-center gap-2">
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                {resource.type.toUpperCase()}
                                              </Badge>
                                              {resource.downloadUrl ? (
                                                <span className="text-xs text-blue-600">
                                                  Download
                                                </span>
                                              ) : (
                                                <span className="text-xs text-blue-600">
                                                  Visit
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <ExternalLink className="h-4 w-4 text-gray-400" />
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="text-sm text-gray-500">
                                <p>Last updated by {info.updatedBy}</p>
                                <p>{info.lastUpdated.toLocaleString()}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Share className="h-4 w-4 mr-2" />
                                  Share
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleBookmark(info.id)}
                                >
                                  <Bookmark
                                    className={`h-4 w-4 mr-2 ${
                                      bookmarkedItems.includes(info.id)
                                        ? "fill-current text-yellow-500"
                                        : ""
                                    }`}
                                  />
                                  {bookmarkedItems.includes(info.id)
                                    ? "Bookmarked"
                                    : "Bookmark"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSafetyInfo.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No safety information found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No safety information matches your search criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterCategory("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="emergency-contacts" className="space-y-6">
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>
                  In a life-threatening emergency, call 911 immediately.
                </strong>
                The contacts below are for non-emergency situations and support
                services.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {emergencyContacts
                .filter((contact) => contact.isActive)
                .sort((a, b) => a.priority - b.priority)
                .map((contact) => (
                  <Card
                    key={contact.id}
                    className={`hover:shadow-lg transition-shadow ${
                      contact.priority === 1
                        ? "ring-2 ring-red-500 bg-red-50"
                        : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {getEmergencyTypeIcon(contact.type)}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {contact.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {contact.description}
                          </p>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <a
                                href={`tel:${contact.phoneNumber}`}
                                className="text-red-600 font-medium hover:underline"
                              >
                                {contact.phoneNumber}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {contact.availableHours}
                              </span>
                            </div>
                            {contact.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">
                                  {contact.location}
                                </span>
                              </div>
                            )}
                          </div>

                          {contact.priority === 1 && (
                            <div className="mt-3 p-2 bg-red-100 rounded text-red-800 text-sm font-medium">
                              Emergency Contact - Call for immediate assistance
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Additional Support
                    </h3>
                    <p className="text-blue-800 text-sm mb-3">
                      If you need help but don't see an appropriate contact
                      above, call our main police number at (555) 123-4567. Our
                      operators can direct you to the right department or
                      service.
                    </p>
                    <p className="text-blue-800 text-sm">
                      For TTY/TDD services, dial 711 before any of the numbers
                      above.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
