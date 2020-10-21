import requests
import time
import json

class data:
    def __init__(self, url, pageStart, pageStop, pageSize):
        self.url = url
        self.pageStart = pageStart
        self.pageStop = pageStop
        self.pageSize = pageSize
        self.toFilter = []
        self.fromFilter = []

    def get(self):
        return requests.get(self.url+"page="+str(self.index)+"&pageSize="+str(self.pageSize)).json()

    def getLoop(self):
        self.raw = []
        for self.index in range(self.pageStart, self.pageStop+1):
            data = self.get()
            data = self.postProcess(data)

            self.raw = self.raw + data
            print("Page: "+str(self.index)+"   Total TXs: "+str(len(self.raw))+"   Increase from Previous: "+str(len(data)))

    def postProcess(self, data):
        return self.filter(data["result"]["list"])

    def setFilter(self, toFilter, fromFilter):
        self.toFilter = toFilter
        self.fromFilter = fromFilter

    def filter(self, data):
        return [obj for obj in data if not any(obj["to"].lower() == item.lower() for item in self.toFilter) and not any(obj["from"].lower() == item.lower() for item in self.fromFilter)]

    def export(self):
        with open('./raw/txdata.txt', 'w') as outfile:
            json.dump(self.raw, outfile)

    def importFile(self, filename):
        with open(filename) as json_file:
            self.raw = json.load(json_file)
        print("Data Length: "+str(len(self.raw)))

    def splitData(self):
        keys = list(self.raw[0].keys())
        print("Keys: "+str(keys))
        self.data = {}
        for key in keys:
            self.data[key] = [tx[key] for tx in self.raw]

    def calculateTPS(self):
        self.TPS = len(self.data["timestamp"])/(max(self.data["timestamp"]) - min(self.data["timestamp"]))
        print("TPS: "+str(self.TPS))

if __name__=="__main__":
    cfxData = data("https://confluxscan.io/api/transaction/list?", 1, 100, 100)
    cfxData.setFilter(["0x83f4049e4c1f956f69ec3f649cfa227cf95a591d"], ["0x176c45928d7c26b0175dec8bf6051108563c62c5"]) #filtering out data that is generated to load test network

    # #for pulling new data from confluxscan
    # cfxData.getLoop()
    # cfxData.export()

    # #importing existing data and splitting
    cfxData.importFile("./raw/txdata.txt")
    cfxData.splitData()
    cfxData.calculateTPS()
