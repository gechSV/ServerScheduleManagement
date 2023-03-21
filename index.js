const { all } = require('axios');
const express = require('express')
const router = express.Router()
const https = require('https');

const ZabGUParser = require('./modules/ScheduleParser')
const FIO = require('./modules/FileIO')
const config = require('./config.json');

router.use(express.static('public'))

router.get('/', function(req, res){ 
        res.status(200).send({message: 'ok'})
})

module.exports = router;

