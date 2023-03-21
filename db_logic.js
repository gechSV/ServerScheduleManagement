// Конфигурационный файл
const config = require('./config.json')

// Подключение к postgres
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    "schedule_manegement_db", 
    "postgres", 
    "sadamit2242", {
    dialect: "postgres",
    host: "localhost",
    pool: {
        max: 30,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
  });

// Подключение моделей БД
const {ScheduleType} = require('./DB_models/schedule_type_model.js')
const {Organization} = require('./DB_models/organization_model.js')
const {Schedule} = require('./DB_models/schedule_model.js')

class DB_logic{

    constructor(){
        sequelize.authenticate().then(async () => {
            console.log('Connection has been established successfully.');
         }).catch((error) => {
            console.error('Unable to connect to the database: ', error);
        });

        ScheduleType.sync({ alter: true })
        Organization.sync({ alter: true })
        Schedule.sync({ alter: true })
    }

    /**
     * Добавление строки в таблицу organizations
     * @param {*} name название организации
     */
    async addOrganization(name){
        if (name != null){
            await Organization.create({
                name: name
            })
            .then(() => console.log('\x1b[32m', 'db_logic: В таблтцу organizations добавлена запись'))
            .catch(err=> {throw new Error("db_logic: " + err)})
        }
        else{
            throw new Error("db_logic: name == null")
        }
        console.log('\x1b[32m', 'db_logic: В таблтцу organizations добавлена запись')
    }

    /**
     * Добавление строки в таблицу scedule_types
     * @param {*} type тип расписания
     */
    async addScheduleType(type){
        if (type != null){
            await ScheduleType.create({
                type: type
            })
            .then(() => console.log('\x1b[32m', 'db_logic: В таблтцу scheduleType добавлена запись'))
            .catch(err=> {throw new Error("db_logic: " + err)})
        }
        else{
            throw new Error("db_logic: type == null")
        }
    }

    /**
     * Добавление строки в таблицу schedules
     * @param {*} name название расписания (уникально)
     * @param {*} schedule расписание (.json)
     * @param {*} password пароль для доступа (len == 0 || len >= 4) 
     * @param {*} scheduleTypeId внешний ключ: id типа (fk) 
     * @param {*} organizationId внешний ключ: id организации (fk)
     */
    async addSchedule(name, schedule, password, scheduleTypeId, organizationId){

        if ((name !== null) && (schedule !== null) && (password.length == 0 || password.length >= 4)
            && (scheduleTypeId !== null) && (organizationId !== null)){

            // const typeCheck = await ScheduleType.findOne({where: {id: scheduleTypeId}})
            // if (typeCheck === null){
            //     throw new Error('db_logic: тип расписания не был найден по индексу: ' + scheduleTypeId)
            // }

            // const organizationCheck = await Organization.findOne({where: {id: organizationId}})
            // if (organizationCheck === null){
            //     throw new Error('db_logic: организация не был найдена по индексу: ' + organizationId)
            // }

            Schedule.create({
                name: name,
                schedule: schedule,
                password: password,
                scheduleTypeId: scheduleTypeId,
                organizationId: organizationId
            })
            .then(() => console.log('\x1b[32m', 'db_logic: В таблтцу schedule добавлена запись'))
            .catch(err=> {throw new Error("db_logic: " + err)})
        }
        else{
            throw new Error("db_logic: incorrect param")
        }
        
    }

    async bulkAddScedule(scheduleArray){
        Schedule.bulkCreate(scheduleArray)
    }
}

exports.DB_logic = DB_logic