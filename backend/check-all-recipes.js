const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://nhuthoas04:123@cluster0.awyu0je.mongodb.net/goiymonan?retryWrites=true&w=majority&appName=Cluster0';

async function checkRecipes() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');
    
    const db = client.db('goiymonan');
    const recipes = await db.collection('recipes').find({}).toArray();
    
    console.log(`📊 Tổng số recipes: ${recipes.length}\n`);
    
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name || 'No name'}`);
      console.log(`   - ID: ${recipe._id}`);
      console.log(`   - Status: ${recipe.status || 'null'}`);
      console.log(`   - Author Email: ${recipe.authorEmail || 'N/A'}`);
      console.log(`   - Description: ${recipe.description || 'N/A'}`);
      console.log(`   - isDeleted: ${recipe.isDeleted || false}`);
      console.log(`   - Created: ${recipe.createdAt || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkRecipes();
