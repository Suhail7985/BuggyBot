import os
from typing import AsyncGenerator, List, Dict

from services.config import get_llm_provider, require_provider


_client = None
_gemini_model = None


def get_model_name() -> str:
    if get_llm_provider() == "openai":
        return os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    return os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def _temperature() -> float:
    return float(os.getenv("OPENAI_TEMPERATURE", os.getenv("GEMINI_TEMPERATURE", "0.35")))


def _max_tokens() -> int:
    return int(os.getenv("OPENAI_MAX_TOKENS", os.getenv("GEMINI_MAX_TOKENS", "2048")))


def _build_messages(system_prompt: str, user_message: str) -> List[Dict[str, str]]:
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]


def _get_openai_client():
    global _client
    if _client is None:
        from openai import AsyncOpenAI

        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key:
            raise ValueError("OPENAI_API_KEY is not set")
        _client = AsyncOpenAI(api_key=api_key)
    return _client


def _get_gemini_model():
    global _gemini_model
    if _gemini_model is None:
        import google.generativeai as genai

        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
        genai.configure(api_key=api_key)
        _gemini_model = genai.GenerativeModel(
            model_name=get_model_name(),
            generation_config=genai.GenerationConfig(
                temperature=_temperature(),
                max_output_tokens=_max_tokens(),
            ),
        )
    return _gemini_model


async def generate_streaming_response(
    system_prompt: str,
    user_message: str,
) -> AsyncGenerator[str, None]:
    """Stream tokens from OpenAI or Gemini depending on configured API key."""
    provider = require_provider()

    if provider == "openai":
        client = _get_openai_client()
        stream = await client.chat.completions.create(
            model=get_model_name(),
            messages=_build_messages(system_prompt, user_message),
            temperature=_temperature(),
            max_tokens=_max_tokens(),
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
        return

    # Gemini: combine system + user (no native system role in older API pattern)
    model = _get_gemini_model()
    combined = f"{system_prompt}\n\n---\n\n{user_message}"
    response = await model.generate_content_async(combined, stream=True)
    async for chunk in response:
        if chunk.text:
            yield chunk.text


async def generate_response(system_prompt: str, user_message: str) -> str:
    provider = require_provider()

    if provider == "openai":
        client = _get_openai_client()
        response = await client.chat.completions.create(
            model=get_model_name(),
            messages=_build_messages(system_prompt, user_message),
            temperature=_temperature(),
            max_tokens=_max_tokens(),
        )
        return response.choices[0].message.content or ""

    model = _get_gemini_model()
    combined = f"{system_prompt}\n\n---\n\n{user_message}"
    response = await model.generate_content_async(combined)
    return response.text or ""
