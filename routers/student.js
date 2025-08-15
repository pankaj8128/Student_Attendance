const express = require('express')
const pool = require('../db')

const app = express();
const router = express.Router();
app.use(express.json());

router.get('/:id', async (req, res) => {
    const id = req.params.id; 
    let conn;
    try{
        conn = await pool.getConnection();
        const row = await conn.query('select s.name, at.date, at.attendance from attendance_table at join student s on at.id = s.id where s.id = ?', [id]);
        res.json(row);
    }  
    catch (err) {
        console.log('Error: ', err);
    }
    finally {
        if(conn)
            conn.release();
    }   
});


router.post('/', async (req, res) => {
    const {id, name, contact} = req.body;
    let conn;
    try{
        conn = await pool.getConnection();
        const rows = await conn.query('insert into student values (?, ?, ?)', [id, name, contact]);
        rows? res.send('Student inserted'):res.send('Unable to insert student');
    } 
    catch (err) {
        console.log('Error: ', err);
    }
    finally{
        if(conn)
            conn.release()
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    let conn;
    try{
        conn = await pool.getConnection();
        const rows2 = await conn.query('delete from attendance_table where id = ?', [id]);
        const rows1 = await conn.query('delete from student where id = ?', [id]);
        (rows1 || rows2)? res.send('Successful'):res.send('Unsuccessful');
    }
    catch (err) {
        console.log("Error: ", err);
    }
    finally {
        if(conn)
            conn.release();
    }
});

module.exports = router;
