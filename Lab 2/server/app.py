import json

from flask import Flask, render_template, request, redirect, Response, jsonify
import pandas as pd
import numpy as np

from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.decomposition import PCA
from sklearn.preprocessing import MinMaxScaler,StandardScaler,RobustScaler
from collections import OrderedDict
import operator
import matplotlib.pyplot as plt
from sklearn.manifold import MDS
from sklearn import metrics

class LoadData :
    data = {"randomizeddata":None,"stratifieddata":None,"completedata":None}
    def __init__(self) :
        self.main_data = pd.read_csv("data/car_data_final.csv")
        self.load_data()
        self.create_random_sample()
        self.create_stratified_sample()
        
        
    def load_data(self) :        
        columns = ['manufacturer','transmission','fuel_type','wheels','style','model','year','market_category','size']
        self.size_mapping = None
        for column in columns :
            if column == 'size' :
                self.main_data[column],self.size_mapping = pd.factorize(self.main_data[column], sort=True)
                self.main_data[column] = pd.to_numeric(self.main_data[column])
            else :
                self.main_data[column] = pd.factorize(self.main_data[column], sort=True)[0] + 1
                self.main_data[column] = pd.to_numeric(self.main_data[column])
        self.data['completedata'] = self.main_data

        all_columns = ['manufacturer', 'transmission', 'fuel_type', 'cylinders', 'msrp', 'style', 'model', 'year', 'horsepower',  'size', 'highwaympg','citympg', 'popularity']

        self.data['completedata'] = self.data['completedata'].loc[:,all_columns]

    def create_random_sample(self):
        sampled_records = self.data['completedata'].sample(frac=.3)
        self.data['randomizeddata'] = sampled_records
    
    
    def create_stratified_sample(self) :
        optimal_k = 3
        kmean  = KMeans(n_clusters=optimal_k)
        records = self.data['completedata']
        kmean.fit(records)
        labels = kmean.labels_
        centroids = kmean.cluster_centers_
        mydict = {}
        strat_records = {i: records.iloc[np.where(kmean.labels_ == i)[0]] for i in range(kmean.n_clusters)}
        new_dataframes = []
        total_rows = records.shape[0]
        required_rows = int(records.shape[0]*.3)
        for i in range(0,3) :
            sample_fraction  = (strat_records[i].shape[0]/total_rows)*required_rows/strat_records[i].shape[0]
            fract = strat_records[i].sample(frac=sample_fraction)
            fract['cluster'] = i
            new_dataframes.append(fract)

        stratifieddata = pd.concat(new_dataframes)
        self.data['stratifieddata'] =  stratifieddata
    
    def reduce_data(self,dataframe_mod,n_components=False) :
        mycardata = dataframe_mod
        features = mycardata
        #labels = mycardata['size'].values
        columns = features.columns[0:len(mycardata.columns)]
        scaler =  MinMaxScaler(feature_range=[0, 1]) #StandardScaler()
        x_train = scaler.fit_transform(features)
        x_test = []
        if n_components != False :
            myreducer = PCA(n_components=n_components)
        else :
            myreducer = PCA()
        x_train = myreducer.fit_transform(x_train)
        return myreducer,x_train,columns

