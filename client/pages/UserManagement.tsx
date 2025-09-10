import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User, UserRole } from "@shared/types";
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
import { Label } from "../components/ui/label";
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
import { Switch } from "../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Shield,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Key,
  UserPlus,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";

interface PendingAccount {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  requestedRole: UserRole;
  submittedDate: Date;
  status: "pending" | "approved" | "rejected";
  documents?: string[];
  notes?: string;
}

export default function UserManagement() {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<{
    fullName: string;
    username: string;
    role: UserRole;
    email?: string;
    phone?: string;
    password: string;
  }>({
    fullName: "",
    username: "",
    role: UserRole.CITIZEN,
    email: "",
    phone: "",
    password: "",
  });
  const [newUserPhoto, setNewUserPhoto] = useState<File | null>(null);

  // Edit user state
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Reset password state
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const canManageUsers = hasRole(UserRole.SUPER_ADMIN);
  const canApproveAccounts = hasAnyRole([
    UserRole.SUPER_ADMIN,
    UserRole.POLICE_HEAD,
  ]);

  const [activeTab, setActiveTab] = useState<"users" | "pending" | "roles">("users");

  useEffect(() => {
    fetchUsers();
    fetchPendingAccounts();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      const data = await res.json();
      if (res.ok && data.success) {
        const list: any[] = data.data.users.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        }));
        await Promise.all(
          list.map(async (u) => {
            try {
              const p = await api.get(`/users/${u.id}/photo`);
              if (p.ok) {
                const d = await p.json();
                u.photoUrl = d?.data?.photoUrl || null;
              }
            } catch {}
          }),
        );
        setUsers(list as User[]);
      }
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingAccounts = async () => {
    try {
      const res = await api.get("/pending-accounts");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const list: PendingAccount[] = (data.data.pending || []).map(
            (p: any) => ({
              ...p,
              submittedDate: new Date(p.submittedDate),
            }),
          );
          setPendingAccounts(list);
        }
      }
    } catch (e) {
      console.error("Failed to load pending accounts", e);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) =>
        statusFilter === "active" ? user.isActive : !user.isActive,
      );
    }

    setFilteredUsers(filtered);
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const res = await api.put(`/users/${userId}`, { isActive });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, isActive } : user,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleApproveAccount = async (accountId: string) => {
    try {
      const res = await api.post(`/pending-accounts/${accountId}/approve`, {});
      if (res.ok) {
        await fetchPendingAccounts();
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error approving account:", error);
    }
  };

  const handleRejectAccount = async (accountId: string) => {
    try {
      const res = await api.post(`/pending-accounts/${accountId}/reject`, {});
      if (res.ok) {
        await fetchPendingAccounts();
      }
    } catch (error) {
      console.error("Error rejecting account:", error);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "bg-crime-red text-white";
      case UserRole.POLICE_HEAD:
        return "bg-crime-yellow text-crime-black";
      case UserRole.DETECTIVE_OFFICER:
        return "bg-blue-500 text-white";
      case UserRole.PREVENTIVE_OFFICER:
        return "bg-green-500 text-white";
      case UserRole.HR_MANAGER:
        return "bg-purple-500 text-white";
      case UserRole.CITIZEN:
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const userStats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    admins: users.filter((u) => u.role === UserRole.SUPER_ADMIN).length,
    officers: users.filter((u) =>
      [
        UserRole.POLICE_HEAD,
        UserRole.DETECTIVE_OFFICER,
        UserRole.PREVENTIVE_OFFICER,
      ].includes(u.role),
    ).length,
    citizens: users.filter((u) => u.role === UserRole.CITIZEN).length,
    pendingApprovals: pendingAccounts.filter((p) => p.status === "pending")
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
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-300">
            Comprehensive user administration and role management
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
          <Card onClick={() => setActiveTab("users")} className="cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {userStats.total}
              </h3>
              <p className="text-gray-600">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {userStats.active}
              </h3>
              <p className="text-gray-600">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {userStats.inactive}
              </h3>
              <p className="text-gray-600">Inactive</p>
            </CardContent>
          </Card>
          <Card onClick={() => setActiveTab("roles")} className="cursor-pointer">
            <CardContent className="p-6 text-center">
              <Settings className="w-8 h-8 mx-auto mb-2 text-crime-red" />
              <h3 className="text-2xl font-bold text-crime-black">
                {userStats.admins}
              </h3>
              <p className="text-gray-600">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {userStats.officers}
              </h3>
              <p className="text-gray-600">Officers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <h3 className="text-2xl font-bold text-crime-black">
                {userStats.citizens}
              </h3>
              <p className="text-gray-600">Citizens</p>
            </CardContent>
          </Card>
          <Card onClick={() => setActiveTab("pending")} className="cursor-pointer">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-crime-yellow" />
              <h3 className="text-2xl font-bold text-crime-black">
                {userStats.pendingApprovals}
              </h3>
              <p className="text-gray-600">Pending</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Directory</TabsTrigger>
            <TabsTrigger value="pending">Pending Accounts</TabsTrigger>
            <TabsTrigger value="roles">System Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Search & Filter Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value={UserRole.SUPER_ADMIN}>
                        Super Admin
                      </SelectItem>
                      <SelectItem value={UserRole.POLICE_HEAD}>
                        Police Head
                      </SelectItem>
                      <SelectItem value={UserRole.DETECTIVE_OFFICER}>
                        Detective Officer
                      </SelectItem>
                      <SelectItem value={UserRole.PREVENTIVE_OFFICER}>
                        Preventive Officer
                      </SelectItem>
                      <SelectItem value={UserRole.HR_MANAGER}>
                        HR Manager
                      </SelectItem>
                      <SelectItem value={UserRole.CITIZEN}>Citizen</SelectItem>
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

                  {canManageUsers && (
                    <Button
                      className="bg-crime-red hover:bg-crime-red-dark text-white"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {canManageUsers && (
              <>
                {/* Add User Dialog */}
                <div>
                  <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                  >
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Create a new user account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={newUser.fullName}
                            onChange={(e) =>
                              setNewUser({
                                ...newUser,
                                fullName: e.target.value,
                              })
                            }
                            placeholder="Full name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={newUser.username}
                              onChange={(e) =>
                                setNewUser({
                                  ...newUser,
                                  username: e.target.value,
                                })
                              }
                              placeholder="username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={newUser.password}
                              onChange={(e) =>
                                setNewUser({
                                  ...newUser,
                                  password: e.target.value,
                                })
                              }
                              placeholder="password"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              value={newUser.email}
                              onChange={(e) =>
                                setNewUser({
                                  ...newUser,
                                  email: e.target.value,
                                })
                              }
                              placeholder="email@example.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={newUser.phone}
                              onChange={(e) =>
                                setNewUser({
                                  ...newUser,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="+251-..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Profile Photo</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setNewUserPhoto(e.target.files?.[0] || null)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(val) =>
                              setNewUser({ ...newUser, role: val as UserRole })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={UserRole.SUPER_ADMIN}>
                                Super Admin
                              </SelectItem>
                              <SelectItem value={UserRole.POLICE_HEAD}>
                                Police Head
                              </SelectItem>
                              <SelectItem value={UserRole.DETECTIVE_OFFICER}>
                                Detective Officer
                              </SelectItem>
                              <SelectItem value={UserRole.PREVENTIVE_OFFICER}>
                                Preventive Officer
                              </SelectItem>
                              <SelectItem value={UserRole.HR_MANAGER}>
                                HR Manager
                              </SelectItem>
                              <SelectItem value={UserRole.CITIZEN}>
                                Citizen
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button
                            className="bg-crime-red text-white"
                            onClick={async () => {
                              if (
                                !newUser.fullName ||
                                !newUser.username ||
                                !newUser.password
                              )
                                return;
                              try {
                                const res = await api.post("/users", {
                                  username: newUser.username,
                                  password: newUser.password,
                                  role: newUser.role,
                                  fullName: newUser.fullName,
                                  email: newUser.email,
                                  phone: newUser.phone,
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  const u = data.data;
                                  const normalized: any = {
                                    ...u,
                                    createdAt: new Date(u.createdAt),
                                    updatedAt: new Date(u.updatedAt),
                                  };
                                  if (newUserPhoto) {
                                    const fd = new FormData();
                                    fd.append("file", newUserPhoto);
                                    const upRes = await api.post(
                                      `/users/${u.id}/photo`,
                                      fd,
                                    );
                                    if (upRes.ok) {
                                      const pr = await upRes.json();
                                      normalized.photoUrl =
                                        pr?.data?.photoUrl || null;
                                    }
                                  }
                                  setUsers((prev) => [normalized, ...prev]);
                                  setIsAddDialogOpen(false);
                                  setNewUser({
                                    fullName: "",
                                    username: "",
                                    role: UserRole.CITIZEN,
                                    email: "",
                                    phone: "",
                                    password: "",
                                  });
                                  setNewUserPhoto(null);
                                }
                              } catch (e) {
                                console.error("Failed to create user", e);
                              }
                            }}
                          >
                            Save User
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            )}

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>User Directory</CardTitle>
                <CardDescription>
                  {filteredUsers.length} user(s) found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user_) => (
                    <div
                      key={user_.id}
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {(user_ as any).photoUrl ? (
                              <img
                                src={(user_ as any).photoUrl}
                                alt={user_.fullName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-crime-red rounded-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-crime-black">
                                {user_.fullName}
                              </h3>
                              <p className="text-gray-600">@{user_.username}</p>
                            </div>
                            <Badge className={getRoleBadgeColor(user_.role)}>
                              {user_.role.replace("_", " ").toUpperCase()}
                            </Badge>
                            <Badge
                              className={
                                user_.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {user_.isActive ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {user_.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            {user_.email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                {user_.email}
                              </div>
                            )}
                            {user_.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                {user_.phone}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Joined{" "}
                              {new Date(user_.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {canManageUsers && (
                          <div className="flex items-center gap-4 ml-6">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={user_.isActive}
                                onCheckedChange={(checked) =>
                                  handleToggleUserStatus(user_.id, checked)
                                }
                              />
                              <span className="text-sm text-gray-600">
                                Active
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => { setEditUser(user_); setIsEditDialogOpen(true); }}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => { setResetUser(user_); setIsResetDialogOpen(true); }}>
                                <Key className="w-4 h-4 mr-1" />
                                Reset Password
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No users found
                      </h3>
                      <p className="text-gray-500">
                        Try adjusting your search and filter criteria
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Edit User Dialog */}
            {editUser && (
              <Dialog open={isEditDialogOpen} onOpenChange={(v) => { if(!v) setEditUser(null); setIsEditDialogOpen(v); }}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>Update user details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={editUser.fullName} onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={editUser.email || ''} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={editUser.phone || ''} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={editUser.role} onValueChange={(val) => setEditUser({ ...editUser, role: val as UserRole })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                            <SelectItem value={UserRole.POLICE_HEAD}>Police Head</SelectItem>
                            <SelectItem value={UserRole.DETECTIVE_OFFICER}>Detective Officer</SelectItem>
                            <SelectItem value={UserRole.PREVENTIVE_OFFICER}>Preventive Officer</SelectItem>
                            <SelectItem value={UserRole.HR_MANAGER}>HR Manager</SelectItem>
                            <SelectItem value={UserRole.CITIZEN}>Citizen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button className="bg-crime-red text-white" onClick={async () => {
                        if (!editUser) return;
                        try {
                          const updates: any = { fullName: editUser.fullName, username: editUser.username, email: editUser.email, phone: editUser.phone, role: editUser.role };
                          const res = await api.put(`/users/${editUser.id}`, updates);
                          if (res.ok) {
                            const d = await res.json();
                            const updated = d.data;
                            setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated, createdAt: new Date(updated.createdAt), updatedAt: new Date(updated.updatedAt) } : u));
                            setIsEditDialogOpen(false);
                            setEditUser(null);
                          }
                        } catch (e) { console.error('Failed to update user', e); }
                      }}>Save</Button>
                      <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditUser(null); }}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Reset Password Dialog */}
            {resetUser && (
              <Dialog open={isResetDialogOpen} onOpenChange={(v) => { if(!v) setResetUser(null); setIsResetDialogOpen(v); }}>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>Set a new password for {resetUser.fullName}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button className="bg-crime-red text-white" onClick={async () => {
                        if (!resetUser || !newPassword) return;
                        try {
                          const res = await api.post(`/users/${resetUser.id}/reset-password`, { password: newPassword });
                          if (res.ok) {
                            setIsResetDialogOpen(false);
                            setResetUser(null);
                            setNewPassword('');
                          }
                        } catch (e) { console.error('Failed to reset password', e); }
                      }}>Reset</Button>
                      <Button variant="outline" onClick={() => { setIsResetDialogOpen(false); setResetUser(null); setNewPassword(''); }}>Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pending Account Approvals</CardTitle>
                    <CardDescription>
                      Review and approve new account requests
                    </CardDescription>
                  </div>
                  <Badge className="bg-crime-yellow text-crime-black">
                    {
                      pendingAccounts.filter((p) => p.status === "pending")
                        .length
                    }{" "}
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingAccounts.map((account) => (
                    <div key={account.id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <UserPlus className="w-6 h-6 text-crime-red" />
                            <h3 className="text-lg font-semibold text-crime-black">
                              {account.fullName}
                            </h3>
                            <Badge
                              className={getRoleBadgeColor(
                                account.requestedRole,
                              )}
                            >
                              {account.requestedRole
                                .replace("_", " ")
                                .toUpperCase()}
                            </Badge>
                            <Badge
                              className={
                                account.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : account.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {account.status.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {account.email}
                            </div>
                            {account.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                {account.phone}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Submitted{" "}
                              {new Date(
                                account.submittedDate,
                              ).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Settings className="w-4 h-4 mr-2" />
                              Username: {account.username}
                            </div>
                          </div>

                          {account.notes && (
                            <div className="bg-blue-50 p-3 rounded-lg mb-3">
                              <p className="text-sm text-blue-800">
                                {account.notes}
                              </p>
                            </div>
                          )}

                         {Array.isArray(account.documents) && account.documents.length > 0 && (
  <div className="mb-3">
    <p className="text-sm font-medium text-gray-700 mb-2">
      Submitted Documents:
    </p>
    <div className="flex flex-wrap gap-2">
      {account.documents.map((doc, index) => (
        <Badge
          key={index}
          variant="outline"
          className="text-xs"
        >
          {doc}
        </Badge>
      ))}
    </div>
  </div>
)}

                        </div>

                        {canApproveAccounts && account.status === "pending" && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleApproveAccount(account.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRejectAccount(account.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {pendingAccounts.length === 0 && (
                    <div className="text-center py-12">
                      <UserPlus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No pending approvals
                      </h3>
                      <p className="text-gray-500">
                        All account requests have been processed
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.values(UserRole).map((role) => (
                    <div key={role} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-6 h-6 text-crime-red" />
                            <h3 className="text-lg font-semibold text-crime-black">
                              {role.replace("_", " ").toUpperCase()}
                            </h3>
                            <Badge className={getRoleBadgeColor(role)}>
                              {users.filter((u) => u.role === role).length}{" "}
                              Users
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-4">
                            {role === UserRole.SUPER_ADMIN &&
                              "Full system administration access and control"}
                            {role === UserRole.POLICE_HEAD &&
                              "Senior police management with oversight responsibilities"}
                            {role === UserRole.DETECTIVE_OFFICER &&
                              "Investigation specialist with case management access"}
                            {role === UserRole.PREVENTIVE_OFFICER &&
                              "Patrol and crime prevention duties"}
                            {role === UserRole.HR_MANAGER &&
                              "Human resources and personnel management"}
                            {role === UserRole.CITIZEN &&
                              "Public access for crime reporting and tracking"}
                          </p>
                        </div>
                        {canManageUsers && (
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Permissions
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
