const axios = require('axios');
const cheerio = require('cheerio');
var FormData = require('form-data');
const FIO = require('./FileIO')
const config = require('../config.json');

const url = 'https://zabgu.ru/schedule'

const {DB_logic} = require('../db_logic');
const { Schedule } = require('../DB_models/schedule_model');
const { json } = require('sequelize');
const db_logic = new DB_logic()

/**
 * Функция предназначенная для получения списка всех групп с сайта ZabGU.ru
 * @returns массив объектов: {nameGroup: "name"}
 */
async function getAllGroup(){
    const data = []
    // Совершаем запрос на сайт забгу
    // В качестве ответа получим html код страницы - htmlBody
        
    const reqUrl = await axios.get(url);
    const htmlBody = await reqUrl.data;

    const $ = cheerio.load(htmlBody);

    const selectGr = $('select#type_group option')
    
    selectGr.each((i, elem) =>{
                data.push({
                    nameGroup: $(elem).text()
                });
            });

    console.log('ScheduleParser: the list of groups has been received');
    return data;
}



/**
 * Функция предназначенная для получения списка событий по 
 * заданной группе с сайта ZabGU.ru
 * @param {*} strNameGroup название группы
 * @returns объект содержащий расписание группы
 */
async function getEventListByGroup(strNameGroup){

    var dataURL = new FormData();
    dataURL.append('group', strNameGroup);

    var config = {
        method: 'post',
      maxBodyLength: Infinity,
        url: 'https://zabgu.ru/schedule',
        headers: { 
          ...dataURL.getHeaders()
        },
        data : dataURL
      };


    const reqUrl = await axios(config)
    .catch(function (error) {
        console.log(error);
    })

    const htmlBody = await reqUrl.data;

    const $ = cheerio.load(htmlBody);

    const selectGr = $('table.schedule_table')

    let data = [];
    let counterWeekDay = 0;
    let counterWeekType = 1; 
    let counterEventNum = 1;
    
    let startIndex = 2;

    selectGr.each((i, elem) =>{
        for (let j = 2; j < 98; j++) {

            if((j - 2) % 14 == 0) 
                counterWeekDay++;

            if(counterWeekType == 3)
                counterWeekType = 1

            if((counterEventNum == 8))
                counterEventNum = 1
            

            for(let c = 2; c < 8; c ++){
                if ($(elem).find(`tr:nth-child(${j}) td:nth-child(${c})`).text().length < 3 
                    || $(elem).find(`tr:nth-child(${j}) td:nth-child(${c})`).text() == '  в'){
                    startIndex ++;
                }
                else{
                    break;
                }
            }
            
            let NameCon = $(elem).find(`tr:nth-child(${j}) td:nth-child(${startIndex})`).text();
            let TypeCon = $(elem).find(`tr:nth-child(${j}) td:nth-child(${startIndex + 1})`).text();
            let HostCon = $(elem).find(`tr:nth-child(${j}) td:nth-child(${startIndex + 2})`).text();
            let LocationCon = $(elem).find(`tr:nth-child(${j}) td:nth-child(${startIndex + 3})`).text();
            let Location2Con = $(elem).find(`tr:nth-child(${j}) td:nth-child(${startIndex + 4})`).text();

            if (!NameCon.length == 0 && !TypeCon.length == 0 && 
                !LocationCon.length == 0 && !Location2Con.length == 0){
                    data.push({
                        WeekDayNumber: counterWeekDay,
                        WeekType:counterWeekType,
                        EventNumber: Math.floor(counterEventNum),
                        Name: NameCon,
                        Type: TypeCon,
                        Host: HostCon,
                        faculty: LocationCon,
                        Location: Location2Con,
                    }); 
                }


            startIndex = 2;
            counterWeekType++;
            counterEventNum += 0.5;
        }
    });
    
    console.log(`ScheduleParser: The schedule of the ${strNameGroup} group has been received`)
    return data;
}


/**
 * Функция для получения списка наименований 
 * всех групп c цикличным расписанием ЗабГУ
 * @returns ничего)
 */
