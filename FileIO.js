const fs = require("fs");
const config = require('./config.json')


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

exports.writeJSONFile = writeJSONFile