def fetch_top_three_attr(datatype=None) :
    global data_loader
    significance = {}
    for index, dataframe in data_loader.data.items():
        if index == 'stratifieddata':
            dataframe = dataframe.drop(columns=['cluster'])
        else:
            dataframe = dataframe.drop(columns=['size'])
        myreducer, x_train, columns = data_loader.reduce_data(dataframe, 4)
        attrdict = {}
        for attr in range(0, len(columns)):
            attrdict["column" + str(attr)] = {"PC0": 0, "PC1": 0, "PC2": 0, "PC3": 0}

        count = 0

        loadings = myreducer.components_.T  # * np.sqrt(myreducer.explained_variance_)
        loadings = pd.DataFrame(loadings, columns=['PC1', 'PC2', 'PC3', 'PC4'])
        loadings = np.sum(np.square(loadings), axis=1)

        tempattrdict = {}
        for i, row in loadings.iteritems():
            tempattrdict["column" + str(i)] = row
        attrdict = tempattrdict

        '''
        for pcindex,value in enumerate(myreducer.components_) :

            for attr in range(0,len(value)) :
                attrdict["column"+str(attr)]["PC"+str(pcindex)] = value[attr]

            count += 1
            if count == 4 :
                break

        for attr in range(0,len(columns)) :
            columns_values = attrdict["column"+str(attr)]
            sum_square_loadings = pow(columns_values["PC0"],2) + pow(columns_values["PC1"],2) + pow(columns_values["PC2"],2) + pow(columns_values["PC3"],2)
            attrdict["column"+str(attr)] = sum_square_loadings
        '''

        attrdict = dict(sorted(attrdict.items(), key=operator.itemgetter(1), reverse=True))
        attrdict_2 = []
        count = 0
        for col, value in attrdict.items():
            loc = int(col.replace("column", ""))
            attrdict_2.append({"x": columns[loc], "y": value})
            count += 1
        attrdict = attrdict_2

        significance[index] = attrdict
    if datatype != None :
        significance = significance[datatype]
    return significance



#First of all you have to import it from the flask module:

app = Flask(__name__)
@app.route("/", methods = ['POST', 'GET'])
def index():
    global data_loader
    if request.method == 'GET' :
        return render_template("index.html")

@app.route("/elbow_curve",methods=["POST","GET"])    
def fetch_kmeans_elbow() :
    
    global data_loader
    records = data_loader.data['completedata']
    sse = []
    columns = ['manufacturer','transmission','fuel_type','style','model','year','size']
    for column in columns :
        if column == 'size' :
            records[column] = pd.factorize(records[column], sort=True)[0]
            records[column] = pd.to_numeric(records[column])
        else :
            records[column] = pd.factorize(records[column], sort=True)[0] + 1
            records[column] = pd.to_numeric(records[column])

    for i in range(1, 11): 
        KM = KMeans(n_clusters = i, max_iter = 500) 
        KM.fit(records) 
        sse.append({"x":i,"y":KM.inertia_})   
    
    
    return jsonify(sse)
    
@app.route("/scree_plot/<plot_type>",methods=["POST","GET"])
def produce_plot(plot_type) :
    global data_loader
    scree_plot_data = {}
    for index,dataframe in data_loader.data.items() :
        if index == 'stratifieddata' :
            dataframe = dataframe.drop(columns=['cluster'])
        else :
            dataframe = dataframe.drop(columns=['size'])
        myreducer,x_train,columns = data_loader.reduce_data(dataframe)
        x = [i for i in range(1,len(myreducer.explained_variance_ratio_)+1) ]
        y = [ x/np.sum(myreducer.explained_variance_ratio_)*100 for x in myreducer.explained_variance_ratio_ ]
        xy = []
        for j in range(0,len(x)) :
            xy.append({"x":"PC "+str(x[j]),"y":y[j]})
        scree_plot_data[index] = xy
    return jsonify(scree_plot_data)

@app.route("/pca_loadings/<data_type>",methods=["POST","GET"])
def produce_loadings(data_type) :
    return jsonify(fetch_top_three_attr())


        
        

    
from sklearn import metrics
def scatterplot(x,y,name) :
    plt.scatter(x,y)
    plt.savefig(name)
    
