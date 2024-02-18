const mongoose = require('mongoose');
const logger = require('../utils /logger');
require('dotenv').config();

// General container
const config = {};

mongoose.set('strictQuery', false);
config.connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.dbUrl, {});
    logger.info(
      `\x1b[36m%s\x1b[0m`,
      `DB: MongoDB Connected: ${conn.connection.host}`,
    );
  } catch (error) {
    logger.error(
      `\x1b[31m%s\x1b[0m`,
      `DB: MongoDB Conn Failure: ${error.message}`,
    );
    process.exit(1);
  }
};

module.exports = config;
