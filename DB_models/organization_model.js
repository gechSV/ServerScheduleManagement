const {Sequelize, DataTypes, Model} = require('sequelize');

const sequelize = new Sequelize("schedule_manegement_db", "postgres", "sadamit2242", {
    dialect: "postgres",
    host: "localhost"
  });

  class Organization extends Model {};

  Organization.init({
   name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
   } 
  }, 
  {
    sequelize,
    modelName: "organizations",
    timestamps: true,
  });


exports.Organization = Organization;
  