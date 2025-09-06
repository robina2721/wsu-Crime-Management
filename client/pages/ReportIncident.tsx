import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IncidentType, Priority } from "@shared/types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { api } from "@/lib/api";

export default function ReportIncident() {
  const navigate = useNavigate();
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    incidentType: IncidentType.PATROL_OBSERVATION,
    severity: Priority.LOW,
    location: "",
    dateOccurred: new Date().toISOString().slice(0, 16),
    reporterName: "",
    contact: "",
    followUpRequired: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!form.title || !form.description || !form.location) {
      setError("Please fill in title, description and location.");
      return;
    }
    // If user tries to report a crime (this app separates crime reporting), require signup/login
    // We'll treat incident types as non-crime; if developers add a crime type later, check here.
    // Submit anonymously if not logged in - backend will accept anonymous incidents.
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        incidentType: form.incidentType,
        severity: form.severity,
        location: form.location,
        dateOccurred: form.dateOccurred,
        followUpRequired: !!form.followUpRequired,
        reporterName: form.reporterName || "Anonymous",
      };
      const res = await api.post("/incidents", payload);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to submit incident.");
        setLoading(false);
        return;
      }
      // After successful submit, navigate to incidents page where admins can see it.
      navigate("/incident-reports");
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Report an Incident</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="text-red-700 bg-red-50 p-3 rounded">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reporterName">Your Name (optional)</Label>
                <Input
                  id="reporterName"
                  value={form.reporterName}
                  onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                  placeholder="Your name (will appear on the report)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Short title for the incident"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Where did this happen?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentType">Incident Type</Label>
                  <Select
                    value={form.incidentType}
                    onValueChange={(v: any) => setForm({ ...form, incidentType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(IncidentType).map((typ) => (
                        <SelectItem key={typ} value={typ}>
                          {typ}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={form.severity}
                    onValueChange={(v: any) => setForm({ ...form, severity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Priority).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOccurred">Date/Time Occurred</Label>
                <Input
                  id="dateOccurred"
                  type="datetime-local"
                  value={form.dateOccurred}
                  onChange={(e) => setForm({ ...form, dateOccurred: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={6}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSubmit} className="bg-crime-red text-white" disabled={loading}>
                  Submit Incident
                </Button>
                <Link to="/">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                Note: To report a crime that requires police action, please sign up and log in.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
