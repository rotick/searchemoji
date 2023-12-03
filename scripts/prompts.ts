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
