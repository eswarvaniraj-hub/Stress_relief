// ==========================================================================
// BREATHLY / RESET — Google Gemini AI Coach Controller
// Calls Google Gemini REST API using secure server-side environment variables.
// ==========================================================================

/**
 * Handle conversational AI coaching requests via Google Gemini
 */
exports.chatWithGemini = async (req, res) => {
  try {
    const { message, context } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required.'
      });
    }

    // Retrieve API key from environment variables (checking standard names)
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn('[Gemini Coach] GEMINI_API_KEY environment variable is not configured on server.');
      return res.json({
        success: false,
        reply: "I am currently running in offline adaptive mode. I'm here to support your focus and energy—would you like to start a 2-minute Bubble Rhythm break or switch to Minimum Mode?",
        actionType: 'play-bubble-rhythm'
      });
    }

    // Prepare contextual user summary for the prompt
    let contextSummary = 'No specific habit telemetry provided.';
    if (context && typeof context === 'object') {
      const parts = [];
      if (context.userName) parts.push(`User Name: ${context.userName}`);
      if (context.statusTitle) parts.push(`Current Well-Being Status: ${context.statusTitle}`);
      if (context.workload) parts.push(`Daily Workload: ${context.workload}`);
      if (context.sleepQuality) parts.push(`Sleep Quality: ${context.sleepQuality}`);
      if (context.stressRating) parts.push(`Pressure/Stress Rating: ${context.stressRating}/10`);
      if (context.topDistraction) parts.push(`Top Interruption: ${context.topDistraction}`);
      if (context.habitsCount !== undefined) {
        parts.push(`Habits: ${context.completedHabits || 0}/${context.habitsCount} completed today`);
      }
      if (context.isHighStressState) parts.push('Stress State: Elevated/High Cognitive Load');
      if (parts.length > 0) {
        contextSummary = parts.join(' | ');
      }
    }

    // Construct System Instruction for Reset Digital Coach
    const systemPrompt = `You are Reset Coach, a compassionate, scientifically-grounded digital well-being and habit coach built into the Breathly/Reset platform.
Your mission is to help users overcome procrastination, cognitive overload, study friction, and burnout.

User Context:
${contextSummary}

Guidelines:
1. Be warm, empathetic, clear, and concise (keep responses to 2-4 short sentences; do not write long essays).
2. Ground your advice in gentle behavioral neuroscience (e.g. lowering friction, taking 2-minute micro-steps, protecting sleep, taking non-screen rhythm breaks).
3. If the user feels exhausted or overwhelmed, recommend scaling down habits to 2-minute "Minimum Mode" or taking a relaxing "Bubble Rhythm" break.
4. If the user is struggling with focus, suggest a dedicated 25-minute Pomodoro study block.
5. Do NOT give medical or clinical diagnoses. Keep it practical, supportive, and actionable.`;

    const requestPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nUser Question/Message: "${message.trim()}"` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 350,
        topP: 0.9
      }
    };

    // Attempt model call: start with gemini-1.5-flash, fallback to gemini-2.0-flash if needed
    const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash'];
    let geminiResponse = null;
    let selectedModel = modelsToTry[0];

    for (const model of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });

        if (response.ok) {
          geminiResponse = await response.json();
          selectedModel = model;
          break;
        } else {
          const errBody = await response.text();
          console.warn(`[Gemini Coach] ${model} returned status ${response.status}:`, errBody.substring(0, 150));
        }
      } catch (networkErr) {
        console.warn(`[Gemini Coach] Network error calling ${model}:`, networkErr.message);
      }
    }

    if (!geminiResponse || !geminiResponse.candidates || !geminiResponse.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('No candidate returned from Gemini models');
    }

    const replyText = geminiResponse.candidates[0].content.parts[0].text.trim();

    // Determine if an action button should accompany the reply
    let actionType = null;
    const lowerReply = (replyText + ' ' + message).toLowerCase();
    if (lowerReply.includes('bubble rhythm') || lowerReply.includes('bubble break') || lowerReply.includes('pop bubble')) {
      actionType = 'play-bubble-rhythm';
    } else if (lowerReply.includes('pomodoro') || lowerReply.includes('focus block') || lowerReply.includes('focus sprint') || lowerReply.includes('25-minute')) {
      actionType = 'start-focus-sprint';
    } else if (lowerReply.includes('minimum mode') || lowerReply.includes('micro-dose') || lowerReply.includes('micro step')) {
      actionType = 'min-mode-all';
    } else if (lowerReply.includes('box breathing') || lowerReply.includes('breathing reset') || lowerReply.includes('4-7-8')) {
      actionType = 'quick-reset';
    } else if (lowerReply.includes('distraction radar') || lowerReply.includes('interruption')) {
      actionType = 'open-radar';
    }

    return res.json({
      success: true,
      reply: replyText,
      actionType,
      model: selectedModel
    });

  } catch (error) {
    console.error('[Gemini Coach Error]:', error.message);
    // Return friendly, compassionate guidance without leaking stack trace or server internals
    return res.json({
      success: false,
      reply: "I hear you. When things feel heavy, even a small 2-minute pause can help reset your working memory. Would you like to take a gentle Bubble Rhythm break or switch today's habits to Minimum Mode?",
      actionType: 'play-bubble-rhythm'
    });
  }
};
