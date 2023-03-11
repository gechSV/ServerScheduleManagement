const express = require('express')

// Конфигурационный файл
const config = require('./config.json')

const router = require('./index')
const app = express()

const host = config.socket.host_ip
const port = config.socket.port 


app.listen(port, host, function(){
    return console.log('\033[95mServer listens \033[96m'+`http://${host}:${port}` + '\033[0m')
})

app.use('/', router)
app.use('/getAllGroup', router)