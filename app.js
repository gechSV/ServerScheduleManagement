const express = require('express')

// Конфигурационный файл
const config = require('./config.json')

// Подключение к postgres
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    "schedule_manegement_db", 
    "postgres", 
    "sadamit2242", {
    dialect: "postgres",
    host: "localhost"
  });

// Подключение моделей БД
const {ScheduleType} = require('./DB_models/schedule_type_model.js')
const {Organization} = require('./DB_models/organization_model.js')
const {Schedule} = require('./DB_models/schedule_model.js')

const {DB_logic} = require('./db_logic')
const db_logic = new DB_logic()

const router = require('./index');
const app = express()

const host = config.socket.host_ip
const port = config.socket.port 


app.listen(port, host, async function(){

    // await sequelize.authenticate().then(async () => {
    //     console.log('Connection has been established successfully.');
    //  }).catch((error) => {
    //     console.error('Unable to connect to the database: ', error);
    // });

    // await ScheduleType.sync({ alter: true })
    // await Organization.sync({ alter: true })
    // await Schedule.sync({ alter: true })

    // await db_logic.addOrganization("ЗабГУ")
    // await db_logic.addScheduleType("Пользовательское")
    // await db_logic.addSchedule('ИВТ-19-1', "РАСПИСАНИЕ", "", 1, 2)

    return console.log('\033[95mServer listens \033[96m'+`http://${host}:${port}` + '\033[0m')
})

app.use('/', router)
app.use('/getAllGroup', router)