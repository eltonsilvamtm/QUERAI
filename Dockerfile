FROM tiangolo/uvicorn-gunicorn:python3.8-slim

COPY ./app /app
ENV MAX_WORKERS="2"
ENV WEB_CONCURRENCY="1"
RUN pip install --no-cache-dir -r /app/requirements.txt
RUN python -m spacy download en_core_web_sm
RUN apt-get -y update
RUN apt-get -y install git
RUN pip install git+https://github.com/boudinfl/pke.git
RUN python -m nltk.downloader punkt
RUN python -m nltk.downloader averaged_perceptron_tagger
RUN python -m nltk.downloader wordnet

