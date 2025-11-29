const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://nhuthoas04:123@cluster0.awyu0je.mongodb.net/goiymonan')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const recipe = await mongoose.connection.collection('recipes').findOne({ name: 'canh' });
    
    if (recipe) {
      console.log('\n📝 Recipe Details:\n');
      console.log('Name:', recipe.name);
      console.log('Description:', recipe.description);
      console.log('Author Email:', recipe.authorEmail);
      console.log('Author ID:', recipe.authorId);
      console.log('Status:', recipe.status);
      console.log('Category:', recipe.category);
      console.log('Cuisine:', recipe.cuisine);
      console.log('\nFull Recipe Object:');
      console.log(JSON.stringify(recipe, null, 2));
    } else {
      console.log('❌ Recipe not found');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
