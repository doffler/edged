import os
import sys
import json

if __name__ == "__main__":

  # read in and parsing json data from offloader.js file
  json_file = sys.argv[1]
  with open(json_file) as fi:
    data = json.load(fi)

  print(data['input_data']['index'])
