"""List available OpenAI models (dev utility)."""
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise SystemExit("Set OPENAI_API_KEY in ai-service/.env")

client = OpenAI(api_key=api_key)
models = client.models.list()
for m in sorted(models.data, key=lambda x: x.id):
    if "gpt" in m.id or "embedding" in m.id:
        print(m.id)
