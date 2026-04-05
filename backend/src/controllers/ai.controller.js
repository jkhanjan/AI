const { multiAI } = require("../services/multiAI.services");

exports.chat = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "No prompt provided" });
    }

    const response = await multiAI(prompt);

    res.json({
      response
    });

  } catch (error) {
    res.status(500).json({
      message: "AI error",
      error: error.message
    });
  }
};