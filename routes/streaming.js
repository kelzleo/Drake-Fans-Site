const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.render('streaming', {title: 'Streaming page'})
})

module.exports = router;