from transformers import T5ForConditionalGeneration, T5Tokenizer
from fastapi import FastAPI
from pydantic import BaseModel
from flashtext import KeywordProcessor
import pke
import traceback
import torch
from nltk.tokenize import sent_tokenize
from nltk.corpus import wordnet as wn
import random
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sense2vec import Sense2Vec
from sentence_transformers import SentenceTransformer
import nltk
nltk.download('punkt')

# from similarity.normalized_levenshtein import NormalizedLevenshtein
# import spacy
# import pandas as pd


def set_seed(seed: int):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


set_seed(42)
app = FastAPI()


class QuizRequest(BaseModel):
    context: str


class QuizResponse(BaseModel):
    quiz: list


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# run these commands to download and save the models first
# question_model = T5ForConditionalGeneration.from_pretrained('ramsrigouthamg/t5_squad_v1')
# question_tokenizer = T5Tokenizer.from_pretrained('ramsrigouthamg/t5_squad_v1')
# question_model = question_model.to(device)
# summary_model = T5ForConditionalGeneration.from_pretrained('t5-base')
# summary_tokenizer = T5Tokenizer.from_pretrained('t5-base')
# sentence_transformer = SentenceTransformer('msmarco-distilbert-base-v3')
#
# question_generation_model = question_model.save_pretrained("./models/question_generation_model")
# question_tokenizer_model = question_tokenizer.save_pretrained("./models/question_generation_tokenizer")
# summarization_model = summary_model.save_pretrained("./models/summarization_model")
# summary_tokenizer_model = summary_tokenizer.save_pretrained("./models/summarization_tokenizer")
# sentence_transformer_model = sentence_transformer.save("./models/sentence_transformer_model")


# run these commands once the models have been downloaded
question_model = T5ForConditionalGeneration.from_pretrained("./models/question_generation_model")
question_tokenizer = T5Tokenizer.from_pretrained("./models/question_generation_tokenizer")
summary_model = T5ForConditionalGeneration.from_pretrained("./models/summarization_model")
summary_tokenizer = T5Tokenizer.from_pretrained("./models/summarization_tokenizer")
sentence_transformer = SentenceTransformer("./models/sentence_transformer_model")
s2v = Sense2Vec().from_disk('./models/s2v_old')
# import the models to the device for a quicker response time
sentence_transformer = sentence_transformer.to(device)
question_model = question_model.to(device)
summary_model = summary_model.to(device)


# normalized_levenshtein = NormalizedLevenshtein()


def generate_quiz(context):
    output = []
    counter = 0
    summary_text = summarizer(context, summary_model, summary_tokenizer)

    keywords = get_keywords(context, summary_text)

    for answer in keywords:

        ques = get_question(summary_text, answer, question_model, question_tokenizer)
        distractors = get_distractors(answer, ques.replace("?", ""), s2v, sentence_transformer, 40, 0.2)
        if not distractors:
            distractors = get_distractors_wordnet(answer)
        counter += 1
        mcq = {"mcq" + str(counter): {'question': ques, 'answer': answer.capitalize(),
                                      'distractors': distractors}}
        output.append(mcq)

    summary_final = {'summary': summary_text}
    keywords_final = {'keywords': keywords}
    output.append(summary_final)
    output.append(keywords_final)

    return output


def summarizer(text, summarization_model, summarization_tokenizer):
    text = text.strip().replace("\n", " ")
    text = "summarize: " + text
    # print (text)
    max_len = 512
    encoding = summarization_tokenizer.encode_plus(text, max_length=max_len, pad_to_max_length=False,
                                                   truncation=True, return_tensors="pt").to(device)

    input_ids, attention_mask = encoding["input_ids"], encoding["attention_mask"]

    outs = summarization_model.generate(input_ids=input_ids,
                                        attention_mask=attention_mask,
                                        early_stopping=True,
                                        num_beams=3,
                                        num_return_sequences=1,
                                        no_repeat_ngram_size=2,
                                        min_length=75,
                                        max_length=300)

    dec = [question_tokenizer.decode(ids, skip_special_tokens=True) for ids in outs]
    summary = dec[0]
    summary = post_process_text(summary)
    summary = summary.strip()

    return summary


def post_process_text(content):
    final = ""
    for sent in sent_tokenize(content):
        sent = sent.capitalize()
        final = final + " " + sent
    return final


def get_keywords(original_text, summary_text):
    keywords = get_nouns_multipartite(original_text)
    # print("keywords not summarized: ", keywords)
    keyword_processor = KeywordProcessor()
    for keyword in keywords:
        keyword_processor.add_keyword(keyword)

    keywords_found = keyword_processor.extract_keywords(summary_text)
    keywords_found = list(set(keywords_found))
    # print("keywords found in summarized: ", keywords_found)

    important_keywords = []
    for keyword in keywords:
        if keyword in keywords_found:
            important_keywords.append(keyword)

    # print(important_keywords)
    return important_keywords


def get_nouns_multipartite(content):
    out = []
    try:
        extractor = pke.unsupervised.MultipartiteRank()
        extractor.load_document(input=content)
        #    not contain punctuation marks or stopwords as candidates.
        pos = {'PROPN', 'NOUN'}
        extractor.candidate_selection(pos=pos)
        # 4. build the Multipartite graph and rank candidates using random walk,
        #    alpha controls the weight adjustment mechanism, see TopicRank for
        #    threshold/method parameters.
        extractor.candidate_weighting(alpha=1.1, threshold=0.75, method='average')
        key_phrases = extractor.get_n_best(n=15)

        for val in key_phrases:
            out.append(val[0])
        print("nouns_multipartite: ", out)
    except:
        out = []
        traceback.print_exc()

    return out


