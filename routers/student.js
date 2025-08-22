const express = require('express')
const pool = require('../db')

const app = express();
const router = express.Router();
app.use(express.json());
app.set('view engine', 'ejs');

router.get('/:id', async (req, res) => {
    const id = req.params.id; 
    let conn;
    try{
        conn = await pool.getConnection();
        const student = await conn.query('select * from student where id = ?', [id]);
        const attend = await conn.query("select ((select count(*) from attendance_table where id = ? and attendance = 'P') / (select count(*) from attendance_table where id = ?)) * 100 as total_attendance", [id, id]);
        res.render('student_profile', { name: student[0].first_name, attendance: attend[0].total_attendance });
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
    const {id, first_name, last_name, contact} = req.body;
    let conn;
    try{
        conn = await pool.getConnection();
        const rows = await conn.query('insert into student values (?, ?, ?, ?)', [id, first_name, last_name, contact]);
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
    const {id, first_name, last_name, contact} = req.body;
    let conn;
    try{
        conn = await pool.getConnection();
        const rows = await conn.query('update student set first_name = ?, last_name = ?, contact = ? where id = ?', [first_name, last_name, contact, id]);
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
        const rows2 = await conn.query('delete from attendance_table where id = ?', [id]);
        const rows1 = await conn.query('delete from student where id = ?', [id]);
        (rows1 || rows2)? res.send('Student deleted'):res.send('Deletion failed');
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
