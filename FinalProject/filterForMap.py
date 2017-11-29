import pandas as pd
import numpy as np

cols = ['lagoslakeid', 'summerpud', 'totalpud', 'nhd_lat', 'nhd_long', 'lake_area_ha', 'lagosname1', 'meandepth', 'maxdepth', 'state_name', "hu12_nlcd2011_pct_11", "hu12_nlcd2011_pct_21", "hu12_nlcd2011_pct_22", "hu12_nlcd2011_pct_23", "hu12_nlcd2011_pct_24", "hu12_nlcd2011_pct_31", "hu12_nlcd2011_pct_41", "hu12_nlcd2011_pct_42", "hu12_nlcd2011_pct_43"]
cols += ["hu12_nlcd2011_pct_52", "hu12_nlcd2011_pct_71", "hu12_nlcd2011_pct_81", "hu12_nlcd2011_pct_82", "hu12_nlcd2011_pct_90", "hu12_nlcd2011_pct_95"]
print(cols)

df = pd.read_csv(
    "LagosNutrSumFullReg.csv",
    usecols=cols,
    dtype=str)
    # .dropna(axis=0, how='any')
df = df[df.index % 10 == 0]
print(len(df))
df.to_csv("map_data.csv", index=False)
