import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserRole } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/contexts/I18nContext";
import LanguageToggle from "@/components/LanguageToggle";

export default function Signup() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    requestedRole: UserRole.CITIZEN as string,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [employeeDetails, setEmployeeDetails] = useState({
    employeeId: "",
    department: "",
    badgeNumber: "",
    rank: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const isEmployee = form.requestedRole !== UserRole.CITIZEN;

  const roleOptions = [
    { value: UserRole.CITIZEN, label: "Citizen" },
    { value: UserRole.PREVENTIVE_OFFICER, label: "Preventive Officer" },
    { value: UserRole.DETECTIVE_OFFICER, label: "Detective Officer" },
    { value: UserRole.POLICE_HEAD, label: "Police Head" },
    { value: UserRole.HR_MANAGER, label: "HR Manager" },
  ];

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setIsLoading(true);
    try {
      let payload: any = { ...form };
      if (isEmployee) {
        if (!photoFile) {
          setError("Photo is required for employee accounts");
          setIsLoading(false);
          return;
        }
        const dataUrl = await fileToDataUrl(photoFile);
        payload.photo = dataUrl;
        payload.details = { ...employeeDetails };
      }
      const res = await api.post("/auth/signup", payload);
      const data = await res.json();
      if (res.ok && data.success) {
        // Show success dropdown and redirect to login (do not auto-login)
        setShowSuccess(true);
        // If system returns token (auto-login), still redirect user to login page after showing success
        setTimeout(() => {
          navigate('/login');
        }, 3500);
        if (data.token && data.user) {
          // Clear any token that might have been issued unintentionally
          try { localStorage.removeItem('auth_token'); localStorage.removeItem('user_data'); } catch {}
        }
        if (!isEmployee) {
          setInfo("Signup successful. Redirecting to login...");
        } else {
          setInfo("Your request has been submitted for approval. Redirecting to login...");
        }
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Signup error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crime-black via-gray-900 to-crime-red-dark flex items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4 z-50">
        <Link to="/">
          <Button
            variant="outline"
            className="h-9 border-white/40 text-black hover:bg-white hover:text-crime-black"
          >
            ← Home
          </Button>
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle />
      </div>
      <div className="absolute inset-0 bg-black/20"></div>
      <Card className="w-full max-w-md relative z-10 border-crime-red shadow-2xl">
        <CardHeader className="text-center space-y-4">
           <div className="flex justify-center">
            <img src="/wspolice.jpeg" alt="Logo" className="w-20 h-20" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-crime-black">
              {t("app.title")}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t("city.name")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Your Name + Surname"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Use Unique Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Type valid Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="Use ET Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="At least 6 characters"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Request Role</Label>
              <Select
                value={form.requestedRole}
                onValueChange={(v) => setForm({ ...form, requestedRole: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isEmployee && (
              <div className="space-y-4 border rounded-md p-4">
                <div className="space-y-2">
                  <Label htmlFor="photo">Upload Photo</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setPhotoFile(f || null);
                      setPhotoPreview(f ? URL.createObjectURL(f) : "");
                    }}
                    required={isEmployee}
                  />
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-24 w-24 rounded object-cover border"
                    />
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={employeeDetails.employeeId}
                      onChange={(e) =>
                        setEmployeeDetails({ ...employeeDetails, employeeId: e.target.value })
                      }
                      required={isEmployee}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={employeeDetails.department}
                      onChange={(e) =>
                        setEmployeeDetails({ ...employeeDetails, department: e.target.value })
                      }
                      required={isEmployee}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badgeNumber">Badge Number</Label>
                    <Input
                      id="badgeNumber"
                      value={employeeDetails.badgeNumber}
                      onChange={(e) =>
                        setEmployeeDetails({ ...employeeDetails, badgeNumber: e.target.value })
                      }
                      required={isEmployee}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rank">Rank</Label>
                    <Input
                      id="rank"
                      value={employeeDetails.rank}
                      onChange={(e) =>
                        setEmployeeDetails({ ...employeeDetails, rank: e.target.value })
                      }
                      required={isEmployee}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-crime-red bg-red-50 p-3 rounded-md">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {info && (
              <div className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded-md">
                {info}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-crime-red hover:bg-crime-red-dark text-white"
            >
              {isLoading ? "Submitting…" : "Create Account"}
            </Button>
            <div className="text-center text-sm text-gray-600 pt-2">
              Already have an account?{" "}
              <Link className="text-crime-red hover:underline" to="/login">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
