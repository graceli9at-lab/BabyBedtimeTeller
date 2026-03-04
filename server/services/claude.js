import Anthropic from '@anthropic-ai/sdk';

const LENGTH_INSTRUCTIONS = {
  short: '3 short paragraphs, around 80 words total',
  medium: '5 paragraphs, around 150 words total',
  long: '7 to 8 paragraphs, around 250 words total',
};

const MAX_TOKENS = { short: 350, medium: 600, long: 900 };

export async function* generateStory({ name, age, characters, length }) {
  if (process.env.MOCK_MODE === 'true') {
    yield* generateMockStory({ name, age, characters, length });
    return;
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = [
    `You are a warm, imaginative children's bedtime story author.`,
    `Write a soothing bedtime story for a ${age}-year-old child.`,
    `Use simple, age-appropriate vocabulary.`,
    `The story should be calming and end with the child peacefully falling asleep.`,
    `Length: ${LENGTH_INSTRUCTIONS[length]}.`,
    `Write only the story text — no title, no preamble.`,
  ].join(' ');

  const userPrompt = `The child's name is ${name}. Include these characters or themes: ${characters}.`;

  const stream = await client.messages.stream({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
    max_tokens: MAX_TOKENS[length],
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield { type: 'chunk', text: event.delta.text };
    }
  }

  const final = await stream.finalMessage();
  yield {
    type: 'done',
    inputTokens: final.usage.input_tokens,
    outputTokens: final.usage.output_tokens,
  };
}

async function* generateMockStory({ name, age, characters }) {
  const firstChar = characters.split(',')[0].trim();

  const story = buildMockStory(name, age, firstChar, characters);

  // Stream word by word with a realistic delay
  const words = story.split(' ');
  for (const word of words) {
    yield { type: 'chunk', text: word + ' ' };
    await delay(25 + Math.random() * 45);
  }

  yield { type: 'done', inputTokens: 0, outputTokens: words.length };
}

function buildMockStory(name, age, firstChar, allChars) {
  return `Once upon a time, in a land where the stars hung low enough to touch, ` +
    `there lived a child named ${name}. ${name} was ${age} years old and had the most ` +
    `wonderful imagination of anyone in the whole kingdom.

One quiet evening, just as the moon began to rise, ${name} discovered something magical ` +
    `at the edge of the garden — ${allChars}. "I've been hoping you'd come," ${firstChar} ` +
    `said softly, eyes twinkling like the stars above.

Together, they wandered through a forest where the leaves shimmered silver, and rivers ` +
    `flowed with moonlight instead of water. Every step felt like floating, every sound ` +
    `was a gentle lullaby carried on the breeze.

"Are you getting sleepy?" ${firstChar} asked, noticing ${name}'s eyes growing heavy. ` +
    `${name} nodded, a slow and peaceful smile spreading across their face.

They found the coziest spot beneath an ancient oak tree, its branches draped in soft, ` +
    `glowing moss. ${firstChar} tucked ${name} in with a blanket woven from clouds, ` +
    `and the stars arranged themselves into a gentle canopy of light.

"Sleep now," whispered ${firstChar}. "Tomorrow will bring new adventures. But for now, ` +
    `dream the sweetest dreams." And with one last contented breath, ${name} drifted off ` +
    `into the most beautiful sleep, wrapped in warmth and wonder.

The moon smiled down. The stars sang softly. And the whole world was peaceful and still.`;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
