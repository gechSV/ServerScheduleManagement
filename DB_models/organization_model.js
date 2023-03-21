const {Sequelize, DataTypes, Model} = require('sequelize');

const sequelize = new Sequelize("schedule_manegement_db", "postgres", "sadamit2242", {
    dialect: "postgres",
    host: "localhost"
  });


/**
 * Модель для таблицы БД, отвечающей за индефикацию организации, 
 * которой пренадлежит данное расписание: пользовательское, ЗабГУ, школа №1, и тп.
 */
const Organization = sequelize.define("organizations", 
  {
   name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
   } 
  }, 
  {
    timestamps: false,
  }
);

// sequelize.sync({ alter: true })

exports.Organization = Organization;
  