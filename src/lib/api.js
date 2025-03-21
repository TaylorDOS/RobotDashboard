
export async function classifyDescription(description) {
    console.log("Attempting to classify description:", description);
    
    try {
      const response = await fetch("https://capstone-gemini-flask-api.onrender.com/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ description }),
        mode: "cors", 
      });
      
      console.log("API Response status:", response.status);
      
      if (!response.ok) {
        let errorDetails = "";
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
        } catch (e) {
          // Ignore error parsing issues
        }
        
        console.error("Classification API error:", response.status, errorDetails);
        throw new Error(`Classification failed with status ${response.status}: ${errorDetails}`);
      }
      
      const data = await response.json();
      console.log("Classification result:", data);
      
      if (!data.category) {
        console.error("Unexpected API response format:", data);
        throw new Error("API response missing expected data");
      }
      
      return data; // { category, priority }
    } catch (error) {
      console.error("Error in classification API call:", error);
      throw error;
    }
  }