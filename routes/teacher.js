const express = require("express");
const router = express.Router();
const pool = require("../db");
const { auth } = require("../middlewares/auth");

router.use(express.json());
router.use(auth);

router.post("/class", async (req, res) => {
  const { subject, semester } = req.body;
  let conn, rows;
  try {
    conn = await pool.connect();
    rows = await conn.query(
      `
        SELECT * FROM subjects 
        WHERE subject_name = $1
        `,
      [subject],
    );
    if (!rows?.rows?.length)
      rows = await conn.query(
        `
            INSERT INTO subjects (subject_name)
            VALUES ($1)
            RETURNING subject_id
            `,
        [subject],
      );
    const subject_id = rows.rows[0].subject_id;
    rows = await conn.query(
      `
        INSERT INTO classes (teacher_id, subject_id, semester)
        VALUES ($1, $2, $3)
        `,
      [req.payload.id, subject_id, semester],
    );
    res.status(200).json({ message: "Class added successfully" });
  } catch (err) {
    console.log("Error creating class: ", err);
    res.status(500).json({ message: "Failed to create class" });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
