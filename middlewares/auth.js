const pool = require('../db');
const path = require('path');

exports.auth = async (req, res, next) => {
    const id = req.cookies.id;
    let conn;
    try {
        conn = await pool.getConnection();
        let rows = await conn.query('SELECT teacher_id, first_name, last_name FROM teachers where teacher_id = ?', [id]);
        if(rows.length < 1 || (req.cookies.first_name != rows[0].first_name && req.cookies.last_name != rows[0].last_name)) 
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
