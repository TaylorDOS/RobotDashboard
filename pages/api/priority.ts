import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  category?: string;
  priority?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { description } = req.body;

  if (!description || typeof description !== "string") {
    return res.status(400).json({ error: "Invalid or missing description" });
  }

  try {
    const result = await classifyDescription(description);

    // Fallback if result is missing or invalid
    if (!result?.category) {
      const fallback = fallbackPriority(description);
      return res.status(200).json(fallback);
    }

    return res.status(200).json({
      category: result.category,
      priority:
        result.priority !== undefined
          ? result.priority
          : fallbackPriority(result.category).priority,
    });
  } catch (error) {
    console.error("Classification failed, using fallback...", error);
    const fallback = fallbackPriority(description);
    return res.status(200).json(fallback);
  }
}

// External classification service
async function classifyDescription(description: string): Promise<{ category: string; priority?: number }> {
  console.log("Attempting to classify description:", description);

  const response = await fetch("https://capstone-gemini-flask-api.onrender.com/classify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    let errorDetails = "";
    try {
      const errorData = await response.json();
      errorDetails = JSON.stringify(errorData);
    } catch (_) {
      // Ignore parsing error
    }

    throw new Error(`Classification API failed: ${response.status} - ${errorDetails}`);
  }

  const data = await response.json();

  if (!data.category) {
    throw new Error("API response missing category");
  }

  return data;
}

// Heuristic fallback classifier
function fallbackPriority(desc: string): { category: string; priority: number } {
  const lower = desc.toLowerCase();

  if (lower.includes("medicine") || lower.includes("pill") || lower.includes("drug") || lower.includes("prescription")) {
    return { category: "Medicine", priority: 1 };
  } else if (lower.includes("blood") || lower.includes("sample") || lower.includes("specimen") || lower.includes("lab")) {
    return { category: "Blood Samples", priority: 2 };
  } else if (lower.includes("document") || lower.includes("paper") || lower.includes("file") || lower.includes("form")) {
    return { category: "Documents", priority: 3 };
  } else if (lower.includes("linen") || lower.includes("cloth") || lower.includes("supply") || lower.includes("fabric")) {
    return { category: "Linen Supplies", priority: 4 };
  } else {
    return { category: "Others", priority: 5 };
  }
}