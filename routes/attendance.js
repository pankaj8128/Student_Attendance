const express = require("express");
const pool = require("../db");
const { auth } = require("../middlewares/auth");
const router = express.Router();
router.use(auth);
router.use(express.json());

router.get("/less", async (req, res) => {
  let conn;
  const subjects = JSON.parse(req.cookies.subjects);
  const subject = req.query.subject;
  if (!subject) return res.status(400).send("Subject not provided");
  let class_id;
  for (let sub of subjects) {
    if (sub.subject_name === subject) {
      class_id = sub.class_id;
      break;
    }
  }
  try {
    conn = await pool.connect();
    let students = await conn.query(
      `
            SELECT s.student_id, s.first_name, s.last_name 
            FROM students s
            JOIN enrollments e ON e.student_id = s.student_id
            WHERE e.class_id = $1
            ORDER BY s.student_id ASC
            `,
      [class_id],
    );
    students = students.rows;
    const answer = [];
    let attendance;
    for (const student of students) {
      try {
        attendance = await conn.query(
          `
                SELECT (
                    (SELECT COUNT(*) FROM attendance WHERE class_id = $1 AND student_id = $2 AND status = 'Present') * 100.0 / 
                    (SELECT COUNT(*) FROM attendance WHERE class_id = $1 AND student_id = $2)
                    ) as total_attendance `,
          [class_id, student.student_id],
        );
        attendance = Math.ceil(attendance.rows[0].total_attendance);
        if (attendance && attendance < 75)
          answer.push({
            id: student.student_id,
            firstName: student.first_name,
            lastName: student.last_name,
            attendance: Math.ceil(attendance),
          });
      } catch (e) {
        console.log(
          `Student ${student.student_id} has not attended class ${class_id}`,
        );
      }
    }
    res.status(200).json(answer);
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).send("Database Error");
  } finally {
    if (conn) conn.release();
  }
});

router.get("/:date", async (req, res) => {
  let conn;
  const subject = req.query.subject;
  if (!subject) {
    res.status(400).send("Subject not provided");
    return;
  }

  try {
    conn = await pool.connect();
    let class_id = await conn.query(
      `
            SELECT c.class_id FROM classes c
            JOIN subjects s ON s.subject_id = c.subject_id
            JOIN teachers t ON t.teacher_id = c.teacher_id
            WHERE s.subject_name = $1 AND t.teacher_id = $2
            `,
      [subject, req.payload.id],
    );
    class_id = class_id.rows[0].class_id;
    let students = await conn.query(
      `
            SELECT s.student_id, s.first_name, s.last_name, a.status FROM students s
            JOIN attendance a ON a.student_id = s.student_id
            WHERE a.class_id = $1 AND a.attendance_date = $2
            `,
      [class_id, req.params.date],
    );
    let topic = await conn.query(
      `
            SELECT t.topic_description FROM topics t
            WHERE t.class_id = $1 AND t.topic_date = $2
            `,
      [class_id, req.params.date],
    );
    topic = topic.rows[0]?.topic_description || "";
    res.status(200).json({
      date: req.params.date,
      description: topic,
      students: students.rows,
    });
  } catch (e) {
    console.log("Error: ", e);
    res.status(500).json({ message: "Failed to get attendance data" });
  } finally {
    if (conn) conn.release();
  }
});

router.post("/", async (req, res) => {
  let conn, rows;
  const { date, subject, description, attendance } = req.body;
  const teacher_id = req.payload.id;
  try {
    conn = await pool.connect();
    class_id = await conn.query(
      `
            SELECT c.class_id FROM classes c
            JOIN subjects s ON s.subject_id = c.subject_id
            JOIN teachers t ON t.teacher_id = c.teacher_id
            WHERE s.subject_name = $1 AND t.teacher_id = $2
            `,
      [subject, teacher_id],
    );
    class_id = class_id.rows[0].class_id;
    rows = await conn.query(
      `
            INSERT INTO topics (class_id, topic_date, topic_description)
            VALUES ($1, $2, $3)
            ON CONFLICT (class_id, topic_date) DO UPDATE
            SET topic_description = EXCLUDED.topic_description;
            `,
      [class_id, date, description],
    );
    for (let i = 0; i < attendance.length; i++) {
      let status = attendance[i].status;
      let student_id = attendance[i].student_id;
      rows = await conn.query(
        `
                INSERT INTO attendance (class_id, student_id, attendance_date, status)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (class_id, student_id, attendance_date) DO UPDATE
                SET status = EXCLUDED.status;
                `,
        [class_id, student_id, date, status],
      );
    }
    res.status(201).json({ message: "Attendance marked" });
  } catch (err) {
    console.log(`Error: ${err}`);
    res.status(500).json({ message: "Failed to mark attendance" });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
