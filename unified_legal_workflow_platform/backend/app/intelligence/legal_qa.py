import json
from typing import List
from . import llm_client


SYSTEM_PROMPT = """You are a grounded legal knowledge assistant. Answer legal questions strictly based on the provided knowledge sources.

Rules:
1. Only use information from the provided sources — never fabricate
2. Every factual claim must cite its source
3. If sources are insufficient, clearly say so
4. Distinguish between what sources say directly vs what can be inferred
5. Flag uncertainty explicitly
6. Never provide generic legal advice not grounded in the provided documents
7. Return valid JSON only"""


class LegalKnowledgeQA:
    def answer(self, query: str, knowledge_items: List[dict], matter_context: str = "") -> dict:
        if not knowledge_items:
            return {
                "answer": "No knowledge sources are available to answer this question. Please connect knowledge repositories (SharePoint, Google Drive, or uploaded documents) to enable grounded Q&A.",
                "citations": [],
                "is_complete": False,
                "uncertainty_notes": "No knowledge sources available",
                "model_used": llm_client.active_model(),
            }

        sources_text = "\n\n".join([
            f"SOURCE [{i+1}]: {item['title']}\n"
            f"Type: {item['source_type']}\n"
            f"Content:\n{item.get('content', item.get('content_summary', ''))[:1500]}"
            for i, item in enumerate(knowledge_items[:8])
        ])

        prompt = f"""Question: {query}

{f'Matter Context: {matter_context}' if matter_context else ''}

Available Knowledge Sources:
{sources_text}

Return JSON:
{{
  "answer": "comprehensive answer citing sources as [1], [2], etc.",
  "citations": [
    {{
      "knowledge_item_id": "...",
      "title": "source title",
      "source_type": "...",
      "source_url": "...",
      "relevant_excerpt": "the most relevant passage from this source",
      "relevance_score": 0.0-1.0
    }}
  ],
  "is_complete": true/false,
  "uncertainty_notes": "what is unclear or missing from sources, or null if complete"
}}"""

        raw = llm_client.complete(SYSTEM_PROMPT, prompt, max_tokens=3000)
        raw = llm_client.strip_fences(raw)
        result = json.loads(raw)

        citations = result.get("citations", [])
        for i, citation in enumerate(citations):
            if i < len(knowledge_items):
                citation["knowledge_item_id"] = knowledge_items[i].get("id", citation.get("knowledge_item_id", ""))

        return {
            "answer": result.get("answer", ""),
            "citations": citations,
            "is_complete": result.get("is_complete", False),
            "uncertainty_notes": result.get("uncertainty_notes"),
            "model_used": llm_client.active_model(),
        }

    def find_relevant_sources(self, query: str, knowledge_items: List[dict]) -> List[dict]:
        """Keyword-based relevance ranking (no vector DB needed for v1)."""
        if not knowledge_items:
            return []

        query_words = set(query.lower().split())
        scored = []
        for item in knowledge_items:
            text = f"{item.get('title','')} {item.get('content','')} {item.get('content_summary','')} {' '.join(item.get('tags', []))}".lower()
            score = sum(1 for word in query_words if word in text)
            if score > 0:
                scored.append((score, item))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item for _, item in scored[:8]]
