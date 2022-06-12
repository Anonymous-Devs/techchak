const {
 account,
 profile,
 portfolio
} = require('./seeds/superAdmin');

module.exports = {
 async up(db, client) {
   try {

     await db.collection('accounts').insertOne(account);
     await db.collection('profiles').insertOne(profile);
     await db.collection('portfolios').insertOne(portfolio);

   } catch (e) {
     console.log(e);
   }
 },

 async down(db, client) {
   try {
     const acc = await db.collection('accounts').deleteOne({
       email: account.email
     });
     const prf = await db.collection('profiles').deleteOne({
       email: account.email
     });
     const port = await db.collection('portfolios').deleteMany({
       user: profile._id
     });

     console.log(acc, prf, port);

   } catch (e) {
     console.log(e);
   }
 }
};