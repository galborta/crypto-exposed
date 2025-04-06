# EXP0S3D Platform

A platform dedicated to maintaining transparency in the cryptocurrency space.

## Features

- Real-time tracking and documentation
- Community-driven reporting system
- Secure contact and submission forms
- Multi-chain address tracking
- Evidence-based documentation

## Tech Stack

- Node.js
- Express
- EJS Templates
- TailwindCSS
- MongoDB

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create `.env` file with required environment variables:
```
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
```
4. Run the application:
```bash
npm start
```

## API Endpoints

- `/api/contact` - Handle contact and entry submissions
- `/api/auth` - Authentication endpoints
- `/api/entries` - Entry management endpoints

## Contributing

Contact us through the platform's submission form to contribute information or report issues.

## Version

Current: 1.0.0

## License

All rights reserved © 2024 EXP0S3D

## Overview

EXP0S3D is a web-based platform that maintains a database of verified cryptocurrency scammers and their associated fraudulent activities. The platform serves two main purposes:

1. To warn potential victims about known scammers
2. To document and track the methods used in cryptocurrency fraud

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create .env):
```
MONGO_URI=mongodb://localhost:27017/blog
PORT=3000
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
COOKIE_SECRET=your_cookie_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. Start the development server:
```bash
npm run dev
```

## Architecture

### Frontend
- **Public Interface** (`/`)
  - View and search scammer profiles
  - Detailed profile views with evidence
  - Real-time statistics
- **Admin Dashboard** (`/admin`)
  - Profile management (CRUD)
  - Photo uploads via Cloudinary
  - Status management (Draft/Published)

### Backend
- **Node.js + Express**
- **API Routes** (`/api/profiles`)
  - GET `/`: List profiles (paginated)
  - GET `/:id`: Single profile
  - POST `/`: Create profile
  - PUT `/:id`: Update profile
  - DELETE `/:id`: Delete profile
  - GET `/stats`: Get statistics

### Database (MongoDB)
- **Collections**:
  - `profiles`: Scammer information
  - `admins`: Admin accounts

### Profile Schema
```javascript
{
  fileNumber: String,
  name: String,
  photoUrl: String,
  dateOfBirth: Date,
  age: Number,
  height: String,
  weight: String,
  nationality: String,
  placeOfBirth: String,
  totalScammedUSD: Number,
  overview: String (min 50 chars),
  story: String,
  methodology: String (min 50 chars),
  associatedProjects: String,
  status: Enum['Draft', 'Published']
}
```

## Security
- JWT authentication for admin access
- CSRF protection
- Cloudinary secure uploads
- Protected API endpoints

## Features
- ✅ Responsive design
- ✅ Real-time search
- ✅ Pagination
- ✅ Image optimization
- ✅ Form validation
- ✅ Secure file uploads
- ✅ Statistics dashboard

## API Usage

### List Profiles
```bash
GET /api/profiles?page=1&limit=10
```

### Create Profile
```bash
POST /api/profiles
Content-Type: application/json

{
  "name": "John Doe",
  "nationality": "USA",
  "totalScammedUSD": 1000000,
  ...
}
```

### Upload Photo
```bash
POST /api/profiles/:id/photo
Content-Type: multipart/form-data

photo: [file]
```

## App Overview

Crypto Exposed is a web-based platform that maintains a database of verified cryptocurrency scammers and their associated fraudulent activities. The platform serves two main purposes:
1. Provide a public registry of known crypto scammers to help potential victims avoid fraud
2. Allow authorized administrators to manage and maintain scammer profiles with verified evidence

## User Flows

### Public Users
1. **Homepage Access**
   - View list of exposed scammers
   - Search profiles by name or project
   - View detailed scammer profiles
   - Access statistics about total scams exposed

2. **Profile Viewing**
   - Click on profile cards to view detailed information
   - Access evidence and documentation
   - View associated fraudulent projects
   - See total amount scammed in USD

### Admin Users
1. **Authentication**
   - Secure login through `/admin` endpoint
   - JWT-based session management
   - Protected routes and API endpoints

2. **Profile Management**
   - Create new scammer profiles
   - Edit existing profiles
   - Update status (Active/Inactive)
   - Manage evidence and project documentation
   - Delete profiles when necessary

## Tech Stack & APIs

### Frontend
- EJS (Embedded JavaScript) for templating
- Tailwind CSS for styling
- Vanilla JavaScript for interactivity
- Responsive design for mobile compatibility

### Backend
- Node.js
- Express.js framework
- MongoDB for database
- Mongoose ODM
- JWT for authentication
- CSRF protection

### Security
- Helmet.js for security headers
- Rate limiting
- CSRF tokens
- Secure session management
- Protected API endpoints

### Development
- Nodemon for development
- Environment-based configuration
- Git for version control

## Core Features

### 1. Profile Management
- Scammer profiles with verified information
- Photo/avatar support
- Status tracking (Active/Inactive)
- Amount scammed tracking
- Associated projects documentation
- Evidence management

### 2. Search & Discovery
- Real-time profile search
- Filter by name or project
- Detailed profile views
- Statistics dashboard

### 3. Admin Dashboard
- Secure admin interface
- Profile CRUD operations
- Evidence verification
- Status management

### 4. Security
- Protected admin routes
- Secure authentication
- API protection
- CSRF prevention

## Scope Definition

### In-Scope
- ✅ Scammer profile management
- ✅ Public profile viewing
- ✅ Search functionality
- ✅ Admin authentication
- ✅ Basic statistics
- ✅ Evidence documentation
- ✅ Project association
- ✅ Status tracking
- ✅ Responsive design
- ✅ Security measures

### Out of Scope (Future Considerations)
- ❌ User registration/authentication
- ❌ Community reporting
- ❌ Profile verification workflow
- ❌ Blockchain integration
- ❌ Automated scam detection
- ❌ API for third-party integration
- ❌ Multi-language support
- ❌ Advanced analytics
- ❌ Email notifications
- ❌ Social media integration

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy .env.example to .env)
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Required environment variables:
```bash
MONGODB_URI=your_mongodb_uri
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
COOKIE_SECRET=your_cookie_secret

