const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

module.exports = async (req, res) => {
  const { username, password } = req.body;
  let conn;
  try {
    conn = await pool.connect();
    const teacher = await conn.query(
      `SELECT * FROM teachers WHERE username = $1`,
      [username],
    );
    if (teacher.rows.length === 0) {
      return res.status(201).json({ message: "Username Not Found" });
    }
    if (await bcrypt.compare(password, teacher.rows[0]?.password)) {
      const token = jwt.sign(
        {
          id: teacher.rows[0]?.teacher_id,
          username: username,
          first_name: teacher.rows[0]?.first_name,
          last_name: teacher.rows[0]?.last_name,
        },
        process.env.SECRET_KEY,
        { expiresIn: "15m" },
      );
      res.cookie("jwt_token", token, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(201).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (conn) conn.release();
  }
};
