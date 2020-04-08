import csv
import pandas as pd
import numpy as np


records = pd.read_csv("car_data_final.csv")



'''
act_shape = records.shape
print("Shape of the record is {}".format(records.shape))
print("\n")

columns = ['manufacturer','transmission','fuel_type','wheels','style','model','year','market_category','size']

for column in columns :
    records[column] = pd.factorize(records[column], sort=True)[0] + 1 
    records[column] = pd.to_numeric(records[column])

records.to_csv('car_data_complete.csv')
sampled_records = records.sample(frac=.3)
sampled_records.to_csv("random_sample_cars.csv")

#Code to implement random sampling starts

req_shape = sampled_records.shape


#Code to implement stratified sampling starts
grouping_records = records.groupby(['manufacturer','year'])
unique = grouping_records.groups.keys()


groups = {}
stratified_sampled_records = pd.DataFrame()
for index,value in grouping_records.size().items() :
    key = index[0]+str(index[1])
    groups[index] = [0,value]
        
strat_records = records.groupby(['manufacturer','year']).apply(lambda x : x.sample(frac= (((len(x)/act_shape[0])*req_shape[0])/len(x))  ))  


for index,row in strat_records.iterrows() :
    group = (row['manufacturer'],row['year'])
    groups[group][0] += 1
    

for group,count in groups.items() :
    #print(group)
    #print()
    print("Percentage for group {} is {}".format(str(group),str(count[0]/count[1])))
    
#
#strat_records.to_csv("stratified_sample_cars.csv")
 '''   
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt



'''
error_margin = []
for n in range(1,21) :
    kmean = KMeans(n_clusters=n)
    kmean.fit(records)
    error_margin.append(kmean.inertia_)

#print("\n".join([str(x) for x in error_margin]))

plt.plot([x for x in range(1,21)], error_margin, 'bx-')
plt.xlabel('k')
plt.ylabel('Sum of square distances')
plt.title('Finding the optimal k')
plt.show() 
'''

optimal_k = 4
kmean  = KMeans(n_clusters=optimal_k)
kmean.fit(records)


labels = kmean.labels_
centroids = kmean.cluster_centers_

mydict = {}
#for i in range(0,optimal_k) :
#    mydict[i] = records[np.where(labels == i)]
    
strat_records = {i: records.iloc[np.where(kmean.labels_ == i)[0]] for i in range(kmean.n_clusters)}

new_dataframes = []
total_rows = records.shape[0]
required_rows = int(records.shape[0]*.3)
for i in range(0,4) :
    sample_fraction  = (strat_records[i].shape[0]/total_rows)*required_rows/strat_records[i].shape[0]
    fract = strat_records[i].sample(frac=sample_fraction)
    new_dataframes.append(fract)

dataframe = pd.concat(new_dataframes)    
dataframe.to_csv("stratified_sample_cars_2.csv")
