import sys
import json
import re
import math

def calculate_readability(text):
    """
    Flesch-Kincaid Reading Ease formula.
    206.835 - 1.015*(total words / total sentences) - 84.6*(total syllables / total words)
    """
    words = re.findall(r'\b\w+\b', text)
    sentences = re.split(r'[.!?]+', text)
    sentences = [s for s in sentences if s.strip()]
    
    total_words = max(1, len(words))
    total_sentences = max(1, len(sentences))
    
    # Syllable approximation
    def count_syllables(word):
        word = word.lower()
        count = len(re.findall(r'[aeiouy]{1,2}', word))
        return max(1, count)
        
    total_syllables = sum(count_syllables(w) for w in words)
    
    score = 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
    return round(max(0.0, min(100.0, score)), 1)

def extract_keywords_fallback(text, top_n=5):
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    stopwords = set(["this", "that", "with", "from", "your", "have", "more", "will", "about", "there", "what", "which", "when", "where", "them", "some", "into"])
    filtered = [w for w in words if w not in stopwords]
    
    counts = {}
    for w in filtered:
        counts[w] = counts.get(w, 0) + 1
        
    sorted_words = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    return [w[0].capitalize() for w in sorted_words[:top_n]]

def analyze_nlp(text):
    if not text:
        text = "Sample text for AI creator analytics."

    words = re.findall(r'\b\w+\b', text)
    word_count = len(words)
    readability = calculate_readability(text)
    keywords = extract_keywords_fallback(text)
    
    # Simple extractive summary (first 2 meaningful sentences)
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    summary = ". ".join(sentences[:2]) + "." if sentences else text
    
    # Sentiment calculation (VADER / rule-based fallback)
    pos_words = set(["great", "awesome", "excellent", "proven", "good", "best", "super", "viral", "success", "easy", "step", "free", "optimize"])
    neg_words = set(["bad", "slow", "hard", "error", "mistake", "costly", "expensive", "fail", "wrong"])
    
    pos_count = sum(1 for w in words if w.lower() in pos_words)
    neg_count = sum(1 for w in words if w.lower() in neg_words)
    
    total_sentiment = max(1, pos_count + neg_count)
    pos_pct = round((pos_count / total_sentiment) * 100) if pos_count else 60
    neg_pct = round((neg_count / total_sentiment) * 100) if neg_count else 10
    neu_pct = 100 - pos_pct - neg_pct
    
    sentiment_label = "Positive" if pos_pct >= 50 else ("Negative" if neg_pct >= 40 else "Neutral")
    
    # WPM estimation assuming average speech timing
    wpm = min(220, max(110, round(word_count * 1.2)))

    return {
        "analytics": {
            "summary": summary,
            "keywords": keywords,
            "sentiment": {
                "score": round((pos_pct - neg_pct) / 100, 2),
                "label": sentiment_label,
                "positive": pos_pct,
                "neutral": neu_pct,
                "negative": neg_pct
            },
            "readabilityScore": readability,
            "wpm": wpm,
            "wordCount": word_count
        }
    }

if __name__ == "__main__":
    payload = {}
    if len(sys.argv) > 1:
        try:
            payload = json.loads(sys.argv[1])
        except Exception:
            pass

    text = payload.get("text", "")
    output = analyze_nlp(text)
    print(json.dumps(output))
