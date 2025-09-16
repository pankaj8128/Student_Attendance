const express = require('express')
const path = require('path')
const mariadb = require('mariadb')
const pool = require('./db')
const student_route = require('./routes/student')
const bcrypt = require('bcrypt')
require('dotenv').config()

const port = process.env.port;
const app = express()
app.use(express.json());

const cookieParser = require('cookie-parser')
app.use(cookieParser());

app.set('view engine', 'ejs')

app.use('/student', student_route);

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    console.log(`Response detected: ${new Date(Date.now())}`);
    if(req.cookies.id){
        res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
        return;
    }
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.post('/dashboard', async (req, res) => {
    const {id, password} = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const teacher = await conn.query('SELECT * FROM teachers WHERE teacher_id = ?', [id]);
        if(await bcrypt.compare(password, teacher[0].password)) {
            res.cookie('id', id);
            res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
        } else {
            res.json("Wrong credentials");
        }
    }
    catch(err) {
        console.log('Error: ', err);
        res.json({err: err});
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
