# Crypto Exposed Platform

A platform dedicated to exposing cryptocurrency scammers and protecting potential victims by providing verified information about known scams and fraudulent actors in the crypto space.

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
```
MONGODB_URI=your_mongodb_uri
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
COOKIE_SECRET=your_cookie_secret
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