
# ParkEase – Smart Parking Slot Booking and Management System

## About the Project

ParkEase is a web-based Smart Parking Slot Booking and Management System designed to simplify parking management.

The system allows customers to view available parking spaces and reserve slots. Administrators can manage parking locations, zones, slots, users, bookings, payments, and reports. Parking operators and security staff can manage vehicle entry and exit.

The application helps reduce manual parking operations, improves slot utilization, and provides better visibility into parking activities.

## Key Features

- User registration and login with role-based access.
- Parking location and zone management.
- Parking slot creation and management.
- Real-time parking availability.
- Online parking slot reservation.
- Vehicle entry and exit tracking.
- Automatic parking duration calculation.
- Parking fee calculation based on vehicle type and duration.
- Payment management.
- Admin dashboard with parking statistics.
- User and role management.

## User Roles

| Role | Responsibilities |
|---|---|
| Admin | Manage locations, zones, slots, users, bookings, payments and reports |
| Customer | View available slots, reserve parking and view bookings and payments |
| Parking Operator | Monitor parking operations and manage vehicle entry and exit |
| Security Staff | Record vehicle entry and exit at the parking facility |

## Reports

The system provides four important reports:

1. Slot Occupancy Report
2. Booking Report
3. Revenue Report
4. Vehicle Entry/Exit Report

## Technology Stack

### Frontend
- React.js
- JavaScript
- HTML
- CSS
- Vite

### Backend
- Node.js
- Express.js
- REST API

### Database
- MongoDB Atlas
- Mongoose

### Deployment and DevOps
- Docker
- Docker Compose
- Kubernetes
- Minikube

### Development Tools
- Visual Studio Code
- Postman
- Git
- GitHub

## Project Structure

```text
ParkEase/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── Dockerfile
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   └── services/
│   └── Dockerfile
│
├── k8s/
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
│
├── docker-compose.yml
├── package.json
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/HumeraMahaveen/ParkEase-Smart-Parking-System.git
cd ParkEase-Smart-Parking-System
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder and configure your MongoDB Atlas connection, JWT secret, and other environment variables required by the backend.

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Configure the frontend API URL to point to your running backend.

### 4. Deployment

The project also includes Docker and Kubernetes configuration files for containerization and deployment.

## Project Objectives

- Simplify parking slot booking and management.
- Reduce manual parking management.
- Track vehicle entry and exit.
- Calculate parking charges based on duration and vehicle type.
- Monitor parking occupancy and revenue.
- Provide separate access for different user roles.

## Future Enhancements

- QR-code-based parking entry.
- Online payment gateway integration.
- Live parking availability updates.
- Mobile application support.
- Smart sensor integration for automatic slot detection.

## Author

**Humera Mahaveen**

GitHub: [HumeraMahaveen](https://github.com/HumeraMahaveen)

## License

This project was developed for academic purposes.
