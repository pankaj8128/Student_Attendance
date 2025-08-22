CREATE DATABASE IF NOT EXISTS students;
USE students;

CREATE TABLE IF NOT EXISTS student (
    id INT(11) NOT NULL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    contact TEXT
);

CREATE TABLE IF NOT EXISTS topic (
    date DATE NOT NULL PRIMARY KEY DEFAULT (CURDATE()),
    topics_covered VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS attendance_table (
    date DATE NOT NULL DEFAULT (CURDATE()),
    id INT(11) NOT NULL,
    attendance ENUM('P','A') DEFAULT 'A',
    PRIMARY KEY (date, id),
    FOREIGN KEY (id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (date) REFERENCES topic(date) ON DELETE CASCADE
);
