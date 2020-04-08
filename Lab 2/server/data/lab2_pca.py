import csv
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.decomposition import PCA
from sklearn.preprocessing import MinMaxScaler,StandardScaler

import sys


from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
records = pd.read_csv("car_data_final.csv")


sse = []
columns = ['manufacturer','transmission','fuel_type','wheels','style','model','year','market_category','size']
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
      
    # calculates squared error 
    # for the clustered points 
    sse.append(KM.inertia_)      
  
# plot the cost against K values 
plt.plot(range(1, 11), sse, color ='g', linewidth ='3') 
plt.xlabel("Value of K") 
plt.ylabel("Sqaured Error (Cost)") 
plt.show() # clear the plot 

'''
file_handle = open("stratified_sample_cars_2.csv","r")
dataset = pd.read_csv(file_handle)



#TESTCODE#
scaler = MinMaxScaler(feature_range=[0, 1]) 
transform_data = scaler.fit_transform(dataset)
myreducer = PCA().fit(transform_data)
plt.figure()
plt.plot(np.cumsum(myreducer.explained_variance_ratio_)) #We need the cumulative sum for each component #How to use SSE for each n_clusters
plt.xlabel('Number of Components')
plt.ylabel('Variance per component increase')
plt.show()
#TESTCODE#


filenames = ['car_data_complete.csv','stratified_sample_cars_2.csv','random_sample_cars.csv']
significance = {}
for filename in filenames :
    file_handle2 = open(filename,'r')
    mycardata = pd.read_csv(file_handle2)
    features = mycardata.drop('size',1)
    labels = mycardata['size']
    
    columns = list(mycardata.columns[1:len(mycardata.columns)].values) 

    x_train, x_test, y_train, y_test = train_test_split(features,labels,test_size=0.25) 
    scaler =  MinMaxScaler(feature_range=[0, 1]) #StandardScaler()
    x_train = scaler.fit_transform(x_train)
    x_test = scaler.transform(x_test)
    myreducer = PCA()
    x_train = myreducer.fit_transform(x_train)
    x_test = myreducer.transform(x_test)
    #print( "\n".join( str(x) for x in myreducer.explained_variance_ratio_)  )


    x = [i for i in range(1,len(myreducer.explained_variance_ratio_)+1) ]
    y = [ x/np.sum(myreducer.explained_variance_ratio_)*100 for x in myreducer.explained_variance_ratio_ ]

    plt.bar(x,y,color='blue')
    plt.xlabel('Principle component')
    plt.ylabel('Variance in percent')
    plt.title(filename)
    #plt.show()
    
    attrdict = {}
    for attr in range(0,len(columns)) :
        attrdict["column"+str(attr)] = { "PC0":0,"PC1":0,"PC2":0,"PC3":0 }
    
    count = 0
    for index,value in enumerate(myreducer.components_) :
        
        for attr in range(0,len(value)) :
            attrdict["column"+str(attr)]["PC"+str(index)] = value[attr]

        count += 1
        if count == 4 :
            break
    
    for attr in range(0,len(columns)) :
        columns_values = attrdict["column"+str(attr)]
        sum_square_loadings = pow(columns_values["PC0"],2) + pow(columns_values["PC1"],2) + pow(columns_values["PC2"],2) + pow(columns_values["PC3"],2)
        attrdict["column"+str(attr)] = sum_square_loadings
    
    
    attrdict_2 = {}
    count = 0
    for index,value in attrdict.items() :
        attrdict_2[columns[count]] = value
        count += 1
    attrdict = attrdict_2
    
    significance[filename.split('.')[0]] = attrdict
''' 


    
    