const express = require('express');
const pool = require('../db');
const { auth } = require('../middlewares/auth');
const router = express.Router();
router.use(auth);
router.use(express.json());

router.get('/less', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        let students = await conn.query('SELECT student_id, first_name, last_name FROM students WHERE teacher_id = ?', [req.cookies.id]);
        const answer = [];
        let attendance;
        for (const student of students) {
            attendance = await conn.query("SELECT ((SELECT COUNT(*) FROM attendance WHERE teacher_id = ? AND student_id = ? AND status = 'Present') / (SELECT COUNT(*) FROM attendance WHERE teacher_id = ? AND student_id = ?)) * 100 as total_attendance", [req.cookies.id, student.student_id, req.cookies.id, student.student_id]);
            if(attendance.length && attendance[0].total_attendance < 75)
                answer.push({"id": student.student_id, "firstName": student.first_name, "lastName": student.last_name, "attendance": Math.ceil(attendance[0].total_attendance)});
        }
        res.json(answer);
    }
    catch (err) {
        res.render('error', {err})
    }
    finally {
        if(conn) 
            conn.release();
    }
});

router.get('/:date', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        let students = await conn.query('SELECT student_id, status FROM attendance WHERE teacher_id = ? AND attendance_date= ?', [Number(req.cookies.id), req.params.date]);
        let topic = await conn.query('SELECT topic FROM topics WHERE teacher_id = ? AND topic_date = ?', [Number(req.cookies.id), req.params.date]);
        topic.length? topic = topic[0].topic:topic = '';
        res.json({"date": req.params.date, topic, students});
    }
    catch (e){
        console.log('Error: ', e);
    }
    finally{
        if(conn)
            conn.release();
    }
});

router.post('/', async (req, res) => {
    let conn;
    let rows;
    try{
        conn = await pool.getConnection();
        // topic
        rows = await conn.query('SELECT * FROM topics WHERE teacher_id = ? AND topic_date = ?', [req.cookies.id, req.body.date]);
        if(rows.length) 
            await conn.query('UPDATE topics SET topic = ? WHERE teacher_id = ? AND topic_date = ?',[req.body.topic, Number(req.cookies.id), req.body.date]);
        else
            await conn.query('INSERT INTO topics values (?, ?, ?)', [Number(req.cookies.id), req.body.date, req.body.topic]);

        // students
        for(let i = 0; i < req.body.attendance.length; i++) {
            let status = req.body.attendance[i].status;
            rows = await conn.query('SELECT * FROM attendance WHERE teacher_id = ? AND attendance_date = ? AND student_id = ?', [Number(req.cookies.id), req.body.date, Number(req.body.attendance[i].student_id)]);
            if(rows.length) // attendance already marked
                await conn.query('UPDATE attendance SET status = ? WHERE teacher_id = ? AND student_id = ? AND attendance_date = ?', [status, Number(req.cookies.id), Number(req.body.attendance[i].student_id), req.body.date]);
            else
                await conn.query('INSERT INTO attendance values (?, ?, ?, ?)', [Number(req.cookies.id), Number(req.body.attendance[i].student_id), req.body.date, status]);
        } 
        res.json('attendance done');
    }
    catch (err) {
        console.log(`Error: ${err}`);
        res.render('error', {err});
    }
    finally {
        if(conn)
            conn.release();
    }
});

module.exports = router;
