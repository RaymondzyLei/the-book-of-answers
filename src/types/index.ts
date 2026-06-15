export type Category =
  | 'affirmative'
  | 'negative'
  | 'neutral'
  | 'action'
  | 'mysterious';

export interface Answer {
  text: string;
  category: Category;
}

export type Phase = 'idle' | 'fading' | 'typing' | 'revealed';
