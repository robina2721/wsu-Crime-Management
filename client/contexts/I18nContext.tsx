import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Lang = "en" | "am" | "wo";

type Dict = Record<string, string>;

type I18nContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Lang, Dict> = {
  en: {
    "app.title": "Crime Management System",
    "city.name": "Wolaita Sodo City",
    "login.accessSystem": "Login",
    "hero.leadingBadge": "Ethiopia's Leading Crime Management Platform",
    "hero.welcome": "Welcome to",
    "hero.securePortal": "Access Secure Portal",
    "hero.emergency": "Emergency: 911",
    "trust.iso": "ISO Certified",
    "trust.encryption": "256-bit Encryption",
    "trust.support": "24/7 Support",
    "features.platformTitle": "Comprehensive Crime Management Platform",
    "features.platformDesc":
      "Cutting-edge technology meets law enforcement expertise. Our platform provides all the tools necessary for effective crime prevention, investigation, and community safety.",
    "roles.designedFor": "Designed for Every User",
    "roles.designedForDesc":
      "Role-based access ensures each user gets the tools they need while maintaining security.",
    "testimonials.heading": "Trusted by Law Enforcement",
    "testimonials.subheading": "See what our users say about the system",
    "cta.badge": "Secure Access Portal",
    "cta.heading": "Ready to Make Wolaita Sodo Safer?",
    "cta.subheading":
      "Join our mission for community safety. Access our secure system to manage cases, file reports, monitor activities, and contribute to a safer city.",
    "cta.enterPortal": "Enter Secure Portal",
    "cta.learnMore": "Learn More",
    "footer.dept": "Wolaita Sodo City Police Department",
    "footer.emergency": "Emergency: 911",
    "footer.location": "Wolaita Sodo, Ethiopia",
    "footer.copyright":
      "© 2024 Wolaita Sodo City Crime Management System. All rights reserved.",

    "login.accessLevel": "Access Level",
    "login.selectRole": "Select your role",
    "login.username": "Username",
    "login.usernamePlaceholder": "Enter your username",
    "login.password": "Password",
    "login.passwordPlaceholder": "Enter your password",
    "login.secureLogin": "Secure Login",
    "login.authenticating": "Authenticating...",
    "login.errorFillFields": "Please fill in all fields",
    "login.invalidCredentials": "Invalid credentials",
    "login.portalTitle": "Crime Management System",
    "login.portalSubtitle": "Wolaita Sodo City Security Portal",
    "login.emergencyContact": "Emergency Contact: 911",

    // Citizen Portal
    "citizen.title": "Citizen Portal",
    "citizen.subtitle": "Submit and track your crime reports",
    "citizen.reportButton": "New Report",
    "citizen.tabs.crimes": "Crime Cases",
    "citizen.tabs.incidents": "Incident Reports",

    // Stats
    "stats.totalReports": "Total Reports",
    "stats.underInvestigation": "Under Investigation",
    "stats.resolved": "Resolved",
    "stats.avgResponse": "Avg Response",
    "stats.days": "days",

    // Filters/Search
    "search.placeholder": "Search...",
    "filters.status": "Filter by Status",
    "filters.category": "Filter by Category",
    "filters.type": "Filter by Type",
    "filters.allStatuses": "All Statuses",
    "filters.allCategories": "All Categories",
    "filters.allTypes": "All Types",

    // General/Labels
    "general.viewDetails": "View Details",
    "general.reportDetails": "Report Details",
    "general.reportId": "Report ID",
    "general.category": "Category",
    "general.priority": "Priority",
    "general.incidentDate": "Incident Date",
    "general.reportedDate": "Reported Date",
    "general.location": "Location",
    "general.description": "Description",
    "general.evidence": "Evidence",
    "general.witnesses": "Witnesses",
    "general.currentStatus": "Current Status",
    "general.lastUpdated": "Last Updated",
    "general.statusHistory": "Status History",
    "general.provideAdditionalInfo": "Provide Additional Information",
    "general.conversation": "Conversation",
    "general.submitUpdate": "Submit Update",
    "general.noOfficerAssigned": "No Officer Assigned",
    "general.pendingAssignment": "This report is pending assignment to an investigating officer.",
    "general.cancel": "Cancel",
    "general.submit": "Submit",
    "general.submitReport": "Submit Report",
    "general.estimatedResolution": "Estimated resolution",
    "general.notProvided": "Not provided",
    "general.notSelected": "Not selected",
    "general.evidenceFiles": "Evidence Files",
    "general.noFilesUploaded": "No files uploaded",
    "general.uploadEvidence": "Upload Evidence",
    "general.clickToUpload": "Click to upload photos, videos, or documents",
    "general.maxFileSize": "Max file size: 10MB",
    "general.uploadingFiles": "Uploading files...",
    "general.addWitness": "Add Witness",
    "general.remove": "Remove",

    // Crime form
    "crime.form.title": "Incident Title *",
    "crime.form.category": "Category *",
    "crime.form.date": "Date of Incident *",
    "crime.form.priority": "Priority",
    "crime.form.location": "Location *",
    "crime.form.description": "Detailed Description *",
    "crime.form.placeholder.title": "Brief description of the incident",
    "crime.form.placeholder.location": "Address or description of the location",
    "crime.form.placeholder.description": "Provide a detailed description of what happened, including dates, times, people involved, and any other relevant information...",

    // Incident form
    "incident.form.title": "Incident Title *",
    "incident.form.type": "Incident Type *",
    "incident.form.severity": "Severity",
    "incident.form.dateOccurred": "Date Occurred *",
    "incident.form.location": "Location *",
    "incident.form.description": "Description *",

    // Dialogs/Tabs
    "dialog.submitCrimeReportTitle": "Submit Crime Report",
    "dialog.submitCrimeReportDesc": "Provide details about the incident you wish to report",
    "dialog.submitIncidentReportTitle": "Submit Incident Report",
    "dialog.submitIncidentReportDesc": "Provide details about the incident you wish to report",
    "tabs.details": "Details",
    "tabs.status": "Status Tracking",
    "tabs.contact": "Contact Officer",
    "tabs.incident": "Incident Details",
    "tabs.evidence": "Evidence & Witnesses",
    "tabs.review": "Review & Submit",

    // Empty state
    "empty.noReports": "No reports found",
    "empty.noReportsDesc": "You haven't submitted any reports yet or no reports match your search criteria.",
    "empty.submitFirst": "Submit Your First Report",

    // Status translations
    "status.reported": "Reported",
    "status.under_investigation": "Under Investigation",
    "status.assigned": "Assigned",
    "status.resolved": "Resolved",
    "status.closed": "Closed",
    "status.rejected": "Rejected",

    // Incident Status
    // Kept keys consistent to reuse t with `incidentStatus.${key}`
    "incidentStatus.reported": "Reported",
    "incidentStatus.investigating": "Investigating",
    "incidentStatus.escalated": "Escalated",
    "incidentStatus.resolved": "Resolved",
    "incidentStatus.closed": "Closed",

    // Category translations
    "category.theft": "Theft",
    "category.assault": "Assault",
    "category.burglary": "Burglary",
    "category.fraud": "Fraud",
    "category.vandalism": "Vandalism",
    "category.drug_offense": "Drug Offense",
    "category.domestic_violence": "Domestic Violence",
    "category.traffic_violation": "Traffic Violation",
    "category.other": "Other",

    // Incident type translations
    "incidentType.patrol_observation": "Patrol Observation",
    "incidentType.citizen_complaint": "Citizen Complaint",
    "incidentType.traffic_incident": "Traffic Incident",
    "incidentType.suspicious_activity": "Suspicious Activity",
    "incidentType.property_damage": "Property Damage",
    "incidentType.noise_complaint": "Noise Complaint",
    "incidentType.public_disturbance": "Public Disturbance",
    "incidentType.emergency_response": "Emergency Response",
    "incidentType.other": "Other",

    // Priority
    "priority.low": "Low",
    "priority.medium": "Medium",
    "priority.high": "High",
    "priority.critical": "Critical",
  },
  am: {
    "app.title": "የወንጀል አስተዳደር ስርዓት",
    "city.name": "ወላይታ ሶዶ ከተማ",
    "login.accessSystem": "መግባት / ስርዓቱን መድረስ",
    "hero.leadingBadge": "የኢትዮጵያ ከፍተኛ የወንጀል አስተዳደር መድረክ",
    "hero.welcome": "እንኳን በደህና መጡ",
    "hero.securePortal": "ወደ ደህንነቱ የተጠበቀ ፖርታል ግባ",
    "hero.emergency": "አደጋ: 911",
    "trust.iso": "የISO ማረጋገጫ",
    "trust.encryption": "256-ቢት ማስደበቂያ",
    "trust.support": "24/7 ድጋፍ",
    "features.platformTitle": "አጠቃላይ የወንጀል አስተዳደር መድረክ",
    "features.platformDesc":
      "የቴክኖሎጂ አዳዲስ ሀሳቦች ከየእለቱ ሕግ አስከባሪ ልምድ ጋር ይገናኛሉ። ለወንጀል መከላከያ፣ ምርመራ እና የማህበረሰብ ደህንነት ሁሉን አቀፍ መሣሪያዎችን እናቀርባለን።",
    "roles.designedFor": "ለሁሉም ተጠቃሚ የተዘጋጀ",
    "roles.designedForDesc":
      "በሚና መሰረት የሚመደብ መዳረሻ የእያንዳንዱን ፍላጎት ሳይጎድል ደህንነትን ይጠብቃል።",
    "testimonials.heading": "በሕግ አስከባሪዎች የተታመነ",
    "testimonials.subheading": "ስርዓቱ ስለምን እንደሚያስደንቅ ይህን ይካሄዱ",
    "cta.badge": "የደህንነት መዳረሻ ፖርታል",
    "cta.heading": "ወላይታ ሶዶን የበለጠ አስተማማኝ ለማድረግ ዝግጁ ነዎት?",
    "cta.subheading":
      "ለማህበረሰብ ደህንነት ተቀላቀሉ። ጉዳዮችን ያስተዳድሩ፣ ሪፖርቶችን ያስገቡ እና እንቅስቃሴዎችን ይከታተሉ።",
    "cta.enterPortal": "ወደ ፖርታሉ ግባ",
    "cta.learnMore": "ተጨማሪ ይወቁ",
    "footer.dept": "የወላይታ ሶዶ ከተማ ፖሊስ መምሪያ",
    "footer.emergency": "አደጋ: 911",
    "footer.location": "ወላይታ ሶዶ፣ ኢትዮጵያ",
    "footer.copyright":
      "© 2024 የወላይታ ሶዶ ከተማ የወንጀል አስተዳደር ስርዓት። መብቱ ተጠብቆ ይጠበቃል።",

    "login.accessLevel": "የመዳረሻ ደረጃ",
    "login.selectRole": "ሚናዎን ይምረጡ",
    "login.username": "የተጠቃሚ ስም",
    "login.usernamePlaceholder": "የተጠቃሚ ስምዎን ያስገቡ",
    "login.password": "የሚስጥር ቁልፍ",
    "login.passwordPlaceholder": "የሚስጥር ቁልፍዎን ያስገቡ",
    "login.secureLogin": "ደህንነታዊ መግቢያ",
    "login.authenticating": "በማረጋገጥ ላይ...",
    "login.errorFillFields": "እባክዎ ሁሉንም መስኮች ይሙሉ",
    "login.invalidCredentials": "የተሳሳተ መረጃ",
    "login.portalTitle": "የወንጀል አስተዳደር ስርዓት",
    "login.portalSubtitle": "የወላይታ ሶዶ ከተማ የደህንነት ፖርታል",
    "login.emergencyContact": "የአደጋ መደወያ: 911",

    "citizen.title": "የዜግነት ፖርታል",
    "citizen.subtitle": "የወንጀል ሪፖርቶችን ያስገቡና ይከታተሉ",
    "citizen.reportButton": "አዲስ ሪፖርት",
    "citizen.tabs.crimes": "የወንጀል ጉዳዮች",
    "citizen.tabs.incidents": "የክስተት ሪፖርቶች",

    "stats.totalReports": "አጠቃላይ ሪፖርቶች",
    "stats.underInvestigation": "በምርመራ ሂደት ላይ",
    "stats.resolved": "ተፈትኗል",
    "stats.avgResponse": "አማካኝ ምላሽ",
    "stats.days": "ቀናት",

    "search.placeholder": "ፈልግ...",
    "filters.status": "በሁኔታ አጣራ",
    "filters.category": "በምድብ አጣራ",
    "filters.type": "በአይነት አጣራ",
    "filters.allStatuses": "ሁሉም ሁኔታዎች",
    "filters.allCategories": "ሁሉም ምድቦች",
    "filters.allTypes": "ሁሉም አይነቶች",

    "general.viewDetails": "ዝርዝሮች ይመልከቱ",
    "general.reportDetails": "የሪፖርት ዝርዝር",
    "general.reportId": "የሪፖርት መለያ",
    "general.category": "ምድብ",
    "general.priority": "ቅድሚያ",
    "general.incidentDate": "የክስተት ቀን",
    "general.reportedDate": "የተሪፖረተ ቀን",
    "general.location": "አካባቢ",
    "general.description": "መግለጫ",
    "general.evidence": "ማስረጃ",
    "general.witnesses": "ምስክሮች",
    "general.currentStatus": "የአሁኑ ሁኔታ",
    "general.lastUpdated": "የመጨረሻ እዘማኝ",
    "general.statusHistory": "የሁኔታ ታሪክ",
    "general.provideAdditionalInfo": "ተጨማሪ መረጃ ይስጡ",
    "general.conversation": "ውይይት",
    "general.submitUpdate": "እዘማኝ ይላኩ",
    "general.noOfficerAssigned": "ሰራተኛ አልተመደበም",
    "general.pendingAssignment": "ይህ ሪፖርት ለመመደብ በመጠባበቅ ላይ ነው።",
    "general.cancel": "ሰርዝ",
    "general.submit": "አስገባ",
    "general.submitReport": "ሪፖርት አስገባ",
    "general.estimatedResolution": "ግምታዊ መፍትሄ",
    "general.notProvided": "አልተሰጠም",
    "general.notSelected": "አልተመረጠም",
    "general.evidenceFiles": "የማስረጃ ፋይሎች",
    "general.noFilesUploaded": "ምንም ፋይል አልተሰቀለም",
    "general.uploadEvidence": "ማስረጃ አስቀምጥ",
    "general.clickToUpload": "ፎቶ፣ ቪዲዮ ወይም ሰነዶችን ለመስቀል ጠቅ ያድርጉ",
    "general.maxFileSize": "ከፍተኛ መጠን: 10MB",
    "general.uploadingFiles": "ፋይሎችን በመስቀል ላይ...",
    "general.addWitness": "ምስክር አክል",
    "general.remove": "አስወግድ",

    "crime.form.title": "የክስተት ርዕስ *",
    "crime.form.category": "ምድብ *",
    "crime.form.date": "የክስተት ቀን *",
    "crime.form.priority": "ቅ��ሚያ",
    "crime.form.location": "አካባቢ *",
    "crime.form.description": "ዝርዝር መግለጫ *",
    "crime.form.placeholder.title": "ክስተቱን አጭር ይግለጹ",
    "crime.form.placeholder.location": "የአካባቢ አድራሻ ወይም መግለጫ",
    "crime.form.placeholder.description": "ዝርዝር መግለጫ ይስጡ...",

    "incident.form.title": "የክስተት ርዕስ *",
    "incident.form.type": "የክስተት አይነት *",
    "incident.form.severity": "ክብደት",
    "incident.form.dateOccurred": "የተከሰተበት ቀን *",
    "incident.form.location": "አካባቢ *",
    "incident.form.description": "መግለጫ *",

    "dialog.submitCrimeReportTitle": "የወንጀል ሪፖርት አስገባ",
    "dialog.submitCrimeReportDesc": "ስለሚያመለክቱት ክስተት ዝርዝር ይስጡ",
    "dialog.submitIncidentReportTitle": "የክስተት ሪፖርት አስገባ",
    "dialog.submitIncidentReportDesc": "ስለክስተቱ ዝርዝር ይስጡ",
    "tabs.details": "ዝርዝሮች",
    "tabs.status": "የሁኔታ ክትትል",
    "tabs.contact": "ከሰራተኛ ጋር ይገናኙ",
    "tabs.incident": "የክስተት ዝርዝር",
    "tabs.evidence": "ማስረጃ እና ምስክሮች",
    "tabs.review": "ክለም እና አስገባ",

    "empty.noReports": "ሪፖርት አልተገኘም",
    "empty.noReportsDesc": "እስካሁን ሪፖርት አልካተቱም ወይም ከፈለጉት ጋር አይመሳሰልም።",
    "empty.submitFirst": "የመጀመሪያውን ሪፖርት አስገባ",

    "status.reported": "ተሪፖረተ",
    "status.under_investigation": "በምርመራ ሂደት ላይ",
    "status.assigned": "ተመድቧል",
    "status.resolved": "ተፈትኗል",
    "status.closed": "ተዘግቷል",
    "status.rejected": "ተተርሷል",

    "incidentStatus.reported": "ተሪፖረተ",
    "incidentStatus.investigating": "በምርመራ ላይ",
    "incidentStatus.escalated": "ተጨማሪ ተሰጥቷል",
    "incidentStatus.resolved": "ተፈትኗል",
    "incidentStatus.closed": "ተዘግቷል",

    "category.theft": "ስርቆት",
    "category.assault": "ጥቃት",
    "category.burglary": "መስከረከር",
    "category.fraud": "ተናጋሪነት",
    "category.vandalism": "አባላት ጉዳት",
    "category.drug_offense": "የህክምና መድሀኒት ጥፋት",
    "category.domestic_violence": "ቤተሰብ ጥቃት",
    "category.traffic_violation": "የትራፊክ ጥፋት",
    "category.other": "ሌላ",

    "incidentType.patrol_observation": "የጥበቃ እይታ",
    "incidentType.citizen_complaint": "የዜግነት ክስተት",
    "incidentType.traffic_incident": "የትራፊክ ክስተት",
    "incidentType.suspicious_activity": "አስቸጋሪ እንቅስቃሴ",
    "incidentType.property_damage": "የንብረት ጉዳት",
    "incidentType.noise_complaint": "የማይጸድቅ ጩኸት",
    "incidentType.public_disturbance": "የሕዝብ ተውሳክ",
    "incidentType.emergency_response": "አደጋ ምላሽ",
    "incidentType.other": "ሌላ",

    "priority.low": "ዝቅተኛ",
    "priority.medium": "መካከለኛ",
    "priority.high": "ከፍተኛ",
    "priority.critical": "አስቸኳይ",
  },
  wo: {
    // Wolaytatto (Wolaita)
    "app.title": "Wolaytta Xoossa Qeyyanna Shishsha",
    "city.name": "Wolaytta Soodo Gaama",
    "login.accessSystem": "Qillaa",
    "hero.leadingBadge": "Itiyoophiya Heezzo Qeyyanna Shishsha Maadda",
    "hero.welcome": "Aykaashsha!",
    "hero.securePortal": "Shishsha Gaamanchuwaa Eqqa",
    "hero.emergency": "Aycce: 911",
    "trust.iso": "ISO Moosettida",
    "trust.encryption": "256-bit Qomishsha",
    "trust.support": "24/7 Qolanchuwi",
    "features.platformTitle": "Baalaa Qeyyanna Shishsha Maadda",
    "features.platformDesc":
      "Tekinoloojitti haaroi, heezzoassi azazanchuwassi gakkana. Qeyyanna, wossanchuwaa, kaaccuwaa qoppeessuwan baalaa ubbai berdiya.",
    "roles.designedFor": "Hakkane Dargaassi Dargaassi Gaamanko",
    "roles.designedForDesc":
      "Miishshai dargaassi gaamankuwaa erissi, shishshi wottido.",
    "testimonials.heading": "Heezzoassi Moosettida",
    "testimonials.subheading": "Shishshai ha ikkidoshshi, hee azeessite",
    "cta.badge": "Shishsha Gaamanchuwaa",
    "cta.heading": "Wolaytta Soodo Amanuwaa Woyyadanai?",
    "cta.subheading":
      "Amanuwaa woyyadanai koyyite. Case taaxxissuwaa, report qophissuwaa, woyyadanai qoppeessu.",
    "cta.enterPortal": "Gaamanchuwaa Eqqa",
    "cta.learnMore": "Roore Be’o",
    "footer.dept": "Wolaytta Soodo Gaama Heezzoassi Biroo",
    "footer.emergency": "Aycce: 911",
    "footer.location": "Wolaytta Soodo, Itiyoophiya",
    "footer.copyright":
      "© 2024 Wolaytta Soodo Gaama Qeyyanna Shishsha. Ubbai Qaxxishshido.",

    "login.accessLevel": "Gaamanchuwaa Minji",
    "login.selectRole": "Miishsha Doorate",
    "login.username": "Usuura Sunta",
    "login.usernamePlaceholder": "Usuura sunta eyyada",
    "login.password": "Qulfettaa",
    "login.passwordPlaceholder": "Qulfettaa eyyada",
    "login.secureLogin": "Shishshi Eqqa",
    "login.authenticating": "Nabbabbancho…",
    "login.errorFillFields": "Ubbai borchanchuwaa wo’ete",
    "login.invalidCredentials": "Qaxxishshida yanna",
    "login.portalTitle": "Qeyyanna Shishsha",
    "login.portalSubtitle": "Wolaytta Soodo Gaama Shishsha Gaamanchuwaa",
    "login.emergencyContact": "Aycce Qaxxishshi: 911",

    "citizen.title": "Mishira Shishsha",
    "citizen.subtitle": "Qeyyanna report qophissana qaxi",
    "citizen.reportButton": "Haaro Report",
    "citizen.tabs.crimes": "Case Shokka",
    "citizen.tabs.incidents": "Incident Reporta",

    "stats.totalReports": "Ubbai Reporta",
    "stats.underInvestigation": "Wossanchuwaa Gaassuwaa",
    "stats.resolved": "Phettana",
    "stats.avgResponse": "Gooti Qaxxishsha",
    "stats.days": "gakkana",

    "search.placeholder": "Hasi...",
    "filters.status": "Staatuse doorate",
    "filters.category": "Gishshsha doorate",
    "filters.type": "Ayiinta doorate",
    "filters.allStatuses": "Ubbai Staatuse",
    "filters.allCategories": "Ubbai Gishshsha",
    "filters.allTypes": "Ubbai Ayiinta",

    "general.viewDetails": "Qaqiisa La’ate",
    "general.reportDetails": "Report Qaqiisa",
    "general.reportId": "Report ID",
    "general.category": "Gishshsha",
    "general.priority": "Qaxxara",
    "general.incidentDate": "Incident Hayyi",
    "general.reportedDate": "Report Hayyi",
    "general.location": "Baaruwaa",
    "general.description": "Xawishsha",
    "general.evidence": "Beesha",
    "general.witnesses": "Markkubba",
    "general.currentStatus": "Wodee Staatuse",
    "general.lastUpdated": "Gammado Woddido",
    "general.statusHistory": "Staatuse Tariikha",
    "general.provideAdditionalInfo": "Ledote Xawishsha Mettidate",
    "general.conversation": "Woggaa",
    "general.submitUpdate": "Woddido Lakkisate",
    "general.noOfficerAssigned": "Officeri giddo danda’a",
    "general.pendingAssignment": "Hee report officerida danda’ana giddo.",
    "general.cancel": "Hakkisa",
    "general.submit": "Lakkisa",
    "general.submitReport": "Report Lakkisa",
    "general.estimatedResolution": "Qesho Phettana",
    "general.notProvided": "Alaa woy",
    "general.notSelected": "Doorantamme",
    "general.evidenceFiles": "Beesha Faayile",
    "general.noFilesUploaded": "Faayile pe'ino",
    "general.uploadEvidence": "Beesha Soqqisa",
    "general.clickToUpload": "Suuraa, video woy dokumenta soqqisa",
    "general.maxFileSize": "Max 10MB",
    "general.uploadingFiles": "Faayile soqqisana...",
    "general.addWitness": "Markkubba Leelisa",
    "general.remove": "Huna",

    "crime.form.title": "Incident Raqido *",
    "crime.form.category": "Gishshsha *",
    "crime.form.date": "Incident Hayyi *",
    "crime.form.priority": "Qaxxara",
    "crime.form.location": "Baaruwaa *",
    "crime.form.description": "Xawishsha *",
    "crime.form.placeholder.title": "Incident xawishsha lau",
    "crime.form.placeholder.location": "Baaruwaa xawishsha",
    "crime.form.placeholder.description": "Qaqisa xawishsha metti...",

    "incident.form.title": "Incident Raqido *",
    "incident.form.type": "Incident Ayiinta *",
    "incident.form.severity": "Qaxxara",
    "incident.form.dateOccurred": "Hayyi Geeshshido *",
    "incident.form.location": "Baaruwaa *",
    "incident.form.description": "Xawishsha *",

    "dialog.submitCrimeReportTitle": "Crime Report Lakkisa",
    "dialog.submitCrimeReportDesc": "Incident qaqisa xawishsha metti",
    "dialog.submitIncidentReportTitle": "Incident Report Lakkisa",
    "dialog.submitIncidentReportDesc": "Incident qaqisa xawishsha metti",
    "tabs.details": "Qaqiisa",
    "tabs.status": "Staatuse Qaxxishsha",
    "tabs.contact": "Officer Kaalessa",
    "tabs.incident": "Incident Qaqiisa",
    "tabs.evidence": "Beesha & Markkubba",
    "tabs.review": "Suqqisa & Lakkisa",

    "empty.noReports": "Report pe'ino",
    "empty.noReportsDesc": "Haani report pe'ite woy hasi giddo pe'ino.",
    "empty.submitFirst": "Qomma Report Lakkisa",

    "status.reported": "Reportiidi",
    "status.under_investigation": "Wossanchuwaa giddo",
    "status.assigned": "Danda’idi",
    "status.resolved": "Phettana",
    "status.closed": "Cufiidi",
    "status.rejected": "Addiidi",

    "incidentStatus.reported": "Reportiidi",
    "incidentStatus.investigating": "Wossanchuwaa giddo",
    "incidentStatus.escalated": "Heeqqe",
    "incidentStatus.resolved": "Phettana",
    "incidentStatus.closed": "Cufiidi",

    "category.theft": "Hanafa",
    "category.assault": "Gac'c'o",
    "category.burglary": "Gishsha c'irsa",
    "category.fraud": "Hogogga",
    "category.vandalism": "Harmmaasoy",
    "category.drug_offense": "Medhanit woshsha",
    "category.domestic_violence": "Mana giddo woshsha",
    "category.traffic_violation": "Traffic woshsha",
    "category.other": "Wole",

    "incidentType.patrol_observation": "Patrol Qaccisa",
    "incidentType.citizen_complaint": "Mishira Qachcha",
    "incidentType.traffic_incident": "Traffic Incident",
    "incidentType.suspicious_activity": "Shakkichi Ata",
    "incidentType.property_damage": "Qeexxuwaa Qoqisa",
    "incidentType.noise_complaint": "Gombba Qachcha",
    "incidentType.public_disturbance": "Hayo Qoqisa",
    "incidentType.emergency_response": "Aycce Xishsha",
    "incidentType.other": "Wole",

    "priority.low": "Qoma",
    "priority.medium": "Mitsi",
    "priority.high": "Heeqqe",
    "priority.critical": "Qicco",
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem("lang") as Lang) || "en",
  );

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const dict = translations[lang] || translations.en;

  const t = (key: string, fallback?: string) => {
    const v = dict[key] ?? translations.en[key];
    return v ?? fallback ?? key;
  };

  const value = useMemo(() => ({ lang, setLang, t }), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
