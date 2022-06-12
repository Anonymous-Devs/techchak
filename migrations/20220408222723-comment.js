const {comments, commentIds} = require('./seeds/comments');


module.exports = {
  async up (db, client) {
    try{
    
      await db.collection('comments').insertMany(comments);
    
    } catch(e){
      console.log(e);
    }
  },
  
  async down(db, client) {
    try{
      
    const cmts1 = await db.collection('comments').deleteOne({_id: commentIds[0]});
    const cmts2 = await db.collection('comments').deleteOne({_id: commentIds[1]});
    console.log(cmts1, cmts2);
  
    }catch(e){
      console.log(e);
    }
  }
};
