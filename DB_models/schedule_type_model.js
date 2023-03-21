const {Sequelize, DataTypes, Model} = require('sequelize');

const sequelize = new Sequelize("schedule_manegement_db", "postgres", "sadamit2242", {
    dialect: "postgres",
    host: "localhost"
  });

/**
 * Модель для таблицы БД, отвечающей за 
 * индификацию типа расписания: пользовательское, школьное, для универа и тп. 
 */
const ScheduleType = sequelize.define("schedule_types",
  {
   type: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
   } 
  }, 
  {
    sequelize,
    timestamps: false,
  }
);

// sequelize.sync({ alter: true })

exports.ScheduleType = ScheduleType;
  