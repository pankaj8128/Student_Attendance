const express = require('express')
const path = require('path')
const mariadb = require('mariadb')
const pool = require('./db')
const student_router = require('./routers/student')
require('dotenv').config()

const port = process.env.port;
const app = express()
app.use(express.json());
app.set('view engine', 'ejs')

app.use('/student', student_router);

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    console.log(`Response detected: ${new Date(Date.now())}`);
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', async (req, res) => {
    const { id, password } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const teacher = await conn.query('select id, password from teachers where id = ? and password = ?', [id, password]);
        console.log(teacher);
        if(teacher.length == 1) {
            res.cookie('id', id);
            res.redirect('/index.html');
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
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('select * from student');
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
    console.log(`Listening on port: ${port}`);
});
