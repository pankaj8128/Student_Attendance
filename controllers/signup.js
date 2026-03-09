const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

module.exports = async (req, res) => {
  let { username, first_name, last_name, password } = req.body;
  if (!username || !first_name || !last_name || !password)
    return res.status(201).json({ message: "Please provide valid data" });
  password = await bcrypt.hash(password, 10);
  let conn;
  try {
    conn = await pool.connect();
    const result = await conn.query(
      `
        INSERT INTO teachers 
        (username, first_name, last_name, password) VALUES 
        ($1, $2, $3, $4) RETURNING teacher_id
      `,
      [username, first_name, last_name, password],
    );
    const token = jwt.sign(
      {
        id: result.rows[0].teacher_id,
        username: username,
        first_name: first_name,
        last_name: last_name,
      },
      process.env.SECRET_KEY,
      { expiresIn: "15m" },
    );
    res.cookie("jwt_token", token, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("id", result.rows[0].teacher_id);
    res.status(200).json({ message: "Account created successfully" });
  } catch (err) {
    console.log("Error: ", err);
    if (err.code === "23505")
      return res.status(409).json({ message: "Username taken" });
    res.status(500).json({ message: "Account creation failed" });
  } finally {
    if (conn) conn.release();
  }
};
