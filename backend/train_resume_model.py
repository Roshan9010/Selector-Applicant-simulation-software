import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
import pickle
import os

print("Loading Kaggle Resume dataset...")
df = pd.read_csv('data/UpdatedResumeDataSet.csv')

def clean_text(text):
    text = re.sub('http\S+\s*', ' ', text)  # remove URLs
    text = re.sub('RT|cc', ' ', text)  # remove RT and cc
    text = re.sub('#\S+', '', text)  # remove hashtags
    text = re.sub('@\S+', '  ', text)  # remove mentions
    text = re.sub('[%s]' % re.escape("""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""), ' ', text)  # remove punctuations
    text = re.sub(r'[^\x00-\x7f]',r' ', text) 
    text = re.sub('\s+', ' ', text)  # remove extra whitespace
    return text.lower()

print("Cleaning raw resume text...")
df['Cleaned_Resume'] = df['Resume'].apply(lambda x: clean_text(x))

print("Vectorizing (TF-IDF)...")
tfidf = TfidfVectorizer(stop_words='english', max_features=1500)
tfidf.fit(df['Cleaned_Resume'])

# Fit a simple NearestNeighbors model to find the most similar category to an uploaded resume
matrix = tfidf.transform(df['Cleaned_Resume'])
nn = NearestNeighbors(n_neighbors=3, metric='cosine')
nn.fit(matrix)

print("Saving models to /data...")
with open('data/tfidf.pkl', 'wb') as f:
    pickle.dump(tfidf, f)
with open('data/nn_model.pkl', 'wb') as f:
    pickle.dump(nn, f)
df[['Category', 'Cleaned_Resume']].to_pickle('data/resumes_df.pkl')

print("Training script finished successfully!")
