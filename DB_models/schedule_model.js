const {Sequelize, DataTypes, Model} = require('sequelize');

const sequelize = new Sequelize("schedule_manegement_db", "postgres", "sadamit2242", {
    dialect: "postgres",
    host: "localhost",
    logging: false
});

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

/**
 * Модель для таблицы БД, отвечающей за индефикацию организаций, 
 * по типу деятельности ВУЗ, Школа, пользователи и тп
 */
const OrganizationType = sequelize.define("organization_types", 
  {
   type_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
   } 
  }, 
  {
    timestamps: false,
  }
);

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

OrganizationType.hasMany(Organization, {as: "organizations"});
Organization.belongsTo(OrganizationType, {
  foreignKey: "id",
  as: "organization_types"
})

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

sequelize.sync({alter:true})

exports.Schedule = Schedule; 
exports.ScheduleType =ScheduleType;
exports.Organization = Organization;
exports.OrganizationType = OrganizationType;