def get_question(context, answer, q_model, q_tokenizer):
    text = "context: {} answer: {}".format(context, answer)

    encoding = q_tokenizer.encode_plus(text, max_length=384, pad_to_max_length=False,
                                       truncation=True, return_tensors="pt").to(device)
    input_ids, attention_mask = encoding["input_ids"], encoding["attention_mask"]

    outs = q_model.generate(input_ids=input_ids,
                            attention_mask=attention_mask,
                            early_stopping=True,
                            num_beams=5,
                            num_return_sequences=1,
                            no_repeat_ngram_size=2,
                            max_length=72)

    dec = [question_tokenizer.decode(ids, skip_special_tokens=True) for ids in outs]

    question = dec[0].replace("question:", "")
    question = question.strip()
    return question


def get_distractors(word, original_sentence, sense2vec_model, sentence_model, top_n, lambda_value):
    distractors = sense2vec_get_words(word, sense2vec_model, top_n, original_sentence)
    print("distractors ", distractors)
    if len(distractors) == 0:
        return distractors
    distractors_new = [word.capitalize()]
    distractors_new.extend(distractors)

    embedding_sentence = original_sentence + " " + word.capitalize()
    keyword_embedding = sentence_model.encode([embedding_sentence])
    distractor_embeddings = sentence_model.encode(distractors_new)

    max_keywords = min(len(distractors_new), 10)
    filtered_keywords = mmr(keyword_embedding, distractor_embeddings, distractors_new, max_keywords, lambda_value)
    final = [word.capitalize()]

    for wrd in filtered_keywords:
        if wrd.lower() != word.lower():
            final.append(wrd.capitalize())
    final = final[1:]
    return final


def sense2vec_get_words(word, sense2vec_picker, top_n, question):
    output = []
    # print("word ", word)
    try:
        sense = sense2vec_picker.get_best_sense(word, senses=["NOUN", "PERSON", "PRODUCT",
                                                              "LOC", "ORG", "EVENT", "NORP",
                                                              "WORK OF ART", "FAC", "GPE", "NUM", "FACILITY"])
        most_similar = sense2vec_picker.most_similar(sense, n=top_n)
        # print (most_similar)
        output = filter_same_sense_words(sense, most_similar)
        # print("Similar ", output)
    except:
        output = []

    threshold = 0.6
    final = [word]
    checklist = question.split()
    for x in output:
        # if get_highest_similarity_score(final, x) < threshold and x not in final and x not in checklist:
        final.append(x)

    return final[1:]


def get_distractors_wordnet(word):
    distractors = []
    try:
        syn = wn.synsets(word, 'n')[0]

        word = word.lower()
        orig_word = word
        if len(word.split()) > 0:
            word = word.replace(" ", "_")
        hypernym = syn.hypernyms()
        if len(hypernym) == 0:
            return distractors
        for item in hypernym[0].hyponyms():
            name = item.lemmas()[0].name()
            # print ("name ",name, " word",orig_word)
            if name == orig_word:
                continue
            name = name.replace("_", " ")
            name = " ".join(w.capitalize() for w in name.split())
            if name is not None and name not in distractors:
                distractors.append(name)
    except:
        print("Wordnet distractors not found")
    return distractors


def filter_same_sense_words(original, wordlist):
    filtered_words = []
    base_sense = original.split('|')[1]
    # print(base_sense)
    for each_word in wordlist:
        if each_word[0].split('|')[1] == base_sense:
            filtered_words.append(each_word[0].split('|')[0].replace("_", " ").title().strip())
    return filtered_words


# def get_highest_similarity_score(wordlist, wrd):
#     score = []
#     for each in wordlist:
#         score.append(normalized_levenshtein.similarity(each.lower(), wrd.lower()))
#     return max(score)


def mmr(doc_embedding, word_embeddings, words, top_n, lambda_param):
    # Extract similarity within words, and between words and the document
    word_doc_similarity = cosine_similarity(word_embeddings, doc_embedding)
    word_similarity = cosine_similarity(word_embeddings)

    # Initialize candidates and already choose best keyword/keyphrase
    keywords_idx = [np.argmax(word_doc_similarity)]
    candidates_idx = [i for i in range(len(words)) if i != keywords_idx[0]]

    for _ in range(top_n - 1):
        # Extract similarities within candidates and
        # between candidates and selected keywords/phrases
        candidate_similarities = word_doc_similarity[candidates_idx, :]
        target_similarities = np.max(word_similarity[candidates_idx][:, keywords_idx], axis=1)

        # Calculate MMR
        mmr = (lambda_param) * candidate_similarities - (1 - lambda_param) * target_similarities.reshape(-1, 1)
        mmr_idx = candidates_idx[np.argmax(mmr)]

        # Update keywords & candidates
        keywords_idx.append(mmr_idx)
        candidates_idx.remove(mmr_idx)

    return [words[idx] for idx in keywords_idx]


@app.get('/')
def index():
    return {'message': 'Hi! I am the QUERAI api'}


@app.post("/get-quiz", response_model=QuizResponse)
def get_quiz(request: QuizRequest):
    context = request.context
    return {'quiz': generate_quiz(context)}
