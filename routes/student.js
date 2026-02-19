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
        const rows = await conn.query('SELECT student_id, first_name, last_name FROM students WHERE teacher_id = ?', [req.payload.id]);
        res.status(200).json(rows);
    }
    catch (err) {
        console.log('Error: ', err);
        res.status(500).send('Database Error');
    }
    finally {
        if(conn)
            conn.release();
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id; 
    if (!id)
        res.status(422).send('Invalid ID');
    let conn;
    try{
        conn = await pool.getConnection();
        const student = await conn.query('SELECT student_id, first_name, last_name FROM students WHERE teacher_id = ? AND student_id = ?', [req.payload.id, id]);
        if(!student.length)
            return res.json('Id not found');  
        const attendance = await conn.query("SELECT ((SELECT COUNT(*) FROM attendance WHERE teacher_id = ? AND student_id = ? AND status = 'Present') / (SELECT COUNT(*) FROM attendance WHERE teacher_id = ? AND student_id = ?)) * 100 as total_attendance", [req.payload.id, id, req.payload.id, id]);
        let presentDates = await conn.query("SELECT attendance_date FROM attendance WHERE teacher_id = ? AND student_id = ? AND status = 'Present'", [req.payload.id, id]);
        let absentDates = await conn.query("SELECT attendance_date FROM attendance WHERE teacher_id = ? AND student_id = ? AND status = 'Absent'", [req.payload.id, id]);
        for(let i = 0; i < presentDates.length; i++)
            presentDates[i] = presentDates[i].attendance_date;
        for(let i = 0; i < absentDates.length; i++)
            absentDates[i] = absentDates[i].attendance_date;
        res.status(200).json({student: student[0], attendance: Math.ceil(attendance[0].total_attendance), presentDates, absentDates});
    }  
    catch (err) {
        res.status(500).send('Database Error');
    }
    finally {
        if(conn)
            conn.release();
    }   
});


router.post('/', async (req, res) => {
    const {id, first_name, last_name} = req.body;
    if (!id || !first_name || !last_name)
        res.status(422).send('Invalid Data');
    let conn;
    try{
        conn = await pool.getConnection();
        const rows = await conn.query('INSERT INTO students values (?, ?, ?, ?)', [req.payload.id, id, first_name, last_name]);
        rows? res.status(201).send('Student inserted'):res.status(500).send('Insertion failed');
    } 
    catch (err) {
        res.status(500).send('Database Error');
    }
    finally {
        if(conn)
            conn.release();
    }
});

router.put('/', async (req, res) => {
    const {id, first_name, last_name} = req.body;
    if (!id || !first_name || !last_name)
        res.status(422).send('Invalid Data');
    let conn;
    try{
        conn = await pool.getConnection();
        const rows = await conn.query('UPDATE students SET first_name = ?, last_name = ? WHERE teacher_id = ? AND student_id = ?', [first_name, last_name, req.payload.id, id]);
        rows? res.status(201).send('Student updated'):res.status(500).send('Updation failed');
    }
    catch (err) {
        res.status(500).send('Database Error');
    }
    finally {
        if(conn)
            conn.release();
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    if (!id)
        res.status(422).send('Id not provided');
    let conn;
    try{
        conn = await pool.getConnection();
        const rows = await conn.query('DELETE FROM students WHERE teacher_id = ? AND student_id = ?', [req.payload.id, id]);
        rows? res.status(204).send('Student deleted'):res.status(500).send('Deletion failed');
    }
    catch (err) {
        res.status(500).send('Database Error');
    }
    finally {
        if(conn)
            conn.release();
    }
});

module.exports = router;