async function readAllGroupName (){
    let allGroupBuffer = []
    let  allGroup = [];

    // Получаем список групп
    allGroupBuffer = await getAllGroup();
    // console.log(allGroup);

    // Удаляем группы с не цикличным* расписанием  
    allGroupBuffer.forEach(function(group){
            if((!group.nameGroup.includes('з-')) && (!group.nameGroup.includes('зм-')) 
            && (!group.nameGroup.includes('мз-')) && (!group.nameGroup.includes('с-'))
            && (!group.nameGroup.includes('зк-'))){
                allGroup.push(group);
            }
    })

    // Записываем список групп в файл в формате JSON
    try {
        FIO.writeJSONFile(config.file_setting.dir_for_group_list, 
                        'ZabGU_Group_list', JSON.stringify(allGroup));
    } catch (error) {
        console.log(error);
        return;
    }
}



/**
 * Функция для чтения всех расписаний груп и запись их в базу данных
 * @returns ничего)
 */
async function getAllGroupSchedule(){

    // db_logic.addSchedule("test", "расписание", "test", 0, 0)

    //Записываем наименования всех групп в файл 
    await readAllGroupName();

    let allGroupList = []

    //  Читаем список групп из файла 
    try {
        allGroupList = await JSON.parse(FIO.readJSONFile(config.file_setting.dir_for_group_list, 'ZabGU_Group_list')); 
    } catch (error) {
        console.log(error);
        return;
    }

    const scheduleArray = []

    for (const group of allGroupList){
        // Получаем рассписание группы по её названию - nameGroup : ИВТ(ивт)-19
        groupSchedule = await getEventListByGroup(group.nameGroup);

        // Записываем расписание группы в массив
        try {
            // FIO.writeJSONFile(config.file_setting.dir_for_schedule, 
            //                 'group_schedule_(' + group.nameGroup + ')', JSON.stringify(groupSchedule));
            
            //await db_logic.addSchedule(group.nameGroup, JSON.stringify(groupSchedule), 'zabgu', 1, 1);

            scheduleArray.push({
                name: group.nameGroup,
                schedule: JSON.stringify(groupSchedule),
                password: 'zabgu',
                scheduleTypeId: 1,
                organizationId: 1});
            
        } catch (error) {
            console.log(error);
        }
    }

    console.log("scheduleArray")

    await db_logic.bulkAddScedule(scheduleArray);
    console.log("Данные добавлены в БД")
}


function process(item, teacherSchedule){
    return new Promise((resolve, reject) => {
        new Promise((resolve, reject) => {
            if(!teacherSchedule.hasOwnProperty(item['Host'])){

                // Совпадение не найдено, добавляем преподавателя в массив
                teacherSchedule[item['Host']] = []
                teacherSchedule[item['Host']].push(item)
                resolve()
            }
            else{

                // Проверка на повторение событий
                if(!teacherSchedule[item['Host']].includes(item)){
                    teacherSchedule[item['Host']].push(item)
                    resolve()
                }
            }
            resolve()
        })
    })
}


async function readTeacherSchedule() {
    const allSchedules = await db_logic.getTeacherSchedule();
  
    const teacherSchedule = allSchedules.reduce(
        // accumulator - Значение, полученное в результате предыдущего вызова callbackFn.
        (accumulator, current) => {

        const list = JSON.parse(current.schedule);

        for (const item of list) {

          const key = item.Host;

          if (!accumulator.has(key)) {
            accumulator.set(key, []);
            accumulator.get(key).push(item);
            continue;
          }

          if(!accumulator.get(key).includes(item)){
            accumulator.get(key).push(item);
          }

        }

        return accumulator;
      },

      new Map()

    );

    // console.log((typeof teacherSchedule))
    // return Array.from(teacherSchedule.values());

    return teacherSchedule;
}

async function pushTeacherDataToBD() {

    const result = await readTeacherSchedule();
    const scheduleArray = []

    for(const item of result){
        // console.log(item[1][0]['Host'])

        // console.log(result.item)


        try {

            scheduleArray.push({
                name: item[1][0]['Host'],
                schedule: JSON.stringify(item[1]),
                password: 'zabgu',
                scheduleTypeId: 2,
                organizationId: 1});
            
        } catch (error) {
            console.log(error);
        }

    }

    // await db_logic.deleteTeacherSchedule()
    await db_logic.bulkAddScedule(scheduleArray);

    // console.log(scheduleArray);
};

  


exports.getAllGroup = getAllGroup;
exports.getEventListByGroup = getEventListByGroup;
exports.readAllGroupName = readAllGroupName;
exports.getAllGroupSchedule = getAllGroupSchedule;
exports.readTeacherSchedule = readTeacherSchedule;
exports.pushTeacherDataToBD = pushTeacherDataToBD


