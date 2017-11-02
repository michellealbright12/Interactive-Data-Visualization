Clare Bates Congdon
Wed Sep 27 05:43:22 2017

original data file: est14_ME.txt
  downloaded from: 
    http://www.census.gov/did/www/saipe/data/statecounty/data/2014.html  

This is estimated census data for 2014, for the state of Maine. Each line of
data is one county.

converted using the Python script makeCSV.py:
    python3 makeCSV.py > est14_ME.csv

The script converts the tab-separated data into CSV format, capturing the
four columns of interest:
  The number of people in poverty in that county
  The percent in poverty in that county
  The median income in that county
  The county name

The script also adds an initial header line to the data.

