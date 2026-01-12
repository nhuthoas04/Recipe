import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '8f9e7d6c5b4a3928171615141312111009080706050403020100abcdefghijklmnop';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value;

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
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('goiymonan');

    // Find user and get their liked recipes
    const user = await db.collection('users').findOne({
      _id: new ObjectId(userId)
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const likedRecipeIds = user.likedRecipes || [];

    if (likedRecipeIds.length === 0) {
      return NextResponse.json({
        success: true,
        recipes: []
      });
    }

    // Get all liked recipes
    const recipes = await db.collection('recipes')
      .find({ _id: { $in: likedRecipeIds.map((id: any) => new ObjectId(id)) } })
      .toArray();

    const formattedRecipes = recipes.map(recipe => ({
      ...recipe,
      id: recipe._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({
      success: true,
      recipes: formattedRecipes
    });
  } catch (error: any) {
    console.error('[liked-recipes] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
