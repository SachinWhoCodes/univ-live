import { VercelRequest, VercelResponse } from "@vercel/node";

interface WebsiteContentRequest {
  coachingName: string;
  educatorName: string;
  subjects: string[];
  description: string;
  yearEstablished?: number;
  studentCount?: number;
}

interface WebsiteContentResponse {
  stats: Array<{ label: string; value: string; icon: string }>;
  achievements: Array<{ title: string; description: string; icon: string }>;
  testimonials: Array<{ name: string; course: string; rating: number; text: string; avatar: string }>;
  faculty: Array<{ name: string; subject: string; designation: string; experience: string; bio: string; image: string }>;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { coachingName, educatorName, subjects, description, yearEstablished, studentCount } = req.body as WebsiteContentRequest;

    if (!coachingName || !educatorName || !subjects || !description) {
      return res.status(400).json({ error: "Missing required fields: coachingName, educatorName, subjects, description" });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    const isDev = process.env.NODE_ENV !== "production";
    if (!groqApiKey) {
      console.error("GROQ_API_KEY not configured");
      const msg = isDev ? "GROQ_API_KEY not configured on server. Add it to Vercel environment variables or .env.local for local dev." : "API configuration error";
      return res.status(500).json({ error: msg });
    }

    // Build the prompt for Groq
    const prompt = buildWebsiteContentPrompt(
      coachingName,
      educatorName,
      subjects,
      description,
      yearEstablished,
      studentCount
    );

    // Call Groq API
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are an expert website content creator for educational coaching centers. Generate engaging and professional content for their website based on the information provided.

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "stats": [{"label": "string", "value": "string", "icon": "string"}],
  "achievements": [{"title": "string", "description": "string", "icon": "string"}],
  "testimonials": [{"name": "string", "course": "string", "rating": number (1-5), "text": "string", "avatar": "string (initials)"}],
  "faculty": [{"name": "string", "subject": "string", "designation": "string", "experience": "string", "bio": "string", "image": "string (placeholder like initials or color)"}]
}

Guidelines:
- Stats should showcase key achievements (e.g., "1000+ Students", "95% Success Rate", "10+ Years", "50+ Tests")
- Achievements should list awards, recognitions, certifications (3-5 items)
- Testimonials should be realistic student reviews (3-4 items with ratings 4-5)
- Faculty should include the educator and if mentioned any other faculty (2-3 items)
- Use placeholder values for images (like "JD" for "John Doe" or URLs like "https://avatar.placeholder.com/JD")
- Icons can be simple names: "Users", "Trophy", "Star", "BookOpen", "Target", "Award", etc.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!groqResponse.ok) {
      const error = await groqResponse.text();
      console.error("Groq API error:", error);
      const msg = isDev ? `Groq API error: ${error}` : "Failed to generate website content";
      return res.status(500).json({ error: msg });
    }

    const data = await groqResponse.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: "No response from AI" });
    }

    // Parse the JSON response - handle potential markdown wrapping
    let generatedContent: WebsiteContentResponse;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/) || [null, content];
      const jsonString = jsonMatch[1] || content;
      generatedContent = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content, parseError);
      const msg = isDev ? `Failed to parse AI response: ${String(parseError)} -- content: ${String(content).slice(0, 200)}` : "Failed to parse AI response";
      return res.status(500).json({ error: msg });
    }

    return res.status(200).json(generatedContent);
  } catch (error) {
    console.error("Error in generate-website-content:", error);
    const isDev = process.env.NODE_ENV !== "production";
    return res.status(500).json({ error: isDev ? String(error) : "Internal server error" });
  }
}

function buildWebsiteContentPrompt(
  coachingName: string,
  educatorName: string,
  subjects: string[],
  description: string,
  yearEstablished?: number,
  studentCount?: number
): string {
  const subjectsText = subjects.join(", ");
  const yearsActive = yearEstablished ? new Date().getFullYear() - yearEstablished : 5;
  const studentInfo = studentCount ? `with approximately ${studentCount} students enrolled` : "";

  return `Generate professional and engaging website content for an educational coaching center with the following information:

Coaching Center Name: ${coachingName}
Founder/Educator: ${educatorName}
Subjects: ${subjectsText}
Years Active: ${yearsActive} years
Student Info: ${studentInfo}

Description/About: ${description}

Create realistic and professional content that would appeal to students looking to join this coaching center. The content should reflect the subjects offered and the coaching center's mission. Make the testimonials specific to the subjects mentioned and align achievements with common educational milestones.`;
}
