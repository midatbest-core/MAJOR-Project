import sys
import json
import os
import re

# Dynamically prepend project .venv site-packages to sys.path
venv_site_packages = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.venv', 'Lib', 'site-packages'))
if os.path.exists(venv_site_packages) and venv_site_packages not in sys.path:
    sys.path.insert(0, venv_site_packages)

def calculate_readability(text):
    """
    Flesch-Kincaid Reading Ease formula.
    """
    words = re.findall(r'\b\w+\b', text)
    sentences = re.split(r'[.!?]+', text)
    sentences = [s for s in sentences if s.strip()]
    
    total_words = max(1, len(words))
    total_sentences = max(1, len(sentences))
    
    def count_syllables(word):
        word = word.lower()
        count = len(re.findall(r'[aeiouy]{1,2}', word))
        return max(1, count)
        
    total_syllables = sum(count_syllables(w) for w in words)
    
    score = 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
    return round(max(0.0, min(100.0, score)), 1)

def extract_keywords(text, top_n=6):
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    stopwords = set([
        "this", "that", "with", "from", "your", "have", "more", "will", "about", 
        "there", "what", "which", "when", "where", "them", "some", "into", "going", 
        "side", "yeah", "know", "back", "come", "came", "inside", "outside", "they",
        "their", "then", "than", "were", "been", "would", "could", "should", "just",
        "like", "also", "here", "make", "made", "does", "done", "very", "much"
    ])
    filtered = [w for w in words if w not in stopwords]
    
    counts = {}
    for w in filtered:
        counts[w] = counts.get(w, 0) + 1
        
    sorted_words = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    return [w[0].capitalize() for w in sorted_words[:top_n]]

def textrank_summarize(text, num_sentences=2):
    if not text or len(text.strip()) < 15:
        return text.strip() if text else "Transcript indexed successfully."

    clean_text = re.sub(r'\s+', ' ', text).strip()
    raw_sentences = re.split(r'(?<=[.!?])\s+', clean_text)
    sentences = []
    for s in raw_sentences:
        s_clean = s.strip()
        if len(s_clean.split()) > 35:
            sub_s = re.split(r'(?<=,)\s+|\s+(?:and|but|so|because|then)\s+', s_clean)
            sentences.extend([sub.strip() for sub in sub_s if len(sub.strip().split()) >= 4])
        elif len(s_clean.split()) >= 4:
            sentences.append(s_clean)

    if not sentences:
        return clean_text[:250] + ("..." if len(clean_text) > 250 else "")

    if len(sentences) <= num_sentences:
        res = " ".join(sentences)
        return res[0].upper() + res[1:]

    stopwords = set([
        "a", "an", "the", "and", "or", "but", "if", "because", "as", "until", "while",
        "of", "at", "by", "for", "with", "about", "against", "between", "into", "through",
        "during", "before", "after", "above", "below", "to", "from", "up", "upon", "down",
        "in", "out", "on", "off", "over", "under", "again", "further", "then", "once",
        "here", "there", "when", "where", "why", "how", "all", "any", "both", "each",
        "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
        "own", "same", "so", "than", "too", "very", "can", "will", "just", "should", "now",
        "i", "me", "my", "myself", "we", "our", "ours", "you", "your", "he", "him", "his",
        "she", "her", "it", "its", "they", "them", "their", "what", "which", "who", "whom",
        "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been",
        "being", "have", "has", "had", "having", "do", "does", "did", "doing", "would",
        "could", "going", "yeah", "know", "like"
    ])

    words = re.findall(r'\b[a-zA-Z]{3,}\b', clean_text.lower())
    freq = {}
    for w in words:
        if w not in stopwords:
            freq[w] = freq.get(w, 0) + 1

    max_freq = max(freq.values()) if freq else 1
    for w in freq:
        freq[w] = freq[w] / max_freq

    sentence_scores = []
    for idx, sent in enumerate(sentences):
        sent_words = re.findall(r'\b[a-zA-Z]{3,}\b', sent.lower())
        if not sent_words:
            continue
        score = sum(freq.get(w, 0) for w in sent_words) / (len(sent_words) ** 0.8)
        if idx == 0:
            score *= 1.3
        sentence_scores.append((score, idx, sent))

    if not sentence_scores:
        return clean_text[:250] + ("..." if len(clean_text) > 250 else "")

    sentence_scores.sort(key=lambda x: x[0], reverse=True)
    top_sentences = sentence_scores[:num_sentences]
    top_sentences.sort(key=lambda x: x[1])

    summary_text = " ".join([s[2] for s in top_sentences]).strip()
    summary_text = summary_text[0].upper() + summary_text[1:]
    if not re.search(r'[.!?]$', summary_text):
        summary_text += "."
        
    return summary_text

