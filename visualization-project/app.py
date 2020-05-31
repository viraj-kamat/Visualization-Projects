from flask import Flask, render_template, request, redirect, Response, jsonify
import pandas as pd
import numpy as np

from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.decomposition import PCA
from sklearn.preprocessing import MinMaxScaler, StandardScaler, RobustScaler
from collections import OrderedDict
import operator
import matplotlib.pyplot as plt
from sklearn.manifold import MDS
from sklearn import metrics
from random import *
import json
from sklearn.preprocessing import MinMaxScaler,StandardScaler,RobustScaler
import pdb


class Load_data():
    dataframe = None

    def read_data(self):

        def fill_missing_dist(column_val):
            if np.isnan(column_val):
                column_val = float(randint(1, 7))
            else:
                column_val = float(column_val)
            return column_val

        dc_data = pd.read_csv("static/data/dc_crime_add_vars.zip")
        def change_offense(text) :
            text = text.lower()

            if "assault" in text :
                return "Assault"
            if "motor vehicle" in text or "auto" in text :
                return "Motor theft"
            if "other" in text :
                return "Other"
            if "sex" in text :
                return "Sex abuse"


        dc_data = pd.read_csv("static/data/dc_crime_add_vars.zip")
        dc_data = dc_data.drop(
            ['CENSUS_TRACT', 'END_DATE', 'START_DATE', 'NEIGHBORHOOD_CLUSTER', 'Unnamed: 0', 'X', 'BLOCK_GROUP', 'PSA'],
            axis=1)
        dc_data['VOTING_PRECINCT'].fillna(dc_data['VOTING_PRECINCT'].mode()[0], inplace=True)
        dc_data['DISTRICT'] = dc_data['DISTRICT'].apply(fill_missing_dist)
        dc_unemp_data = pd.read_csv("static/data/DC_unemployment.zip")
        dc_unemp_data = dc_unemp_data.loc[ dc_unemp_data['Year'] == 2017    ]
        dc_data = dc_data.loc[ dc_data['year'] == 2017    ]
        self.dataframe = dc_data.merge(dc_unemp_data, how="left", left_on=["WARD", "year"], right_on=["Ward", "Year"],
                                       validate="many_to_one")

        self.dataframe = self.dataframe.drop(columns=['Ward', 'Year'])
        self.dataframe.columns = map(str.lower, self.dataframe.columns)
        self.dataframe.columns = [x.replace(' ', '_') for x in self.dataframe.columns]
        self.dataframe["offense"] = self.dataframe['offense'].apply(lambda x :  change_offense(x))


        #print(self.dataframe.columns)
    def filter_dataframe_by_params(self, params):
        '''
        Params are dict type that filters the dataframe \
        based on certain criteria - eg time of day, etc
        '''
        dataframe = self.dataframe.copy()
        for k, v in params.items():
            dataframe = dataframe.loc[dataframe[k] == v].copy()

        return dataframe

        # hmap = {}
        # for idx,row in dc_unemp_data.iterrows() :
        #    key = str(int(row['Year'])) + str(int(row['Ward']))
        #    if key not in hmap.keys() : 
        #        hmap[key] = 0
        #    hmap[key] += 1

        # dc_data['umemp_rate'] = None
        # for idx,row in dc_data.iterrows() :
        #     key = str(row['year']) + str(row['WARD'])
        #     dc_data[idx,'unemp_rate'] = hmap[key]

    def __init__(self):
        self.read_data()


data_loader = Load_data()
app = Flask(__name__)


@app.route('/')
def index():
    global data_loader
    return render_template("index.html")


@app.route("/render_factor_charts/", methods=['GET','POST'])
def render_factor_charts():
    '''
    arguments : array of factors in POST request
    response : bar chart values of each factor
    '''
    global data_loader
    assert (request.method == 'POST')

    json_arguments = request.get_json()
    factors = json_arguments['factors']
    # factors = ['shift', 'offense']
    # assert_array_equal(factors,["month","year","hour","offense","district","method","shift","psa"])
    dataframe = data_loader.dataframe[factors]
    bar_chart_data = {}
    for factor in factors:
        unique_factor = dataframe[factor].unique()
        factor_data = {}
        for unq in unique_factor:
            factor_data[str(unq)] = len(list(dataframe.loc[dataframe[factor] == unq].values))
        bar_chart_data[str(factor)] = factor_data

    return jsonify(bar_chart_data)


