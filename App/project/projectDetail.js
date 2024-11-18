const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/projectDetail', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Project ID parameter is required' });
    }

    try {
        const query = `
            SELECT 
                p.*, 
                ps.stack_id 
            FROM 
                Project p
            LEFT JOIN 
                Project_Stack ps ON p.project_id = ps.project_id
            WHERE 
                p.project_id = ?
        `;
        const [results] = await db.query(query, [id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the project details' });
    }
});

module.exports = router;

//GET  http://devmatch.ddns.net/project/projectSearch?id=0