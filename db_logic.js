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

        ScheduleType.sync()
        Organization.sync()
        Schedule.sync()
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
            .then(() => console.log('\x1b[32m', 'db_logic: В таблтцу organizations добавлена запись', '\x1b[0m'))
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
            .then(() => console.log('\x1b[32m', 'db_logic: В таблтцу scheduleType добавлена запись', '\x1b[0m'))
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
            .then(() => console.log('\x1b[32m', 'db_logic: В таблтцу schedule добавлена запись', '\x1b[0m'))
            .catch(err=> {throw new Error("db_logic: " + err)})
        }
        else{
            throw new Error("db_logic: incorrect param")
        }
        
    }

    /**
     * Функция для выгрузки в таблицу schedule большого количества строк одновременно
     * @param {*} scheduleArray массив данных формата: {
                name: name,
                schedule: schedule,
                password: '1234',
                scheduleTypeId: 1,
                organizationId: 1
            } 
     */
    async bulkAddScedule(scheduleArray){
        Schedule.bulkCreate(scheduleArray)
        .then(() => console.log('\x1b[32m', `db_logic: В таблтцу schedule успешно добавленны ${scheduleArray.length} 
            записей.`, '\x1b[0m'))
            .catch(err=> {throw new Error("db_logic: " + err)})
    }


    /**
     * Функция для получения id органицации по его имени
     * @param {*} orgName нименование
     * @returns organizationId
     */
    async getOrganizationIdByName(orgName){
        const id = await Organization.findOne({
            raw:true, 
            attributes: ['id'],
            where:{
                name: orgName
            }
        })
        .catch(err=> {throw new Error("db_logic: " + err)});

        return id;
    }

    /**
     * Функция для получения сиска нименования всех групп по имени организации
     */
    async getAllGroupNameByOrgName(orgName){

        if(orgName === null){
            throw new Error(`db_logic: orgName = null`);
        }

        const orgId = await this.getOrganizationIdByName(orgName);
        if(orgId == null){
            throw new Error(`db_logic: в таблице organizations не было найдено совпадений по имнени ${orgName}`);
        }

        const allGroupName = await Schedule.findAll({
            raw: true,
            attributes: ['name'],
            where: {
                organizationId: orgId.id
            }
        })
        .catch(err=> {throw new Error("db_logic: " + err)});

        return allGroupName;
    }

    /**
     * Функция для получения расписания в формате JSON по названию
     * @param {*} scName название расписания 
     * @returns json
     */
    async getScheduleByName(scName){

        if(scName === null){
            throw new Error(`db_logic: scName = null`);
        }

        const schedule = await Schedule.findOne({
            raw: true,
            attributes: ['schedule'],
            where: {
                name: scName
            }
        })
        .catch(err=> {throw new Error("db_logic: " + err)});

        if(schedule === null){
            throw new Error(`db_logic: в таблице schedule не было найдено совпадений по имнени ${scName}`);
        }

        return JSON.parse(schedule['schedule']);
    }
}

exports.DB_logic = DB_logic