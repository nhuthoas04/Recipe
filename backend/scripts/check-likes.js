// Script kiểm tra likes/saves trong database
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://nhuthoas04:123@cluster0.awyu0je.mongodb.net/goiymonan?retryWrites=true&w=majority&appName=Cluster0';

async function checkData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('goiymonan');
    
    // Check recipes với likes > 0
    const recipesWithLikes = await db.collection('recipes').find({ likesCount: { $gt: 0 } }).toArray();
    console.log('\nRecipes with likes > 0:', recipesWithLikes.length);
    recipesWithLikes.forEach(r => {
      console.log(`  - ${r.name}: ${r.likesCount} likes, ${r.savesCount} saves`);
    });
    
    // Check users với liked recipes
    const usersWithLikes = await db.collection('users').find({ 'likedRecipes.0': { $exists: true } }).toArray();
    console.log('\nUsers with liked recipes:', usersWithLikes.length);
    usersWithLikes.forEach(u => {
      console.log(`  - ${u.email}: ${u.likedRecipes?.length || 0} liked, ${u.savedRecipes?.length || 0} saved`);
    });
    
    // Show sample recipe
    const sampleRecipe = await db.collection('recipes').findOne({});
    console.log('\nSample recipe:', {
      name: sampleRecipe?.name,
      likesCount: sampleRecipe?.likesCount,
      savesCount: sampleRecipe?.savesCount
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkData();
