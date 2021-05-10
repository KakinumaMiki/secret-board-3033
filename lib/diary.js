'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/secret_board_aid',
  {
    logging: false
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false
    //   }
    // }
  });
const Diary = sequelize.define(
  'Diary',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING
    },
    content: {
      type: Sequelize.TEXT
    },
    postedBy: {
      type: Sequelize.STRING
    },
    trackingCookie: {
      type: Sequelize.STRING
    }
  },
  {
    freezeTableName: true,
    timestamps: true
  }
);

Diary.sync();
module.exports = Diary;