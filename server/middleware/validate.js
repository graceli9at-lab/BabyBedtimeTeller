import { z } from 'zod';

const StorySchema = z.object({
  name: z.string().min(1).max(50).transform(s => s.replace(/[<>&"']/g, '')),
  age: z.number().int().min(1).max(10),
  characters: z.string().min(1).max(200).transform(s => s.replace(/[<>&"']/g, '')),
  length: z.enum(['short', 'medium', 'long']),
});

export function validateStory(req, res, next) {
  const result = StorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid input',
      details: result.error.flatten(),
    });
  }
  req.storyInput = result.data;
  next();
}
