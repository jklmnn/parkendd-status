#!/usr/bin/python3

import json
import jsonschema
import requests
import sys

url = "https://api.parkendd.de"

def usage(d0):
  print("Usage: {0} [OPTION]".format(d0))
  print("Options:")
  print("       --help    show this help")
  
def get_cities(index):
  return index['cities'].keys()
  
class ApiValidate:
  
  def __init__(self, indexschema, cityschema):
    self.indexschema = indexschema
    self.cityschema = cityschema
    
  def index_is_valid(self, data):
    try:
      jsonschema.validate(data, self.indexschema)
    except:
      return False
    return True
  
  
  def city_is_valid(self, data):
    try:
      jsonschema.validate(data, self.cityschema)
    except:
      return False
    return True

if __name__ == "__main__":
  if len(sys.argv) < 2:
    req = requests.get(url)
    result = {"status": req.status_code}
    if req.status_code == 200:
      i_f = open("schema_index.json", "r")
      c_f = open("schema_city.json", "r")
      apival = ApiValidate(json.load(i_f), json.load(c_f))
      i_f.close()
      c_f.close()
      result["index"] = apival.index_is_valid(req.json())
      if result["index"]:
        cities = []
        for city in get_cities(req.json()):
          rc = requests.get("{0}/{1}".format(url, city));
          cities.append({city: apival.city_is_valid(rc.json())})
        result["cities"] = cities
    print(result)
  else:
    usage(sys.argv[0])
    exit(1)
