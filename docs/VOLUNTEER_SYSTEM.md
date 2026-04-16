# Volunteer Management System
## Didar Mubarak Pakistan

A comprehensive React Native mobile application for managing volunteer assignments, validations, approvals, badge printing, and dispatch for Didar Mubarak events.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Workflows](#workflows)
- [API Integration](#api-integration)
- [Getting Started](#getting-started)

## 🎯 Overview

This system provides a centralized platform to:
- Manage volunteer assignments for Didar events
- Validate volunteer data against the Enrollment System
- Handle approvals and discrepancies
- Generate badges and dispatch packages
- Provide real-time dashboards to leadership

## 🏗 Architecture

### Organizational Hierarchy
```
National Council
    ↓
Regional Councils (6 Regions)
    - Gilgit
    - Hunza
    - Gupis
    - Ishkoman
    - Lower Chitral
    - Upper Chitral
    ↓
Local Councils
    ↓
Jamat Khanas (Volunteer Sources)
```

### Access Levels (5 Levels)
| Level | Name | Band Color |
|-------|------|------------|
| 1 | Stage | Gold |
| 2 | Pandal | Royal Blue |
| 3 | Outside Holding Area | Lime Green |
| 4 | Outside Area | Orange |
| 5 | Health Area | Red |

## ✨ Features

### 1. Role-Based Access
- **View Only**: Dashboard access for monitoring
- **Maker**: Upload, validate, approve/reject, submit
- **Checker**: Review, print badges, prepare & dispatch

### 2. Excel Data Upload
- Upload volunteer data via Excel files
- Automatic validation (CNIC, duplicates, discrepancies)
- Real-time validation results

### 3. Validation Rules
- ❌ CNIC not found → Rejected
- ❌ Same duty duplicate → Rejected
- ⚠️ Different duties same event → Discrepant
- ⚠️ Multiple teams → Discrepant
- ℹ️ Multiple events → Flagged (allowed)

### 4. Badge Printing
- Batch printing by access level
- Color-coded bands
- Covering sheets with signature collection

### 5. Dispatch Management
- Package preparation
- Tracking by destination
- Complete audit trail

### 6. Leadership Dashboards
- Required vs Received progress
- Required vs Printed progress
- Regional breakdowns
- Event-wise statistics

## 📁 Project Structure

```
src/
├── components/
│   └── volunteer/
│       ├── VolunteerCard.tsx    # Volunteer info display
│       ├── StatsCard.tsx        # Dashboard statistics
│       ├── FilterBar.tsx        # Filter controls
│       ├── FileUpload.tsx       # Excel upload
│       └── index.ts
│
├── constants/
│   └── volunteerConstants.ts    # Master data & configs
│
├── context/
│   ├── AuthContext.tsx          # Authentication state
│   └── VolunteerContext.tsx     # Volunteer management state
│
├── navigation/
│   ├── AppNavigator.tsx         # Main navigation
│   └── VolunteerNavigator.tsx   # Role-based navigation
│
├── screens/
│   └── volunteer/
│       ├── MakerHomeScreen.tsx      # Maker dashboard
│       ├── VolunteerUploadScreen.tsx
│       ├── VolunteerReviewScreen.tsx
│       ├── CheckerHomeScreen.tsx    # Checker dashboard
│       ├── PrintBadgesScreen.tsx
│       ├── DispatchPackagesScreen.tsx
│       ├── DashboardScreen.tsx      # Leadership view
│       └── index.ts
│
├── services/
│   ├── api.ts                   # Base API service
│   ├── volunteerApi.ts          # Volunteer API service
│   └── tokenService.ts          # Token management
│
├── theme/
│   └── index.ts                 # Colors, fonts, spacing
│
├── types/
│   ├── index.ts                 # General types
│   └── volunteer.ts             # Volunteer system types
│
└── utils/
    └── base64.ts                # Utilities
```

## 👥 User Roles

### Level 1: View Only
- Access dashboards only
- Monitor progress and KPIs
- No edit capabilities

### Level 2: Maker (Regional)
- Upload volunteer data via Excel
- View validation results
- Handle discrepancies
- Approve/reject records
- Submit finalized data to Checker

### Level 3: Checker (Regional/National)
- Review submitted records
- National checker → view all regions
- Regional checker → view only their region
- Print badges in batches
- Print covering sheets
- Prepare dispatch packages

## 🔄 Workflows

### Maker Workflow
1. Upload Excel file with volunteer data
2. System validates (CNIC, duplicates, discrepancies)
3. Review validation results
4. Approve valid records
5. Handle discrepancies (approve/reject)
6. Submit approved records
7. System generates Volunteer IDs

### Checker Workflow
1. Receive submitted records
2. Review by region/access level
3. Select records for printing
4. Print badges in batches
5. Generate covering sheets
6. Prepare dispatch packages
7. Dispatch to source entities

## 🔌 API Integration

### Endpoints Structure
```
/api/volunteers          - Volunteer CRUD
/api/volunteers/upload   - Excel upload
/api/volunteers/approve  - Batch approval
/api/volunteers/submit   - Submit to checker
/api/enrollment/validate - CNIC validation
/api/print/batch        - Print management
/api/dispatch/package   - Dispatch management
/api/dashboard/stats    - Analytics
```

### Data Sources
- Local Councils
- Regional Event Managers
- ITREB (Reciters)
- Health Boards (Medical staff)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- React Native CLI
- Xcode (iOS) / Android Studio (Android)

### Installation
```bash
# Install dependencies
npm install

# iOS
cd ios && pod install && cd ..

# Run
npm run ios
# or
npm run android
```

### Environment Setup
Create `.env` file:
```env
API_BASE_URL=https://api-volunteer.azurewebsites.net
USE_MOCK_API=true
```

## 📊 Events (9 Total)

| Event # | Name | Location |
|---------|------|----------|
| 1-3 | Day 1-3 | Gilgit |
| 4-5 | Day 4-5 | Hunza |
| 6-7 | Day 6-7 | Chitral |
| 8 | Day 8 | Ishkoman |
| 9 | Grand Finale | Gilgit |

## 🎨 Badge Colors by Access Level

| Access Level | Band Color | Hex Code |
|--------------|------------|----------|
| Stage | Gold | #FFD700 |
| Pandal | Royal Blue | #4169E1 |
| Outside Holding | Lime Green | #32CD32 |
| Outside Area | Orange | #FFA500 |
| Health Area | Red | #FF0000 |

## 📱 Screenshots

*(Add screenshots here)*

## 📝 License

This project is proprietary software for Didar Mubarak Pakistan volunteer management.

## 🤝 Contributing

Contact the development team for contribution guidelines.

---

**Developed for Didar Mubarak Pakistan**
