-- 1. Handle the Enum for Attendance Status
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent');

-- 2. Teachers Table
CREATE TABLE teachers (
    teacher_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- 3. Students Table
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL
);

-- 4. Subjects Table
CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL
);

-- 5. Classes Table
CREATE TABLE classes (
    class_id SERIAL PRIMARY KEY,
    teacher_id INT,
    subject_id INT,
    semester VARCHAR(20),
    CONSTRAINT fk_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

-- 6. Enrollments Table
CREATE TABLE enrollments (
    class_id INT,
    student_id INT,
    PRIMARY KEY (class_id, student_id),
    CONSTRAINT fk_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- 7. Topics Table
CREATE TABLE topics (
    topic_id SERIAL PRIMARY KEY,
    class_id INT,
    topic_date DATE DEFAULT CURRENT_DATE,
    topic_description TEXT,
    CONSTRAINT fk_class_topic FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    UNIQUE (class_id, topic_date)
);

-- 8. Attendance Table
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    class_id INT,
    student_id INT,
    attendance_date DATE NOT NULL,
    status attendance_status DEFAULT 'Present',
    CONSTRAINT fk_enrollment FOREIGN KEY (class_id, student_id) REFERENCES enrollments(class_id, student_id) ON DELETE CASCADE,
    UNIQUE (class_id, student_id, attendance_date)
);
