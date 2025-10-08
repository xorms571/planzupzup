import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword");
  const page = searchParams.get("page") || "1";
  const areaCode = searchParams.get("areaCode");

  const serviceKey = process.env.NEXT_PUBLIC_KOR_SERVICE_API_KEY;

  if (!serviceKey) {
    return NextResponse.json({ error: "API key is missing on server" }, { status: 500 });
  }
  if (!keyword) {
    return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
  }

  const url = `https://apis.data.go.kr/B551011/KorService2/searchKeyword2?serviceKey=${serviceKey}&keyword=${encodeURIComponent(
    keyword
  )}&areaCode=${areaCode}&_type=json&arrange=A&numOfRows=10&pageNo=${page}&MobileOS=ETC&MobileApp=AppTest`;

  try {
    const apiResponse = await fetch(url, { headers: { accept: 'application/json' } });

    if (!apiResponse.ok) {
      return new Response(apiResponse.body, {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
      });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data from external API' }, { status: 500 });
  }
}
