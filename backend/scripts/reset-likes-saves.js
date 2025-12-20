// Script để reset tất cả likes và saves về 0
// Chạy: node scripts/reset-likes-saves.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://nhuthoas04:123@cluster0.awyu0je.mongodb.net/goiymonan?retryWrites=true&w=majority&appName=Cluster0';

async function resetLikesAndSaves() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('goiymonan');
    
    // Reset tất cả recipes: likesCount = 0, savesCount = 0
    const recipesResult = await db.collection('recipes').updateMany(
      {},
      { 
        $set: { 
          likesCount: 0, 
          savesCount: 0 
        } 
      }
    );
    console.log(`Reset ${recipesResult.modifiedCount} recipes (likesCount=0, savesCount=0)`);
    
    // Reset tất cả users: likedRecipes = [], savedRecipes = []
    const usersResult = await db.collection('users').updateMany(
      {},
      { 
        $set: { 
          likedRecipes: [], 
          savedRecipes: [] 
        } 
      }
    );
    console.log(`Reset ${usersResult.modifiedCount} users (likedRecipes=[], savedRecipes=[])`);
    
    // Verify
    const sampleRecipe = await db.collection('recipes').findOne({});
    console.log('\nSample recipe after reset:', {
      name: sampleRecipe?.name,
      likesCount: sampleRecipe?.likesCount,
      savesCount: sampleRecipe?.savesCount
    });
    
    const sampleUser = await db.collection('users').findOne({});
    console.log('Sample user after reset:', {
      email: sampleUser?.email,
      likedRecipes: sampleUser?.likedRecipes?.length || 0,
      savedRecipes: sampleUser?.savedRecipes?.length || 0
    });
    
    console.log('\n✅ Done! All likes and saves have been reset to 0.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

resetLikesAndSaves();
