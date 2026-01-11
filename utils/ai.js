import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function parseIntent(userMessage, currentLocation = "Raleigh, NC") {
    try {
        // PASS 1: Initial Extraction
        const pass1 = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are Bernard, an elite lead scraper AI. Extract structured scraping parameters from the user's request.
                    Context: ${currentLocation} (Default location).
                    
                    Output JSON:
                    {
                        "niche": string | null, 
                        "city": string | null,
                        "state": string | null,
                        "filters": {
                            "minRating": number | null,
                            "minReviews": number | null,
                            "requireNoWebsite": boolean,
                            "requireWebsite": boolean
                        },
                        "isGibberish": boolean // Set true if input is nonsense or unrelated to business search (e.g. "hello", "weather", "tacos")
                    }`
                },
                { role: "user", content: userMessage }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
        });

        const result1 = JSON.parse(pass1.choices[0].message.content);

        // Immediate Rejection if Gibberish
        if (result1.isGibberish || !result1.niche) {
            console.log("AI: Detected gibberish or invalid niche. Rejecting.");
            throw new Error("Input not relevant to lead scraping.");
        }

        // PASS 2: Accuracy Verification (The "Double Check")
        const pass2 = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are the Quality Control AI. Verify the extraction below.
                    
                    User Request: "${userMessage}"
                    Extracted Params: ${JSON.stringify(result1)}
                    
                    Task:
                    1. Is this accurate? 
                    2. Does it perfectly capture the user's filters (rating, no website)?
                    3. Is it hallucinations?

                    If accurate, output the SAME JSON.
                    If inaccurate, output the CORRECTED JSON.
                    If the User Request is impossible to scrape or nonsense, output { "error": "Invalid" }.
                    `
                },
                { role: "user", content: "Verify and finalize parameters." }
            ],
            response_format: { type: "json_object" },
            temperature: 0,
        });

        const finalResult = JSON.parse(pass2.choices[0].message.content);

        if (finalResult.error) {
            throw new Error("AI Verification failed: Input rejected.");
        }

        return finalResult;

    } catch (error) {
        console.error("AI Parse Error:", error);
        // Fallback: simple text parse
        return { niche: userMessage, city: "Raleigh", state: "NC" }; // Naive fallback
    }
}
