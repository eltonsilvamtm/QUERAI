Docker base image and installation details: https://github.com/tiangolo/uvicorn-gunicorn-fastapi-docker


1. Build create image and run docker locally:
1.1 open cmd as administrator and go to the folder where the application is

#the dot means to run on the current folder
docker build -t querai .

docker run --name querai -p 80:80 querai

2. Postman Instructions:

http://localhost/get-quiz

{
"context": "Elon Reeve Musk, born in June 28 1971, is an entrepreneur, investor, and business magnate. He is the founder, CEO, and chief engineer at SpaceX; early-stage investor, CEO, and product architect of Tesla, Inc.; founder of The Boring Company; and co-founder of Neuralink and OpenAI. With an estimated net worth of around US$273 billion as of April 2022,[4] Musk is the wealthiest person in the world according to both the Bloomberg Billionaires Index and the Forbes real-time billionaires list. Musk was born to a Canadian mother and South African father, and raised in Pretoria, South Africa. He briefly attended the University of Pretoria before moving to Canada at age 17 to avoid conscription. He was enrolled at Queen's University and transferred to the University of Pennsylvania two years later, where he received a bachelor's degree in economics and physics. He moved to California in 1995 to attend Stanford University but decided instead to pursue a business career, co-founding the web software company Zip2 with his brother Kimbal. The startup was acquired by Compaq for $307 million in 1999. The same year, Musk co-founded online bank X.com, which merged with Confinity in 2000 to form PayPal. The company was bought by eBay in 2002 for $1.5 billion. In 2002, Musk founded SpaceX, an aerospace manufacturer and space transport services company, of which he is CEO and chief engineer. In 2004, he joined electric vehicle manufacturer Tesla Motors, Inc. (now Tesla, Inc.) as chairman and product architect, becoming its CEO in 2008. In 2006, he helped create SolarCity, a solar energy services company that was later acquired by Tesla and became Tesla Energy. In 2015, he co-founded OpenAI, a nonprofit research company that promotes friendly artificial intelligence. In 2016, he co-founded Neuralink, a neurotechnology company focused on developing brain–computer interfaces, and founded The Boring Company, a tunnel construction company. Musk has proposed the Hyperloop, a high-speed vactrain transportation system. Musk has been criticized for unorthodox and unscientific stances and highly publicized controversial statements. In 2018, he was sued by the U.S. Securities and Exchange Commission (SEC) for falsely tweeting that he had secured funding for a private takeover of Tesla. He settled with the SEC, temporarily stepping down from his chairmanship and agreeing to limitations on his Twitter usage. In 2019, he won a defamation trial brought against him by a British caver who advised in the Tham Luang cave rescue. Musk has also been criticized for spreading misinformation about the COVID-19 pandemic and for his other views on such matters as artificial intelligence, cryptocurrency, and public transport."
}


3. Google cloud Run: Push docker to Google container registry

3.1 Create a project on gcloud console.
3.2 Enable Container registry on the project

3.3 Install Gcloud SDK from https://cloud.google.com/sdk/docs/quickstart

3.4 run: gcloud init

docker build . --tag gcr.io/querai/querai:latest

https://cloud.google.com/container-registry/docs/advanced-authentication
gcloud auth configure-docker

docker push gcr.io/querai/querai:latest

4. Deploy API using Google Cloud Run

gcloud init  ---> Choose re-initialize this configuration [default] with new settings --> Pick correct cloud project to use.


Parameters: https://cloud.google.com/sdk/gcloud/reference/run/deploy

gcloud run deploy --image gcr.io/querai/querai:latest --cpu 2 --concurrency 1 --memory 8Gi --platform managed --min-instances 0 --timeout 1m --port 80

to check which region is the closest to you:
https://cloud.google.com/about/locations/

5. Postman Instructions:

https://querai-dv6ggvjzva-nw.a.run.app/get-quiz

{
"context": "Elon Reeve Musk, born in June 28 1971, is an entrepreneur, investor, and business magnate. He is the founder, CEO, and chief engineer at SpaceX; early-stage investor, CEO, and product architect of Tesla, Inc.; founder of The Boring Company; and co-founder of Neuralink and OpenAI. With an estimated net worth of around US$273 billion as of April 2022,[4] Musk is the wealthiest person in the world according to both the Bloomberg Billionaires Index and the Forbes real-time billionaires list. Musk was born to a Canadian mother and South African father, and raised in Pretoria, South Africa. He briefly attended the University of Pretoria before moving to Canada at age 17 to avoid conscription. He was enrolled at Queen's University and transferred to the University of Pennsylvania two years later, where he received a bachelor's degree in economics and physics. He moved to California in 1995 to attend Stanford University but decided instead to pursue a business career, co-founding the web software company Zip2 with his brother Kimbal. The startup was acquired by Compaq for $307 million in 1999. The same year, Musk co-founded online bank X.com, which merged with Confinity in 2000 to form PayPal. The company was bought by eBay in 2002 for $1.5 billion. In 2002, Musk founded SpaceX, an aerospace manufacturer and space transport services company, of which he is CEO and chief engineer. In 2004, he joined electric vehicle manufacturer Tesla Motors, Inc. (now Tesla, Inc.) as chairman and product architect, becoming its CEO in 2008. In 2006, he helped create SolarCity, a solar energy services company that was later acquired by Tesla and became Tesla Energy. In 2015, he co-founded OpenAI, a nonprofit research company that promotes friendly artificial intelligence. In 2016, he co-founded Neuralink, a neurotechnology company focused on developing brain–computer interfaces, and founded The Boring Company, a tunnel construction company. Musk has proposed the Hyperloop, a high-speed vactrain transportation system. Musk has been criticized for unorthodox and unscientific stances and highly publicized controversial statements. In 2018, he was sued by the U.S. Securities and Exchange Commission (SEC) for falsely tweeting that he had secured funding for a private takeover of Tesla. He settled with the SEC, temporarily stepping down from his chairmanship and agreeing to limitations on his Twitter usage. In 2019, he won a defamation trial brought against him by a British caver who advised in the Tham Luang cave rescue. Musk has also been criticized for spreading misinformation about the COVID-19 pandemic and for his other views on such matters as artificial intelligence, cryptocurrency, and public transport."
}