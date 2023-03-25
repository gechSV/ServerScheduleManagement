const { all } = require('axios');
const express = require('express')
const router = express.Router()
const https = require('https');

const ZabGUParser = require('./modules/ScheduleParser')
const FIO = require('./modules/FileIO')
const config = require('./config.json');

const {DB_logic} = require('./db_logic');
const { Console } = require('console');
const db_logic = new DB_logic()

router.use(express.static('public'))

router.get('/', function(req, res){ 
        res.status(202).send({message: 'ok'});
})

/**
 * API для получения списка наименований всех групп по названию организации
 * пример запроса: http://127.0.0.1:8000/api/getScheduleNameListByOrganizatonName/ЗабГУ
 */
router.get("/api/getScheduleNameListByOrganizatonName/:organizationName", 
async function(req, res){
        const orgName = await req.params.organizationName;

        // console.log(await db_logic.getOrganizationIdByName(orgName));

        try {
                res.status(200).send(await db_logic.getAllGroupNameByOrgName(orgName));        
        } catch (error) {
                console.log(error);
                res.status(400).send({message: `${error}`});
        }
        
})

/**
 * API для получения расписания по его названию
 * пример запроса: http://127.0.0.1:8000/api/getScheduleByGroupName/АФК-20
 */
router.get("/api/getScheduleByGroupName/:scheduleName", async function(req, res){
        
        const scheduleName = await req.params.scheduleName;

        try {
                const schedule = await db_logic.getScheduleByName(scheduleName)
                res.status(200).send(schedule);        
        } catch (error) {
                console.log(error);
                res.status(400).send({message: `${error}`});
        }
})


router.get("/api/getAllOrganization")



module.exports = router;

