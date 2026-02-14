const express = require('express');
const router = express.Router();
const { getUpcomingContests, getAllContests } = require('../controllers/contestController');

router.get('/upcoming', getUpcomingContests);
router.get('/all', getAllContests);

module.exports = router;
