const express = require('express');
const router = express.Router();

// Rotta placeholder vuota per evitare crash
router.get('/', (req, res) => {
    res.json([]);
});

module.exports = router;