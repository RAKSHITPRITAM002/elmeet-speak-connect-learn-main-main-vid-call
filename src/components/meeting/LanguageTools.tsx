import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Languages,
  Globe,
  Keyboard,
  BookOpen,
  MessageCircle,
  Copy,
  Check,
  Search,
  Volume2,
  KeyboardOff,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

// Types
interface CharacterKey {
  character: string;
  label?: string;
  width?: number; // in units, 1 = standard key width
  type?: "character" | "modifier" | "special";
}

interface KeyboardLayout {
  id: string;
  name: string;
  language: string;
  rows: CharacterKey[][];
}

interface Definition {
  definition: string;
  example?: string;
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

interface DictionaryResult {
  word: string;
  phonetic: string;
  meanings: Meaning[];
}

interface LanguageToolsProps {
  meetingId: string;
}

const LanguageTools: React.FC<LanguageToolsProps> = ({ meetingId }) => {
  const [activeTab, setActiveTab] = useState<"keyboard" | "dictionary" | "phrases">("keyboard");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("korean");
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<DictionaryResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [copiedPhraseId, setCopiedPhraseId] = useState<string | null>(null);
  const [dictionaryLanguage, setDictionaryLanguage] = useState<string>("english");
  const [phrasesLanguage, setPhrasesLanguage] = useState<string>("korean");

  // Available languages for different tools
  const availableLanguages = [
    { id: "korean", name: "Korean (한국어)" },
    { id: "japanese", name: "Japanese (日本語)" },
    { id: "chinese", name: "Chinese (中文)" },
    { id: "arabic", name: "Arabic (العربية)" },
    { id: "russian", name: "Russian (Русский)" },
    { id: "hindi", name: "Hindi (हिन्दी)" },
    { id: "thai", name: "Thai (ไทย)" },
    { id: "spanish", name: "Spanish (Español)" },
    { id: "french", name: "French (Français)" },
    { id: "german", name: "German (Deutsch)" },
    { id: "italian", name: "Italian (Italiano)" },
    { id: "portuguese", name: "Portuguese (Português)" },
    { id: "english", name: "English" }
  ];

  // Keyboard layouts
  const keyboardLayouts: { [key: string]: KeyboardLayout } = {
    korean: {
      id: "korean",
      name: "Korean (Hangul)",
      language: "Korean",
      rows: [
        [
          { character: "ㅂ", label: "b" },
          { character: "ㅈ", label: "j" },
          { character: "ㄷ", label: "d" },
          { character: "ㄱ", label: "g" },
          { character: "ㅅ", label: "s" },
          { character: "ㅛ", label: "yo" },
          { character: "ㅕ", label: "yeo" },
          { character: "ㅑ", label: "ya" },
          { character: "ㅐ", label: "ae" },
          { character: "ㅔ", label: "e" }
        ],
        [
          { character: "ㅁ", label: "m" },
          { character: "ㄴ", label: "n" },
          { character: "ㅇ", label: "ng" },
          { character: "ㄹ", label: "r/l" },
          { character: "ㅎ", label: "h" },
          { character: "ㅗ", label: "o" },
          { character: "ㅓ", label: "eo" },
          { character: "ㅏ", label: "a" },
          { character: "ㅣ", label: "i" }
        ],
        [
          { character: "ㅋ", label: "k" },
          { character: "ㅌ", label: "t" },
          { character: "ㅊ", label: "ch" },
          { character: "ㅍ", label: "p" },
          { character: "ㅠ", label: "yu" },
          { character: "ㅜ", label: "u" },
          { character: "ㅡ", label: "eu" },
          { character: " ", label: "Space", width: 2, type: "special" }
        ]
      ]
    },
    japanese: {
      id: "japanese",
      name: "Japanese (Hiragana)",
      language: "Japanese",
      rows: [
        [
          { character: "あ", label: "a" },
          { character: "い", label: "i" },
          { character: "う", label: "u" },
          { character: "え", label: "e" },
          { character: "お", label: "o" }
        ],
        [
          { character: "か", label: "ka" },
          { character: "き", label: "ki" },
          { character: "く", label: "ku" },
          { character: "け", label: "ke" },
          { character: "こ", label: "ko" }
        ],
        [
          { character: "さ", label: "sa" },
          { character: "し", label: "shi" },
          { character: "す", label: "su" },
          { character: "せ", label: "se" },
          { character: "そ", label: "so" }
        ],
        [
          { character: "た", label: "ta" },
          { character: "ち", label: "chi" },
          { character: "つ", label: "tsu" },
          { character: "て", label: "te" },
          { character: "と", label: "to" }
        ],
        [
          { character: "나", label: "na" },
          { character: "に", label: "ni" },
          { character: "ぬ", label: "nu" },
          { character: "ね", label: "ne" },
          { character: "の", label: "no" }
        ],
        [
          { character: " ", label: "Space", width: 2, type: "special" }
        ]
      ]
    },
    japanese_katakana: {
      id: "japanese_katakana",
      name: "Japanese (Katakana)",
      language: "Japanese",
      rows: [
        [
          { character: "ア", label: "a" },
          { character: "イ", label: "i" },
          { character: "ウ", label: "u" },
          { character: "エ", label: "e" },
          { character: "オ", label: "o" }
        ],
        [
          { character: "カ", label: "ka" },
          { character: "キ", label: "ki" },
          { character: "ク", label: "ku" },
          { character: "ケ", label: "ke" },
          { character: "コ", label: "ko" }
        ],
        [
          { character: "サ", label: "sa" },
          { character: "シ", label: "shi" },
          { character: "ス", label: "su" },
          { character: "セ", label: "se" },
          { character: "ソ", label: "so" }
        ],
        [
          { character: "タ", label: "ta" },
          { character: "チ", label: "chi" },
          { character: "ツ", label: "tsu" },
          { character: "テ", label: "te" },
          { character: "ト", label: "to" }
        ],
        [
          { character: "ナ", label: "na" },
          { character: "ニ", label: "ni" },
          { character: "ヌ", label: "nu" },
          { character: "ネ", label: "ne" },
          { character: "ノ", label: "no" }
        ],
        [
          { character: " ", label: "Space", width: 2, type: "special" }
        ]
      ]
    },
    chinese: {
      id: "chinese",
      name: "Chinese (Pinyin)",
      language: "Chinese",
      rows: [
        [
          { character: "ā", label: "a1" },
          { character: "á", label: "a2" },
          { character: "ǎ", label: "a3" },
          { character: "à", label: "a4" },
          { character: "ē", label: "e1" },
          { character: "é", label: "e2" },
          { character: "ě", label: "e3" },
          { character: "è", label: "e4" }
        ],
        [
          { character: "ī", label: "i1" },
          { character: "í", label: "i2" },
          { character: "ǐ", label: "i3" },
          { character: "ì", label: "i4" },
          { character: "ō", label: "o1" },
          { character: "ó", label: "o2" },
          { character: "ǒ", label: "o3" },
          { character: "ò", label: "o4" }
        ],
        [
          { character: "ū", label: "u1" },
          { character: "ú", label: "u2" },
          { character: "ǔ", label: "u3" },
          { character: "ù", label: "u4" },
          { character: "ǖ", label: "ü1" },
          { character: "ǘ", label: "ü2" },
          { character: "ǚ", label: "ü3" },
          { character: "ǜ", label: "ü4" }
        ],
        [
          { character: " ", label: "Space", width: 2, type: "special" }
        ]
      ]
    },
    chinese_simplified: {
      id: "chinese_simplified",
      name: "Chinese (Simplified)",
      language: "Chinese",
      rows: [
        [
          { character: "我", label: "wǒ (I)" },
          { character: "你", label: "nǐ (you)" },
          { character: "他", label: "tā (he)" },
          { character: "她", label: "tā (she)" },
          { character: "们", label: "men (plural)" }
        ],
        [
          { character: "是", label: "shì (is)" },
          { character: "不", label: "bù (not)" },
          { character: "有", label: "yǒu (have)" },
          { character: "好", label: "hǎo (good)" },
          { character: "谢谢", label: "xièxie (thanks)" }
        ],
        [
          { character: "再见", label: "zàijiàn (bye)" },
          { character: "请", label: "qǐng (please)" },
          { character: "对不起", label: "duìbùqǐ (sorry)" },
          { character: " ", label: "Space", width: 2, type: "special" }
        ]
      ]
    },
    arabic: {
      id: "arabic",
      name: "Arabic",
      language: "Arabic",
      rows: [
        [
          { character: "ض", label: "ḍ" },
          { character: "ص", label: "ṣ" },
          { character: "ث", label: "th" },
          { character: "ق", label: "q" },
          { character: "ف", label: "f" },
          { character: "غ", label: "gh" },
          { character: "ع", label: "ʿ" },
          { character: "ه", label: "h" },
          { character: "خ", label: "kh" },
          { character: "ح", label: "ḥ" }
        ],
        [
          { character: "ش", label: "sh" },
          { character: "س", label: "s" },
          { character: "ي", label: "y" },
          { character: "ب", label: "b" },
          { character: "ل", label: "l" },
          { character: "ا", label: "a" },
          { character: "ت", label: "t" },
          { character: "ن", label: "n" },
          { character: "م", label: "m" },
          { character: "ك", label: "k" }
        ],
        [
          { character: "ظ", label: "ẓ" },
          { character: "ط", label: "ṭ" },
          { character: "ذ", label: "dh" },
          { character: "د", label: "d" },
          { character: "ز", label: "z" },
          { character: "ر", label: "r" },
          { character: "و", label: "w" },
          { character: " ", label: "Space", width: 2, type: "special" }
        ]
      ]
    },
    russian: {
      id: "russian",
      name: "Russian (Cyrillic)",
      language: "Russian",
      rows: [
        [
          { character: "й", label: "y" },
          { character: "ц", label: "ts" },
          { character: "у", label: "u" },
          { character: "к", label: "k" },
          { character: "е", label: "e" },
          { character: "н", label: "n" },
          { character: "г", label: "g" },
          { character: "ш", label: "sh" },
          { character: "щ", label: "shch" },
          { character: "з", label: "z" },
          { character: "х", label: "kh" }
        ],
        [
          { character: "ф", label: "f" },
          { character: "ы", label: "y" },
          { character: "в", label: "v" },
          { character: "а", label: "a" },
          { character: "п", label: "p" },
          { character: "р", label: "r" },
          { character: "о", label: "o" },
          { character: "л", label: "l" },
          { character: "д", label: "d" },
          { character: "ж", label: "zh" },
          { character: "э", label: "e" }
        ],
        [
          { character: "я", label: "ya" },
          { character: "ч", label: "ch" },
          { character: "с", label: "s" },
          { character: "м", label: "m" },
          { character: "и", label: "i" },
          { character: "т", label: "t" },
          { character: "ь", label: "soft" },
          { character: "б", label: "b" },
          { character: "ю", label: "yu" },
          { character: " ", label: "Space", width: 2, type: "special" }
        ]
      ]
    },
    thai: {
      id: "thai",
      name: "Thai",
      language: "Thai",
      rows: [
        [
          { character: "ก", label: "k" },
          { character: "ข", label: "kh" },
          { character: "ฃ", label: "kh" },
          { character: "ค", label: "kh" },
          { character: "ฅ", label: "kh" },
          { character: "ฆ", label: "kh" },
          { character: "ง", label: "ng" },
          { character: "จ", label: "ch" },
          { character: "ฉ", label: "ch" },
          { character: "ช", label: "ch" }
        ],
        [
          { character: "่", label: "tone" },
          { character: "้", label: "tone" },
          { character: "๊", label: "tone" },
          { character: "๋", label: "tone" },
          { character: "ั", label: "a" },
          { character: "ะ", label: "a" },
          { character: "า", label: "aa" },
          { character: "ำ", label: "am" },
          { character: "ิ", label: "i" },
          { character: "ี", label: "ii" }
        ],
        [
          { character: "ึ", label: "ue" },
          { character: "ื", label: "uee" },
          { character: "ุ", label: "u" },
          { character: "ู", label: "uu" },
          { character: "เ", label: "e" },
          { character: "แ", label: "ae" },
          { character: "โ", label: "o" },
          { character: "ใ", label: "ai" },
          { character: "ไ", label: "ai" },
          { character: " ", label: "Space", width: 2, type: "special" }
        ]
      ]
    },
    hindi: {
      id: "hindi",
      name: "Hindi (Devanagari)",
      language: "Hindi",
      rows: [
        [
          { character: "अ", label: "a" },
          { character: "आ", label: "ā" },
          { character: "इ", label: "i" },
          { character: "ई", label: "ī" },
          { character: "उ", label: "u" },
          { character: "ऊ", label: "ū" },
          { character: "ए", label: "e" },
          { character: "ऐ", label: "ai" },
          { character: "ओ", label: "o" },
          { character: "औ", label: "au" }
        ],
        [
          { character: "क", label: "ka" },
          { character: "ख", label: "kha" },
          { character: "ग", label: "ga" },
          { character: "घ", label: "gha" },
          { character: "च", label: "ca" },
          { character: "छ", label: "cha" },
          { character: "ज", label: "ja" },
          { character: "झ", label: "jha" },
          { character: "ट", label: "ṭa" }
        ],
        [
          { character: "त", label: "ta" },
          { character: "थ", label: "tha" },
          { character: "द", label: "da" },
          { character: "ध", label: "dha" },
          { character: "न", label: "na" },
          { character: "प", label: "pa" },
          { character: "फ", label: "pha" },
          { character: "ब", label: "ba" },
          { character: "म", label: "ma" }
        ],
        [
          { character: "य", label: "ya" },
          { character: "र", label: "ra" },
          { character: "ल", label: "la" },
          { character: "व", label: "va" },
          { character: "श", label: "śa" },
          { character: "ष", label: "ṣa" },
          { character: "स", label: "sa" },
          { character: "ह", label: "ha" },
          { character: " ", label: "Space", width: 2, type: "special" }
        ]
      ]
    },
    greek: {
      id: "greek",
      name: "Greek",
      language: "Greek",
      rows: [
        [
          { character: "α", label: "alpha" },
          { character: "β", label: "beta" },
          { character: "γ", label: "gamma" },
          { character: "δ", label: "delta" },
          { character: "ε", label: "epsilon" },
          { character: "ζ", label: "zeta" },
          { character: "η", label: "eta" },
          { character: "θ", label: "theta" }
        ],
        [
          { character: "ι", label: "iota" },
          { character: "κ", label: "kappa" },
          { character: "λ", label: "lambda" },
          { character: "μ", label: "mu" },
          { character: "ν", label: "nu" },
          { character: "ξ", label: "xi" },
          { character: "ο", label: "omicron" },
          { character: "π", label: "pi" }
        ],
        [
          { character: "ρ", label: "rho" },
          { character: "σ", label: "sigma" },
          { character: "τ", label: "tau" },
          { character: "υ", label: "upsilon" },
          { character: "φ", label: "phi" },
          { character: "χ", label: "chi" },
          { character: "ψ", label: "psi" },
          { character: "ω", label: "omega" }
        ],
        [
          { character: " ", label: "Space", width: 2, type: "special" }
        ]
      ]
    },
    hebrew: {
      id: "hebrew",
      name: "Hebrew",
      language: "Hebrew",
      rows: [
        [
          { character: "א", label: "alef" },
          { character: "ב", label: "bet" },
          { character: "ג", label: "gimel" },
          { character: "ד", label: "dalet" },
          { character: "ה", label: "he" },
          { character: "ו", label: "vav" },
          { character: "ז", label: "zayin" },
          { character: "ח", label: "het" }
        ],
        [
          { character: "ט", label: "tet" },
          { character: "י", label: "yod" },
          { character: "כ", label: "kaf" },
          { character: "ל", label: "lamed" },
          { character: "מ", label: "mem" },
          { character: "נ", label: "nun" },
          { character: "ס", label: "samekh" },
          { character: "ע", label: "ayin" }
        ],
        [
          { character: "פ", label: "pe" },
          { character: "צ", label: "tsadi" },
          { character: "ק", label: "qof" },
          { character: "ר", label: "resh" },
          { character: "ש", label: "shin" },
          { character: "ת", label: "tav" },
          { character: " ", label: "Space", width: 2, type: "special" }
        ]
      ]
    },
    arabic2: {
      id: "arabic",
      name: "Arabic",
      language: "Arabic",
      rows: [
        [
          { character: "ض", label: "ḍ" },
          { character: "ص", label: "ṣ" },
          { character: "ث", label: "th" },
          { character: "ق", label: "q" },
          { character: "ف", label: "f" },
          { character: "غ", label: "gh" },
          { character: "ع", label: "ʿ" },
          { character: "ه", label: "h" },
          { character: "خ", label: "kh" },
          { character: "ح", label: "ḥ" }
        ],
        [
          { character: "ش", label: "sh" },
          { character: "س", label: "s" },
          { character: "ي", label: "y" },
          { character: "ب", label: "b" },
          { character: "ل", label: "l" },
          { character: "ا", label: "a" },
          { character: "ت", label: "t" },
          { character: "ن", label: "n" },
          { character: "م", label: "m" },
          { character: "ك", label: "k" }
        ],
        [
          { character: "ظ", label: "ẓ" },
          { character: "ط", label: "ṭ" },
          { character: "ذ", label: "dh" },
          { character: "د", label: "d" },
          { character: "ز", label: "z" },
          { character: "ر", label: "r" },
          { character: "و", label: "w" },
          { character: "ة", label: "h" },
          { character: "ء", label: "ʾ" }
        ],
        [
          { character: " ", label: "Space", width: 4, type: "special" }
        ]
      ]
    },
    russian2: {
      id: "russian",
      name: "Russian",
      language: "Russian",
      rows: [
        [
          { character: "й", label: "y" },
          { character: "ц", label: "ts" },
          { character: "у", label: "u" },
          { character: "к", label: "k" },
          { character: "е", label: "e" },
          { character: "н", label: "n" },
          { character: "г", label: "g" },
          { character: "ш", label: "sh" },
          { character: "щ", label: "shch" },
          { character: "з", label: "z" },
          { character: "х", label: "kh" }
        ],
        [
          { character: "ф", label: "f" },
          { character: "ы", label: "y" },
          { character: "в", label: "v" },
          { character: "а", label: "a" },
          { character: "п", label: "p" },
          { character: "р", label: "r" },
          { character: "о", label: "o" },
          { character: "л", label: "l" },
          { character: "д", label: "d" },
          { character: "ж", label: "zh" },
          { character: "э", label: "e" }
        ],
        [
          { character: "я", label: "ya" },
          { character: "ч", label: "ch" },
          { character: "с", label: "s" },
          { character: "м", label: "m" },
          { character: "и", label: "i" },
          { character: "т", label: "t" },
          { character: "ь", label: "'" },
          { character: "б", label: "b" },
          { character: "ю", label: "yu" }
        ],
        [
          { character: " ", label: "Space", width: 4, type: "special" }
        ]
      ]
    },
    hindi2: {
      id: "hindi",
      name: "Hindi",
      language: "Hindi",
      rows: [
        [
          { character: "ौ", label: "au" },
          { character: "ै", label: "ai" },
          { character: "ा", label: "ā" },
          { character: "ी", label: "ī" },
          { character: "ू", label: "ū" },
          { character: "ब", label: "b" },
          { character: "ह", label: "h" },
          { character: "ग", label: "g" },
          { character: "द", label: "d" },
          { character: "ज", label: "j" }
        ],
        [
          { character: "ो", label: "o" },
          { character: "े", label: "e" },
          { character: "्", label: "्" },
          { character: "ि", label: "i" },
          { character: "ु", label: "u" },
          { character: "प", label: "p" },
          { character: "र", label: "r" },
          { character: "क", label: "k" },
          { character: "त", label: "t" },
          { character: "च", label: "c" }
        ],
        [
          { character: "ॉ", label: "ŏ" },
          { character: "ं", label: "ṃ" },
          { character: "म", label: "m" },
          { character: "न", label: "n" },
          { character: "व", label: "v" },
          { character: "ल", label: "l" },
          { character: "स", label: "s" },
          { character: "य", label: "y" }
        ],
        [
          { character: " ", label: "Space", width: 4, type: "special" }
        ]
      ]
    },
    thai2: {
      id: "thai",
      name: "Thai",
      language: "Thai",
      rows: [
        [
          { character: "ๅ", label: "ๅ" },
          { character: "/", label: "/" },
          { character: "_", label: "_" },
          { character: "ภ", label: "ph" },
          { character: "ถ", label: "th" },
          { character: "ุ", label: "u" },
          { character: "ึ", label: "ue" },
          { character: "ค", label: "kh" },
          { character: "ต", label: "t" },
          { character: "จ", label: "c" },
          { character: "ข", label: "kh" },
          { character: "ช", label: "ch" }
        ],
        [
          { character: "ๆ", label: "ๆ" },
          { character: "ไ", label: "ai" },
          { character: "ำ", label: "am" },
          { character: "พ", label: "ph" },
          { character: "ะ", label: "a" },
          { character: "ั", label: "a" },
          { character: "ี", label: "i" },
          { character: "ร", label: "r" },
          { character: "น", label: "n" },
          { character: "ย", label: "y" },
          { character: "บ", label: "b" },
          { character: "ล", label: "l" }
        ],
        [
          { character: "ฟ", label: "f" },
          { character: "ห", label: "h" },
          { character: "ก", label: "k" },
          { character: "ด", label: "d" },
          { character: "เ", label: "e" },
          { character: "้", label: "้" },
          { character: "่", label: "่" },
          { character: "า", label: "a" },
          { character: "ส", label: "s" },
          { character: "ว", label: "w" },
          { character: "ง", label: "ng" }
        ],
        [
          { character: " ", label: "Space", width: 4, type: "special" }
        ]
      ]
    }
  };

  // Common phrases by language
  const commonPhrases: { [key: string]: { id: string; phrase: string; translation: string; category: string }[] } = {
    korean: [
      { id: "kr1", phrase: "안녕하세요", translation: "Hello", category: "Greetings" },
      { id: "kr2", phrase: "감사합니다", translation: "Thank you", category: "Greetings" },
      { id: "kr3", phrase: "죄송합니다", translation: "I'm sorry", category: "Greetings" },
      { id: "kr4", phrase: "이름이 뭐예요?", translation: "What is your name?", category: "Questions" },
      { id: "kr5", phrase: "저는 [이름]입니다", translation: "My name is [name]", category: "Introductions" },
      { id: "kr6", phrase: "어디에서 왔어요?", translation: "Where are you from?", category: "Questions" },
      { id: "kr7", phrase: "천천히 말해 주세요", translation: "Please speak slowly", category: "Learning" },
      { id: "kr8", phrase: "다시 말해 주세요", translation: "Please say that again", category: "Learning" }
    ],
    japanese: [
      { id: "jp1", phrase: "こんにちは", translation: "Hello", category: "Greetings" },
      { id: "jp2", phrase: "ありがとうございます", translation: "Thank you", category: "Greetings" },
      { id: "jp3", phrase: "すみません", translation: "Excuse me/I'm sorry", category: "Greetings" },
      { id: "jp4", phrase: "お名前は何ですか？", translation: "What is your name?", category: "Questions" },
      { id: "jp5", phrase: "私の名前は[名前]です", translation: "My name is [name]", category: "Introductions" },
      { id: "jp6", phrase: "出身はどこですか？", translation: "Where are you from?", category: "Questions" },
      { id: "jp7", phrase: "ゆっくり話してください", translation: "Please speak slowly", category: "Learning" },
      { id: "jp8", phrase: "もう一度言ってください", translation: "Please say that again", category: "Learning" }
    ],
    chinese: [
      { id: "cn1", phrase: "你好", translation: "Hello", category: "Greetings" },
      { id: "cn2", phrase: "谢谢", translation: "Thank you", category: "Greetings" },
      { id: "cn3", phrase: "对不起", translation: "I'm sorry", category: "Greetings" },
      { id: "cn4", phrase: "你叫什么名字？", translation: "What is your name?", category: "Questions" },
      { id: "cn5", phrase: "我叫[名字]", translation: "My name is [name]", category: "Introductions" },
      { id: "cn6", phrase: "你从哪里来？", translation: "Where are you from?", category: "Questions" },
      { id: "cn7", phrase: "请说慢一点", translation: "Please speak slowly", category: "Learning" },
      { id: "cn8", phrase: "请再说一遍", translation: "Please say that again", category: "Learning" }
    ],
    arabic: [
      { id: "ar1", phrase: "مرحبا", translation: "Hello", category: "Greetings" },
      { id: "ar2", phrase: "شكرا", translation: "Thank you", category: "Greetings" },
      { id: "ar3", phrase: "آسف", translation: "I'm sorry", category: "Greetings" },
      { id: "ar4", phrase: "ما اسمك؟", translation: "What is your name?", category: "Questions" },
      { id: "ar5", phrase: "اسمي [الاسم]", translation: "My name is [name]", category: "Introductions" },
      { id: "ar6", phrase: "من أين أنت؟", translation: "Where are you from?", category: "Questions" },
      { id: "ar7", phrase: "تكلم ببطء من فضلك", translation: "Please speak slowly", category: "Learning" },
      { id: "ar8", phrase: "أعد ذلك مرة أخرى من فضلك", translation: "Please say that again", category: "Learning" }
    ],
    russian: [
      { id: "ru1", phrase: "Привет", translation: "Hello", category: "Greetings" },
      { id: "ru2", phrase: "Спасибо", translation: "Thank you", category: "Greetings" },
      { id: "ru3", phrase: "Извините", translation: "I'm sorry", category: "Greetings" },
      { id: "ru4", phrase: "Как вас зовут?", translation: "What is your name?", category: "Questions" },
      { id: "ru5", phrase: "Меня зовут [имя]", translation: "My name is [name]", category: "Introductions" },
      { id: "ru6", phrase: "Откуда вы?", translation: "Where are you from?", category: "Questions" },
      { id: "ru7", phrase: "Говорите медленнее, пожалуйста", translation: "Please speak slowly", category: "Learning" },
      { id: "ru8", phrase: "Повторите, пожалуйста", translation: "Please say that again", category: "Learning" }
    ],
    thai: [
      { id: "th1", phrase: "สวัสดี", translation: "Hello", category: "Greetings" },
      { id: "th2", phrase: "ขอบคุณ", translation: "Thank you", category: "Greetings" },
      { id: "th3", phrase: "ขอโทษ", translation: "I'm sorry", category: "Greetings" },
      { id: "th4", phrase: "ชื่ออะไร", translation: "What is your name?", category: "Questions" },
      { id: "th5", phrase: "ผม/[ชื่อ]", translation: "My name is [name]", category: "Introductions" },
      { id: "th6", phrase: "มาจากไหน", translation: "Where are you from?", category: "Questions" },
      { id: "th7", phrase: "ช้าๆ หน่อย", translation: "Please speak slowly", category: "Learning" },
      { id: "th8", phrase: "อีกครั้งไหม", translation: "Please say that again", category: "Learning" }
    ]
  };

  // Handle keyboard key press
  const handleKeyPress = (key: CharacterKey) => {
    setInputText((prev: string) => prev + key.character);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  // Clear input
  const clearInput = () => {
    setInputText("");
  };

  // Copy input to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inputText);
  };

  // Search dictionary
  const searchDictionary = () => {
    if (!searchTerm.trim()) return;

    // In a real app, you would call an API to get dictionary results
    // For this example, we'll simulate results based on the selected language
    let mockResults: DictionaryResult[] = [];

    switch (selectedLanguage) {
      case 'korean':
        mockResults = [
          {
            word: searchTerm,
            phonetic: "/안녕하세요/",
            meanings: [
              {
                partOfSpeech: "expression",
                definitions: [
                  {
                    definition: "Hello / Good day / How are you?",
                    example: "안녕하세요, 만나서 반갑습니다."
                  }
                ]
              }
            ]
          }
        ];
        break;
      case 'japanese':
        mockResults = [
          {
            word: searchTerm,
            phonetic: "/こんにちは/",
            meanings: [
              {
                partOfSpeech: "expression",
                definitions: [
                  {
                    definition: "Hello / Good afternoon",
                    example: "こんにちは、お元気ですか？"
                  }
                ]
              }
            ]
          }
        ];
        break;
      case 'chinese':
        mockResults = [
          {
            word: searchTerm,
            phonetic: "/nǐ hǎo/",
            meanings: [
              {
                partOfSpeech: "expression",
                definitions: [
                  {
                    definition: "Hello / How are you?",
                    example: "你好，很高兴认识你。"
                  }
                ]
              }
            ]
          }
        ];
        break;
      case 'arabic':
        mockResults = [
          {
            word: searchTerm,
            phonetic: "/marḥaban/",
            meanings: [
              {
                partOfSpeech: "expression",
                definitions: [
                  {
                    definition: "Hello / Welcome",
                    example: "مرحبا، كيف حالك؟"
                  }
                ]
              }
            ]
          }
        ];
        break;
      case 'russian':
        mockResults = [
          {
            word: searchTerm,
            phonetic: "/privet/",
            meanings: [
              {
                partOfSpeech: "expression",
                definitions: [
                  {
                    definition: "Hi / Hello",
                    example: "Привет, как дела?"
                  }
                ]
              }
            ]
          }
        ];
        break;
      case 'thai':
        mockResults = [
          {
            word: searchTerm,
            phonetic: "/sà-wàt-dee/",
            meanings: [
              {
                partOfSpeech: "expression",
                definitions: [
                  {
                    definition: "Hello / Greetings",
                    example: "สวัสดี/ค่ะ"
                  }
                ]
              }
            ]
          }
        ];
        break;
      default:
        mockResults = [
          {
            word: searchTerm,
            phonetic: "/example/",
            meanings: [
              {
                partOfSpeech: "noun",
                definitions: [
                  {
                    definition: "This is a sample definition for demonstration purposes.",
                    example: "This is an example sentence."
                  }
                ]
              }
            ]
          }
        ];
    }

    setSearchResults(mockResults);

    // Add to recent searches if not already there
    if (!recentSearches.includes(searchTerm)) {
      setRecentSearches((prev: any) => [searchTerm, ...prev].slice(0, 5));
    }
  };

  // Copy phrase to clipboard
  const copyPhrase = (phraseId: string, phrase: string) => {
    navigator.clipboard.writeText(phrase);
    setCopiedPhraseId(phraseId);

    // Reset copied status after 2 seconds
    setTimeout(() => {
      setCopiedPhraseId(null);
    }, 2000);
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      // Set language based on selected language
      switch (selectedLanguage) {
        case 'korean':
          utterance.lang = 'ko-KR';
          break;
        case 'japanese':
        case 'japanese_katakana':
          utterance.lang = 'ja-JP';
          break;
        case 'chinese':
        case 'chinese_simplified':
          utterance.lang = 'zh-CN';
          break;
        case 'arabic':
          utterance.lang = 'ar-SA';
          break;
        case 'russian':
          utterance.lang = 'ru-RU';
          break;
        case 'thai':
          utterance.lang = 'th-TH';
          break;
        case 'hindi':
          utterance.lang = 'hi-IN';
          break;
        case 'greek':
          utterance.lang = 'el-GR';
          break;
        case 'hebrew':
          utterance.lang = 'he-IL';
          break;
        default:
          utterance.lang = 'en-US';
      }

      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a voice for the selected language
      const voice = voices.find(v => v.lang.startsWith(utterance.lang));
      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  return (
    <div className="language-tools h-full flex flex-col">
      <div className="header flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Language Tools</h2>

        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="korean">Korean</SelectItem>
            <SelectItem value="japanese">Japanese (Hiragana)</SelectItem>
            <SelectItem value="japanese_katakana">Japanese (Katakana)</SelectItem>
            <SelectItem value="chinese">Chinese (Pinyin)</SelectItem>
            <SelectItem value="chinese_simplified">Chinese (Simplified)</SelectItem>
            <SelectItem value="arabic">Arabic</SelectItem>
            <SelectItem value="russian">Russian</SelectItem>
            <SelectItem value="thai">Thai</SelectItem>
            <SelectItem value="hindi">Hindi</SelectItem>
            <SelectItem value="greek">Greek</SelectItem>
            <SelectItem value="hebrew">Hebrew</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs
        defaultValue="keyboard"
        className="flex-1 flex flex-col"
        onValueChange={(value: string) => setActiveTab(value as "keyboard" | "dictionary" | "phrases")}
        value={activeTab}
      >
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="keyboard" className="flex-1">
              <Keyboard size={16} className="mr-2" />
              Character Pad
            </TabsTrigger>
            <TabsTrigger value="dictionary" className="flex-1">
              <BookOpen size={16} className="mr-2" />
              Dictionary
            </TabsTrigger>
            <TabsTrigger value="phrases" className="flex-1">
              <MessageCircle size={16} className="mr-2" />
              Phrases
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="keyboard" className="flex-1 p-4 overflow-auto">
          <div className="space-y-4">
            <div className="relative">
              <Input
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type or use the character pad below"
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearInput}
                  className="h-8 w-8"
                >
                  <span className="sr-only">Clear</span>
                  ×
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="h-8 w-8"
                >
                  <Copy size={14} />
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">
                  {keyboardLayouts[selectedLanguage]?.name || "Keyboard"}
                </div>
                <Select
                  value={selectedLanguage}
                  onValueChange={setSelectedLanguage}
                >
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(keyboardLayouts).map((langId) => (
                      <SelectItem key={langId} value={langId}>
                        {keyboardLayouts[langId].name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="keyboard-toggle" className="text-sm">Show Keyboard</Label>
                <Switch
                  id="keyboard-toggle"
                  checked={showKeyboard}
                  onCheckedChange={setShowKeyboard}
                />
              </div>
            </div>

            {showKeyboard && (
              <div className="virtual-keyboard bg-gray-100 p-3 rounded-lg">
                <div className="space-y-2">
                  {keyboardLayouts[selectedLanguage]?.rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-1">
                      {row.map((key, keyIndex) => (
                        <Button
                          key={`${rowIndex}-${keyIndex}`}
                          variant="outline"
                          className={`h-12 flex flex-col justify-center items-center ${
                            key.width ? `w-${key.width * 12}` : 'w-12'
                          } ${key.type === 'special' ? 'bg-gray-200' : ''}`}
                          onClick={() => handleKeyPress(key)}
                        >
                          <span className="text-lg">{key.character}</span>
                          {key.label && <span className="text-xs text-gray-500">{key.label}</span>}
                        </Button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p>
                Use this character pad to type special characters for {keyboardLayouts[selectedLanguage]?.language}.
                Click on a character to add it to the input field above.
              </p>
              <p className="mt-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="link" className="p-0 h-auto text-sm text-gray-500 flex items-center">
                        <Info size={14} className="mr-1" /> Tips for using IME
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>For Korean: Combine consonants and vowels to form syllables.</p>
                      <p>For Japanese: Use hiragana for native Japanese words.</p>
                      <p>For Chinese: Use pinyin with tone marks for proper pronunciation.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dictionary" className="flex-1 p-4 overflow-auto">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={searchTerm}
                  onChange={(e: { target: { value: any; }; }) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${keyboardLayouts[selectedLanguage]?.language || ""} dictionary`}
                  onKeyDown={(e: { key: string; }) => e.key === 'Enter' && searchDictionary()}
                />
              </div>
              <Button onClick={searchDictionary}>
                <Search size={16} className="mr-2" />
                Search
              </Button>
            </div>

            {recentSearches.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Recent Searches</div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term: any, index: any) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        setSearchTerm(term);
                        searchDictionary();
                      }}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="dictionary-results">
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((result: { word: string; phonetic: any; meanings: any[]; }, index: any) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center">
                              {result.word}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => speakText(result.word)}
                                className="ml-2 h-8 w-8"
                              >
                                <Volume2 size={16} />
                              </Button>
                            </CardTitle>
                            <CardDescription>{result.phonetic}</CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard()}
                          >
                            <Copy size={16} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {result.meanings.map((meaning: { partOfSpeech: any; definitions: any[]; }, mIndex: any) => (
                          <div key={mIndex} className="mb-3">
                            <div className="font-medium text-sm text-gray-500 mb-1">
                              {meaning.partOfSpeech}
                            </div>
                            {meaning.definitions.map((def: { definition: any; example: any; }, dIndex: any) => (
                              <div key={dIndex} className="mb-2">
                                <div className="text-sm">{def.definition}</div>
                                {def.example && (
                                  <div className="text-sm text-gray-500 italic mt-1">
                                    "{def.example}"
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="text-center py-8 text-gray-500">
                  No results found. Try a different search term.
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Search for a word to see its definition.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="phrases" className="flex-1 p-4 overflow-auto">
          <ScrollArea className="h-full">
            <div className="space-y-6">
              {Object.entries(
                commonPhrases[selectedLanguage]?.reduce<Record<string, typeof commonPhrases[keyof typeof commonPhrases]>>(
                  (acc, phrase) => {
                    if (!acc[phrase.category]) {
                      acc[phrase.category] = [];
                    }
                    acc[phrase.category].push(phrase);
                    return acc;
                  },
                  {}
                ) || {}
              ).map(([category, phrases]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium mb-2">{category}</h3>
                  <div className="space-y-2">
                    {phrases.map((phrase) => (
                      <Card key={phrase.id}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium mb-1 flex items-center">
                                {phrase.phrase}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => speakText(phrase.phrase)}
                                  className="ml-1 h-6 w-6"
                                >
                                  <Volume2 size={14} />
                                </Button>
                              </div>
                              <div className="text-sm text-gray-600">{phrase.translation}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyPhrase(phrase.id, phrase.phrase)}
                            >
                              {copiedPhraseId === phrase.id ? (
                                <Check size={16} className="text-green-500" />
                              ) : (
                                <Copy size={16} />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LanguageTools;




