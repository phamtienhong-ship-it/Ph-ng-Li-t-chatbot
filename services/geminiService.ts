
import { GoogleGenAI } from "@google/genai";
import { KNOWLEDGE_BASE_PROMPT } from '../constants';

const getBotResponse = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      return "Lỗi: API key chưa được cấu hình. Vui lòng liên hệ quản trị viên.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            systemInstruction: KNOWLEDGE_BASE_PROMPT,
            temperature: 0.2, // Keep it focused on the knowledge base
        },
    });

    return response.text.trim();
  } catch (error: any) {
    console.error("Gemini API error:", error);
    if (error.message?.includes("Requested entity was not found")) {
        return "Xin lỗi, hiện tại tôi không thể kết nối với dịch vụ AI. Vui lòng kiểm tra lại cấu hình.";
    }
    return "Xin lỗi, tôi đang gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại sau.";
  }
};

export { getBotResponse };
