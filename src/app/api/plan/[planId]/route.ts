/* eslint-disable */

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACK_HOST;

export async function GET(req: NextRequest, { params }: { params: { planId: string } }) {
  const { planId } = params;
  const cookie = req.cookies.get('connect.sid');

  try {
    const response = await axios.get(`${BACKEND_URL}/api/plan/${planId}`, {
      headers: {
        'Authorization': `Bearer ${cookie?.value}`,
      },
      withCredentials: true,
    });
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new NextResponse('server error', {
      status: 500,
    });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { planId: string } }) {
  const { planId } = params;
  const cookie = req.cookies.get('connect.sid');

  try {
    const response = await axios.delete(`${BACKEND_URL}/api/plan/${planId}`, {
      headers: {
        'Authorization': `Bearer ${cookie?.value}`,
      },
      withCredentials: true,
    });
    return new NextResponse(null, {
      status: response.status,
    });
  } catch (error: any) {
    console.error('Error forwarding DELETE request to backend:', error.message || error);

    if (axios.isAxiosError(error) && error.response) {
      console.error('Backend DELETE response error:', error.response.data);
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

export const runtime = 'edge';