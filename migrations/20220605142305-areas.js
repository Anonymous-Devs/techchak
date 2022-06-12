const p = require('./seeds/areas');

module.exports = {
  async up(db, client) {
    try {
      await db.collection('areas').insertMany(p);
    } catch (e) {
      console.error(e);
    }
  },

  async down(db, client) {

    await db.collection('areas').deleteMany({});
  }
};