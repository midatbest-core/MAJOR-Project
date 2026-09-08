import sys
import json

def run_llm_task(task_type, prompt_data):
    """
    Python fallback/router for Generative AI tasks.
    Used if Node.js service passes requests to Python.
    """
    topic = prompt_data.get("topic", "AI Tools")
    niche = prompt_data.get("niche", "Tech")
    
    if task_type == "titles":
        return {
            "titles": [
                f"How to Master {topic} in 2026 (Zero API Cost)",
                f"The Ultimate {niche} Guide: {topic} Secrets Exposed",
                f"Why Everyone is Switching to Local AI for {topic}",
                f"5 Game-Changing {topic} Tips Every Creator Needs",
                f"Building a $0 Cost AI Workflow ({topic} Demo)"
            ]
        }
    elif task_type == "description":
        return {
            "description": f"In this video, we explore {topic} in the {niche} space.\n\n📌 Timestamps:\n00:00 - Intro\n02:15 - Key Concepts\n06:40 - Step by Step Demo\n\n#AI #{niche.replace(' ', '')} #{topic.replace(' ', '')}"
        }
    elif task_type == "hashtags":
        return {
            "hashtags": [f"#{topic.replace(' ', '')}", f"#{niche.replace(' ', '')}", "#ContentCreator", "#TechTutorial", "#Automation"]
        }
    else:
        return {"result": f"Generated output for {topic}"}

if __name__ == "__main__":
    payload = {}
    if len(sys.argv) > 1:
        try:
            payload = json.loads(sys.argv[1])
        except Exception:
            pass

    task_type = payload.get("taskType", "titles")
    output = run_llm_task(task_type, payload)
    print(json.dumps(output))
