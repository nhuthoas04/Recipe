const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://nhuthoas04:123@cluster0.awyu0je.mongodb.net/goiymonan?retryWrites=true&w=majority&appName=Cluster0';

async function checkRecipes() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('goiymonan');
    
    // Đếm tất cả recipes
    const totalCount = await db.collection('recipes').countDocuments();
    console.log('Total recipes in database:', totalCount);
    
    // Đếm approved recipes
    const approvedCount = await db.collection('recipes').countDocuments({
      $and: [
        { $or: [{ status: 'approved' }, { status: { $exists: false } }] },
        { $or: [{ isDeleted: { $ne: true } }, { isDeleted: { $exists: false } }] }
      ]
    });
    console.log('Approved recipes (visible to users):', approvedCount);
    
    // Lấy 5 recipes mẫu
    const samples = await db.collection('recipes').find({
      $and: [
        { $or: [{ status: 'approved' }, { status: { $exists: false } }] },
        { $or: [{ isDeleted: { $ne: true } }, { isDeleted: { $exists: false } }] }
      ]
    }).limit(5).toArray();
    
    console.log('\nSample recipes:');
    samples.forEach((recipe, idx) => {
      console.log(`${idx + 1}. ${recipe.name} (${recipe.category} - ${recipe.cuisine})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkRecipes();
