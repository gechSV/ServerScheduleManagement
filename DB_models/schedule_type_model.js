const {Sequelize, DataTypes, Model} = require('sequelize');

const sequelize = new Sequelize("schedule_manegement_db", "postgres", "sadamit2242", {
    dialect: "postgres",
    host: "localhost"
  });

  class ScheduleType extends Model {};

  ScheduleType.init({
   type: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
   } 
  }, 
  {
    sequelize,
    modelName: "schedule_types",
    timestamps: true,
  });
  

exports.ScheduleType = ScheduleType;
  