# Note

This project was created as a learning exercise while exploring and practicing Express.js.
# Student Attendance Management System

This project is a web application for teachers to manage and mark student attendance. It uses Node.js, Express.js, MariaDB, and EJS for server-side rendering. The backend is the main focus, with a simple frontend for interaction.

## Features

- Teacher authentication (signup/login) with password hashing (bcrypt)
- Student management (add/view students)
- Mark and view attendance by date
- View students with attendance below 75%
- View individual student attendance details
- Topic tracking for each class date
- Secure routes using authentication middleware
- EJS templating for error and profile views

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

### 3. Install MariaDB

#### Ubuntu (Linux)

```sh
sudo apt update
sudo apt install mariadb-server
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

#### Windows

- Download the MariaDB installer from: https://mariadb.org/download/
- Run the installer and follow the setup instructions
- Start the MariaDB service from the Services app or using the command prompt

### 4. Database Setup

1. Open MariaDB client (e.g., `mysql -u root -p`)
2. Run the SQL script in `db-init/schema.sql` to create the required database and tables:

```sql
source db-init/schema.sql;
```

### 5. Environment Variables

Create a `.env` file in the project root with the following content (edit as needed):

```
host=localhost
user=<your_db_user>
password=<your_db_password>
database=attendance_system
db_port=3306
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
