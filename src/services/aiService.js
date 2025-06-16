import OpenAI from 'openai';


export async function getGiftRecommendations(prompt, budget, quantity) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a gifting expert specializing in corporate and promotional gifts. Provide relevant gift suggestions based on the user's requirements."
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