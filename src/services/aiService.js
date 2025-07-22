import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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'
});

export async function getGiftRecommendations(prompt, budget, quantity) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a gifting expert specializing in corporate and promotional gifts.ONLY suggest real products available from the website: https://www.mhglobal.com/ Filter strictly based on the user's given budget, quantity, and category. Provide at least 10 products if available."
        },
        {
          role: "user",
          content: `Please suggest appropriate gifts with the following criteria:
            - Budget per item: RM${budget}
            - Quantity needed: ${quantity} pieces
            - Requirements: ${prompt}
            
            Format the response as a JSON array with objects containing:
            - category (string)
            - subcategory (string)
            - description (string)
            - image (string, provide a full URL to a representative image with papular web sites valid full URL ending in .jpg or .png)
            - keywords (array of strings)
            - minPrice (number)
            - maxPrice (number)`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content ?? '');
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}