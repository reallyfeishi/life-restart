import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { world, identity, talents, attributes } = await request.json();

  return NextResponse.json({
    sessionId: crypto.randomUUID(),
    success: true,
    message: '会话已创建',
  });
}
