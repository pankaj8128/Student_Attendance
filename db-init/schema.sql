-- Database
CREATE DATABASE IF NOT EXISTS attendance_system;
USE attendance_system;

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    subject varchar(100) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Students Table (Composite PK: teacher_id + student_id)
CREATE TABLE IF NOT EXISTS students (
    teacher_id INT NOT NULL,
    student_id INT NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (teacher_id, student_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
);

-- Topics Table (Composite PK: teacher_id + date)
CREATE TABLE IF NOT EXISTS topics (
    teacher_id INT NOT NULL,
    topic_date DATE NOT NULL DEFAULT (CURDATE()),
    topic VARCHAR(255) NOT NULL,
    PRIMARY KEY (teacher_id, `date`),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
);

-- Attendance Table (Composite PK: teacher_id + student_id + date)
CREATE TABLE IF NOT EXISTS attendance (
    teacher_id INT NOT NULL,
    student_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL DEFAULT 'Present',
    PRIMARY KEY (teacher_id, student_id, `date`),
    FOREIGN KEY (teacher_id, student_id) 
        REFERENCES students(teacher_id, student_id) 
        ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
);
