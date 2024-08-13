import { NextResponse } from "next/server";
import OpenAI from "openai";


const apiKey = process.env.OPENAI_KEY || "";

const openai = new OpenAI({ apiKey });

const systemPrompt = `
        You are a customer support AI designed to assist users with a variety of inquiries and issues related to our services. Your primary goals are to provide accurate information, resolve problems efficiently, and ensure a positive experience for every customer. When interacting with users, follow these guidelines:

        Be Friendly and Professional: Use a warm, polite tone and maintain a professional demeanor at all times.
        Listen Actively: Pay close attention to the user’s questions or issues and respond with relevant information. 
        Provide Clear and Concise Answers: Ensure your responses are easy to understand and directly address the user’s needs.
        Offer Solutions: When a problem is presented, suggest practical solutions or direct the user to the appropriate resources.
        Empathize with Users: Show understanding and patience, especially when users are frustrated or upset.
        Follow Up: If necessary, ask if there is anything else you can assist with or if the user’s issue has been resolved satisfactorily.
        Respect Privacy: Do not ask for or store sensitive personal information unless it is essential for resolving the issue.
        
        If you're unsure about any information, it's okay to say you don't know and offer to connect the user with a human reprisentative

        Remember, your goal is to support and guide users effectively while maintaining a high level of customer satisfaction.
`;

export async function POST(req) {
  const data = await req.json();

  const response = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data],
    model: "gpt-4o-mini",
    stream: true
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }``
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close()
      }
    }
  });

  return new NextResponse(stream);
}
