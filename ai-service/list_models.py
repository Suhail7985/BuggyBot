"""List available OpenAI models (dev utility)."""
import os

from openai import OpenAI

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not GEMINI_API_KEY and not OPENAI_API_KEY:
    raise SystemExit("Missing AI API keys")

api_key = OPENAI_API_KEY
if not api_key:
    raise SystemExit("Missing AI API keys")

client = OpenAI(api_key=api_key)
models = client.models.list()
for m in sorted(models.data, key=lambda x: x.id):
    if "gpt" in m.id or "embedding" in m.id:
        print(m.id)
