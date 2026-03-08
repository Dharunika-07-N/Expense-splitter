export async function scanReceipt(imageBase64) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514', // using model specified by user
            max_tokens: 1000,
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image',
                        source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 }
                    },
                    {
                        type: 'text',
                        text: `Extract all line items from this receipt. 
            Return ONLY a JSON object like:
            {
              "merchant": "Restaurant Name",
              "total": 84.50,
              "tax": 6.50,
              "items": [
                { "name": "Burger", "price": 12.99 },
                { "name": "Fries", "price": 4.99 }
              ]
            }`
                    }
                ]
            }]
        })
    });

    const data = await response.json();
    const text = data.content[0].text;
    return JSON.parse(text.replace(/```json|```/g, '').trim());
}
