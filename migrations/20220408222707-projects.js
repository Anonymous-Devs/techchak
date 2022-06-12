const {projects, createdBy} = require('./seeds/projects');


module.exports = {
  async up (db, client) {
    try{
    
      await db.collection('projects').insertMany(projects);
    
    } catch(e){
      console.log(e);
    }
  },
  
  async down(db, client) {
    try{
    const prj = await db.collection('projects').deleteMany({createdBy});
    console.log(prj);
  
    }catch(e){
      console.log(e);
    }
  }
};
