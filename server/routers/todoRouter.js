import { emptyOrRows } from '../helper/utils.js';
import { pool } from '../helper/db.js';
import { Router } from "express";

const router = Router()

router.get('/', (req, res, next) => {
    pool.query('SELECT * FROM task', (error, result) => {
        if (error) {
            return next(error)
        }
        return res.status(200).json(emptyOrRows(result))
    })
})

router.post('/create', (req, res, next) => {
    pool.query('INSERT INTO task (description) VALUES ($1) RETURNING id',
        [req.body.description], 
        (error, result) => {
            if (error) {
                return next(error);
            }
            return res.status(201).json({ id: result.rows[0].id }); // Rückgabe der neuen ID
        }
    );
});



router.delete('/delete/:id', (req, res, next) => {
    const id = parseInt(req.params.id)
    pool.query(
        'DELETE FROM task WHERE id = $1',
        [id],
        (error, result) => {
            if (error) {
                return next(error)
            }
            return res.status(200).json({ id: id });
        }
    );
});

export default router;