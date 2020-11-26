import json
import matplotlib.pyplot as plt
import numpy as np

key = {
    "additions": "userA",
    "deletions": "userD",
    "commits": "userC"
}

class DevData:
    def __init__(self, fileLocation):
        self.location = fileLocation
        self.ranges = { # define ranges for sorting
            "additions": [1e2, 1e4],
            "deletions": [1e2, 1e4],
            "commits": [20, 100]
        }

    def run(self, type, plot=False):
        self.dataType = type
        self.parse()
        self.sortAll()

        print("low: =<"+str(self.ranges[type][0])+" high: >="+str(self.ranges[type][1]))
        for ind in range(len(self.data)):
            print(self.data[ind]['topic']+" tagged repos: "+str(self.data[ind]["repositories"]))
            self.plotter(ind, key[type])
            self.printRanges(ind, key[type])
        if plot is True:
            plt.show()

    def parse(self):
        with open(self.location) as f:
            self.data = json.load(f)

    def sortAll(self):
        for ind in range(len(self.data)):
            self.data[ind] = self.sortTopic(self.data[ind])

    def sortTopic(self, topic):
        listStats = ["userA", "userD", "userC"]
        for item in listStats:
            topic[item] = self.sort(topic[item])
        return topic

    def sort(self, obj):
        return dict(sorted(obj.items(), key=lambda item: item[1], reverse=True))

    def setRanges(self, obj):
        self.ranges = obj

    def printRanges(self, ind, key):
        data = list(self.data[ind][key].values())
        low = len([i for i in data if i <= self.ranges[self.dataType][0]])
        high = len([i for i in data if i >= self.ranges[self.dataType][1]])

        print(self.data[ind]['topic']+" devs - "+self.dataType+"    ", "low: "+str(low), "medium: "+str(len(data)-low-high), "high: "+str(high))

    def plotter(self, ind, key):
        fig, ax = plt.subplots(1,2)

        users = list(self.data[ind][key].keys())[:10]
        y_pos = range(len(users))
        amount = list(self.data[ind][key].values())

        # top 10 bar chart
        ax[0].barh(y_pos, amount[:10], align='center')
        ax[0].set_yticks(y_pos)
        ax[0].set_yticklabels(users)
        ax[0].invert_yaxis()  # labels read top-to-bottom
        ax[0].set_xscale('log')
        ax[0].set_xlabel(self.dataType+" per year")
        ax[0].set_title(self.data[ind]['topic']+": Top 10 "+self.dataType)

        # historgram distribution of devs
        bins = np.logspace(np.log10(0.1),np.log10(max(amount)), 100)
        bins = np.append([0], bins)
        ax[1].hist(amount, bins = bins)
        ax[1].set_xlabel(self.dataType+" per year")
        ax[1].set_ylabel("developers")
        ax[1].set_yscale('log')
        ax[1].set_xscale('log')
        ax[1].set_title(self.data[ind]['topic']+": "+self.dataType+" distribution")

if __name__=='__main__':
    data = DevData("./data/devs_2020-11-25T18:12:13-05:00.json")

    data.run("commits")
    # data.run("commits", plot=True)
    # data.run("additions")
    # data.run("deletions")
