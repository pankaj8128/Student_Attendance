const express = require('express')
const path = require('path')
const mariadb = require('mariadb')
const pool = require('./db')
const student_route = require('./routes/student')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const port = process.env.port;
const app = express()
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use('/student', student_route);

app.get('/', (req, res) => {
    console.log(`Response detected: ${new Date(Date.now())}`);
    if(req.cookies.id){
        res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
        return;
    }
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "style.css"));
});

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "script.js"));
});

app.post('/dashboard', async (req, res) => {
    const {id, password} = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const teacher = await conn.query('SELECT * FROM teachers WHERE teacher_id = ?', [id]);
        if(await bcrypt.compare(password, teacher[0].password)) {
            res.cookie('id', id);
            res.cookie('first_name', teacher[0].first_name);
            res.cookie('last_name', teacher[0].last_name);
            res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
        } else {
            res.json("Wrong credentials");
        }
    }
    catch(err) {
        console.log('Error: ', err);
        res.render('error', {err});
    }
    finally {
        if(conn)
            conn.release();
    }
});

app.post('/attendance', async (req, res) => {
    let conn;
    try{
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * from attendance WHERE teacher_id = ? AND date = ?', [Number(req.cookies.id), req.body.date]);
        if(rows.length) {
            for(let i = 0; i < req.body.attendance.length; i++) {
                let status = req.body.attendance[i].status;
                status = status.charAt(0).toUpperCase() + status.slice(1);
                await conn.query('UPDATE attendance SET status = ? WHERE teacher_id = ? AND student_id = ? AND date = ?', [status, Number(req.cookies.id), Number(req.body.attendance[i].student_id), req.cookies.date]);
            }
            await conn.query('UPDATE topics SET topic = ? WHERE teacher_id = ? AND date = ?',[req.body.topic, Number(req.cookies.id), req.body.date]);
            res.send('Attendance marked');
        } 
        else {
            for(let i = 0; i < req.body.attendance.length; i++) {
                let status = req.body.attendance[i].status;
                status = status.charAt(0).toUpperCase() + status.slice(1);
                await conn.query('INSERT INTO attendance values (?, ?, ?, ?)', [Number(req.cookies.id), Number(req.body.attendance[i].student_id), req.body.date, status]);
            }
            await conn.query('INSERT INTO topics values (?, ?, ?)', [Number(req.cookies.id), req.body.date, req.body.topic]);
            res.send('Attendance marked');
        } 
    }
    catch (err) {
        console.log(`Error: ${err}`);
        res.json(err);
    }
    finally {
        if(conn)
            conn.release();
    }
});

app.get('/students', async (req, res) => {

    if(req.cookies.id === undefined){
        res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
        return;
    }

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

app.listen(port, () => {
    console.log(`Listening on port: ${port}. Visit: http://localhost:${port}`);
});
