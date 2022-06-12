const {
  account,
  profile,
  portfolio
} = require('./seeds/fellows');

module.exports = {
  async up(db, client) {
    try {

      await db.collection('accounts').insertMany(account);
      await db.collection('profiles').insertMany(profile);
      await db.collection('portfolios').insertMany(portfolio);

    } catch (e) {
      console.log(e);
    }
  },

  async down(db, client) {
    try {
    let a = {acknowledged: true, deletedCount: 0}, b = {acknowledged: true, deletedCount: 0}, c = {acknowledged: true, deletedCount: 0};
      for (let i in account) {
        let d = await db.collection('accounts').deleteMany({
          email: account[i].email
        });
        a.acknowledged = d.acknowledged;
        a.deletedCount += d.deletedCount;
        const e = await db.collection('profiles').deleteMany({
          email: account[i].email
        });
        b.acknowledged = e.acknowledged;
        b.deletedCount += e.deletedCount;
      }
      
      for (let prf of profile) {
        const f = await db.collection('portfolios').deleteMany({
          user: prf._id
        });
        c.acknowledged = f.acknowledged;
        c.deletedCount += f.deletedCount;
        
      }
      console.log(a, b, c);
    } catch (e) {
      console.log(e);
    }
  }
};