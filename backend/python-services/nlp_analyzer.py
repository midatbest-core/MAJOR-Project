import sys
import json
import os
import re

# Dynamically prepend project .venv site-packages to sys.path
venv_site_packages = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.venv', 'Lib', 'site-packages'))
if os.path.exists(venv_site_packages) and venv_site_packages not in sys.path:
    sys.path.insert(0, venv_site_packages)

try:
    import textstat
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    from sklearn.feature_extraction.text import TfidfVectorizer
    import networkx as nx
    from sklearn.metrics.pairwise import cosine_similarity
    import nltk
    from nltk.corpus import stopwords
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {str(e)}. Please run pip install -r requirements.txt"}))
    sys.exit(1)

try:
    stop_words = set(stopwords.words('english'))
except LookupError:
    nltk.download('stopwords', quiet=True)
    stop_words = set(stopwords.words('english'))

def extract_keywords(text, top_n=6):
    try:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=top_n)
        X = vectorizer.fit_transform([text])
        keywords = vectorizer.get_feature_names_out()
        return [k.capitalize() for k in keywords]
    except Exception:
        # Fallback if text is too short or lacks valid words
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        filtered = [w for w in words if w not in stop_words]
        counts = {}
        for w in filtered:
            counts[w] = counts.get(w, 0) + 1
        return [w[0].capitalize() for w in sorted(counts.items(), key=lambda x: x[1], reverse=True)[:top_n]]

def textrank_summarize(text, num_sentences=2):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if len(s.split()) > 3]
    
    if len(sentences) <= num_sentences:
        return " ".join(sentences)

    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        X = vectorizer.fit_transform(sentences)
        similarity_matrix = cosine_similarity(X)
        
        nx_graph = nx.from_numpy_array(similarity_matrix)
        scores: dict = nx.pagerank(nx_graph)  # type: ignore
        
        ranked_sentences = sorted(((scores[i], s) for i, s in enumerate(sentences)), reverse=True)
        top_sentences = [s for _, s in ranked_sentences[:num_sentences]]
        
        # Preserve original order
        summary = " ".join([s for s in sentences if s in top_sentences])
        return summary
    except Exception:
        return " ".join(sentences[:num_sentences])

def analyze_nlp(text, audio_duration=None):
    if not text or len(text.strip()) == 0:
        raise ValueError("No text provided for NLP analysis")

    words = re.findall(r'\b\w+\b', text)
    word_count = len(words)
    
    readability = textstat.flesch_reading_ease(text)  # type: ignore
    grade_level = textstat.text_standard(text)  # type: ignore
    
    keywords = extract_keywords(text)
    summary = textrank_summarize(text)
    
    analyzer = SentimentIntensityAnalyzer()
    sentiment_scores = analyzer.polarity_scores(text)
    
    comp = sentiment_scores['compound']
    if comp >= 0.05:
        sentiment_label = "Positive"
    elif comp <= -0.05:
        sentiment_label = "Negative"
    else:
        sentiment_label = "Neutral"

    pos_pct = round(sentiment_scores['pos'] * 100)
    neg_pct = round(sentiment_scores['neg'] * 100)
    neu_pct = round(sentiment_scores['neu'] * 100)
    
    total = pos_pct + neg_pct + neu_pct
    if total > 0 and total != 100:
        diff = 100 - total
        neu_pct += diff

    if total == 0:
        pos_pct, neu_pct, neg_pct = 33, 34, 33

    if audio_duration and float(audio_duration) > 0:
        wpm = round((word_count / float(audio_duration)) * 60)
    else:
        wpm = 145
        
    wpm = min(250, max(80, wpm))

    sentence_count = len(re.split(r'[.!?]+', text))
    sentence_count = max(1, sentence_count)

    return {
        "analytics": {
            "summary": summary,
            "keywords": keywords,
            "sentiment": {
                "polarity": comp,
                "label": sentiment_label,
                "positive": pos_pct,
                "neutral": neu_pct,
                "negative": neg_pct
            },
            "readabilityScore": readability,
            "readabilityGrade": grade_level,
            "wordCount": word_count,
            "sentenceCount": sentence_count,
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
