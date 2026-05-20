import { Request, Response, NextFunction } from "express";
import { sendChatMessage } from "./chat-messages.service.js";

export const handleAskChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    
    // Giả lập userId = 1 (Vì hiện tại bạn chưa gửi token lên từ mobile)
    // Sau này khi có auth middleware, bạn thay bằng: const userId = req.user.id;
    const userId = 1; 

    if (!message) {
       res.status(400).json({ success: false, error: "Nội dung tin nhắn không được để trống." });
       return;
    }

    // Gọi hàm Service có chứa Puter.js
    const result = await sendChatMessage(userId, message);
    
    // Trả về đúng format mà Mobile app đang chờ: response.data.data
    res.status(200).json({ success: true, data: result.assistantMessage.content });
  } catch (error) {
    // Đẩy lỗi sang errorHandlerMiddleware của hệ thống
    next(error);
  }
};