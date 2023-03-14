const axios = require('axios');
const cheerio = require('cheerio');
var FormData = require('form-data');
const FIO = require('./FileIO')
const config = require('../config.json');

const url = 'https://zabgu.ru/schedule'



// Функция предназначенная для получения списка всех групп 
async function getAllGroup(){
    const data = []
    // Совершаем запрос на сайт забгу
    // В качестве ответа получим html код страницы - htmlBody
        
    const reqUrl = await axios.get(url);
    const htmlBody = await reqUrl.data;

    const $ = cheerio.load(htmlBody);

    const selectGr = await $('select#type_group option')
    
    selectGr.each((i, elem) =>{
                data.push({
                    nameGroup: $(elem).text()
                });
            });

    console.log('ScheduleParser: the list of groups has been received');
    return data;
}



// Функция предназначенная для получения списка событий по заданной группе
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

    const selectGr = await $('table.schedule_table')

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
                if ($(elem).find(`tr:nth-child(${j}) td:nth-child(${c})`).text().length < 3){
                    startIndex ++;
                }
                else{
                    break;
                }
            }
            
            data.push({
                WeekDayNumber: counterWeekDay,
                WeekType:counterWeekType,
                EventNumber: Math.floor(counterEventNum),
                Name: $(elem).find(`tr:nth-child(${j}) td:nth-child(${startIndex})`).text(),
                Type: $(elem).find(`tr:nth-child(${j}) td:nth-child(${startIndex + 1})`).text(),
                Host: $(elem).find(`tr:nth-child(${j}) td:nth-child(${startIndex + 2})`).text(),
                Location: $(elem).find(`tr:nth-child(${j}) td:nth-child(${startIndex + 3})`).text(),
                Location2: $(elem).find(`tr:nth-child(${j}) td:nth-child(${startIndex + 4})`).text(),
            }); 

            startIndex = 2;
            counterWeekType++;
            counterEventNum += 0.5;
        }
    });
    
    console.log(`ScheduleParser: The schedule of the ${strNameGroup} group has been received`)
    return data;
}


// Функция для получения списка наименований всех групп ЗабГУ
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



// Функция для чтения всех расписаний груп и запись их в отдельные файлы
async function getAllGroupSchedule(){

    //Записываем наименования всех групп в файл 
    await readAllGroupName();

    let allGroupList = []

    //  Читаем список групп из файла 
    try {
        allGroupList = JSON.parse(FIO.readJSONFile(config.file_setting.dir_for_group_list, 'ZabGU_Group_list')); 
    } catch (error) {
        console.log(error);
        return;
    }

    allGroupList.forEach(async function(group){
        // Получаем рассписание группы по её названию - nameGroup : ИВТ(ивт)-19
        groupSchedule = await getEventListByGroup(group.nameGroup);

        // Записываем расписание группы в файл
         try {
            FIO.writeJSONFile(config.file_setting.dir_for_schedule, 
                            'group_schedule_(' + group.nameGroup + ')', JSON.stringify(groupSchedule));
        } catch (error) {
            console.log(error)
        }
    })

}

exports.getAllGroup = getAllGroup;
exports.getEventListByGroup = getEventListByGroup;
exports.readAllGroupName = readAllGroupName
exports.getAllGroupSchedule = getAllGroupSchedule
