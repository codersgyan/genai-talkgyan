export const MODEL =
  "gemini-2.5-flash-native-audio-preview-09-2025";
export const INPUT_SAMPLE_RATE = 16000;
export const OUTPUT_SAMPLE_RATE = 24000;

export const AVAILABLE_TOPICS = [
  "Free Chat",
  "Business Meeting",
  "Travel & Directions",
  "Job Interview",
  "Ordering Food",
  "Daily Routine",
  "Movies & Hobbies",
];

// BCP 47 Standard: Language-Region
export const AVAILABLE_LANGUAGES = [
  {
    id: "en-US",
    name: "English",
    region: "United States",
    code: "en-US",
  },
  {
    id: "en-GB",
    name: "English",
    region: "United Kingdom",
    code: "en-GB",
  },
  {
    id: "es-ES",
    name: "Spanish",
    region: "Spain",
    code: "es-ES",
  },
  {
    id: "es-MX",
    name: "Spanish",
    region: "Mexico",
    code: "es-MX",
  },
  {
    id: "fr-FR",
    name: "French",
    region: "France",
    code: "fr-FR",
  },
  {
    id: "de-DE",
    name: "German",
    region: "Germany",
    code: "de-DE",
  },
  {
    id: "ja-JP",
    name: "Japanese",
    region: "Japan",
    code: "ja-JP",
  },
  {
    id: "ko-KR",
    name: "Korean",
    region: "South Korea",
    code: "ko-KR",
  },
  {
    id: "zh-CN",
    name: "Chinese",
    region: "China (Mandarin)",
    code: "zh-CN",
  },
  {
    id: "hi-IN",
    name: "Hindi",
    region: "India",
    code: "hi-IN",
  },
  {
    id: "pt-BR",
    name: "Portuguese",
    region: "Brazil",
    code: "pt-BR",
  },
];

export const AVAILABLE_VOICES = [
  { id: "charon", name: "Charon", category: "informative" },
  { id: "puck", name: "Puck", category: "upbeat" },
  { id: "kore", name: "Kore", category: "firm" },
  { id: "fenrir", name: "Fenrir", category: "excitable" },
  { id: "aoede", name: "Aoede", category: "confident" },
];

export const AVAILABLE_PROFICIENCY_LEVELS = [
  {
    id: "basic",
    label: "Basic",
    description: "I can have basic conversations",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "I can talk about various topics",
  },
  {
    id: "advanced",
    label: "Top Class",
    description: "I can discuss most topics in detail",
  },
];
