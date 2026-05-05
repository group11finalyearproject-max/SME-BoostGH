from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from openai import AsyncOpenAI
from firebase_auth import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])

# -------------------------------------------------------------------
# Singleton OpenAI client — created once, reused on every request.
# Avoids the overhead of re-initialising httpx on every call.
# -------------------------------------------------------------------
_openai_client: Optional[AsyncOpenAI] = None

def get_openai_client() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="OpenAI API key is not configured. Set OPENAI_API_KEY in your .env file."
            )
        _openai_client = AsyncOpenAI(api_key=api_key)
    return _openai_client


# -------------------------------------------------------------------
# /ai/generate — Business plan, marketing copy, email drafts, etc.
# -------------------------------------------------------------------
class GenerateRequest(BaseModel):
    type: str
    context: dict

@router.post("/generate")
async def generate_content(
    req: GenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    system_prompt = "You are a helpful AI business assistant for SME Boost Ghana."

    if req.type == "business_plan":
        prompt = f"Generate a concise business plan draft based on this context: {req.context}"
    elif req.type == "marketing":
        prompt = f"Generate marketing content based on this context: {req.context}"
    elif req.type == "email":
        prompt = f"Draft a professional email based on this context: {req.context}"
    else:
        prompt = f"Generate content for type '{req.type}' based on context: {req.context}"

    try:
        client = get_openai_client()
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=1000,
        )
        return {"content": response.choices[0].message.content}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------------------------
# /ai/chat — Conversational AI with optional business metrics context
# -------------------------------------------------------------------
class ChatRequest(BaseModel):
    messages: list[dict]
    business_metrics: Optional[Dict[str, Any]] = None

@router.post("/chat")
async def chat_with_ai(
    req: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        system_content = (
            "You are a highly capable AI Sales Assistant and business mentor for SME Boost Ghana. "
            "Provide professional, actionable, and concise advice tailored for small and medium enterprises. "
            "Do not hallucinate data."
        )

        # Ground the assistant with real business data if provided
        if req.business_metrics:
            m = req.business_metrics
            system_content += (
                f"\n\nBUSINESS CONTEXT:"
                f"\n- Registered customers: {m.get('total_customers', 0)}"
                f"\n- Total invoices raised: {m.get('total_invoices', 0)}"
                f"\n- Overdue invoices: {m.get('overdue_invoices', 0)} "
                f"totalling GH₵ {m.get('overdue_amount', 0):.2f}"
                f"\n- Revenue from paid invoices: GH₵ {m.get('revenue', 0):.2f}"
                f"\n\nBase all specific references on these statistics only. "
                f"If asked for details outside this context, state that you only have aggregate summaries."
            )

        messages = [{"role": "system", "content": system_content}]
        messages.extend(req.messages)

        client = get_openai_client()
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )
        return {
            "content": response.choices[0].message.content,
            "metrics_used": req.business_metrics,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))