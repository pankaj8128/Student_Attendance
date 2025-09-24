const express = require('express');
const pool = require('../db');
const { auth } = require('../middlewares/auth');
const router = express.Router();
router.use(express.json());
router.use(auth);

router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT student_id, first_name, last_name FROM students WHERE teacher_id = ?', [req.cookies.id]);
        res.json(rows);
    }
    catch (err) {
        res.render('error', {err});
    }
    finally {
        if(conn)
            conn.release();
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id; 
    let conn;
    try{
        conn = await pool.getConnection();
        const student = await conn.query('SELECT student_id, first_name, last_name FROM students WHERE teacher_id = ? AND student_id = ?', [req.cookies.id, id]);
        if(!student.length)
            return res.json('Id not found');  
        const attendance = await conn.query("SELECT ((SELECT COUNT(*) FROM attendance WHERE teacher_id = ? AND student_id = ? AND status = 'Present') / (SELECT COUNT(*) FROM attendance WHERE teacher_id = ? AND student_id = ?)) * 100 as total_attendance", [req.cookies.id, id, req.cookies.id, id]);
        let presentDates = await conn.query("SELECT attendance_date FROM attendance WHERE teacher_id = ? AND student_id = ? AND status = 'Present'", [req.cookies.id, id]);
        let absentDates = await conn.query("SELECT attendance_date FROM attendance WHERE teacher_id = ? AND student_id = ? AND status = 'Absent'", [req.cookies.id, id]);
        for(let i = 0; i < presentDates.length; i++)
            presentDates[i] = presentDates[i].attendance_date;
        for(let i = 0; i < absentDates.length; i++)
            absentDates[i] = absentDates[i].attendance_date;
        res.json({student: student[0], attendance: Math.ceil(attendance[0].total_attendance), presentDates, absentDates});
    }  
    catch (err) {
        res.render('error', {err});
    }
    finally {
        if(conn)
            conn.release();
    }   
});


router.post('/', async (req, res) => {
    const {id, first_name, last_name} = req.body;
    let conn;
    try{
        conn = await pool.getConnection();
        const rows = await conn.query('INSERT INTO students values (?, ?, ?, ?)', [req.cookies.id, id, first_name, last_name]);
        rows? res.send('Student inserted'):res.send('Insertion failed');
    } 
    catch (err) {
        res.render('error', {err});
    }
    finally {
        if(conn)
            conn.release();
    }
});

router.put('/', async (req, res) => {
    const {id, first_name, last_name} = req.body;
    let conn;
    try{
        conn = await pool.getConnection();
        const rows = await conn.query('UPDATE students SET first_name = ?, last_name = ? WHERE teacher_id = ? AND student_id = ?', [first_name, last_name, req.cookies.id, id]);
        rows? res.send('Student updated'):res.send('Updation failed');
    }
    catch (err) {
        res.render('error', {err});
    }
    finally {
        if(conn)
            conn.release();
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    let conn;
    try{
        conn = await pool.getConnection();
        const rows = await conn.query('DELETE FROM students WHERE teacher_id = ? AND student_id = ?', [req.cookies.id, id]);
        rows? res.send('Student deleted'):res.send('Deletion failed');
    }
    catch (err) {
        res.render('error', {err});
    }
    finally {
        if(conn)
            conn.release();
    }
});

module.exports = router;
