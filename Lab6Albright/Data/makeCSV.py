"""
  File:   makeCSV.py
  Author: Clare Bates Congdon
  Date:   September 23, 2017

  This code converts the est14_ME.txt file -- which is tab separated -- into
  a CSV file, capturing only the columns of interest. (It's recycled from an
  exercise in using dictionaries from my CSCI1101 class, so is quirky.)

  This prints instead of writes to a file; the output can be redirected on
  the Unix commandline.

  to run at unix commandline:
    python3 makeCSV.py > est14_ME.csv
  
  Using Maine 2014 census data, from here:
  http://www.census.gov/did/www/saipe/data/statecounty/data/2014.html  

  Note: This is grabbing just the first word of the county name; works in
  Maine, but might not in other states.
"""

DATA = "est14_ME.txt"        # census data file


def main ():
    
    #read data into a dictionary, key = stateID number (column 2)
    dictionary = read_data()
    
    #print back the info in the dictionary, in CSV format
    print_data_csv(dictionary)
    
    return None

"""
function:    read_data
parameters:  none
return val:  the dictionary, mapping county names to stats for that county
description: read the data into a list of lines
"""
def read_data ():

    dictionary = {}                 # start an empty dictionary    
    
    infile = open(DATA, "r")        # open the data file 
    linelist = infile.readlines()   # read lines into a list

    del linelist[0]                 # remove the first line
    
    # for each line in the list of lines
    for line in linelist:
        
        nextline = line.strip().split()   # get the next line; split into a list

        # get the data in columns 2, 5, 20, and 23
        poverty = nextline[2]
        percent_poverty = nextline[5]
        median_income = nextline[20]
        county = nextline[23]

        # this is nested dictionaries, so make the inner dictionary
        #   don't need a loop here, because we have three specific entries
        innerdict = {}
        innerdict["poverty"] = poverty
        innerdict["percent poverty"] = percent_poverty
        innerdict["median income"] = median_income
        dictionary[county] = innerdict      # add the inner dict for the county

    return dictionary

# print for 3665 use
def print_data_csv(counties):

    # print column headers
    print("Count_Poverty,Percent_Poverty,Median_Income,County")

    # alphabetical order
    #   print county name and inner values for each county
    for county_name, innerdict in sorted(counties.items()):
        print(innerdict["poverty"] + ',', end='')
        print(innerdict["percent poverty"] + ',', end='')
        print(innerdict["median income"] + ',', end='')
        print(county_name)
    
    return None

main()
