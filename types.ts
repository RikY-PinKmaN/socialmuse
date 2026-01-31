export type Platform = 'LinkedIn' | 'Twitter' | 'Instagram';

export type Tone = 'Professional' | 'Witty' | 'Urgent' | 'Friendly' | 'Visionary';

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';

export type ImageResolution = '1K' | '2K' | '4K';

export interface GeneratedPost {
  platform: Platform;
  content: string;
  hashtags?: string[];
  imagePrompt: string;
  imageUrl?: string; // Base64 data URI
  imageLoading: boolean;
  aspectRatio: AspectRatio;
}

export interface ContentGenerationResult {
  linkedin: {
    content: string;
    imagePrompt: string;
  };
  twitter: {
    content: string;
    imagePrompt: string;
  };
  instagram: {
    content: string;
    imagePrompt: string;
    hashtags: string[];
  };
}
