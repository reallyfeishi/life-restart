import { NextRequest, NextResponse } from 'next/server';
import { createAIClient, chatCompletion } from '@/lib/ai/client';
import { buildBackgroundPrompt } from '@/lib/ai/prompts';

export async function POST(request: NextRequest) {
  const { world, identity, talents, attributes, model, disableThinking } = await request.json();

  const config = createAIClient(model);
  if (!config.apiKey) {
    const genderText = identity.gender === 'male' ? '你出生在一个普通的家庭' : '你出生在一个普通的家庭';
    const fallbackBackstory = genderText + '，在这个名为' + world.name + '的世界里，命运的齿轮开始转动。' + (identity.extraInfo || '平凡的生活，等待着你去书写属于自己的故事。');
    return NextResponse.json({ backstory: fallbackBackstory });
  }

  const prompt = buildBackgroundPrompt(world, identity, talents, attributes);
  const backstory = await chatCompletion(config, [{ role: 'user', content: prompt }], 300, disableThinking);

  return NextResponse.json({ backstory });
}
