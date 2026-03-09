const pool = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  let conn;
  const token = req.cookies.jwt_token;
  let payload;
  if (!token) {
    if (req.headers.accept?.includes("text/html"))
      return res.redirect("/login");
    return res.status(401).json({ message: "Token expired" });
  }
  try {
    payload = jwt.verify(token, process.env.SECRET_KEY);
  } catch (JswonWebTokenError) {
    if (req.headers.accept?.includes("text/html"))
      return res.redirect("/login");
    return res.status(401).json({ message: "Token expired" });
  }
  try {
    conn = await pool.connect();
    const rows = await conn.query(
      `
        SELECT teacher_id FROM teachers 
        WHERE teacher_id = $1
        `,
      [Number(payload.id)],
    );
    if (rows.rows.length != 1) {
      return res.status(401).redirect("login");
    }
    req.payload = payload;
    next();
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).json({ message: "Database Error" });
  } finally {
    if (conn) conn.release();
  }
};