# Email Configuration (Gmail SMTP)
EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password
CONTACT_EMAIL=destination_email_address # Optional: For email forwarding
```

## Contributing

This is a private project. Please contact the repository owner for contribution guidelines.

## Version History

- v0.1.0 - Initial release with core features
  - Scammer profiles management
  - Public viewing interface
  - Admin dashboard
  - Search functionality
  - Basic statistics

### v0.9.8
- Added file upload support for entry submissions (images, PDFs, DOCs)

### v0.9.7
- Implemented email forwarding from Gmail to ProtonMail for contact forms

### v0.9.6
- Improved image cropping and upload functionality in admin profiles

### v0.9.5
- Updated Profile model schema
- Removed deprecated fields (evidence, description)
- Added new required fields (methodology, overview)
- Made story field optional

### v0.9.4
- Improved modal sections UI
- Fixed arrow rotation animations
- Enhanced section collapsing functionality
- Improved user experience with modal interactions

### v0.9.3
- Added database management documentation
- Implemented automated backup system
- Added backup scheduling configuration
- Enhanced system reliability and data safety

## Recent Improvements

### UI/UX Enhancements
- Improved mobile text readability
- Enhanced modal UX with click-outside-to-close
- Updated footer and text styling
- Optimized color scheme for better contrast
- Added Bianzhidai font to logo

### Technical Improvements
- Implemented image cropping with aspect ratio control
- Enhanced form validation and error handling
- Improved data persistence and state management
- Added comprehensive backup solutions
- Optimized database schema

### Security Updates
- Enhanced CSRF protection
- Improved session handling
- Secure image upload process
- Protected API endpoints

## Database Management

### MongoDB Configuration
The application uses MongoDB as its primary database. The database connection is configured in `server.js` and uses the following environment variables:

```bash
MONGODB_URI=mongodb://localhost:27017/blog  # Database connection string
```

Key database features:
- Automatic connection retry
- Connection pooling
- Error logging and monitoring
- Real-time statistics tracking

### Automated Backup System

The platform includes a robust automated backup system that ensures data safety:

#### Backup Schedule
- Automatic daily backups at 3:00 AM
- Both local and cloud storage
- 7-day retention policy

#### Backup Components
1. **Local Backups**
   - Location: `./backups` directory
   - Format: Compressed MongoDB dumps (.gz)
   - Naming: `backup-[TIMESTAMP].gz`

2. **Cloud Backups**
   - Storage: Cloudinary
   - Folder: `database_backups`
   - Secure encrypted storage
   - Accessible via Cloudinary dashboard

#### Backup Scripts
- `scripts/backup.js`: Main backup script
- `scripts/cron-backup.sh`: Scheduler script
- Logs stored in `./logs` directory

#### Restore Process
To restore from a backup:

```bash
# From local backup
mongorestore --gzip --archive=backups/[backup-file].gz

# From cloud backup
curl -o restore.gz [cloudinary-url] && mongorestore --gzip --archive=restore.gz
```

#### Monitoring
- Success/failure logs in `logs/backup.log`
- Error logs in `logs/backup-error.log`
- Cloudinary upload confirmations
- Automatic cleanup of old backups

### Contact System
- **Contact Form**
  - Required fields: Name, Contact Info, Message
  - Optional subject field
  - Email notifications via Gmail SMTP
  
- **Entry Submission**
  - Flexible form with optional fields:
    - Subject Name
    - Twitter Handle
    - Wallet Addresses
    - Additional Information
    - File Attachments (up to 5 files, 5MB each)
  - Supported file types: Images (JPEG, PNG, GIF), PDF, DOC/DOCX
  - Automatic file cleanup after email sending

