# Zenith Zephyr Void

A modern blog platform with Express.js server, MongoDB integration, and anonymous commenting capabilities.

## Project Overview

Zenith Zephyr Void is a blog platform designed for publishing articles and allowing readers to comment using pseudonyms without registration requirements. The platform focuses on the content and discussions rather than user identities.

## Features

- Article publishing system
- Anonymous comment functionality
- No registration required
- MongoDB database integration
- Express.js backend
- Clean, responsive design
- Admin dashboard for content management
- Environment configuration
- Error handling middleware

## Project Structure

```
├── controllers/       # Controllers for handling business logic
├── models/            # Data models
├── public/            # Static assets
│   ├── css/           # CSS files
│   ├── js/            # JavaScript files
│   └── images/        # Image files
├── routes/            # Route definitions
├── views/             # HTML views
├── .env               # Environment variables
├── .eslintrc.json     # ESLint configuration
├── .prettierrc        # Prettier configuration
├── server.js          # Application entry point
└── package.json       # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/first-project-with-claude.git
   cd first-project-with-claude
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   NODE_ENV=development
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Visit `http://localhost:3000` in your browser

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run format` - Format code with Prettier

## License

This project is licensed under the ISC License. 