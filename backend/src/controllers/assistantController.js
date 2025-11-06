const axios = require("axios");

// Chat with assistant
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Call OpenAI API or your preferred AI service
    // This is a placeholder implementation
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for StayFinder, an Airbnb-like property rental platform. Help users with questions about properties, bookings, and the platform.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const assistantMessage =
      response.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      message: assistantMessage,
      userId,
    });
  } catch (error) {
    console.error("Assistant error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing your message",
      error: error.message,
    });
  }
};

