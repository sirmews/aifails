export type Mood = 'furious' | 'defeated' | 'bewildered' | 'amused' | 'numb' | 'vengeful';

export type Confession = {
  id: string;
  prompt_used: string;
  what_it_did_instead: string;
  how_it_made_them_feel: string;
  mood: Mood | string;
  solidarity_count: number;
  model_provider: string | null;
  model_name: string | null;
  created_at: string;
};

export type NewConfession = {
  prompt_used: string;
  what_it_did_instead: string;
  how_it_made_them_feel: string;
  mood: Mood | string;
  model_provider?: string | null;
  model_name?: string | null;
};

export type ConfessionSuggestion = {
  id: string;
  confession_id: string;
  suggestion_type: 'prompt' | 'model';
  body: string;
  author_name: string | null;
  created_at: string;
};

export type NewSuggestion = {
  confession_id: string;
  suggestion_type: 'prompt' | 'model';
  body: string;
  author_name?: string | null;
};

export type ModelOption = {
  id: string;
  name: string;
  provider: string;
};