@app.route('/show_me_factors/')
def show_me_factors():
    global data_loader
    '''
    Simply return names of factors used for filtering data
    '''
    return jsonify(["month", "year", "hour", "offense", "district", "method", "shift", "psa"])


@app.route('/get_unqiue_factor_values/<param>')
def get_unqiue_factor_values(param):
    global data_loader
    '''
    arguments :  A factor
    return : An array of unique values for a factor
    '''
    dataframe = data_loader.loc[:, [param]]
    return jsonify(len(dataframe[param].unique()))


@app.route('/get_barchart_data/<param>')
def get_barchart_data(param):
    global data_loader
    '''
    arguments :  A factor
    return : An array of unique values for a factor
    '''
    if data_loader.dataframe.dtypes[param] == np.object :
        dataframe = data_loader.dataframe.loc[:, [param]]
        bar_counts = dataframe[param].value_counts()

        data = []
        for k,v in bar_counts.to_dict().items() :
            data.append({ "name" :k, "count" : v })
        return jsonify(data)  
    else :
        data = { "hist_values" : str(list(data_loader.dataframe[param].values)) }
        return jsonify(data)

@app.route('/render_mds/', methods=['POST'])
def render_mds():
    global data_loader
    assert (request.method == 'POST')

    def create_stratified_sample(dataframe):
        optimal_k = 3
        kmean = KMeans(n_clusters=optimal_k)
        records = dataframe
        kmean.fit(records)
        labels = kmean.labels_
        centroids = kmean.cluster_centers_
        mydict = {}
        strat_records = {i: records.iloc[np.where(kmean.labels_ == i)[0]] for i in range(kmean.n_clusters)}
        new_dataframes = []
        total_rows = records.shape[0]
        required_rows = int(records.shape[0] * .005)
        for i in range(0, 3):
            sample_fraction = (strat_records[i].shape[0] / total_rows) * required_rows / strat_records[i].shape[0]
            fract = strat_records[i].sample(frac=sample_fraction)
            fract['cluster'] = i
            new_dataframes.append(fract)

        stratifieddata = pd.concat(new_dataframes)
        return stratifieddata

    data_loader.dataframe = data_loader.dataframe.drop(columns=['report_dat', 'block', 'optional', 'date'])
    json_arguments = request.get_json()

    for factor in list(data_loader.dataframe.columns):
        if factor in ["shift", "offense", "method", "anc", "voting_precinct", 'ew', 'ns', 'quad', 'crimetype',
                      'unemployment_rate']:
            data_loader.dataframe[factor] = pd.factorize(data_loader.dataframe[factor], sort=True)[0] + 1
            data_loader.dataframe[factor] = pd.to_numeric(data_loader.dataframe[factor])

    # print(data_loader.dataframe.shape)
    data_loader.dataframe = create_stratified_sample(data_loader.dataframe)
    # print(data_loader.dataframe.shape)

    scaler = StandardScaler(with_mean=True, with_std=True)  #
    x_train = scaler.fit_transform(data_loader.dataframe)
    matrix = metrics.pairwise_distances(data_loader.dataframe, metric='euclidean')
    mds = MDS(n_components=2, metric='precomputed')
    mds_data_transformed = mds.fit_transform(matrix).tolist()
    mds_data_transformed = pd.DataFrame(mds_data_transformed, columns=['MDS1', 'MDS2'])
    mds_data_transformed = mds_data_transformed.values.tolist()
    return jsonify(mds_data_transformed)


