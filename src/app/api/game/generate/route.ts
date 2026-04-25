import { NextRequest, NextResponse } from 'next/server';
import { createAIClient, chatCompletion } from '@/lib/ai/client';
import { buildEventPrompt } from '@/lib/ai/prompts';

export async function POST(request: NextRequest) {
  const { age, attributes, talents, events, world, identity, resources, model, disableThinking } = await request.json();

  const config = createAIClient(model);
  if (!config.apiKey) {
    // Fallback: simple event generation without AI
    const ageDescriptions = [
      `${age}岁，你在${world.name}度过了平淡的一年。`,
      `${age}岁，发生了一些有趣的事情，生活继续向前。`,
      `${age}岁，你经历了一些挑战和机遇。`,
      `${age}岁，平凡又不平凡的一年。`,
    ];
    return NextResponse.json({
      content: ageDescriptions[Math.floor(Math.random() * ageDescriptions.length)],
      attrChanges: {},
      resources: {},
    });
  }

  const prompt = buildEventPrompt(age, attributes, talents, events, world, identity, resources);

  try {
    const responseText = await chatCompletion(config, [{ role: 'user', content: prompt }], 500, disableThinking);

    // Try to parse JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        content: parsed.content || '平凡地度过了这一年。',
        attrChanges: parsed.attrChanges || {},
        resources: parsed.resources || {},
      });
    }

    return NextResponse.json({
      content: responseText.trim().slice(0, 100),
      attrChanges: {},
      resources: {},
    });
  } catch (err) {
    console.error('AI generation error:', err);
    return NextResponse.json({
      content: `${age}岁，命运的车轮继续向前转动。`,
      attrChanges: {},
      resources: {},
    });
  }
}
