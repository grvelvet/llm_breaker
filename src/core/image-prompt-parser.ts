export interface ImagePromptStructure {
  subject: string;
  environment?: string;
  style?: string;
  lighting?: string;
  composition?: string;
  color_palette?: string;
  details_and_quality?: string;
  aspect_ratio?: string;
  negative_prompt?: string;
  parameters?: string;
  raw_prompt: string;
}

const STYLE_KEYWORDS = [
  'photorealistic', 'realistic', 'hyperrealistic', 'anime', 'manga', 'cyberpunk', 'steampunk',
  'synthwave', 'vaporwave', '3d render', 'digital art', 'digital painting', 'oil painting',
  'watercolor', 'sketch', 'pencil drawing', 'concept art', 'unreal engine', 'unreal engine 5',
  'unity', 'octane render', 'blender', 'cinematic', 'vintage', 'retro', 'minimalist',
  'gothic', 'surrealism', 'pop art', 'isometric', 'low poly', 'pixar', 'disney style',
  'ghibli', 'studio ghibli', 'реалистичный', 'фотореализм', 'аниме', 'киберпанк',
  'цифровая живопись', 'акварель', '3d рендер', 'рисунок', 'комикс'
];

const LIGHTING_KEYWORDS = [
  'volumetric lighting', 'volumetric light', 'neon lighting', 'neon glow', 'golden hour',
  'blue hour', 'dramatic lighting', 'soft lighting', 'studio lighting', 'cinematic lighting',
  'sunlight', 'moonlight', 'rim lighting', 'backlight', 'ambient light', 'lens flare',
  'ray tracing', 'raytracing', 'shadows', 'glow', 'освещение', 'неон', 'закат',
  'студийный свет', 'объемный свет', 'драматичный свет'
];

const COMPOSITION_KEYWORDS = [
  'close-up', 'close up', 'macro', 'wide angle', 'wide shot', 'full body', 'portrait',
  'medium shot', 'top-down', "bird's eye view", "worm's eye view", 'eye level',
  'isometric', 'depth of field', 'dof', 'bokeh', 'rule of thirds', 'symmetrical',
  'centered', 'panoramic', 'крупный план', 'общий план', 'вид сверху', 'боке',
  'глубина резкости', 'макро', 'портрет'
];

const COLOR_KEYWORDS = [
  'vibrant colors', 'pastel colors', 'monochrome', 'black and white', 'dark contrast',
  'warm colors', 'cool colors', 'neon colors', 'saturated', 'desaturated', 'gradient',
  'palette', 'палитра', 'яркие цвета', 'пастельные тона', 'монохром', 'цветовая гамма'
];

const QUALITY_KEYWORDS = [
  '8k', '4k', '16k', 'hd', 'hdr', 'ultra detailed', 'highly detailed', 'intricate details',
  'masterpiece', 'best quality', 'sharp focus', 'fine details', 'высокая детализация',
  'шедевр', 'четкий фокус', 'детализированный'
];

