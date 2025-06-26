# StayFinder 🏠

A modern property rental platform similar to Airbnb, built with React, Node.js, and MongoDB.

## Features

- 🔍 Search and browse property listings
- 📱 Responsive design for all devices
- 🔐 User authentication and authorization
- 📅 Booking management system
- 🏠 Property listing management for hosts
- 👤 User role management (Host/User)
- 🔄 Seamless role switching
- 📊 Host dashboard with property statistics
- 💳 (Optional) Payment integration
- 🗺️ (Optional) Map integration

## Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router v6
- Axios
- Context API for state management

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Express Validator
- Bcrypt
- Cors
- Dotenv

## Project Structure

```
stayfinder/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── contexts/   # React Context providers
│   │   ├── pages/      # Page components
│   │   └── api/        # API integration
├── backend/            # Node.js/Express backend server
│   ├── src/
│   │   ├── controllers/# Route controllers
│   │   ├── models/     # Database models
│   │   ├── routes/     # API routes
│   │   └── services/   # Business logic
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/stayfinder.git
cd stayfinder
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Install backend dependencies:

```bash
cd ../backend
npm install
```

4. Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stayfinder
JWT_SECRET=your_jwt_secret
```

5. Start the development servers:

Frontend:

```bash
cd frontend
npm run dev
```

Backend:

```bash
cd backend
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## API Documentation

### Authentication Endpoints

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- PUT /api/auth/become-host - Upgrade user to host role

### Listings Endpoints

- GET /api/listings - Get all listings
- GET /api/listings/:id - Get listing by ID
- POST /api/listings - Create new listing (host only)
- PUT /api/listings/:id - Update listing (host only)
- DELETE /api/listings/:id - Delete listing (host only)

### Bookings Endpoints

- POST /api/bookings - Create new booking
- GET /api/bookings - Get user's bookings
- GET /api/bookings/:id - Get booking details
- PUT /api/bookings/:id - Update booking status
- GET /api/bookings/host - Get host's property bookings

## Features Implementation

### User Roles

- Users can register and login with email/password
- Default role is "user" with booking capabilities
- Users can upgrade to "host" role to list properties
- Hosts retain user capabilities (can both book and list properties)

### Host Dashboard

- Property management (create, edit, delete listings)
- Booking overview for host's properties
- Statistics (total listings, bookings, revenue)
- Quick access to create new listings

### Property Listings

- Rich property details (title, description, location)
- Multiple images support
- Amenities selection
- Pricing and guest capacity settings
- Availability management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
