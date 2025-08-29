import { CrimeReport, CrimeCategory, CrimeStatus, Priority } from "../types";

let nextId = 4;

export let crimeReports: CrimeReport[] = [
  {
    id: "1",
    title: "Theft at Market Street",
    description: "Mobile phone stolen from vendor at the main market area",
    category: CrimeCategory.THEFT,
    status: CrimeStatus.UNDER_INVESTIGATION,
    priority: Priority.MEDIUM,
    location: "Market Street, Downtown",
    dateReported: new Date("2024-01-15T10:30:00Z"),
    dateIncident: new Date("2024-01-15T09:00:00Z"),
    reportedBy: "6",
    assignedTo: "3",
    evidence: ["photo1.jpg", "witness_statement.pdf"],
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-01-15T14:22:00Z"),
  },
  {
    id: "2",
    title: "Domestic Violence Incident",
    description: "Reported domestic violence case requiring immediate attention",
    category: CrimeCategory.DOMESTIC_VIOLENCE,
    status: CrimeStatus.ASSIGNED,
    priority: Priority.HIGH,
    location: "Residential Area, Block 5",
    dateReported: new Date("2024-01-16T08:15:00Z"),
    dateIncident: new Date("2024-01-16T07:45:00Z"),
    reportedBy: "6",
    assignedTo: "4",
    evidence: ["medical_report.pdf"],
    createdAt: new Date("2024-01-16T08:15:00Z"),
    updatedAt: new Date("2024-01-16T09:30:00Z"),
  },
  {
    id: "3",
    title: "Vehicle Break-in",
    description: "Car window broken and items stolen from vehicle",
    category: CrimeCategory.BURGLARY,
    status: CrimeStatus.REPORTED,
    priority: Priority.MEDIUM,
    location: "Parking Lot, City Center",
    dateReported: new Date("2024-01-16T12:00:00Z"),
    dateIncident: new Date("2024-01-15T22:30:00Z"),
    reportedBy: "6",
    evidence: ["damage_photos.jpg"],
    createdAt: new Date("2024-01-16T12:00:00Z"),
    updatedAt: new Date("2024-01-16T12:00:00Z"),
  },
];

export function createCrime(report: Omit<CrimeReport, "id" | "dateReported" | "createdAt" | "updatedAt" | "status" | "evidence"> & { priority?: Priority }) {
  const newReport: CrimeReport = {
    id: String(nextId++),
    title: report.title,
    description: report.description,
    category: report.category,
    status: CrimeStatus.REPORTED,
    priority: report.priority ?? Priority.MEDIUM,
    location: report.location,
    dateReported: new Date(),
    dateIncident: new Date(report.dateIncident),
    reportedBy: report.reportedBy,
    evidence: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  crimeReports.push(newReport);
  return newReport;
}

export function updateCrime(id: string, updates: Partial<CrimeReport>) {
  const idx = crimeReports.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  crimeReports[idx] = { ...crimeReports[idx], ...updates, updatedAt: new Date() };
  return crimeReports[idx];
}

export function deleteCrime(id: string) {
  const idx = crimeReports.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  crimeReports.splice(idx, 1);
  return true;
}
