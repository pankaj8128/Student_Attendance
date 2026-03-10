const express = require("express");
const pool = require("../db");
const { auth } = require("../middlewares/auth");
const validator = require("../middlewares/validate");
const {
  add: addvalidator,
  update: updatevalidator,
} = require("../validators/student");

const router = express.Router();
router.use(express.json());
router.use(auth);

router.get("/", async (req, res) => {
  const subject = req.query.subject;
  if (!subject) res.status(422).json({ message: "Subject not provided" });
  let conn;
  try {
    conn = await pool.connect();
    const rows = await conn.query(
      `
            SELECT s.student_id, s.first_name, s.last_name
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            JOIN classes c ON e.class_id = c.class_id
            JOIN subjects sub ON c.subject_id = sub.subject_id
            WHERE c.teacher_id = $1 AND sub.subject_name = $2
            ORDER BY s.student_id ASC
        `,
      [req.payload.id, subject],
    );
    res.status(200).json(rows.rows);
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).send("Database Error");
  } finally {
    if (conn) conn.release();
  }
});

router.get("/:id", async (req, res) => {
  const subjects = JSON.parse(req.cookies.subjects);
  const subject = req.query.subject;
  let class_id;
  for (let sub of subjects) {
    if (sub.subject_name === subject) {
      class_id = sub.class_id;
      break;
    }
  }
  const id = req.params.id;
  if (!id) res.status(422).send("Invalid ID");
  let conn;
  try {
    conn = await pool.connect();
    const student = await conn.query(
      `
            SELECT s.student_id, s.first_name, s.last_name
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            JOIN classes c ON e.class_id = c.class_id
            JOIN subjects sub ON c.subject_id = sub.subject_id
            WHERE c.teacher_id = $1 AND sub.subject_name = $2 AND s.student_id = $3
        `,
      [class_id, subject, id],
    );

    const result = await conn.query(
      `
            SELECT 
                json_agg(attendance_date ORDER BY attendance_date ASC) FILTER (WHERE status = 'Present') AS present,
                json_agg(attendance_date ORDER BY attendance_date ASC) FILTER (WHERE status != 'Present') AS absent
                FROM attendance
                WHERE class_id = $1 AND student_id = $2
            `,
      [class_id, id],
    );
    const { present, absent } = result.rows[0] || { present: [], absent: [] };
    const presentDates = present || [];
    const absentDates = absent || [];
    res.status(200).json({
      student: student.rows[0],
      attendance: Math.ceil(
        (presentDates.length / (presentDates.length + absentDates.length)) *
          100,
      ),
      presentDates: presentDates,
      absentDates: absentDates,
    });
  } catch (err) {
    console.log("Error fetching student: ", err);
    if (err.code === "22012")
      // division by zero
      return res.status(422).json({ message: "No classes are conducted" });
    res.status(500).send("Database Error");
  } finally {
    if (conn) conn.release();
  }
});

router.post("/", validator(addvalidator), async (req, res) => {
  const { first_name, last_name } = req.body;
  const subjects = JSON.parse(req.cookies.subjects);
  const subject = req.query.subject;
  let class_id;
  for (let sub of subjects) {
    if (sub.subject_name === subject) {
      class_id = sub.class_id;
      break;
    }
  }
  let conn;
  try {
    conn = await pool.connect();
    let rows = await conn.query(
      `
            SELECT * FROM students
            WHERE first_name = $1 and last_name = $2
            `,
      [first_name, last_name],
    );
    console.log(rows);
    if (!rows.rows.length) {
      rows = await conn.query(
        `
                INSERT INTO students (first_name, last_name)
                VALUES ($1, $2)
                RETURNING student_id;
            `,
        [first_name, last_name],
      );
    }
    const student_id = rows.rows[0].student_id;
    rows = await conn.query(
      `
            INSERT INTO enrollments (student_id, class_id)
            VALUES ($1, $2)
            `,
      [student_id, class_id],
    );
    res.status(201).json({ message: "Student enrolled successfully" });
  } catch (err) {
    console.log("Error Adding Student: ", err);
    if (err.code === "23505")
      return res.status(409).json({ message: "Student already enrolled" });
    res.status(500).json("Error Adding Student");
  } finally {
    if (conn) conn.release();
  }
});

router.put("/", validator(updatevalidator), async (req, res) => {
  const { id, first_name, last_name } = req.body;
  let conn;
  try {
    conn = await pool.connect();
    let rows = await conn.query(
      `
            UPDATE students
            SET first_name = $1, last_name = $2
            WHERE student_id = $3;
            `,
      [first_name, last_name, id],
    );
    if (rows) res.status(201).json({ message: "Student updated" });
    else res.status(500).json({ message: "Updation failed" });
  } catch (err) {
    console.log("Error Updating Student: ", err);
    res.status(500).json({ message: "Database Error" });
  } finally {
    if (conn) conn.release();
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) res.status(422).send("Id not provided");
  const subjects = JSON.parse(req.cookies.subjects);
  const subject = req.query.subject;
  let class_id;
  for (let sub of subjects) {
    if (sub.subject_name === subject) {
      class_id = sub.class_id;
      break;
    }
  }
  let conn;
  try {
    conn = await pool.connect();
    const delEnr = await conn.query(
      `
            DELETE FROM enrollments
            WHERE class_id = $1 AND student_id = $2
        `,
      [class_id, id],
    );
    const delAtt = await conn.query(
      `
            DELETE FROM attendance
            WHERE class_id = $1 AND student_id = $2
        `,
      [class_id, id],
    );
    if (delEnr && delAtt)
      res.status(204).json({ message: "Student deleted successfully!" });
    else res.json({ message: "Failed to delete student" });
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).send("Failed to delete student");
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
