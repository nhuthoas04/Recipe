const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://nhuthoas04:123@cluster0.awyu0je.mongodb.net/goiymonan')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const recipes = await mongoose.connection.collection('recipes').find({}).toArray();
    
    console.log('\n=== TOTAL RECIPES:', recipes.length, '===\n');
    
    recipes.forEach((r, i) => {
      console.log(`${i+1}. ${r.name}`);
      console.log(`   Author: ${r.authorEmail || r.authorId || 'N/A'}`);
      console.log(`   Status: ${r.status || 'N/A'}`);
      console.log(`   Deleted: ${r.isDeleted || false}`);
      console.log(`   ID: ${r._id}`);
      console.log('');
    });
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
