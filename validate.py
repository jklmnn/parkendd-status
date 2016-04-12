#!/usr/bin/python3

import unittest
import json
import jsonschema
import requests
import sys

url = "https://api.parkendd.de"

def usage(d0):
  print("Usage: {0} [OPTION]".format(d0))
  print("       --help    show this help")
  print("       unittest  run unit tests")
  
def get_cities(index):
  print(index)
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
  

class UnitValidate(unittest.TestCase):
  
  def setUp(self):
    self.req = requests.get(url)
    self.indexschema = json.load("schema_index.json")
    
  def create_city(self, city):
    cr = requests.get("{0}/{1}".format(url, city))
    def test(self):
      assertEqual(cr.status_code, 200)
    setattr(self, "test_{0}".format(city), test)
    
  def test_index(self):
    assertEqual(self.req.status_code, 200)
    jsonschema.validate(self.req.json(), self.indexschema)
    cities = get_cities(self.req.json())
    for city in cities:
      self.create_city(city)
      
  def set_suite(self):
    self.suite = unittest.TestSuite()
    self.suite.addTest(UnitValidate('test_index'))
    return self.suite

if __name__ == "__main__":
  if len(sys.argv) < 2:
    req = requests.get(url)
    result = {"status": req.status_code}
    if req.status_code == 200:
      i_f = open("schema_index.json", "r")
      apival = ApiValidate(json.load(i_f), {})#json.load("schema_city.json"))
      i_f.close()
      result["index"] = apival.index_is_valid(req.json())
    print(result)
  else:
    if sys.argv[1] == 'unittest':
      UnitValidate.set_suite()
    else:
      usage(sys.argv[0])
      exit(1)
