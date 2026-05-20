import { GoogleGenerativeAI } from "@google/generative-ai";

// Khởi tạo Gemini client bằng Key trong file .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function askPuterAI(systemPrompt: string, userMessage: string): Promise<string> {
  try {
    // Sử dụng model gemini-1.5-flash: Tốc độ cực nhanh và hạn mức free rất cao
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      // Đưa toàn bộ thông tin sức khỏe và định hình nhân vật vào systemInstruction
      systemInstruction: systemPrompt, 
    });

    // Truyền câu hỏi của người dùng vào
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("❌ Lỗi khi gọi Gemini API:", error);
    // Bắn lỗi ra để controller bắt và trả về thông báo lỗi cho App Mobile
    throw new Error("Không thể kết nối đến AI."); 
  }
}