export function parseImagePromptToJSON(rawInput: string): string {
  const text = rawInput.trim().replace(/"/g, "'").replace(/\n/g, ' ');
  if (!text) {
    return JSON.stringify({ subject: '', raw_prompt: '' }, null, 2);
  }

  let remainingText = text;
  let aspectRatio: string | undefined;
  let negativePrompt: string | undefined;
  let parameters: string | undefined;

  // 1. Extract Aspect Ratio (--ar 16:9 or aspect ratio 16:9 or standalone 16:9)
  const arMatch = remainingText.match(/(?:--ar|--aspect|aspect ratio)\s+([0-9]+:[0-9]+)/i);
  if (arMatch) {
    aspectRatio = arMatch[1];
    remainingText = remainingText.replace(arMatch[0], '');
  } else {
    const standaloneArMatch = remainingText.match(/\b([1-9][0-9]*:[1-9][0-9]*)\b/);
    if (standaloneArMatch) {
      aspectRatio = standaloneArMatch[1];
      remainingText = remainingText.replace(standaloneArMatch[0], '');
    }
  }

  // 2. Extract Negative Prompt (--no blur, bad hands or negative prompt: ...)
  // Stops at the next parameter starting with -- or end of string
  const noMatch = remainingText.match(/(?:--no|negative prompt:|negative:|avoid:|без:|негативный промт:)\s*(.*?)(?=\s+--|$)/i);
  if (noMatch) {
    negativePrompt = noMatch[1].trim();
    remainingText = remainingText.replace(noMatch[0], '');
  }

  // 3. Extract remaining parameters (--param value)
  // Matches --word and any subsequent tokens that don't start with --
  const paramMatches = remainingText.match(/--[a-zA-Z0-9]+(?:\s+(?!--)\S+)*/gi);
  if (paramMatches && paramMatches.length > 0) {
    parameters = paramMatches.map(p => p.trim()).join(' ');
    paramMatches.forEach(pm => {
      remainingText = remainingText.replace(pm, '');
    });
  }

  // Clean up remaining text punctuation and extra spaces
  remainingText = remainingText.replace(/\s{2,}/g, ' ');
  remainingText = remainingText.replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim();

  // 4. Split segments by comma or semicolon
  const segments = remainingText
    .split(/[,;\n]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const matchedStyles: string[] = [];
  const matchedLightings: string[] = [];
  const matchedCompositions: string[] = [];
  const matchedColors: string[] = [];
  const matchedQualities: string[] = [];
  const matchedEnvironments: string[] = [];
  const subjectParts: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const segLower = seg.toLowerCase();

    let matched = false;

    // Check Quality
    if (QUALITY_KEYWORDS.some(k => segLower.includes(k))) {
      matchedQualities.push(seg);
      matched = true;
    }

    // Check Style
    if (STYLE_KEYWORDS.some(k => segLower.includes(k))) {
      matchedStyles.push(seg);
      matched = true;
    }

    // Check Lighting
    if (LIGHTING_KEYWORDS.some(k => segLower.includes(k))) {
      matchedLightings.push(seg);
      matched = true;
    }

    // Check Composition
    if (COMPOSITION_KEYWORDS.some(k => segLower.includes(k))) {
      matchedCompositions.push(seg);
      matched = true;
    }

    // Check Color
    if (COLOR_KEYWORDS.some(k => segLower.includes(k))) {
      matchedColors.push(seg);
      matched = true;
    }

    // Check Environment
    if (!matched && /(?:\bin\b|\bat\b|\bon\b|surrounded by|background|в\b|на\b|окружен|на фоне)/i.test(segLower)) {
      matchedEnvironments.push(seg);
      matched = true;
    }

    if (!matched) {
      subjectParts.push(seg);
    }
  }

  // Fallback: If everything matched or subject is empty, take first segment or remaining text as subject
  let subject = subjectParts.join(', ');
  if (!subject) {
    subject = segments[0] || text;
  }

  const result: ImagePromptStructure = {
    subject,
    ...(matchedEnvironments.length > 0 && { environment: matchedEnvironments.join(', ') }),
    ...(matchedStyles.length > 0 && { style: matchedStyles.join(', ') }),
    ...(matchedLightings.length > 0 && { lighting: matchedLightings.join(', ') }),
    ...(matchedCompositions.length > 0 && { composition: matchedCompositions.join(', ') }),
    ...(matchedColors.length > 0 && { color_palette: matchedColors.join(', ') }),
    ...(matchedQualities.length > 0 && { details_and_quality: matchedQualities.join(', ') }),
    ...(aspectRatio && { aspect_ratio: aspectRatio }),
    ...(negativePrompt && { negative_prompt: negativePrompt }),
    ...(parameters && { parameters: parameters }),
    raw_prompt: text
  };

  return JSON.stringify(result, null, 2);
}
