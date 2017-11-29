import pandas as pd
import numpy as np

cols = ['lagoslakeid', 'secchi', 'nh4', 'no2', 'sampleyear']
dtypes = {'lagoslakeid': int,
    'secchi': float,
    'nh4': float,
    'no2': float,
    'sampleyear': int}

df = pd.read_csv(
    "lagos_epi_nutr_10541.csv",
    usecols=cols,
    dtype=dtypes).dropna(axis=0, how='all')

top_ten = df.lagoslakeid.value_counts().index.tolist()[:10]

dfx = pd.DataFrame()
for lake_id in top_ten:
    df2 = df[df.lagoslakeid == lake_id]
    for year in np.unique(df2.sampleyear):
        dfx = dfx.append(df2[df2.sampleyear == year].mean(), ignore_index=True)

dfx.lagoslakeid = dfx.lagoslakeid.astype(int)
dfx.sampleyear = dfx.sampleyear.astype(int)

dfx.to_csv("scatter_data.csv", index=False)
