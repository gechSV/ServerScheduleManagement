const {Sequelize, DataTypes, Model} = require('sequelize');

const sequelize = new Sequelize("schedule_manegement_db", "postgres", "sadamit2242", {
    dialect: "postgres",
    host: "localhost"
});

const {ScheduleType} = require('./schedule_type_model.js')
const {Organization} = require('./organization_model.js')

/**
 * Модель для таблицы БД, отвечающей за хранение 
 * расписания и его служебных параметров
 */
const Schedule = sequelize.define("schedules", 
{
  name:{
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true
  }, 
  schedule:{
    type: DataTypes.JSON,
    allowNull: false
  }, 
  password:{
    type: DataTypes.STRING
  }
}, 
{
  timestamps: true,
  createdAt: false, 
  updatedAt: 'updateTimestamp'
}
);


ScheduleType.hasMany(Schedule, {as: "schedules"});
Schedule.belongsTo(ScheduleType, {
  foreignKey: "id",
  as: "schedule_types"
})

Organization.hasMany(Schedule, {as: "schedules"});
Schedule.belongsTo(Organization, {
  foreignKey: "id",
  as: "organizations"
})

exports.Schedule = Schedule;  
