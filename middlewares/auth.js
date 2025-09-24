const pool = require('../db');
const path = require('path');

exports.auth = async (req, res, next) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT teacher_id FROM teachers WHERE teacher_id = ? AND first_name = ? AND last_name = ? AND subject = ?', [req.cookies.id, req.cookies.first_name, req.cookies.last_name, req.cookies.subject]);
        if(rows.length != 1)
            return res.sendFile(path.join(__dirname, '../', 'frontend', 'login.html'));
        next();
    }
    catch (err){
        res.json(err);
    }
    finally{
        if(conn)
            conn.release();
    }
};
