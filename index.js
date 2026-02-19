const express = require('express');
const app = express();
app.use(express.json());

const pool = require('./db');
require('dotenv').config();
const port = process.env.port;

const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'frontend')));

const student_route = require('./routes/student');
const attendance_route = require('./routes/attendance');
app.use('/student', student_route);
app.use('/attendance', attendance_route);
const { auth } = require('./middlewares/auth');

app.get('/', auth, (req, res) => {
    res.redirect('dashboard');
});

app.get('/dashboard', auth, (req, res) => {
    const payload = req.payload;
    res.render('dashboard', {
                id: payload.id,
                teacherData: `${payload.first_name} ${payload.last_name} (${payload.id})`,
                subject: payload.subject
            });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { id, password } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const teacher = await conn.query('SELECT * FROM teachers WHERE teacher_id = ?', [id]);
        if (await bcrypt.compare(password, teacher[0].password)) {
            const token = jwt.sign({
                "id": id,
                "first_name": teacher[0].first_name,
                "last_name": teacher[0].last_name,
                "subject": teacher[0].subject
            },
                process.env.SECRET_KEY,
                { expiresIn: "15m" }
            );
            res.cookie('jwt_token', token, {
                httpOnly: true,
                maxAge: 15 * 60 * 1000
            });
            res.cookie('id', id);
            res.redirect('/dashboard');
        } else {
            res.redirect('/');
        }
    }
    catch (err) {
        res.render('error', { err });
    }
    finally {
        if (conn)
            conn.release();
    }
});

app.post('/signup', async (req, res) => {
    let { first_name, last_name, subject, password } = req.body;
    password = await bcrypt.hash(password, 10);
    let conn;
    try {
        conn = await pool.getConnection();
        let rows = await conn.query('INSERT INTO teachers (first_name, last_name, subject, password) VALUES (?, ?, ?, ?)', [first_name, last_name, subject, password]);
        const id = await conn.query('SELECT teacher_id FROM teachers WHERE first_name = ? AND last_name = ? AND password = ?', [first_name, last_name, password]);
        const token = jwt.sign({
            "id": id[0].id,
            "first_name": first_name,
            "last_name": last_name,
            "subject": subject
        },
            process.env.SECRET_KEY,
            { expiresIn: "15m" }
        );
        res.cookie('jwt_token', token, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000
        });
        res.cookie('id', id[0].id);
        res.redirect('/dashboard');
    }
    catch (err) {
        res.json({ 'Error': err });
    }
    finally {
        if (conn)
            conn.release();
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie("jwt_token", {
        httpOnly: true
    });
    res.redirect('/login');
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}. Visit: http://localhost:${port}`);
});
