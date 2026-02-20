import { AuthToken, GoogleGenAI } from "@google/genai";

const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function GET() {
  const expireTime = new Date(
    Date.now() + 30 * 60 * 1000,
  ).toISOString();

  const token: AuthToken =
    await geminiClient.authTokens.create({
      config: {
        uses: 1, // The default
        expireTime: expireTime, // Default is 30 mins
        newSessionExpireTime: new Date(
          Date.now() + 1 * 60 * 1000,
        ).toISOString(), // Default 1 minute in the future
        httpOptions: { apiVersion: "v1alpha" },
      },
    });

  return Response.json({ token });
}
