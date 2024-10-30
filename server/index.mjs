import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';

const environment = process.env.NODE_ENV

dotenv.config()

const port = 3001;
const { Pool } = pkg;

const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const openDB = () => {
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.NODE_ENV === 'development' ? process.env.DB_NAME : process.env.TEST_DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    })
    return pool
}

app.get('/', (req, res) => {
    const pool = openDB()
    
    pool.query('SELECT * FROM task', (error, result) => {
        pool.end()
        if (error) {
            return res.status(500).json({ error: error.message })
        }
        return res.status(200).json(result.rows)
    })
})

app.post('/create', (req, res) => {
    const pool = openDB()
    
    pool.query('INSERT INTO task (description) VALUES ($1) RETURNING id',
        [req.body.description], 
        (error, result) => {
            pool.end();
            if (error) {
                return res.status(500).json({ error: error.message })
            }
            return res.status(200).json({id: result.rows[0].id})
        }
    )
})

app.delete('/delete/:id', (req, res) => {
    const pool = openDB();
    const id = parseInt(req.params.id);

    pool.query(
        'DELETE FROM task WHERE id = $1',
        [id],
        (error, result) => {
            pool.end(); // Close the pool connection
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ id: id });
        }
    );
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`) 
})