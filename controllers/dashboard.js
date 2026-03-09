const pool = require("../db");

module.exports = async (req, res) => {
  const payload = req.payload;
  let conn;
  let subjects;
  try {
    conn = await pool.connect();
    subjects = await conn.query(
      `
            SELECT c.class_id, c.subject_id, c.subject_id, s.subject_name 
            FROM classes c 
            JOIN subjects s on s.subject_id = c.subject_id 
            WHERE c.teacher_id = $1
            `,
      [Number(payload.id)],
    );
  } catch (err) {
    console.log("Error: ", err);
  } finally {
    if (conn) conn.release();
  }
  res.cookie("subjects", JSON.stringify(subjects.rows), {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
  });
  res.render("dashboard", {
    teacherData: `${payload.first_name} ${payload.last_name} (${payload.username})`,
    subjects: subjects.rows,
  });
};
