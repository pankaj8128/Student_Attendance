const express = require('express')
const path = require('path')
const mariadb = require('mariadb')
const pool = require('./db')
const student_router = require('./routers/student')
require('dotenv').config()

const port = process.env.port;
const app = express()
app.use(express.json());

app.use('/student', student_router);

app.get('/', (req, res) => {
    console.log(`Response detected: ${new Date(Date.now())}`);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/students', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('select * from student');
        res.json(rows);
    }
    catch (err) {
        console.log(err);
    }
    finally {
        if(conn)
            conn.release();
    }
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
