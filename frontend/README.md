# NESTOVA HOTEL BOOKING APP

## The Project Description

This is a full-stack Hotel Booking Application developed to allow users to explore hotels, view accommodation details, select room types and make reservations online.

The website was built using React, TypeScript, Redux Toolkit, Node.js, Express.js, PostgreSQL and CSS Modules. It was developed using reusable React components, Redux Store and REST API integration to manage application data and functionality.

The application provides two main user roles: Administrators and ordinary Users.

Administrators can manage hotel listings, room types and customer reservations through an administration dashboard. Users can register, log in, browse available hotels, view room information and submit booking requests.

The NESTOVA application aims to provide a convenient and user-friendly hotel reservation experience.

## Installation and Set-up

### 1. Technologies and Dependencies

The following technologies and packages were used:

```bash
react
react-dom
typescript
react-redux
@reduxjs/toolkit
react-router-dom
axios
express
pg
jsonwebtoken
dotenv
```

Additional backend and development dependencies may include:

```bash
npm install
```

### 2. Clone Repository

Clone the project repository:

```bash
git clone https://github.com/khethiwengema04-gif/HotelApplication.git
```

Navigate into the project folder:

```bash
cd NESTOVA
```

### 3. Install Dependencies

For the frontend:

```bash
cd frontend
npm install
```

For the backend:

```bash
cd backend
npm install
```

### 4. Environment Configuration

Created a `.env` file in the backend folder and configure the database connection and other required environment variables.


```env
DB_USER=your_database_user
DB_HOST=localhost
DB_DATABASE=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432

PORT=5000
JWT_SECRET=your_jwt_secret
```

Use your actual database credentials and environment configuration. Do not upload passwords or secret keys to GitHub.

## Run App

### 1. Run the Frontend

```bash
npm run dev
```

```text
http://localhost:5173
```

### 2. Run the Backend

Open another terminal in the backend folder:

```bash
npm run dev
```

The backend server runs on the configured port, which is usually:

```text
http://localhost:5000
```

### 3. Database

Make sure PostgreSQL is running and that the NESTOVA database and required tables have been created.

The backend connects to PostgreSQL using the configured environment variables.

## Commits

The following Git commands are used to save and upload project changes:

```bash
git add .
git commit -m "Add description of changes"
git push
```

To retrieve the latest changes:

```bash
git pull
```

## Tech Stack

### 1. React

React was used to build the user interface through reusable components. It allows different sections of the application to be developed and maintained separately.

### 2. TypeScript

TypeScript was used to add static typing to the frontend and backend code. It helps identify errors and improves code organisation.

### 3. Redux Toolkit

Redux Toolkit was used for centralised state management. It manages application data and asynchronous operations through Redux slices and `createAsyncThunk`.

### 4. React Router

React Router was used to navigate between application pages, including the landing page, login, registration, home page and administration pages.

### 5. Axios

Axios was used to send HTTP requests between the frontend and backend API endpoints.

### 6. CSS Modules

CSS Modules were used to style individual React components while keeping their styles separate and organised.

### 7. Node.js

Node.js was used as the runtime environment for the backend application.

### 8. Express.js

Express.js was used to create the backend server, configure API routes and handle client requests.

### 9. PostgreSQL

PostgreSQL was used as the relational database to store user accounts, hotels, room types, bookings and other application information.

### 10. JSON Web Token (JWT)

JWT was used for authentication and securing protected API endpoints. It helps identify authenticated users and restrict administrative operations.

### 11. Cloudinary

Cloudinary was introduced for hotel image uploading and image hosting.

## Application Features

### 1. User Registration and Login
- Register a new account.
- Log in using existing credentials.
- Authenticate users using JWT.
- Support different user roles.

### 2. Hotel Management
- Display available hotels.
- Add new hotel listings.
- Update hotel information.
- Delete hotel listings.
- Display hotel descriptions, prices, locations, facilities and ratings.

### 3. Room Management
- Add room types to hotels.
- View rooms belonging to selected hotels.
- Update room information.
- Delete room types.
- Manage guest capacity, prices and room inventory.

### 4. Booking Management
- Select a room type.
- Enter check-in and check-out dates.
- Specify the number of rooms and guests.
- Add special requests.
- Submit booking requests.
- Support reservation statuses.

### 5. Administration Dashboard
- Access the administrator panel.
- Manage hotel accommodations.
- Manage room types.
- View and manage reservations.

### 6. Reviews and Favourites
- Support hotel reviews.
- Allow users to save favourite hotels.
- Provide hotel-sharing functionality.

## Project Structure

The application is organised into frontend and backend sections.

### Frontend

```text
src/
│
├── components/
│   ├── Navbar/
│   ├── HotelCard/
│   └── Admin/
│
├── pages/
│   ├── Landing/
│   ├── Login/
│   ├── Register/
│   ├── Home/
│   ├── Admin/
│   └── Booking/
│
├── features/
│   ├── register.ts
│   ├── login.ts
│   ├── hotels.ts
│   ├── bookings.ts
│   ├── rooms.ts
│   ├── payment.ts
│   ├── reviews.ts
│   └── profile.ts
│
├── store.ts
├── App.tsx
└── main.tsx
```

### Backend

```text
src/
│
├── config/
│   └── database.ts
│
├── controllers/
│
├── services/
│
├── routes/
│
├── middleware/
│
├── models/
│
└── server.ts
```

*The folder structure above is an illustrative organisation based on the project code shared. Adjust the folder names to match your actual repository.*

## GitHub Repository

**Repository:** Add your NESTOVA GitHub repository link here.

## Conclusion

NESTOVA is a full-stack hotel booking application developed to simplify the process of finding accommodation and making hotel reservations. The application combines modern frontend technologies with a backend API and PostgreSQL database to provide hotel management, room management, user authentication and booking functionality.

The project demonstrates practical knowledge of React, TypeScript, Redux Toolkit, REST API development, database management and full-stack application development.