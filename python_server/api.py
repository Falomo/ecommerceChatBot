from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import time
import turicreate as tc
from sklearn.model_selection import train_test_split

import sys
sys.path.append("..")

customers = pd.read_csv('data/recommend_1.csv') 
transactions = pd.read_csv('data/trx_data.csv')
recommendations = pd.read_csv('output/option1_recommendation.csv')

user_id = 'customerId'
item_id = 'productId'
users_to_recommend = list(customers[user_id])
n_rec = 10 # number of items to recommend
n_display = 30 # to display the first few rows in an output dataset

df_output = None

print(customers.shape)
print(customers.head())

print(transactions.shape)
print(transactions.head())

app = Flask(__name__)

@app.route("/train_model", methods=['GET'])
def hello():
    transactions['products'] = transactions['products'].apply(lambda x: [int(i) for i in x.split('|')])

    data = pd.melt(transactions.set_index('customerId')['products'].apply(pd.Series).reset_index(), 
                id_vars=['customerId'],
                value_name='products') \
        .dropna().drop(['variable'], axis=1) \
        .groupby(['customerId', 'products']) \
        .agg({'products': 'count'}) \
        .rename(columns={'products': 'purchase_count'}) \
        .reset_index() \
        .rename(columns={'products': 'productId'})
    # print(data['productId'])
    data['productId'] = data['productId'].astype(np.int64)

    print(data.head())

    def create_data_dummy(data):
        data_dummy = data.copy()
        data_dummy['purchase_dummy'] = 1
        return data_dummy

    data_dummy = create_data_dummy(data)

    def normalize_data(data):
        df_matrix = pd.pivot_table(data, values='purchase_count', index='customerId', columns='productId')
        df_matrix_norm = (df_matrix-df_matrix.min())/(df_matrix.max()-df_matrix.min())
        d = df_matrix_norm.reset_index()
        d.index.names = ['scaled_purchase_freq']
        return pd.melt(d, id_vars=['customerId'], value_name='scaled_purchase_freq').dropna()

    data_norm = normalize_data(data)

    def split_data(data):
        '''
        Splits dataset into training and test set.
        
        Args:
            data (pandas.DataFrame)
            
        Returns
            train_data (tc.SFrame)
            test_data (tc.SFrame)
        '''
        train, test = train_test_split(data, test_size = .2)
        train_data = tc.SFrame(train)
        test_data = tc.SFrame(test)
        return train_data, test_data

    train_data, test_data = split_data(data)
    train_data_dummy, test_data_dummy = split_data(data_dummy)
    train_data_norm, test_data_norm = split_data(data_norm)

    
  
    def model(train_data, name, user_id, item_id, target, users_to_recommend, n_rec, n_display):
        if name == 'popularity':
            model = tc.popularity_recommender.create(train_data, 
                                                        user_id=user_id, 
                                                        item_id=item_id, 
                                                        target=target)
        elif name == 'cosine':
            model = tc.item_similarity_recommender.create(train_data, 
                                                        user_id=user_id, 
                                                        item_id=item_id, 
                                                        target=target, 
                                                        similarity_type='cosine')
        elif name == 'pearson':
            model = tc.item_similarity_recommender.create(train_data, 
                                                        user_id=user_id, 
                                                        item_id=item_id, 
                                                        target=target, 
                                                        similarity_type='pearson')
            
        recom = model.recommend(users=users_to_recommend, k=n_rec)
        recom.print_rows(n_display)
        return 
    

    users_to_recommend = list(customers[user_id])

    final_model = tc.item_similarity_recommender.create(tc.SFrame(data_dummy), 
                                                user_id=user_id, 
                                                item_id=item_id, 
                                                target='purchase_dummy', 
                                                similarity_type='cosine')

    recom = final_model.recommend(users=users_to_recommend, k=n_rec)
    recom.print_rows(n_display)




    df_rec = recom.to_dataframe()
    print(df_rec.shape)
    print(df_rec.head())

    df_rec['recommendedProducts'] = df_rec.groupby([user_id])[item_id].transform(lambda x: '|'.join(x.astype(str)))
    df_output = df_rec[['customerId', 'recommendedProducts']].drop_duplicates().sort_values('customerId').set_index('customerId')

    def create_output(model, users_to_recommend, n_rec, print_csv=True):
        recomendation = model.recommend(users=users_to_recommend, k=n_rec)
        df_rec = recomendation.to_dataframe()
        df_rec['recommendedProducts'] = df_rec.groupby([user_id])[item_id] \
            .transform(lambda x: '|'.join(x.astype(str)))
        df_output = df_rec[['customerId', 'recommendedProducts']].drop_duplicates() \
            .sort_values('customerId').set_index('customerId')
        if print_csv:
            df_output.to_csv('output/option1_recommendation.csv')
            print("An output file can be found in 'output' folder with name 'option1_recommendation.csv'")
        return df_output


    df_output = create_output(final_model, users_to_recommend, n_rec, print_csv=True)
    print(df_output.shape)
    df_output.head()


    return "Training complete"

@app.route("/recommend/<int:num>", methods=['GET'])
def recommendItem(num):

    print(recommendations.index)
    def customer_recomendation(customer_id):
        if customer_id not in recommendations.index:
            print('Customer not found.')
            return customer_id
        return recommendations.loc[customer_id]

    print(customer_recomendation(num))
    return "hello" 

if __name__ == '__main__':
    app.run(debug=True)

