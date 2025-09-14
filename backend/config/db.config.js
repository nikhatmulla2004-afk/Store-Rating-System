module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "SHA_31*hid", // You need to change this to your MySQL root password
  DB: "store_rating_db",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};