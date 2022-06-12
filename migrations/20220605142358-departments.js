const k = require('./seeds/csvData');

module.exports = {
  async up(db, client) {
    try {
      let m = "departments";
      let f = [];
      let r = await k(m);
      r.forEach(e => f.push({
        name: e
      }));
      console.log(f);
      await db.collection('departments').insertMany(f)

    } catch (e) {
      console.error(e);
    }
  },

  async down(db, client) {

    await db.collection('departments').deleteMany({});
  }
};