def analyze_nlp(text, audio_duration=None):
    if not text:
        text = "Sample text for AI creator analytics."

    words = re.findall(r'\b\w+\b', text)
    word_count = len(words)
    readability = calculate_readability(text)
    keywords = extract_keywords(text)
    summary = textrank_summarize(text)
    
    pos_lexicon = set([
        "great", "awesome", "excellent", "proven", "good", "best", "super", "viral", "success", "easy",
        "step", "free", "optimize", "help", "master", "fast", "speed", "creative", "love", "amazing",
        "power", "smart", "gain", "profit", "win", "winner", "value", "valuable", "top", "growth",
        "perfect", "beautiful", "enjoy", "happy", "rich", "effective", "ideal", "brilliant", "wonderful",
        "outstanding", "like", "favorite", "positive", "benefit", "useful", "advantage", "clear", "solve"
    ])

    neg_lexicon = set([
        "bad", "slow", "hard", "error", "mistake", "costly", "expensive", "fail", "wrong", "felony",
        "problem", "issue", "bug", "crash", "worst", "hate", "ugly", "pain", "terrible", "poor",
        "awful", "horrible", "difficult", "struggle", "loss", "danger", "harm", "risk", "disaster",
        "waste", "broken", "stop", "fake", "scam", "threat", "destroy", "annoying", "never", "no"
    ])

    negations = set(["not", "never", "no", "don't", "dont", "cannot", "cant", "isnt", "wasnt", "werent", "without"])

    pos_score = 0
    neg_score = 0
    sentiment_word_count = 0

    for i, w in enumerate(words):
        lower_w = w.lower()
        prev_w = words[i - 1].lower() if i > 0 else ""
        is_negated = prev_w in negations

        if lower_w in pos_lexicon:
            sentiment_word_count += 1
            if is_negated:
                neg_score += 1
            else:
                pos_score += 1
        elif lower_w in neg_lexicon:
            sentiment_word_count += 1
            if is_negated:
                pos_score += 1
            else:
                neg_score += 1

    if sentiment_word_count == 0:
        pos_pct = 15
        neg_pct = 15
        neu_pct = 70
        sentiment_label = "Neutral"
        polarity = 0.0
    else:
        total = pos_score + neg_score
        if pos_score > neg_score:
            pos_pct = min(90, round((pos_score / total) * 75) + 15)
            neg_pct = max(5, round((neg_score / total) * 20))
            neu_pct = max(0, 100 - pos_pct - neg_pct)
            sentiment_label = "Positive"
            polarity = round((pos_score - neg_score) / total, 2)
        elif neg_score > pos_score:
            neg_pct = min(90, round((neg_score / total) * 75) + 15)
            pos_pct = max(5, round((pos_score / total) * 20))
            neu_pct = max(0, 100 - pos_pct - neg_pct)
            sentiment_label = "Negative"
            polarity = round((pos_score - neg_score) / total, 2)
        else:
            pos_pct = 30
            neg_pct = 30
            neu_pct = 40
            sentiment_label = "Neutral"
            polarity = 0.0

    if audio_duration and float(audio_duration) > 0:
        wpm = round((word_count / float(audio_duration)) * 60)
    else:
        syllables = sum(max(1, len(re.findall(r'[aeiouy]{1,2}', w.lower()))) for w in words)
        est_seconds = max(1.0, syllables / 3.8)
        wpm = round((word_count / est_seconds) * 60)
        
    wpm = min(250, max(80, wpm))

    return {
        "analytics": {
            "summary": summary,
            "keywords": keywords,
            "sentiment": {
                "score": polarity,
                "label": sentiment_label,
                "positive": pos_pct,
                "neutral": neu_pct,
                "negative": neg_pct
            },
            "readabilityScore": readability,
            "readabilityGrade": "Easy to Understand" if readability > 60 else "Advanced Reading",
            "wordCount": word_count,
            "wpm": wpm
        }
    }

if __name__ == "__main__":
    try:
        input_data = ""
        if len(sys.argv) > 1 and sys.argv[1].strip():
            input_data = sys.argv[1]
        else:
            input_data = sys.stdin.read()

        if input_data:
            payload = json.loads(input_data)
            target_text = payload.get("text", "")
            duration = payload.get("duration", None)
            results = analyze_nlp(target_text, duration)
            print(json.dumps(results))
        else:
            print(json.dumps({"error": "No input payload received"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
