import os
from typing import AsyncGenerator, List, Dict, Any
import google.generativeai as genai


_model = None


def get_llm():
    """Get Gemini LLM model (singleton)."""
    global _model
    if _model is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                top_p=0.9,
                top_k=40,
                max_output_tokens=2048,
            ),
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ],
        )
    return _model


async def generate_streaming_response(prompt: str) -> AsyncGenerator[str, None]:
    """Generate a streaming response from Gemini."""
    model = get_llm()
    response = await model.generate_content_async(prompt, stream=True)

    async for chunk in response:
        if chunk.text:
            yield chunk.text


async def generate_response(prompt: str) -> str:
    """Generate a non-streaming response from Gemini."""
    model = get_llm()
    response = await model.generate_content_async(prompt)
    return response.text
