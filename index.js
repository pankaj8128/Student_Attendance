const express = require('express');
const app = express();
app.use(express.json());

const mariadb = require('mariadb');
const pool = require('./db');
require('dotenv').config();
const port = process.env.port;

const path = require('path');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const student_route = require('./routes/student');
const attendance_route = require('./routes/attendance');
app.use('/student', student_route);
app.use('/attendance', attendance_route);

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
