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
  print("       --verbose show verbose output")
  
def get_cities(index):
  return index['cities'].keys()
  
class ApiValidate:
  
  def __init__(self):
    i_f = open("schema_index.json", "r")
    c_f = open("schema_city.json", "r")
    self.indexschema = json.load(i_f)
    self.cityschema = json.load(c_f)
    i_f.close()
    c_f.close()
    
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
      apival = ApiValidate()
      result["index"] = apival.index_is_valid(req.json())
      if result["index"]:
        cities = []
        for city in get_cities(req.json()):
          rc = requests.get("{0}/{1}".format(url, city))
          try:
            cities.append({city: apival.city_is_valid(rc.json())})
          except json.decoder.JSONDecodeError:
            cities.append(False)
        result["cities"] = cities
    print(result)
  else:
    if sys.argv[1] == "--verbose":
      print("fetching index...")
      req = requests.get(url)
      if req.status_code == 200:
        apival = ApiValidate()
        index = apival.index_is_valid(req.json())
        if index:
          print("index ok.")
          for city in get_cities(req.json()):
            print("fetching city {0}...".format(city))
            rc = requests.get("{0}/{1}".format(url, city))
            if rc.status_code == 200:
              if apival.city_is_valid(rc.json()):
                print("{0} ok".format(city))
              else:
                print("{0} error!".format(city))
            else:
              print("{0} status: {1}".format(city, rc.status_code))
      else:
        print("return code: {0}".format(req.status_code))
    else:
      usage(sys.argv[0])
      exit(1)
