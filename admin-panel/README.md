# Email to Discord Webhook Admin Panel

## Features
- Dynamic webhook mapping management
- Real-time stats tracking
- Secure admin authentication
- Easy configuration of email-to-webhook routes

## Setup

### Prerequisites
- Node.js
- MongoDB
- Existing Email to Discord webhook project

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Environment Variables
Create a `.env` file with the following:
```
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Running the Application
- Backend: `npm start`
- Frontend: `npm run frontend`

## Usage
- First user registered becomes the admin
- Add webhook mappings for specific emails or set a catchall webhook
- View real-time processing stats

## Security
- Role-based access control
- First user becomes admin
- Subsequent users are viewers by default

## Configuration
- Webhook mappings are stored in the `.env` file
- Supports email-specific and catchall webhook routes
- Real-time updates via Socket.IO

## Deployment
- Ensure MongoDB connection is properly configured
- Set appropriate environment variables in production
- Use a secure session secret
