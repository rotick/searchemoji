export const keywords = (
  langs: string[],
  emojis: string[]
) => `I want to build an Emoji search engine to help people quickly find the Emoji they want. My strategy involves associating, expanding, and translating the meanings and names expressed by each Emoji into search keywords in multiple languages. This way, users can search for Emojis using their native language.

I need your help as a large language model to generate these names and search keywords. I will provide you with batches of Emoji characters and their Unicode-defined official names, separated by ":" and given in the form of an array, for example:
["😀:grinning face", "😃:grinning face with big eyes"]

I will also inform you each time about the languages for which I want keywords. I will provide the ISO 639-1 codes for the target language in the form of an array, such as: ["en","zh","es",...]

For each Emoji character, you need to translate its name into the corresponding names in various languages and associate and expand them into keywords for each language. Please return the results in JSON format, for example:

\`\`\`
[
  {
    "emoji": "😀",
    "name": {
      "en": "Grinning Face",
      "zh": "嘿嘿",
      …
    },
    "keywords": {
      "en": ["smile", "laugh","happy","haha", …],
      "zh": ["哈哈","咧嘴","笑脸", "开心","喜悦","大笑", …],
      ….
    },
  }
  {
    "emoji": "😃",
    "name": {
      "en": "Grinning Face with Big Eyes",
      "zh": "哈哈",
      …
    },
    "keywords": {
      "en": ["smile","laugh", "happy","haha", …],
      "zh": ["嘿嘿","咧嘴", "笑脸", "开心","喜悦","大笑", …],
      ….
    }
  }
]
\`\`\`
As you can see, the returned JSON object is also an array. Each array item contains the Emoji character I provided, the names in various languages under "name," and keywords under "keywords." The keys in the "name" and "keywords" objects are the ISO 639-1 codes for the respective languages, with values being the names and keyword arrays for each language.

When generating keywords, please consider the following points (which are crucial for me):

1. Associate and expand keywords based on the appearance and name dimensions of the Emoji. Include emotions if it's a facial expression, actions and states if it's a person or body part, actions and emotions if it's an animal, freshness and color if it's a fruit or vegetable, purpose if it's an object, language and landmarks if it's a flag, meaning if it's a symbol, and related words if it's a number or text.
2. Keywords for each language should reflect what native speakers might call or describe the Emoji. Different languages may have different meanings for the same Emoji, so avoid simple translations and generate expressions based on each language's usage habits.
3. The number of keywords for each Emoji in each language should be between 4 and 10, as many as possible, but relevant, without forcing a specific number.
4. If the target language is not English, translate the main concept words in the Emoji name into the target language and include them as part of the keywords.
5. When generating names in each language, if the language follows the convention of capitalizing the first letter, you also need to capitalize the first letter of that name.
6. Onomatopoeic words and some emotive abbreviations can also be used as keywords, such as: "哈哈", "haha", "jaja," "haha," "lol," "lmao," etc.

Now, please provide the batch of Emoji and the target languages for generating keywords:
Target languages: ${JSON.stringify(langs)}
Emoji: ${JSON.stringify(emojis)}
`

export const groupNamePrompt = (
  langs: string[],
  names: string[]
) => `I am building a multilingual Emoji search engine. Unicode has grouped emojis and assigned names to each group. Now, I need to translate these group names into various languages. I will provide you with the group names in the form of an array, like:
["Smileys & Emotion","face-smiling"]
and inform you of the languages for translation, providing their ISO639-1 codes in an array format, such as:
["en","zh","es",…]
Please paraphrase these group names into the specified languages and return them to me in JSON format, like:
\`\`\`
[
  {
    name: "Smileys & Emotion",
    en: "Smileys emotion",
    zh: "表情与情感"
    …
  },
  {
    name: "face-smiling",
    en: "Face smiling",
    zh: "笑脸"
    …
  }
]
\`\`\`
As you can see, the returned format is an array of objects. Each object's "name" corresponds to the given group name, and other keys represent ISO639-1 codes for various languages. The values are the translated results in each language.

When translating, please consider the following:
1. Do not translate literally; use paraphrasing to match the native speakers' wording habits and maintain consistency with the original English names' meanings.
2. Unicode's names for subgroups include "-", and you need to paraphrase these names into their corresponding English names, placing them in the "en" key of the object. This is why I also need you to provide the original "en" key in the return. Note that you only need to handle "-", and other symbols such as "&" do not need translation.
3. For languages with a capitalization convention for the first letter, the initial letter of the results you return should be capitalized.

Now, please translate the following group names into the specified languages:

Group names: ${JSON.stringify(names)}
Target languages: ${JSON.stringify(langs)}
`

export const complementNamePrompt = (
  langs: string[],
  emojis: string[]
) => `I want to build an Emoji search engine to help people quickly find the Emoji they want. My strategy involves associating, expanding, and translating the meanings and names in multiple languages. This way, users can search for Emojis using their native language.

I need your help as a large language model to generate these names. I will provide you with batches of Emoji characters and their Unicode-defined official names, separated by ":" and given in the form of an array, for example:
["😀:grinning face", "😃:grinning face with big eyes"]

I will also inform you each time about the languages for which I want keywords. I will provide the ISO 639-1 codes for the target language in the form of an array, such as: ["en","zh","es",...]

For each Emoji character, you need to translate its name into the corresponding names in various languages. Please return the results in JSON format, for example:

\`\`\`
[
  {
    "emoji": "😀",
    "name": {
      "en": "Grinning Face",
      "zh": "嘿嘿",
      …
    }
  }
  {
    "emoji": "😃",
    "name": {
      "en": "Grinning Face with Big Eyes",
      "zh": "哈哈",
      …
    }
  }
]
\`\`\`
As you can see, the returned JSON object is also an array. Each array item contains the Emoji character I provided, the names in various languages under "name". The keys in the "name" objects are the ISO 639-1 codes for the respective languages, with values being the names for each language.

When generating names in each language, if the language follows the convention of capitalizing the first letter, you also need to capitalize the first letter of that name.

Now, please provide the batch of Emoji and the target languages for generating keywords:
Target languages: ${JSON.stringify(langs)}
Emoji: ${JSON.stringify(emojis)}
`
export const localePrompt = (
  en: Record<string, any>,
  zh: Record<string, any>,
  target: string
) => `I am in the process of making my website multilingual. The English and Chinese versions have been completed, and the multilingual configuration has been extracted into a JSON file. Now I need to add configurations for other languages. I would like you to play the role of an expert in website localization. I will provide you with the Chinese and English multilingual configurations, as well as the ISO639-1 code for the target language. You need to translate them together with their corresponding counterparts in Chinese and English, and return them to me.

The configurations may have multiple levels, with each language configuration having the same key but different values representing translations in various languages. Therefore, when translating, please make sure to follow the format of complete configurations (based on English configuration) and provide me with results accordingly. Please pay attention to the following points during translation:

1. There are variables enclosed in {} within both Chinese and English original texts of configurations. These variables do not need to be translated but should be moved to appropriate positions based on context and conventions of the target language.
2. The returned format should only include a JSON string without any explanations or descriptions.
3. Some words may be followed by punctuation marks, which may differ between Chinese and English translations; these punctuation marks should also be translated into corresponding ones used in the target language.
4.Translations should adhere to native speakers' usage habits of the target language rather than being simply literal translations.

The complete English configuration is as follows:
\`\`\`
${JSON.stringify(en)}
\`\`\`

The complete Chinese configuration is as follows:
\`\`\`
${JSON.stringify(zh)}
\`\`\`

Now please refer to both Chinese and English configurations provided above, help me translate them, and generate results for \`${target}\`.`
