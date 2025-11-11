/* eslint-disable */

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACK_HOST;

export async function GET(req: NextRequest, { params } : { params : Promise<{ locationId: string }>} ) {
  const { locationId } = await params;

  try {
    // 외부 API로 통신
    const response = await axios.get(
      `${BACKEND_URL}/api/location/${locationId}`,
    )
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    })
  } catch (error) {
    console.log(error)
    return new NextResponse('server error', {
      status: 500,
    })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ locationId: string }>} 
) {
  const { locationId } = await params; 

  let requestBody;
  try {
    requestBody = await req.json(); 
    console.log(`Received request body for locationId ${locationId}:`, requestBody);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return new NextResponse('Invalid JSON in request body', { status: 400 });
  }

  if (!BACKEND_URL) {
    console.error('BACKEND_URL is not defined in environment variables.');
    return new NextResponse('Server configuration error: BACKEND_URL not set.', {
      status: 500,
    });
  }

  try {
    // 다이나믹 파라미터 겹쳐서 planId -> locationId 로 
    const response = await axios.post(
      `${BACKEND_URL}/api/location/${locationId}`,
      requestBody, 
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return new NextResponse(JSON.stringify(response.data), {
      status: response.status, // 외부 API의 상태 코드를 그대로 전달
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) { 
    console.error('Error forwarding request to backend:', error.message || error);

    if (axios.isAxiosError(error) && error.response) {
      console.error('Backend response error:', error.response.data);
      return new NextResponse(JSON.stringify(error.response.data), {
        status: error.response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new NextResponse('Internal Server Error', {
      status: 500,
    });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ locationId: string }>} 
) {
  const { locationId } = await params; 

  if (!BACKEND_URL) {
    console.error('BACKEND_URL is not defined in environment variables.');
    return new NextResponse('Server configuration error: BACKEND_URL not set.', {
      status: 500,
    });
  }

  try {
    const contentType = req.headers.get('Content-Type');
    if (!contentType) {
      return new NextResponse('Content-Type header is missing', { status: 400 });
    }
    const response = await fetch(`${BACKEND_URL}/api/location/${locationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: req.body,
    });

    const responseData = await response.json();

    return new NextResponse(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) { 
    console.error('Error forwarding PUT request to backend:', error.message || error);
    
    return new NextResponse('Internal Server Error', {
      status: 500,
    });
  }
}

export const runtime = 'edge';