# EXP0S3D Platform

A platform dedicated to maintaining transparency in the cryptocurrency space.

## Database Configuration

**IMPORTANT**: This application uses MongoDB with the following configuration:
- Database Name: `exp0sed`
- Default URI: `mongodb://localhost:27017/exp0sed`
- Current backup location: `/Users/gabrielalbortam/Desktop/crypto exposed/backups/`

The application uses a single local database. We maintain one active backup file in the `backups` directory, with the format `backup-TIMESTAMP.gz`. The current backup file is `backup-2025-04-03T19-35-20-280Z.gz`.

### Current Backup Process
To create a new backup:
```bash
# This creates a backup with current timestamp
mongodump --uri="mongodb://localhost:27017/exp0sed" --archive=backups/backup-$(date +%Y-%m-%dT%H-%M-%S-%3NZ).gz --gzip
```

### Restore Process
To restore from our current backup:
```bash
# To restore while keeping existing data (safer option)
mongorestore --uri="mongodb://localhost:27017/exp0sed" --archive=backups/backup-2025-04-03T19-35-20-280Z.gz --gzip

# To restore and replace all existing data
mongorestore --uri="mongodb://localhost:27017/exp0sed" --archive=backups/backup-2025-04-03T19-35-20-280Z.gz --gzip --drop
```

**Current Database Status**:
- Main database: Active and running locally
- Current backup: `backup-2025-04-03T19-35-20-280Z.gz`
- Collections: profiles, admins, posts, comments, contacts

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

## Requirements

- Node.js v20.17.0 or higher
- MongoDB v4.4 or higher
- npm v8.0.0 or higher

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create `.env` file with required environment variables:
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/exp0sed

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
COOKIE_SECRET=your_cookie_secret

# Image Upload (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Available scripts:
```bash
# Start production server
npm start

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

2. **MongoDB Connection Issues**
- Ensure MongoDB service is running
- Check connection string in .env
- Verify database name is 'exp0sed'

## API Documentation

### Authentication
```bash
# Login
POST /api/auth/login
{
  "username": "admin",
  "password": "password"
}

# Response
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "username": "admin",
    "role": "admin"
  }
}
```

### Profiles

#### Create Profile
```bash
POST /api/profiles
Content-Type: application/json
Authorization: Bearer <token>

{
  "fileNumber": "HL-25W-93393",
  "name": "John Doe",
  "nationality": "USA",
  "totalScammedUSD": 1000000,
  "overview": "Minimum 50 characters describing the overview...",
  "status": "Draft"
}

# Response
{
  "success": true,
  "data": {
    "id": "profile_id",
    "fileNumber": "HL-25W-93393",
    ...
  }
}
```

#### List Profiles
```bash
GET /api/profiles?page=1&limit=10&status=Published

# Response
{
  "success": true,
  "data": {
    "profiles": [...],
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

#### Get Single Profile
```bash
GET /api/profiles/:fileNumber

# Response
{
  "success": true,
  "data": {
    "profile": {
      "fileNumber": "HL-25W-93393",
      ...
    }
  }
}
```

### Error Responses
All API endpoints follow this error format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Optional additional information
  }
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Contributing

Contact us through the platform's submission form to contribute information or report issues.

## Version

Current: 2.0.0

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
  methodology: [{
    point: String,
    description: String
  }],
  blockchainAddresses: [{
    address: String,
    chain: String,
    tag: String
  }],
  socialProfiles: [{
    platform: String,
    username: String,
    url: String
  }],
  chronology: [{
    date: Date,
    event: String,
    description: String
  }],
  associatedProjects: String,
  status: Enum['Draft', 'Published']
}
```

### Profile Management Scripts

The platform includes scripts for managing individual profiles:

```bash
# Backup a profile
node scripts/backupProfile.js <fileNumber>

# Delete a profile
node scripts/deleteProfile.js <fileNumber>

# Restore a profile from backup
node scripts/restoreProfile.js <fileNumber>
```

Backups are stored in `./backups/profile-<fileNumber>.json`

### Profile Extras API

Update additional profile information:
```bash
PUT /api/profile-extras/agent/:fileNumber/all

{
  "blockchainAddresses": [{
    "address": "0x...",
    "chain": "ethereum",
    "tag": "personal wallet"
  }],
  "socialProfiles": [{
    "platform": "twitter",
    "username": "@handle",
    "url": "https://..."
  }],
  "chronology": [{
    "date": "2024-03-20",
    "event": "Event title",
    "description": "Event details"
  }]
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
```