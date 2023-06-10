const { all } = require('axios');
const express = require('express')
const router = express.Router()
const https = require('https');

const ZabGUParser = require('./modules/ScheduleParser')
const FIO = require('./modules/FileIO')
const config = require('./config.json');

const bodyParser  = require('body-parser');

const {DB_logic} = require('./db_logic');
const db_logic = new DB_logic()

router.use(express.static('public'))
router.use(bodyParser.urlencoded({extended: true}));

router.get('/', async function(req, res){ 
        try {
                const organizations = await db_logic.getAllOrganizationByType("Высшее учебное заведение");
                res.status(200).send(organizations);
        } catch (error) {
                console.log(error);
                res.status(400).send({message: `${error}`});  
        }
})

/**
 * API для получения списка наименований всех групп по названию организации
 * пример запроса: http://192.168.0.11:8000/api/getScheduleNameListByOrganizatonName/ЗабГУ/Расписание групп
 */
router.get("/api/getScheduleNameListByOrganizatonName/:organizationName/:scheduleType", 
async function(req, res){
        const orgName = await req.params.organizationName;
        const schType = await req.params.scheduleType;

        // console.log(await db_logic.getOrganizationIdByName(orgName));

        try {
                const groups = await db_logic.getAllGroupNameByOrgName(orgName, schType);
                res.status(200).send(groups);        
        } catch (error) {
                console.log(error);
                res.status(400).send({message: `${error}`});
        }
        
})

/**
 * API для получения расписания по его названию
 * пример запроса: http://192.168.0.11:8000/api/getScheduleByGroupName/АФК-20/
 * headers: {'password': 'zabgu'}
 */
router.get("/api/getScheduleByGroupName/:scheduleName", async function(req, res){
        
        const scheduleName = await req.params.scheduleName;
        // const password = await req.params.password;
        const password = req.headers["password"];

        try {
                const schedule = await db_logic.getScheduleByName(scheduleName, password)
                res.status(200).send(schedule);        
        } catch (error) {
                console.log(error);
                res.status(400).send({message: `${error}`});
        }
})

/**
 * API для получения расписания пользователя по его названию
 * пример запроса: http://192.168.0.11:8000/api/getUserSchedule/name/
 */
router.get("/api/getUserSchedule/:scheduleName", async function(req, res){
        
        const scheduleName = await req.params.scheduleName;

        try {
                const schedule = await db_logic.getScheduleByName(scheduleName)
                res.status(200).send(schedule);        
        } catch (error) {
                console.log(error);
                res.status(400).send({message: `${error}`});
        }
})


/**
 * API для получения списка организаций по типу организации
 * пример запроса: http://192.168.0.11:8000/api/getAllOrganizationByOrgType/Высшее учебное заведение
 */
router.get("/api/getAllOrganizationByOrgType/:typeOrgName", async function(req, res){

        const typeOrgName = await req.params.typeOrgName;

        try {
                const organizations = await db_logic.getAllOrganizationByType(typeOrgName);
                res.status(200).send(organizations);
        } catch (error) {
                console.log(error);
                res.status(400).send({message: `${error}`});  
        }

})

/**
 * API для добавления расписания пользователя в базу данных
 */
router.post("/api/addSchedule/",async function(req, res){
        const name = await req.body.ScheduleName;
        const password = await req.body.Password;
        const schedule = await req.body.Schedule;
        
        console.log(name)
        console.log(password)
        console.log(schedule)
        
        try {
                await db_logic.addNewUserSchedule(name, password, schedule, 3, 3)
        } catch (error) {
                res.status(500).send("err")
                return
        }

        res.status(200).send("ok")
})


module.exports = router;

