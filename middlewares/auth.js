const pool = require('../db');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = async (req, res, next) => {
    let conn;
    const token = req.cookies.jwt_token;
    let payload;
    if (!token)
        return res.status(401).redirect('login');
    try {
        payload = jwt.verify(token, process.env.SECRET_KEY);
    }
    catch (JswonWebTokenError) {
        return res.status(401).redirect('login');
    }
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT teacher_id FROM teachers WHERE teacher_id = ? AND first_name = ? AND last_name = ? AND subject = ?', [Number(payload.id), String(payload.first_name), String(payload.last_name), String(payload.subject)]);
        if(rows.length != 1)
            return res.status(401).redirect('login');;
        req.payload = payload;
        next();
    }
    catch (err){
        console.log('Error: ', err);
        res.status(500).send('Database Error');
    }
    finally{
        if(conn)
            conn.release();
    }
};
