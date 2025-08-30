import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@shared/types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Car, 
  Shield, 
  Radio,
  Computer,
  Camera,
  Wrench,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  type: string;
  serialNumber: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  status: AssetStatus;
  condition: AssetCondition;
  location: string;
  assignedTo?: string;
  assignedToName?: string;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  warrantyExpiry?: Date;
  description: string;
}

enum AssetCategory {
  VEHICLES = 'vehicles',
  WEAPONS = 'weapons',
  COMMUNICATION = 'communication',
  TECHNOLOGY = 'technology',
  EQUIPMENT = 'equipment',
  INFRASTRUCTURE = 'infrastructure'
}

enum AssetStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
  LOST = 'lost',
  DAMAGED = 'damaged'
}

enum AssetCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

export default function AssetManagement() {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const canManageAssets = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD]);
  const canViewAssets = hasAnyRole([UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD, UserRole.HR_MANAGER]);

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, searchTerm, categoryFilter, statusFilter, conditionFilter]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '',
    category: AssetCategory.EQUIPMENT,
    type: '',
    serialNumber: '',
    currentValue: 0,
    status: AssetStatus.AVAILABLE,
    condition: AssetCondition.GOOD,
    location: '',
    description: ''
  });

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      const data = await res.json();
      if (data.success) {
        setAssets(data.data.assets || []);
      }
    } catch (e) {
      console.error('Failed to load assets', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAsset = async () => {
    try {
      const res = await api.post('/assets', {
        name: newAsset.name,
        category: newAsset.category,
        type: newAsset.type,
        serialNumber: newAsset.serialNumber,
        currentValue: newAsset.currentValue,
        status: newAsset.status,
        condition: newAsset.condition,
        location: newAsset.location,
        description: newAsset.description,
      });
      if (res.ok) {
        setIsAddOpen(false);
        setNewAsset({
          name: '', category: AssetCategory.EQUIPMENT, type: '', serialNumber: '', currentValue: 0,
          status: AssetStatus.AVAILABLE, condition: AssetCondition.GOOD, location: '', description: ''
        });
        await fetchAssets();
      }
    } catch (e) {
      console.error('Failed to add asset', e);
    }
  };

  const filterAssets = () => {
    let filtered = [...assets];

    if (searchTerm) {
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(asset => asset.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.status === statusFilter);
    }

    if (conditionFilter !== 'all') {
      filtered = filtered.filter(asset => asset.condition === conditionFilter);
    }

    setFilteredAssets(filtered);
  };

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case AssetCategory.VEHICLES: return Car;
      case AssetCategory.WEAPONS: return Shield;
      case AssetCategory.COMMUNICATION: return Radio;
      case AssetCategory.TECHNOLOGY: return Computer;
      case AssetCategory.EQUIPMENT: return Package;
      case AssetCategory.INFRASTRUCTURE: return Building;
      default: return Package;
    }
  };

  const getStatusBadgeColor = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.AVAILABLE: return 'bg-green-100 text-green-800';
      case AssetStatus.IN_USE: return 'bg-blue-100 text-blue-800';
      case AssetStatus.MAINTENANCE: return 'bg-yellow-100 text-yellow-800';
      case AssetStatus.RETIRED: return 'bg-gray-100 text-gray-800';
      case AssetStatus.LOST: return 'bg-red-100 text-red-800';
      case AssetStatus.DAMAGED: return 'bg-crime-red text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionBadgeColor = (condition: AssetCondition) => {
    switch (condition) {
      case AssetCondition.EXCELLENT: return 'bg-green-500 text-white';
      case AssetCondition.GOOD: return 'bg-blue-500 text-white';
      case AssetCondition.FAIR: return 'bg-yellow-500 text-white';
      case AssetCondition.POOR: return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.AVAILABLE: return CheckCircle;
      case AssetStatus.IN_USE: return User;
      case AssetStatus.MAINTENANCE: return Wrench;
      case AssetStatus.RETIRED: return XCircle;
      case AssetStatus.LOST: return AlertTriangle;
      case AssetStatus.DAMAGED: return XCircle;
      default: return Package;
    }
  };

  const assetStats = {
    total: assets.length,
    available: assets.filter(a => a.status === AssetStatus.AVAILABLE).length,
    inUse: assets.filter(a => a.status === AssetStatus.IN_USE).length,
    maintenance: assets.filter(a => a.status === AssetStatus.MAINTENANCE).length,
    totalValue: assets.reduce((sum, asset) => sum + asset.currentValue, 0),
    vehicles: assets.filter(a => a.category === AssetCategory.VEHICLES).length,
    equipment: assets.filter(a => a.category === AssetCategory.EQUIPMENT).length
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
          <h1 className="text-3xl font-bold mb-2">Asset Management</h1>
          <p className="text-gray-300">Organizational asset tracking and inventory management</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">{assetStats.total}</h3>
              <p className="text-gray-600">Total Assets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-2xl font-bold text-crime-black">{assetStats.available}</h3>
              <p className="text-gray-600">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <User className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">{assetStats.inUse}</h3>
              <p className="text-gray-600">In Use</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Wrench className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="text-2xl font-bold text-crime-black">{assetStats.maintenance}</h3>
              <p className="text-gray-600">Maintenance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-xl font-bold text-crime-black">${assetStats.totalValue.toLocaleString()}</h3>
              <p className="text-gray-600">Total Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Car className="w-8 h-8 mx-auto mb-2 text-crime-red" />
              <h3 className="text-2xl font-bold text-crime-black">{assetStats.vehicles}</h3>
              <p className="text-gray-600">Vehicles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="text-2xl font-bold text-crime-black">{assetStats.equipment}</h3>
              <p className="text-gray-600">Equipment</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Search & Filter Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value={AssetCategory.VEHICLES}>Vehicles</SelectItem>
                  <SelectItem value={AssetCategory.WEAPONS}>Weapons</SelectItem>
                  <SelectItem value={AssetCategory.COMMUNICATION}>Communication</SelectItem>
                  <SelectItem value={AssetCategory.TECHNOLOGY}>Technology</SelectItem>
                  <SelectItem value={AssetCategory.EQUIPMENT}>Equipment</SelectItem>
                  <SelectItem value={AssetCategory.INFRASTRUCTURE}>Infrastructure</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={AssetStatus.AVAILABLE}>Available</SelectItem>
                  <SelectItem value={AssetStatus.IN_USE}>In Use</SelectItem>
                  <SelectItem value={AssetStatus.MAINTENANCE}>Maintenance</SelectItem>
                  <SelectItem value={AssetStatus.RETIRED}>Retired</SelectItem>
                  <SelectItem value={AssetStatus.LOST}>Lost</SelectItem>
                  <SelectItem value={AssetStatus.DAMAGED}>Damaged</SelectItem>
                </SelectContent>
              </Select>

              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value={AssetCondition.EXCELLENT}>Excellent</SelectItem>
                  <SelectItem value={AssetCondition.GOOD}>Good</SelectItem>
                  <SelectItem value={AssetCondition.FAIR}>Fair</SelectItem>
                  <SelectItem value={AssetCondition.POOR}>Poor</SelectItem>
                </SelectContent>
              </Select>

              {canManageAssets && (
                <>
                  <Button className="bg-crime-red hover:bg-crime-red-dark text-white" onClick={() => setIsAddOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Asset
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Inventory</CardTitle>
            <CardDescription>
              {filteredAssets.length} asset(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAssets.map((asset) => {
                const CategoryIcon = getCategoryIcon(asset.category);
                const StatusIcon = getStatusIcon(asset.status);
                
                return (
                  <div key={asset.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CategoryIcon className="w-6 h-6 text-crime-red" />
                          <h3 className="text-lg font-semibold text-crime-black">{asset.name}</h3>
                          <Badge className={getStatusBadgeColor(asset.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {asset.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getConditionBadgeColor(asset.condition)}>
                            {asset.condition.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{asset.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Serial:</span>
                            <div>{asset.serialNumber}</div>
                          </div>
                          <div>
                            <span className="font-medium">Type:</span>
                            <div>{asset.type}</div>
                          </div>
                          <div>
                            <span className="font-medium">Location:</span>
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {asset.location}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Value:</span>
                            <div className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {asset.currentValue.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {asset.assignedTo && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center text-sm">
                              <User className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="text-blue-800">
                                Assigned to: <strong>{asset.assignedToName}</strong>
                              </span>
                            </div>
                          </div>
                        )}

                        {asset.nextMaintenance && (
                          <div className="mt-3 flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            Next maintenance: {new Date(asset.nextMaintenance).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {canManageAssets && (
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {asset.status === AssetStatus.AVAILABLE && (
                            <Button size="sm" className="bg-crime-yellow hover:bg-yellow-600 text-crime-black">
                              Assign
                            </Button>
                          )}
                          {asset.status === AssetStatus.IN_USE && (
                            <Button variant="outline" size="sm">
                              Return
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredAssets.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No assets found</h3>
                  <p className="text-gray-500">Try adjusting your search and filter criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
