const axios = require('axios');
const cheerio = require('cheerio');
var FormData = require('form-data');

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
    // console.log(selectGr.html())
    
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

    // for(let i = 0; i < data.length; i++){

    // }
    
    console.log(`The schedule of the ${strNameGroup} group has been received`)
    return data;
}

exports.getAllGroup = getAllGroup;
exports.getEventListByGroup = getEventListByGroup;


// await axios.get(url)
// .then(response => {

//     htmlBody = response.data;

//     // Создаём объект cheerio, передав в него html код
//     const $ = cheerio.load(htmlBody);

//     // console.log($('select#type_group option').text())

//     // Получаем список групп
//     $('select#type_group option').each((i, elem) =>{
//         data.push({
//             nameGroup: $(elem).text()
//         });
//     });
// })

// .catch(error =>{
//     console.log(error);
// })




// eventNum: $(elem).find('tr:nth-child(2) td:nth-child(2)').text(),
// eventNum2: $(elem).find('tr:nth-child(2) td:nth-child(3)').text(),
// eventNum3: $(elem).find('tr:nth-child(2) td:nth-child(4)').text(),
// eventNum4: $(elem).find('tr:nth-child(2) td:nth-child(5)').text(),

// eventNum11: $(elem).find('tr:nth-child(3) td:nth-child(2)').text(),
// eventNum22: $(elem).find('tr:nth-child(3) td:nth-child(3)').text(),
// eventNum33: $(elem).find('tr:nth-child(3) td:nth-child(4)').text(),
// eventNum44: $(elem).find('tr:nth-child(3) td:nth-child(5)').text(),

// eventNum111: $(elem).find('tr:nth-child(4) td:nth-child(2)').text(),
// eventNum222: $(elem).find('tr:nth-child(4) td:nth-child(3)').text(),
// eventNum333: $(elem).find('tr:nth-child(4) td:nth-child(4)').text(),
// eventNum444: $(elem).find('tr:nth-child(4) td:nth-child(5)').text(),
// eventNum111: $(elem).find('tr:nth-child(4) td:nth-child(6)').text(),
// eventNum222: $(elem).find('tr:nth-child(4) td:nth-child(7)').text(),
// eventNum333: $(elem).find('tr:nth-child(4) td:nth-child(8)').text(),
// eventNum444: $(elem).find('tr:nth-child(4) td:nth-child(5)').text(),