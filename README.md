# MediConnect: AI-Based Medical Document Summarization and Appointment System

MediConnect is a complete, full-stack healthcare web application designed to simplify medical appointment scheduling, organize patient medical records, and help doctors review relevant medical history efficiently.

The system incorporates Artificial Intelligence to summarize uploaded medical records (PDF documents) into structured, concise clinical summaries with strict patient privacy and authorization controls.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Prerequisites](#prerequisites)
5. [Quick Start Guide (Windows)](#quick-start-guide-windows)
6. [Database Setup (MySQL)](#database-setup-mysql)
7. [Environment Configuration](#environment-configuration)
8. [AI Document Summarization (Gemini & Mock Mode)](#ai-document-summarization)
9. [Google OAuth 2.0 Integration](#google-oauth-20-integration)
10. [REST API Documentation](#rest-api-documentation)
11. [Running Tests](#running-tests)
12. [Troubleshooting & FAQ](#troubleshooting--faq)
13. [Security & Privacy Guarantees](#security--privacy-guarantees)

---

## 1. Key Features

### Patient Management
- **Role-based Authentication**: Email/Password registration and login, Google Sign-In with server-side token verification.
- **Find Specialists**: Search and filter approved doctors by specialization, city, consultation fee, and rating.
- **Appointment Scheduling**: Multi-step booking workflow with real-time available time slots and database-enforced conflict prevention (zero double-booking).
- **Personalized Patient Dashboard**: View upcoming and completed consultations, track status, and cancel appointments.
- **Verified Reviews**: Submit 1 to 5 star ratings and reviews for completed consultations.

### Medical Document Vault & AI Summarization
- **Secure PDF Upload**: Validated file type, size limits (10MB), and isolated private server storage (no public static URLs).
- **Text Extraction**: Automatic PDF text extraction powered by `pdf-parse`.
- **Structured 9-Section Clinical AI Summary**:
  1. Patient Information
  2. Document Dates and Types
  3. Previously Documented Medical Conditions
  4. Previous Treatments and Medications
  5. Allergies Documented in the Records
  6. Important Laboratory Results (preserving exact units & reference intervals)
  7. Other Relevant Medical Findings
  8. Information Requiring Doctor Review (discrepancy & conflict flags)
  9. Missing or Unclear Information
  - **Clinical Safety Disclaimer**: Explicitly marks output as AI-generated for licensed professional review.
- **Patient Sharing & Consent Controls**:
  - Review summary before sharing.
  - Explicitly grant or revoke doctor access per appointment.
  - Keep records completely private.

### Doctor Portal
- **Doctor Registration & Verification**: Comprehensive credential submission (qualifications, medical license, clinic address, fee). Placed in `pending` verification status until administrator approval.
- **Consultation Dashboard**: Daily patient queue, appointment status lifecycle (`confirmed`, `completed`, `cancelled`), patient chief complaints, and access indicators.
- **Pre-Consultation Clinical Insight**: Access AI summaries and original PDF records only when patient authorization is granted.
- **Private Doctor Notes**: Secure clinical notes visible only to the attending physician.
- **Availability Schedule**: Configure working days, start/end times, and 30-minute consultation slots.

### Administrator Console
- **Doctor Credential Verification**: Review license numbers, qualifications, and approve, reject, or suspend doctor accounts.
- **System Statistics**: Monitor total doctors, patients, and booked appointments.
- **Protected Access**: Dedicated admin portal seeded with initial administrative credentials.

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js 19 with Vite
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios with request/response authorization interceptors
- **Icons**: Lucide React
- **Styling**: Healthcare design system (Clean white palette with teal `#0d9488` and blue `#0284c7` accents, responsive CSS)

### Backend
- **Runtime**: Node.js v20+ / v24+
- **Server Framework**: Express.js REST API
- **Database Connector**: `mysql2/promise` with connection pooling
- **Security**: `bcryptjs` password hashing, `jsonwebtoken` (JWT), `express-rate-limit`, CORS origin control
- **File Handling**: `multer` with MIME-type filtering and randomized hex storage names
- **Document Processing**: `pdf-parse` for text extraction
- **AI Engine**: Google Gemini API (`@google/genai` / REST) with automated development fallback mode

### Database
- **Engine**: MySQL 8.0+
- **Schema**: 11 normalized relational tables with foreign keys, cascading constraints, and indexes.

---

## 3. Folder Structure

```
MediConnect/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── DoctorCard.jsx
│   │   │   ├── AppointmentCard.jsx
│   │   │   ├── MedicalRecordCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Notification.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── RoleSelection.jsx
│   │   │   ├── PatientLogin.jsx
│   │   │   ├── PatientRegister.jsx
│   │   │   ├── DoctorLogin.jsx
│   │   │   ├── DoctorRegister.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── DoctorList.jsx
│   │   │   ├── DoctorDetails.jsx
│   │   │   ├── BookAppointment.jsx
│   │   │   ├── BookingConfirmation.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── MedicalRecords.jsx
│   │   │   ├── AppointmentDetails.jsx
│   │   │   ├── DoctorProfile.jsx
│   │   │   ├── PatientProfile.jsx
│   │   │   ├── ReviewPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── doctorService.js
│   │   │   ├── appointmentService.js
│   │   │   ├── medicalRecordService.js
│   │   │   └── reviewService.js
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── auth.css
│   │   │   ├── dashboard.css
│   │   │   ├── doctors.css
│   │   │   ├── appointments.css
│   │   │   └── medical-records.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── environment.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   ├── medicalRecordController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── errorHandler.js
│   │   └── uploadValidation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── MedicalRecord.js
│   │   ├── Review.js
│   │   ├── DoctorAvailability.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── medicalRecordRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── adminRoutes.js
│   ├── services/
│   │   ├── googleAuthService.js
│   │   ├── documentExtractionService.js
│   │   ├── medicalSummaryService.js
│   │   └── fileStorageService.js
│   ├── utils/
│   │   ├── AppError.js
│   │   └── asyncHandler.js
│   ├── uploads/                  # Private secure medical file storage
│   ├── scripts/
│   │   ├── initDb.js             # Automated database creation & seed script
│   │   └── verifyDeps.js
│   ├── tests/
│   │   ├── api.test.js           # End-to-end API test suite
│   │   └── medicalRecord.test.js # PDF extraction & summarization tests
│   ├── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── database/
│   ├── schema.sql                # Complete relational MySQL schema DDL
│   └── sample_data.sql           # Development seed dataset
│
├── .gitignore
└── README.md
```

---

## 4. Prerequisites

1. **Node.js**: Version 20.0.0 or higher (`node -v`)
2. **npm**: Version 9.0.0 or higher (`npm -v`)
3. **MySQL Server**: MySQL 8.0+ or MariaDB 10.5+ (e.g. via MySQL Community Server, XAMPP, or WAMP)

---

## 5. Quick Start Guide (Windows)

### Step 1: Open Terminal in Project Directory
```powershell
cd d:\MediConnect
```

### Step 2: Configure Environment Files
Both `backend/.env` and `frontend/.env` have been pre-created. You can inspect or customize them:
```powershell
# Backend configuration
notepad d:\MediConnect\backend\.env

# Frontend configuration
notepad d:\MediConnect\frontend\.env
```

### Step 3: Start the Backend Server
```powershell
cd d:\MediConnect\backend
npm start
```
The backend server starts at: `http://localhost:5001`

> **Note on Database Connection**: If MySQL is running on `localhost:3306`, MediConnect connects directly to MySQL. If your local MySQL service is not yet started, the server automatically activates a self-contained In-Memory Development Store so you can immediately explore and test all features without interruption!

### Step 4: Start the Frontend Application
In a separate terminal window:
```powershell
cd d:\MediConnect\frontend
npm run dev
```
Open your browser and navigate to: `http://localhost:5173`

---

## 6. Database Setup (MySQL)

When you are ready to use persistent MySQL storage:

### Option A: Automated Setup Script
MediConnect includes an automated initialization script that connects to MySQL, creates the `mediconnect` database, runs `schema.sql`, and seeds initial sample records:

```powershell
cd d:\MediConnect\backend
npm run db:init
```

### Option B: Manual MySQL CLI Commands
Alternatively, execute the SQL files directly using the MySQL command line client:
```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mediconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p mediconnect < d:\MediConnect\database\schema.sql
mysql -u root -p mediconnect < d:\MediConnect\database\sample_data.sql
```

### Pre-Seeded Development Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Administrator** | `admin@mediconnect.local` | `Admin@123456` | Platform compliance and doctor approvals |
| **Cardiologist** | `sarah.jenkins@mediconnect.local` | `Doctor@123456` | Dr. Sarah Jenkins (Approved, Seattle) |
| **Dermatologist** | `alex.patel@mediconnect.local` | `Doctor@123456` | Dr. Alexander Patel (Approved, Seattle) |
| **Neurologist** | `elena.rostova@mediconnect.local` | `Doctor@123456` | Dr. Elena Rostova (Approved, San Francisco) |
| **Pediatrician** | `marcus.chen@mediconnect.local` | `Doctor@123456` | Dr. Marcus Chen (Approved, New York) |
| **Pending Doctor** | `olivia.vance@mediconnect.local` | `Doctor@123456` | Dr. Olivia Vance (Pending admin verification) |
| **Patient** | `patient@mediconnect.local` | `Patient@123456` | John Doe (Sample Patient) |

---

## 7. Environment Configuration

### Backend (`backend/.env`)

```ini
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mediconnect
DB_CONNECTION_LIMIT=10

# Security
JWT_SECRET=mediconnect-super-secure-production-ready-jwt-secret-key-2026
JWT_EXPIRES_IN=24h

# Google OAuth 2.0 (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# AI Document Summarization (Google Gemini API)
LLM_API_KEY=
LLM_MODEL=gemini-1.5-flash
ENABLE_MOCK_SUMMARIZATION=true

# Private Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
```

### Frontend (`frontend/.env`)

```ini
VITE_API_BASE_URL=/api
VITE_GOOGLE_CLIENT_ID=
```

---

## 8. AI Document Summarization

MediConnect uses an AI summarization pipeline to turn multi-page medical PDFs into an easily readable, 9-section clinical document summary.

### Real Google Gemini API Mode
To use the live Gemini LLM API:
1. Obtain an API key from Google AI Studio: `https://aistudio.google.com/`
2. Open `backend/.env` and configure:
   ```ini
   LLM_API_KEY=your_actual_gemini_api_key_here
   LLM_MODEL=gemini-1.5-flash
   ENABLE_MOCK_SUMMARIZATION=false
   ```
3. Restart the backend server. Uploaded PDFs will be summarized directly by Google Gemini into the structured 9-section format.

### Intelligent Mock Summarization Mode
When developing offline or without an API key:
- Set `ENABLE_MOCK_SUMMARIZATION=true` in `backend/.env` (or leave `LLM_API_KEY` blank).
- The system automatically engages the mock summarizer. It parses the document text, extracts vital signs, laboratory parameters, and medications, and produces an authentic 9-section structured summary clearly labeled with:
  `[DEVELOPMENT MOCK AI-GENERATED MEDICAL SUMMARY]`

---

## 9. Google OAuth 2.0 Integration

MediConnect supports Google Sign-In for patients and healthcare providers.

### Configuration
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create an **OAuth 2.0 Client ID** (Web Application).
3. Set Authorized JavaScript origins to `http://localhost:5173`.
4. Copy your Client ID into `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).

### Server-Side Security
The backend uses Google's official `google-auth-library` to cryptographically verify Google ID tokens. The server checks the token's audience against the registered Client ID. MediConnect never treats Google Sign-In as proof of medical qualifications; doctors registering via Google still require administrative credential approval.

---

## 10. REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register/patient` - Register a new patient
- `POST /api/auth/register/doctor` - Register a new doctor (pending verification status)
- `POST /api/auth/login` - Sign in with email and password
- `POST /api/auth/google` - Sign in with Google ID token
- `GET /api/auth/me` - Get authenticated user profile

### Doctor Directory (`/api/doctors`)
- `GET /api/doctors` - Search and filter approved doctors (`specialization`, `city`, `minFee`, `maxFee`, `minRating`, `search`)
- `GET /api/doctors/specializations` - List all available specializations
- `GET /api/doctors/:id` - View full doctor profile and reviews
- `GET /api/doctors/:id/availability?date=YYYY-MM-DD` - Get available time slots for a specific date
- `PUT /api/doctors/profile` - Update doctor profile (Doctor only)
- `PUT /api/doctors/availability` - Update working schedule (Doctor only)

### Appointments (`/api/appointments`)
- `POST /api/appointments` - Book appointment (enforces slot conflict validation)
- `GET /api/appointments/my` - View current user's appointments
- `GET /api/appointments/:id` - View appointment details with authorized records
- `PATCH /api/appointments/:id/cancel` - Cancel appointment with reason
- `PATCH /api/appointments/:id/status` - Update status (`confirmed`, `completed`, `rejected`)
- `PATCH /api/appointments/:id/notes` - Record private doctor notes
- `GET /api/appointments/:id/summary` - Get AI medical summary for consultation
- `POST /api/appointments/:id/summary/share` - Patient grants doctor access to summary
- `POST /api/appointments/:id/summary/revoke` - Patient revokes doctor access to summary

### Medical Records (`/api/medical-records`)
- `POST /api/medical-records/upload` - Upload PDF document (auto-triggers extraction & summary)
- `GET /api/medical-records/my` - List patient's uploaded records
- `GET /api/medical-records/:id/download` - Secure streaming download (authorized users only)
- `DELETE /api/medical-records/:id` - Delete record and storage file
- `POST /api/medical-records/:id/summarize` - Regenerate AI summary

### Reviews (`/api/reviews`)
- `POST /api/reviews` - Submit review for completed appointment (rating 1-5)
- `GET /api/reviews/doctor/:id` - Get reviews for a doctor
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Administrator (`/api/admin`)
- `GET /api/admin/doctors` - View all registered doctors and verification status
- `PATCH /api/admin/doctors/:id/approve` - Approve doctor for public search
- `PATCH /api/admin/doctors/:id/reject` - Reject doctor application
- `PATCH /api/admin/doctors/:id/suspend` - Suspend doctor account
- `GET /api/admin/stats` - View platform overview statistics

---

## 11. Running Tests

MediConnect includes an automated integration test suite covering authentication, appointment conflict prevention, doctor directory filtering, access control permissions, PDF parsing, and AI summarization.

Execute the test suite from the backend directory:
```powershell
cd d:\MediConnect\backend
npm test
```

Expected output:
```
✔ GET /api/health should return status healthy
✔ POST /api/auth/login should authenticate seeded patient
✔ POST /api/auth/login should authenticate seeded approved doctor
✔ POST /api/auth/login should authenticate seeded administrator
✔ POST /api/auth/register/patient should register a new patient
✔ GET /api/doctors should only return approved doctors
✔ GET /api/doctors?specialization=Cardiology should filter correctly
✔ GET /api/doctors/:id/availability should calculate slots for a weekday
✔ POST /api/appointments should book an appointment and reject duplicate slot (409 Conflict)
✔ GET /api/admin/doctors should reject unauthorized patient with 403
✔ GET /api/admin/doctors should allow administrator
✔ PATCH /api/admin/doctors/:id/approve should approve pending doctor
✔ GET /api/appointments/:id should enforce authorization
✔ POST /api/appointments/:id/summary/share should record patient consent
✔ POST /api/appointments/:id/summary/revoke should revoke doctor access
✔ PATCH /api/appointments/:id/cancel should cancel appointment
✔ POST /api/medical-records/upload should upload a valid PDF and generate summary
✔ GET /api/medical-records/my should list patient records
✔ GET /api/medical-records/:id/download should securely stream file to patient
✔ GET /api/medical-records/:id/download should reject unauthorized user
```

---

## 12. Troubleshooting & FAQ

### 1. `ECONNREFUSED 127.0.0.1:3306`
- **Cause**: MySQL server is not started on your machine.
- **Solution**: Start your MySQL daemon (via XAMPP Control Panel, MySQL Workbench, or Windows Services). In the meantime, MediConnect automatically operates using its built-in in-memory development store so you can test all features immediately.

### 2. Frontend says "Network Error" or `ECONNRESET` when calling APIs
- **Cause**: Windows reserves port 5000 for internal system services (SSDP/UPnP), which triggers `ECONNRESET` or `EACCES` when user applications attempt to bind to it.
- **Solution**: MediConnect is pre-configured to run on port `5001`. Ensure the backend is started with `npm start` in `d:\MediConnect\backend`, and the Vite proxy in `frontend/vite.config.js` forwards `/api` to `http://localhost:5001`.

### 3. File upload fails with `LIMIT_FILE_SIZE`
- **Cause**: Uploaded PDF exceeds the configured size limit (10MB).
- **Solution**: Upload documents under 10MB or adjust `MAX_FILE_SIZE_MB` in `backend/.env`.

### 4. Doctor does not appear in public search
- **Cause**: Newly registered doctors are in `pending` verification status.
- **Solution**: Log into the Admin Portal (`admin@mediconnect.local` / `Admin@123456`) and click **Approve Doctor**.

---

## 13. Security & Privacy Guarantees

1. **Private Storage**: Uploaded medical PDFs are saved in `backend/uploads/` with randomly generated 128-bit hex filenames. Files are never served as static public URLs.
2. **Access Control**: Downloading a document requires JWT authentication and checks that the user is the owning patient or an assigned doctor who has been explicitly granted patient consent.
3. **No Plaintext Passwords**: All user passwords are salted and hashed using `bcrypt` (10 rounds).
4. **Audit Logging**: Consent grants, revocations, appointment creations, and unauthorized access attempts are recorded in the `audit_logs` table.
5. **Double-Booking Protection**: Database checks verify that no existing active appointment occupies the doctor's requested time window before booking is finalized.
6. **Clinical Safety**: All AI summaries include a prominent medical disclaimer emphasizing that AI summaries are for healthcare professional review only and do not constitute independent medical diagnoses.