@app.route('/render_scatterplots/',methods=['POST'])
def render_scatterplots():
    '''
    arguments : None
    purpose : returns json data containing scatterplot coordinates
    '''
    df = data_loader.dataframe.copy()
    assert request.method == 'POST'
    json_arguments = request.get_json()
    if json_arguments['column'] != '' :
        df = df.dropna()
        df[json_arguments['column']] =  df[json_arguments['column']].apply(lambda x : x.lower().replace(" ","_"))
        json_arguments['filter'] = [ x.lower().replace(" ","_") for x in json_arguments['filter']]
        df =  df[df[json_arguments['column']].isin(json_arguments['filter'])]
    ward_data = df['ward'].tolist()
    df = df.drop(columns=['ward'])
    columns = list(df.columns)
    for col in columns :
        if df.dtypes[col] == np.object :
            df[col] = pd.factorize(df[col], sort=True)[0] + 1


    pca_values = {}
    #labels = mycardata['size'].values
    columns = df.columns[0:len(df.columns)]
    scaler =  MinMaxScaler(feature_range=[0, 1]) #StandardScaler()
    x_train = scaler.fit_transform(df)
    x_test = []
    myreducer = PCA(n_components=2)
    x_train = myreducer.fit_transform(x_train)
    principalDf = pd.DataFrame(data=x_train, columns=['PCA1', 'PCA2'])
    projection_dataset = {}

    ward_data = pd.DataFrame(data=ward_data, columns=['ward'])
    finalDf = pd.concat([principalDf, ward_data], axis=1)
    unique_labels = ward_data['ward'].unique()

    label_rows = []
    for label in unique_labels :
        temp_dataset = finalDf[finalDf['ward'] == label].sample(frac = 0.01)
        for idx,row in temp_dataset.iterrows() :
            label = str(label)
            element = { "ward" : label, "x" : row.values.tolist()[0] , "y" : row.values.tolist()[1] }
            label_rows.append(element)


    #print( projection_dataset[ list(projection_dataset.keys())[0]  ][0:10] )
    return jsonify({"charts":label_rows})





@app.route('/render_ward_stats/', methods=['GET', 'POST'])
def render_ward_stats():
    '''
    arguments : None 
    purpose : return ward stats

    '''
    global data_loader
    assert (request.method == 'POST')
    hmap = {}
    metric_list = ['shift', 'offense', 'method', 'year', 'month', 'hour']
    for ward in list(data_loader.dataframe.WARD.unique()):
        temp_map = {}
        for metric in metric_list:
            x = data_loader.dataframe[data_loader.dataframe['ward'] == ward][metric].value_counts().rename_axis(
                'unique_values').reset_index(name='counts')
            val = json.dumps(x.to_dict(orient='records'), indent=2)
            temp_map[metric] = val
        hmap[str(ward)] = temp_map
    return jsonify({'chart_data': hmap})


@app.route('/crimes_per_ward', methods=['POST'])
def crimes_per_ward():
    global data_loader
    assert request.method == 'POST'
    json_arguments = request.get_json()

    wards = [x for x in range(1,9)]
    unemp_ward = {}
    for ward in wards :
        df = data_loader.dataframe[data_loader.dataframe['ward'] ==  ward]
        unemp_ward[ward] = df.iloc[0,:].to_dict()['unemployment_rate']

    

    if json_arguments['column'] != '' :
        df = data_loader.dataframe[[json_arguments['column'],'ward']]
        df = df.dropna()
        df[json_arguments['column']] = df[json_arguments['column']].apply(lambda x : x.lower().replace(" ","_"))
        json_arguments['filter'] = [ x.lower().replace(" ","_") for x in json_arguments['filter']]
        df = df[df[json_arguments['column']].isin(json_arguments['filter'])]

        x = df

        x = x['ward'].value_counts().rename_axis('ward').reset_index(name = 'counts')
        x.sort_values(by = ['ward'],inplace=True)
        
        val = x.to_dict(orient='records')
        for idx,item in enumerate(val) :
            ward = item["ward"]
            rate = unemp_ward[ward]
            val[idx]["unemployment_rate"] = rate


        val = json.dumps(val, indent=2)
        return jsonify({'chart_data': val})
    else :
        x = data_loader.dataframe['ward'].value_counts().rename_axis('ward').reset_index(name = 'counts')
        x.sort_values(by = ['ward'],inplace=True)
        val = x.to_dict(orient='records') # 

        for idx,item in enumerate(val) :
            ward = item["ward"]
            rate = unemp_ward[ward]
            val[idx]["unemployment_rate"] = rate


        val = json.dumps(val, indent=2)
        return jsonify({'chart_data': val})


