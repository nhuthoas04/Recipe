import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Must match the JWT_SECRET in login route
const JWT_SECRET = process.env.JWT_SECRET || '8f9e7d6c5b4a3928171615141312111009080706050403020100abcdefghijklmnop';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId } = body;

    const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
      request.cookies.get('auth-token')?.value;

    console.log('[like-recipe] recipeId:', recipeId, 'token exists:', !!token);
    console.log('[like-recipe] JWT_SECRET exists:', !!JWT_SECRET, 'length:', JWT_SECRET?.length);
    console.log('[like-recipe] Token (first 20 chars):', token?.substring(0, 20));

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Decode token to get userId
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
      console.log('[like-recipe] ✅ Decoded userId:', userId);
    } catch (err) {
      console.error('[like-recipe] ❌ Token verification failed:', err);
      console.error('[like-recipe] Token that failed:', token);
      console.error('[like-recipe] JWT_SECRET being used:', JWT_SECRET.substring(0, 10) + '...');
      return NextResponse.json(
        { success: false, error: 'Invalid token', details: process.env.NODE_ENV === 'development' ? (err as Error)?.message : undefined },
        { status: 401 }
      );
    }

    if (!recipeId) {
      return NextResponse.json(
        { success: false, error: 'Missing recipeId' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    // Use 'goiymonan' to match the database used by login route (via getDatabase())
    const db = client.db('goiymonan');

    // Find recipe
    const recipe = await db.collection('recipes').findOne({
      _id: new ObjectId(recipeId)
    });

    if (!recipe) {
      return NextResponse.json(
        { success: false, error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Find user
    const user = await db.collection('users').findOne({
      _id: new ObjectId(userId)
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const likedRecipes = user.likedRecipes || [];
    const isLiked = likedRecipes.some((id: ObjectId) => id.toString() === recipeId);

    if (isLiked) {
      // Unlike - remove from likedRecipes
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { likedRecipes: new ObjectId(recipeId) } } as any
      );
      await db.collection('recipes').updateOne(
        { _id: new ObjectId(recipeId) },
        { $inc: { likesCount: -1 } }
      );
    } else {
      // Like - add to likedRecipes
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { likedRecipes: new ObjectId(recipeId) } }
      );
      await db.collection('recipes').updateOne(
        { _id: new ObjectId(recipeId) },
        { $inc: { likesCount: 1 } }
      );
    }

    // Get updated recipe
    const updatedRecipe = await db.collection('recipes').findOne({
      _id: new ObjectId(recipeId)
    });

    // Get updated user likedRecipes
    const updatedUser = await db.collection('users').findOne({
      _id: new ObjectId(userId)
    });

    console.log('[like-recipe] Success:', { isLiked: !isLiked, likesCount: updatedRecipe?.likesCount || 0 });

    return NextResponse.json({
      success: true,
      isLiked: !isLiked,
      likesCount: updatedRecipe?.likesCount || 0,
      likedRecipes: (updatedUser?.likedRecipes || []).map((id: ObjectId) => id.toString())
    });
  } catch (error: any) {
    console.error('[like-recipe] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
