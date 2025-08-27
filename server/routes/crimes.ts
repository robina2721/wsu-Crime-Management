import { RequestHandler } from "express";
import { CrimeReport, CrimeCategory, CrimeStatus, Priority, ApiResponse } from "../../shared/types";

// Mock database - In production, use a real database like PlanetScale/MySQL
let crimeReports: CrimeReport[] = [
  {
    id: '1',
    title: 'Theft at Market Street',
    description: 'Mobile phone stolen from vendor at the main market area',
    category: CrimeCategory.THEFT,
    status: CrimeStatus.UNDER_INVESTIGATION,
    priority: Priority.MEDIUM,
    location: 'Market Street, Downtown',
    dateReported: new Date('2024-01-15T10:30:00Z'),
    dateIncident: new Date('2024-01-15T09:00:00Z'),
    reportedBy: '6', // citizen user id
    assignedTo: '3', // detective user id
    evidence: ['photo1.jpg', 'witness_statement.pdf'],
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T14:22:00Z')
  },
  {
    id: '2',
    title: 'Domestic Violence Incident',
    description: 'Reported domestic violence case requiring immediate attention',
    category: CrimeCategory.DOMESTIC_VIOLENCE,
    status: CrimeStatus.ASSIGNED,
    priority: Priority.HIGH,
    location: 'Residential Area, Block 5',
    dateReported: new Date('2024-01-16T08:15:00Z'),
    dateIncident: new Date('2024-01-16T07:45:00Z'),
    reportedBy: '6',
    assignedTo: '4', // preventive officer
    evidence: ['medical_report.pdf'],
    createdAt: new Date('2024-01-16T08:15:00Z'),
    updatedAt: new Date('2024-01-16T09:30:00Z')
  },
  {
    id: '3',
    title: 'Vehicle Break-in',
    description: 'Car window broken and items stolen from vehicle',
    category: CrimeCategory.BURGLARY,
    status: CrimeStatus.REPORTED,
    priority: Priority.MEDIUM,
    location: 'Parking Lot, City Center',
    dateReported: new Date('2024-01-16T12:00:00Z'),
    dateIncident: new Date('2024-01-15T22:30:00Z'),
    reportedBy: '6',
    evidence: ['damage_photos.jpg'],
    createdAt: new Date('2024-01-16T12:00:00Z'),
    updatedAt: new Date('2024-01-16T12:00:00Z')
  }
];

let nextId = 4;

export const handleGetCrimes: RequestHandler = (req, res) => {
  try {
    const { status, category, priority, limit = '10', offset = '0' } = req.query;
    
    let filteredReports = [...crimeReports];

    // Apply filters
    if (status) {
      filteredReports = filteredReports.filter(r => r.status === status);
    }
    if (category) {
      filteredReports = filteredReports.filter(r => r.category === category);
    }
    if (priority) {
      filteredReports = filteredReports.filter(r => r.priority === priority);
    }

    // Sort by date reported (newest first)
    filteredReports.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());

    // Apply pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const paginatedReports = filteredReports.slice(offsetNum, offsetNum + limitNum);

    const response: ApiResponse<{
      reports: CrimeReport[];
      total: number;
      limit: number;
      offset: number;
    }> = {
      success: true,
      data: {
        reports: paginatedReports,
        total: filteredReports.length,
        limit: limitNum,
        offset: offsetNum
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching crimes:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

export const handleGetCrime: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const report = crimeReports.find(r => r.id === id);

    if (!report) {
      const response: ApiResponse = {
        success: false,
        error: 'Crime report not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<CrimeReport> = {
      success: true,
      data: report
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching crime:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

export const handleCreateCrime: RequestHandler = (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority = Priority.MEDIUM,
      location,
      dateIncident,
      reportedBy
    } = req.body;

    if (!title || !description || !category || !location || !dateIncident || !reportedBy) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields'
      };
      return res.status(400).json(response);
    }

    const newReport: CrimeReport = {
      id: nextId.toString(),
      title,
      description,
      category,
      status: CrimeStatus.REPORTED,
      priority,
      location,
      dateReported: new Date(),
      dateIncident: new Date(dateIncident),
      reportedBy,
      evidence: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    crimeReports.push(newReport);
    nextId++;

    const response: ApiResponse<CrimeReport> = {
      success: true,
      data: newReport,
      message: 'Crime report created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating crime report:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

export const handleUpdateCrime: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const reportIndex = crimeReports.findIndex(r => r.id === id);
    if (reportIndex === -1) {
      const response: ApiResponse = {
        success: false,
        error: 'Crime report not found'
      };
      return res.status(404).json(response);
    }

    // Update the report
    crimeReports[reportIndex] = {
      ...crimeReports[reportIndex],
      ...updates,
      updatedAt: new Date()
    };

    const response: ApiResponse<CrimeReport> = {
      success: true,
      data: crimeReports[reportIndex],
      message: 'Crime report updated successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating crime report:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

export const handleDeleteCrime: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const reportIndex = crimeReports.findIndex(r => r.id === id);

    if (reportIndex === -1) {
      const response: ApiResponse = {
        success: false,
        error: 'Crime report not found'
      };
      return res.status(404).json(response);
    }

    crimeReports.splice(reportIndex, 1);

    const response: ApiResponse = {
      success: true,
      message: 'Crime report deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error deleting crime report:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};
