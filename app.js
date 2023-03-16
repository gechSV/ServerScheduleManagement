const express = require('express')

// Конфигурационный файл
const config = require('./config.json')

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    "schedule_manegement_db", 
    "postgres", 
    "sadamit2242", {
    dialect: "postgres",
    host: "localhost"
  });

const {Schedule} = require('./DB_models/schedule_model.js')
const {ScheduleType} = require('./DB_models/schedule_type_model.js')
const {Organization} = require('./DB_models/organization_model.js')

const router = require('./index')
const app = express()

const host = config.socket.host_ip
const port = config.socket.port 


app.listen(port, host, async function(){

    sequelize.authenticate().then(() => {
        console.log('Connection has been established successfully.');
     }).catch((error) => {
        console.error('Unable to connect to the database: ', error);
    });

    await ScheduleType.sync();
    await Organization.sync();
    await Schedule.sync();

    return console.log('\033[95mServer listens \033[96m'+`http://${host}:${port}` + '\033[0m')
})

app.use('/', router)
app.use('/getAllGroup', router)