@app.route('/update_ward_stats', methods=['GET','POST'])
def update_ward_stats():
    global data_loader
    assert request.method == 'POST'
    json_arguments = request.get_json()
    factor = json_arguments['factor']
    values = list(json_arguments['values'])
    x = data_loader.dataframe[data_loader.dataframe[factor].isin(values)]
    x = x['ward'].value_counts().rename_axis('ward').reset_index(name = 'counts')
    x.sort_values(by = ['ward'], inplace=True)
    val = json.dumps(x.to_dict(orient='records'), indent =2)
    return jsonify({'chart_data': val})


@app.route('/create_heat_map', methods=['POST'])
def create_heat_map():
    global data_loader
    assert request.method == 'POST'
    json_arguments = request.get_json()
    if json_arguments['column'] != '' :
        df = data_loader.dataframe[[json_arguments['column'],'ward','xblock','yblock']]
        df = df.dropna()
        df[json_arguments['column']] = df[json_arguments['column']].apply(lambda x : x.lower().replace(" ","_"))
        json_arguments['filter'] = [ x.lower().replace(" ","_") for x in json_arguments['filter']]
        df = df[df[json_arguments['column']].isin(json_arguments['filter'])]
        temp = df
        if temp.shape[0] > 10000:
            temp = temp.sample(frac = 0.3, random_state =1 )
        elif temp.shape[0]>5000:
            temp = temp.sample(frac = 0.7, random_state= 1)
        temp = temp[["xblock","yblock"]]
        temp["coordinates"] = temp[['xblock', 'yblock']].apply(lambda x: '[{},{}]'.format(x[0], x[1]), axis=1)
        temp = temp.drop(['xblock','yblock'], axis = 1)
        temp["type"] = "Point"
        temp["coordinates"] = temp["coordinates"].apply(lambda x: eval(x))
        val = temp.to_dict(orient='records')
        x = pd.DataFrame()
        x["geometry"] = val
        x["type"] = "Feature"
        x = json.dumps(x.to_dict(orient='records'))
        return jsonify({'chart_data': x})
    else:
        temp = data_loader.dataframe
        if temp.shape[0] > 10000:
            temp = temp.sample(frac = 0.25, random_state =1 )
        elif temp.shape[0]>5000:
            temp = temp.sample(frac = 0.7, random_state= 1)
        temp = temp[["xblock","yblock"]]
        temp["coordinates"] = temp[['xblock', 'yblock']].apply(lambda x: '[{},{}]'.format(x[0], x[1]), axis=1)
        temp = temp.drop(['xblock','yblock'], axis = 1)
        temp["type"] = "Point"
        temp["coordinates"] = temp["coordinates"].apply(lambda x: eval(x))
        val = temp.to_dict(orient='records')
        x = pd.DataFrame()
        x["geometry"] = val
        x["type"] = "Feature"
        x = json.dumps(x.to_dict(orient='records'))
        return jsonify({'chart_data': x})
    # for idx,row in data_loader.dataframe.iterrows():
    #     hmap = {}
    #     hmap["type"] = "Feature"
    #     lmap = {}
    #     lmap["type"] = "Point"
    #     w_name ={}
    #     w_name["ward"] = row["ward"]
    #     coordinates = []
    #     coordinates.append(row['xblock'])
    #     coordinates.append(row['yblock'])
    #     lmap["coordinates"] = coordinates
    #     hmap["geometry"] = lmap
    #     hmap["properties"] = w_name
    #     features.append(hmap)
    # return jsonify({'chart_data': features})


if __name__ == '__main__':
    # data_loader = Load_data()
    app.run(debug=True)
