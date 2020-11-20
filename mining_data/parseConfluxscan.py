import requests
from pandas import DataFrame
import time

class data:
    def __init__(self, url):
        self.url = url

    def getAndParse(self):
        self.get()
        self.parse()

    def get(self):
        self.raw = requests.get(self.url).json()

    def parseKeys(self):
        self.keys = self.raw["result"]["list"][0].keys()

    def parse(self):
        self.parseKeys()
        self.parsed = {}
        self.length = self.raw["result"]["total"]
        for key in self.keys:
            temp = [None]*self.length
            for ii in range(self.length):
                temp[ii] = self.raw["result"]["list"][ii][key]
            self.parsed[key] = temp

    def export(self, topicList):
        listNames = ["timestamp"] + topicList
        data = [None]*len(listNames)
        for ii in range(len(listNames)):
            data[ii] = self.parsed[listNames[ii]]
        self.df = DataFrame (data).transpose()
        self.df.columns = listNames
        self.df.to_csv('./csv/data_'+str(int(time.time()))+'.csv')


if __name__=="__main__":
    cfxData = data("https://confluxscan.io/api/dashboard/plot?duration=all")
    cfxData.getAndParse()
    cfxData.export(["hashRate"])
