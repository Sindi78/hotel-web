import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';
import { getUserData, createReview, updateReview, checkReviewExists } from '@/libs/apis';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Authentication required', { status: 401 });
  }

  try {
    const userId = session.user.id;
    const userData = await getUserData(userId);

    if (!userData) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(userData, {
      status: 200,
      statusText: 'User data retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Authentication required', { status: 401 });
  }

  try {
    const { reviewText, ratingValue, roomId } = await req.json();

    if (!reviewText || !ratingValue || !roomId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const userId = session.user.id;

    // Check if review already exists
    const existingReview = await checkReviewExists(userId, roomId);

    if (existingReview) {
      // Update existing review
      const updatedReview = await updateReview({
        reviewId: existingReview._id,
        reviewText,
        userRating: ratingValue,
      });

      return NextResponse.json(updatedReview, {
        status: 200,
        statusText: 'Review updated successfully',
      });
    } else {
      // Create new review
      const newReview = await createReview({
        hotelRoomId: roomId,
        reviewText,
        userId,
        userRating: ratingValue,
      });

      return NextResponse.json(newReview, {
        status: 201,
        statusText: 'Review created successfully',
      });
    }
  } catch (error: any) {
    console.error('Error processing review:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 