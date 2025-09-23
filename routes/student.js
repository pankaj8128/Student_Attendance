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
        if(!student.length){
            res.render('error', {err: 'Unknown ID'});
            return;
        }
        const attendance = await conn.query("SELECT ((SELECT COUNT(*) FROM attendance WHERE teacher_id = ? AND student_id = ? AND status = 'Present') / (SELECT COUNT(*) FROM attendance WHERE teacher_id = ? AND student_id = ?)) * 100 as total_attendance", [req.cookies.id, id, req.cookies.id, id]);
        res.render('student_profile', { name: student[0].first_name + ' ' + student[0].last_name, attendance: Math.ceil(attendance[0].total_attendance) });
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
