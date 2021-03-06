'use strict';
const path = require('path');
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // 初始化消息通知表
      const schema = require(path.join('../../app/schema/notice.js'))({ Sequelize });
      await queryInterface.createTable('notice', schema);
    } catch (e) {
      console.log(e);
    }
  },

  async down(queryInterface) {
    // 删除消息通知表
    await queryInterface.dropTable('notice');
  },
};
