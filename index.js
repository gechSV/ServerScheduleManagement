const { all } = require('axios');
const express = require('express')
const router = express.Router()
const https = require('https');

const ZabGUParser = require('./ScheduleParser')
const FIO = require('./FileIO')
const config = require('./config.json')

router.use(express.static('public'))

router.get('/', function(req, res){ 
        res.status(200).send({message: 'ok'})
})


router.get('/getAllGroup', (async function(req, res){

    let allGroup = []

    // Получаем список групп
    allGroup = await ZabGUParser.getAllGroup();
    // console.log(allGroup);

    // Получаем рассписание группы по её названию <<ИВТ(ивт)-19>>
    groupSchedule = await ZabGUParser.getEventListByGroup('ИВТ(ивт)-19');
    // console.log(groupSchedule);

    try {
        FIO.writeJSONFile(config.file_setting.dir_for_group_list, 
                        'ZabGU_Group_list', JSON.stringify(allGroup));
    } catch (error) {
        console.log(error)
        res.status(500).send({message: 'File writing error'})
    }

    res.status(200).send({message: 'ok'})
}))



 

module.exports = router;




// $("*") — The asterisk sign (*) is used as a wildcard selector, which will select every element on the provided markup
// $("div") — Tag selector: selects every instance of the tag provided. In this case, it will select every instance of the <div> tag
// $(".foo") — Class: selects every element that has the foo class applied to it
// $("#bar") — Id: selects every element that has the unique bar id
// $(":focus") — selects the element that currently has focus
// $("input[type='text']") — Attribute: selects any input element with an input type of text
// $('.bar, '#foo) — Selects all child elements with class bar, under an element with foo class
