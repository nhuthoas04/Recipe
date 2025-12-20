/**
 * Script to add sample likes and saves data to existing recipes
 * Run: node backend/scripts/add-likes-saves-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection - Use from .env or fallback to local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-app';

async function addSampleData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name).join(', '));
    
    const recipesCollection = db.collection('recipes');
    const usersCollection = db.collection('users');

    // Get all recipes (không cần phải approved)
    const recipes = await recipesCollection.find({}).toArray();
    console.log(`📚 Found ${recipes.length} recipes in 'recipes' collection`);

    if (recipes.length === 0) {
      console.log('⚠️  No recipes found in database.');
      console.log('💡 Tip: Make sure you have created some recipes from the frontend first.');
      console.log('   Or the recipes might be in MongoDB Atlas instead of local MongoDB.');
      process.exit(0);
    }

    // Update all recipes with random likes and saves counts
    for (const recipe of recipes) {
      const likesCount = Math.floor(Math.random() * 50) + 5; // 5-54 likes
      const savesCount = Math.floor(Math.random() * 30) + 3; // 3-32 saves

      await recipesCollection.updateOne(
        { _id: recipe._id },
        {
          $set: {
            likesCount: likesCount,
            savesCount: savesCount
          }
        }
      );
    }

    console.log('✅ Updated all recipes with likes and saves counts');

    // Get all users
    const users = await usersCollection.find({}).toArray();
    console.log(`👥 Found ${users.length} users`);

    // Add sample liked and saved recipes to each user
    for (const user of users) {
      // Randomly pick 3-8 recipes to like
      const likedCount = Math.min(Math.floor(Math.random() * 6) + 3, recipes.length);
      const shuffledRecipes = [...recipes].sort(() => 0.5 - Math.random());
      const likedRecipes = shuffledRecipes.slice(0, likedCount).map(r => r._id);

      // Randomly pick 2-5 recipes to save
      const savedCount = Math.min(Math.floor(Math.random() * 4) + 2, recipes.length);
      const savedRecipes = shuffledRecipes.slice(0, savedCount).map(r => r._id);

      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            likedRecipes: likedRecipes,
            savedRecipes: savedRecipes
          }
        }
      );

      console.log(`   ✓ User ${user.email}: ${likedRecipes.length} liked, ${savedRecipes.length} saved`);
    }

    console.log('\n✅ Sample data added successfully!');
    console.log('\nSummary:');
    console.log(`- Updated ${recipes.length} recipes with likes/saves counts`);
    console.log(`- Updated ${users.length} users with liked/saved recipes`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
addSampleData();
