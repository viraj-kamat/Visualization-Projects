import csv
import json

import numpy as np

file_handle = open('data.csv','r')
reader = csv.DictReader(file_handle)
fieldnames = reader.fieldnames

count = 0 
count2 = 0
count3 = 0
processed_data = []
manufacturer_count = {}
market_category = {}
for line in reader :
    count += 1
    model = line['model'].strip().replace(' ','').lower()
    manufacturer = line['manufacturer'].strip().replace(' ','').lower()
    
    mark_cat = line['market_category'].strip().replace(' ','').lower()
    
    if mark_cat not in market_category :
        if len(market_category) > 10 :
            continue
        else :
            market_category[mark_cat] = 0
    
    
    if manufacturer == "" or model == "" :
        count3 += 1
        continue
        

        
    if manufacturer not in manufacturer_count :
        if len(manufacturer_count) > 10 :
            continue
        else :
            manufacturer_count[manufacturer] = 0
    
    manufacturer_count[manufacturer] += 1
    
    if 2013 > int(line['year']) :
        continue    
        
        
    key = manufacturer+model
    empty =  False
    for field in fieldnames :
        if line[field].strip() == '' :
            count2 += 1
            empty = True
            break
    
    if not empty :
        processed_data.append(line)
file_handle.close()

print(len(market_category))

#print(count)
#print(count2)
#print(count3)
#print(len(processed_data))

'''

file_handle_2 = open("car.csv",'r')
reader = csv.DictReader(file_handle_2)
fieldnames2 = reader.fieldnames


count = 0
processed_data_2 = {}
manufacturer_count = {}
for line in reader :
    model = line['model'].strip().replace(' ','').lower()
    manufacturer = line['make'].strip().replace(' ','').lower()
    
    if manufacturer not in manufacturer_count :
        if len(manufacturer_count) > 10 :
            continue
        else :
            manufacturer_count[manufacturer] = 0
    
    manufacturer_count[manufacturer] += 1
    
    if 2016 > int(line['year']) :
        continue
    
    if manufacturer == "" or model == "" :
        continue
    key = manufacturer+model
    empty =  False
    for field in fieldnames2 :
        if line[field].strip() == '' :
            empty = True
            break
    
    if not empty :  
        if key in processed_data :
            processed_data_2[key] = processed_data[key]
            
            count += 1
            



fieldnames = fieldnames + ['origin','wheelbase','enginesize','length']



'''





f_h_2 = open('car_data_final.csv','w',newline='\n')
np.random.shuffle(processed_data)
#data_final = data_final[0:700]

writer = csv.DictWriter(f_h_2,fieldnames=fieldnames)
writer.writeheader()

for line in processed_data :
    writer.writerow(line)

    
f_h_2.close()


