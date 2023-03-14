const fs = require("fs");
const config = require('../config.json')


// Функция для записи данных в файл формата json
function writeJSONFile(dirName, fileName, data){

    // Существует ли дериктория для записи: если нет -- создать
    if(!fs.existsSync(config.file_setting.main_dir + dirName)){
        fs.mkdirSync(config.file_setting.main_dir + dirName, { recursive: true });
    }

    // Запись данных в файл 
    fs.writeFileSync(config.file_setting.main_dir + dirName + '\\' + fileName + '.json', 
                    data, function(error){
            if(error) throw error;
    });

    console.log(`FileIO: The file ${fileName} is recorded in memory`);
}


// Функция для чтения данных из файла формата .json
function readJSONFile(dirName, fileName){

    // Существует ли дериктория для записи: если нет сгенерировать ошибку
    if(!fs.existsSync(config.file_setting.main_dir + dirName)){
        throw new Error(`FileIO: The directory "${dirName}" does not exist`)
    }

    let allGroupList = fs.readFileSync(config.file_setting.main_dir + dirName + '\\' + fileName + '.json', "utf8",
    function(error){
        if(error) throw error;
    }); 

    console.log(`FileIO: The file ${fileName} has been read in memory`);
    return allGroupList;
}


exports.writeJSONFile = writeJSONFile
exports.readJSONFile = readJSONFile