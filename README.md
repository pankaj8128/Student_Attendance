# Note

This project was created while learning and practicing Express.js.

# Student Attendance Management System

This project is a web application for teachers to manage and mark student attendance. It uses Node.js, Express.js, PostgreSQL, and EJS for server-side rendering. The backend is the main focus, with a simple frontend for interaction.



---

## Features

- Teacher authentication (signup/login) with password hashing (bcrypt)
- Class and Subject management per teacher
- Student enrollment into specific classes
- Mark and view attendance by date for a given class
- View students with attendance below 75%
- View individual student attendance details
- Topic tracking for each class date
- Secure routes using authentication middleware and HTTP-only cookies
- EJS templating for dashboard views

## Express.js Features Used

- **Routing:** Modular route handling using Express Router (`routes/student.js`, `routes/attendance.js`)
- **Middleware:**
    - Built-in middleware: `express.json()`, `express.urlencoded()`
    - Third-party: `cookie-parser` for cookie handling
    - Custom: Authentication middleware (`middlewares/auth.js`)
- **View Engine:** EJS for rendering error and profile pages
- **Static File Serving:** Serving frontend assets (HTML, CSS, JS)
- **Error Handling:** Centralized error rendering

## Installation

### 1. Clone the Repository

```sh
git clone https://github.com/pankaj8128/Student_Attendance.git 
cd student_attendance
```

### 2. Install Node.js Dependencies

```sh
npm install
```

### 3. Install PostgreSQL

#### Ubuntu (Linux)

```sh
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows

- Download the PostgreSQL installer from: https://www.postgresql.org/download/windows/
- Run the installer and follow the setup instructions
- Start the PostgreSQL service from the Services app

### 4. Database Setup

1. Open PostgreSQL client (e.g., `psql -U postgres`)
2. Run the SQL script in `db-init/schema.sql` to create the required database and tables:

```sql
\i db-init/schema.sql
```

### 5. Environment Variables

Create a `.env` file in the project root with the following content (edit as needed):

```
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<database>
SECRET_KEY=<your_secret_key>
port=3000
```

## Running the Application

```sh
npm start
# or
npx nodemon index.js
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---
**Author:** Pankaj Jagadale
