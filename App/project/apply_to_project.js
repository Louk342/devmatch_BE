const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db'); // db.js 파일 경로

router.post('/applyToProject', [
    body('id').isInt({ min: 1 }).withMessage('Applicant ID must be a positive integer'),
    body('project_id').isInt({ min: 1 }).withMessage('Project ID must be a positive integer'),
    body('role').isIn(['Developer', 'Designer', 'Planner']).withMessage('Role must be one of Developer, Designer, or Planner'),
    body('status').isIn(['applied', 'cancelled']).withMessage('Status must be either applied or cancelled')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id, project_id, role, status } = req.body;

    try {
        const query = `
            INSERT INTO Applications (id, project_id, role, status)
            VALUES (?, ?, ?, ?)
        `;
        await db.query(query, [id, project_id, role, status]);
        res.status(201).send({ message: '지원 완료' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: '지원 중 오류 발생' });
    }
});

module.exports = router;
