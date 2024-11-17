const express = require('express');
const router = express.Router();

router.post('/doLogout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send({ error: 'An error occurred while logging out' });
        }
        res.clearCookie('session_cookie_name');
        res.status(200).send({ message: 'Logout successful' });
    });
});

module.exports = router;
