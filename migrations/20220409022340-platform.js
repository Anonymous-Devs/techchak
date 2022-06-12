const platformMockData = require("./seeds/platform");
module.exports = {
  async up(db, client) {
    try{
    await db.collection('platform_settings').insertOne(platformMockData);
    }
    catch(err){
      console.log(err);
    }
  },

  async down(db, client) {
    try{
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    let res = await db.collection('platform_settings').deleteOne({_id: platformMockData['_id']});
    console.log(res);
    }
    catch(err){
      console.log(err);
    }
  }
};
