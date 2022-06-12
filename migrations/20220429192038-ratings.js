const ratings = require('./seeds/ratings');
module.exports = {
  async up(db, client) {
    await db.collection('ratings').insertMany(ratings);
  },

  async down(db, client) {
    let data = {type: ratings[0].type};
    
    let result = await db.collection('ratings').deleteMany(data);
    // await db.collection('ratings').drop();
    console.info(result)
  }
};
