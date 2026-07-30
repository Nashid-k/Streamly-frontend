export interface RegionLanguage {
  code: string;
  label: string;
  flag: string;
}

export interface RegionInfo {
  countryCode: string;
  countryName: string;
  languages: RegionLanguage[];
}

export const REGIONAL_LANGUAGES: Record<string, { countryName: string; languages: RegionLanguage[] }> = {
  IN: {
    countryName: 'India 🇮🇳',
    languages: [
      { code: 'All', label: 'All Languages', flag: '🌐' },
      { code: 'Hindi', label: 'Hindi (हिंदी)', flag: '🇮🇳' },
      { code: 'English', label: 'English', flag: '🇬🇧' },
      { code: 'Tamil', label: 'Tamil (தமிழ்)', flag: '🇮🇳' },
      { code: 'Telugu', label: 'Telugu (తెలుగు)', flag: '🇮🇳' },
      { code: 'Malayalam', label: 'Malayalam (മലയാളം)', flag: '🇮🇳' },
      { code: 'Kannada', label: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳' },
      { code: 'Marathi', label: 'Marathi (मराठी)', flag: '🇮🇳' },
      { code: 'Bengali', label: 'Bengali (বাংলা)', flag: '🇮🇳' },
      { code: 'Japanese', label: 'Japanese (日本語)', flag: '🇯🇵' },
      { code: 'Korean', label: 'Korean (한국어)', flag: '🇰🇷' },
    ],
  },
  US: {
    countryName: 'United States 🇺🇸',
    languages: [
      { code: 'All', label: 'All Languages', flag: '🌐' },
      { code: 'English', label: 'English', flag: '🇺🇸' },
      { code: 'Spanish', label: 'Spanish (Español)', flag: '🇪🇸' },
      { code: 'French', label: 'French (Français)', flag: '🇫🇷' },
      { code: 'Hindi', label: 'Hindi (हिंदी)', flag: '🇮🇳' },
      { code: 'Japanese', label: 'Japanese (日本語)', flag: '🇯🇵' },
      { code: 'Korean', label: 'Korean (한국어)', flag: '🇰🇷' },
      { code: 'German', label: 'German (Deutsch)', flag: '🇩🇪' },
      { code: 'Italian', label: 'Italian (Italiano)', flag: '🇮🇹' },
    ],
  },
  DEFAULT: {
    countryName: 'Global',
    languages: [
      { code: 'All', label: 'All Languages', flag: '🌐' },
      { code: 'English', label: 'English', flag: '🇬🇧' },
      { code: 'Hindi', label: 'Hindi (हिंदी)', flag: '🇮🇳' },
      { code: 'Spanish', label: 'Spanish (Español)', flag: '🇪🇸' },
      { code: 'Tamil', label: 'Tamil (தமிழ்)', flag: '🇮🇳' },
      { code: 'Telugu', label: 'Telugu (తెలుగు)', flag: '🇮🇳' },
      { code: 'Malayalam', label: 'Malayalam (മലയാളം)', flag: '🇮🇳' },
      { code: 'Kannada', label: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳' },
      { code: 'French', label: 'French (Français)', flag: '🇫🇷' },
      { code: 'Japanese', label: 'Japanese (日本語)', flag: '🇯🇵' },
      { code: 'Korean', label: 'Korean (한국어)', flag: '🇰🇷' },
      { code: 'German', label: 'German (Deutsch)', flag: '🇩🇪' },
    ],
  },
};

export async function detectUserRegion(): Promise<RegionInfo> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      const code = data.country_code || 'US';
      const config = REGIONAL_LANGUAGES[code] || REGIONAL_LANGUAGES.DEFAULT;
      return {
        countryCode: code,
        countryName: data.country_name || config.countryName,
        languages: config.languages,
      };
    }
  } catch (err) {}

  if (typeof navigator !== 'undefined') {
    const langs = (navigator.languages || [navigator.language || '']).join(',').toLowerCase();
    if (
      langs.includes('in') ||
      langs.includes('hi') ||
      langs.includes('ta') ||
      langs.includes('te') ||
      langs.includes('ml') ||
      langs.includes('kn')
    ) {
      return {
        countryCode: 'IN',
        countryName: 'India 🇮🇳',
        languages: REGIONAL_LANGUAGES.IN.languages,
      };
    }
  }

  return {
    countryCode: 'US',
    countryName: 'United States 🇺🇸',
    languages: REGIONAL_LANGUAGES.US.languages,
  };
}