@app.route("/scatter_plots/<task_type>/<data_type>/<distance_metric>",methods=["POST","GET"])    
def produce_scatterplots(data_type,task_type,distance_metric) :
    global data_loader
    pca_values = {}
    



    if task_type == "top_two_pca" :
        count = 0
        pca_values = {}
        for index,dataframe in data_loader.data.items() :
            

            if index != data_type :
                continue

            if index == 'stratifieddata':
                clusters = dataframe['cluster'].values.tolist()
                dataframe = dataframe.drop(columns=['cluster'])

            myreducer,x_train,columns = data_loader.reduce_data(dataframe,2)
            principalDf = pd.DataFrame(data=x_train, columns=['PCA1', 'PCA2'])
            projection_dataset = {}

            if index in ["completedata","randomizeddata"] :
                labels = pd.DataFrame(dataframe['size'], columns=['size'])
                labels = pd.DataFrame(data_loader.size_mapping.take(labels), columns=['size'])
                finalDf = pd.concat([principalDf, labels], axis=1)
                unique_labels = labels['size'].unique()

                for label in unique_labels :
                    temp_dataset = finalDf[finalDf['size'] == label]
                    label_rows = []
                    for idx,row in temp_dataset.iterrows() :
                        label_rows.append(row.values.tolist())
                    projection_dataset[label] = label_rows
            else :
                clusters = pd.DataFrame(clusters, columns=['cluster'])
                finalDf = pd.concat([principalDf, clusters], axis=1)
                for cluster in range(0,4) :
                    temp_dataset = finalDf[finalDf['cluster']==cluster] #.drop(columns=['cluster'])
                    label_rows = []
                    for idx,row in temp_dataset.iterrows() :
                        label_rows.append(row.values.tolist())
                    projection_dataset["Cluster_"+str(cluster)] = label_rows
                


            count += 1
            pca_values[index] = projection_dataset
        #print(pca_values[data_type])
        return jsonify(pca_values[data_type])
    elif task_type == "top_three_attr" :
        significance = fetch_top_three_attr(data_type)
        top_three = [ row['x']  for row in significance  ][0:3]
        dataframe = data_loader.data[data_type].loc[:,top_three]

        scaler =  RobustScaler()
        x_train = scaler.fit_transform(dataframe)
        dataframe = pd.DataFrame(x_train,columns=top_three)
        plot_matrix = {
        }
        plot_matrix = []
        for idx,row in dataframe.iterrows() :
            plot_matrix.append(row.to_json())
        
        return jsonify(plot_matrix)


    elif task_type == "mds_plots" :
        count = 0
        mds_data = {
            "randomizeddata" : {
                "euclidean" : [],
                "correlation" : []
            },
            "stratifieddata": {
                "euclidean": [],
                "correlation": []
            },
            "completedata": {
                "euclidean": [],
                "correlation": []
            }
        }
        for index,dataframe in data_loader.data.items() :
            if index == data_type :
                count += 1

                labels = None
                clusters = None
                if data_type in ['randomizeddata','completedata'] :
                    labels = pd.DataFrame(dataframe['size'],columns=['size'])
                    labels = pd.DataFrame(data_loader.size_mapping.take(labels), columns=['size'])
                    dataframe = dataframe.drop(columns=['size'])
                else :
                    clusters = pd.DataFrame(dataframe['cluster'].values.tolist(),columns=['cluster'])
                    dataframe = dataframe.drop(columns=['size','cluster'])

                scaler = StandardScaler(with_mean=True,with_std=True) #
                x_train = scaler.fit_transform(dataframe)
                dataframe = pd.DataFrame(x_train,columns=dataframe.columns)
                for distance in [distance_metric] : #
                    matrix = metrics.pairwise_distances(dataframe,metric=distance)
                    mds = MDS(n_components=2,metric='precomputed')
                    mds_data_transformed = mds.fit_transform(matrix).tolist()
                    mds_data_transformed = pd.DataFrame(mds_data_transformed, columns=['MDS1', 'MDS2'])


                    if data_type in ['completedata','randomizeddata'] :
                        finalDf = pd.concat([mds_data_transformed, labels], axis=1)
                    else :
                        finalDf = pd.concat([mds_data_transformed, clusters], axis=1)

                    mds_data[index][distance] = finalDf.values.tolist()



        #print(mds_data[data_type])
        return jsonify(mds_data[data_type])
    
    
    
    

    
    

if __name__ == "__main__":
    data_loader = LoadData()
    app.run(debug=True)
    
    
    
    
