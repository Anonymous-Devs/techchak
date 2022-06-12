const config = require('../configs/config')
const fs = require('fs')
module.exports = {
  async up(db, client) {
    
    // if(config.env.toLowerCase() == 'development') 
    // await db.collection('accounts').find()
    
  },

  async down(db, client) {
    // if(config.env.toLowerCase() == 'development') 
    // await db.dropCollection('accounts')
    // await db.dropCollection('profiles')
    // await db.dropDatabase(e=>console.log('Database dropped'))
  }
};
