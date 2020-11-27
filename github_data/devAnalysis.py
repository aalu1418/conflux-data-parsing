import json
import matplotlib.pyplot as plt
import numpy as np

mapping = {
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

    def run(self, plot=False):
        self.dataTypes = ["additions", "deletions", "commits"]
        self.parse()
        self.sortAll()

        print("Metrics for categorization:")
        for key in self.dataTypes:
            print(key, "low: =<"+str(self.ranges[key][0])+" high: >="+str(self.ranges[key][1]))

        for ind in range(len(self.data)):
            print("--------------------------------------")
            print(self.data[ind]['topic']+" tagged repos: "+str(self.data[ind]["repositories"]))
            self.plotter(ind)
            self.printRanges(ind)
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

    def printRanges(self, ind):
        for key in self.dataTypes:
            param = mapping[key]
            data = list(self.data[ind][param].values())
            low = len([i for i in data if i <= self.ranges[key][0]])
            high = len([i for i in data if i >= self.ranges[key][1]])

            print(self.data[ind]['topic']+" devs - "+key+"    ", "low: "+str(low), "medium: "+str(len(data)-low-high), "high: "+str(high))

    def plotter(self, ind):
        fig, ax = plt.subplots(2,2)
        plt.tight_layout()

        # data processing
        users = list(self.data[ind]["userC"].keys())[:10]
        y_pos = range(len(users))
        commits = list(self.data[ind]["userC"].values())
        linesChanged = {key: value + self.data[ind]["userD"][key] for key, value in self.data[ind]["userA"].items()}
        linesChanged = self.sort(linesChanged)
        linesUsers = list(linesChanged.keys())[:10]
        additions = [self.data[ind]["userA"][user] for user in linesUsers]
        deletions = [self.data[ind]["userD"][user] for user in linesUsers]
        addFull = list(self.data[ind]["userA"].values())
        delFull = list(self.data[ind]["userD"].values())

        # top 10 bar chart
        ax[0,0].barh(y_pos, commits[:10], align='center')
        ax[0,0].set_yticks(y_pos)
        ax[0,0].set_yticklabels(users)
        ax[0,0].invert_yaxis()  # labels read top-to-bottom
        ax[0,0].set_xscale('log')
        ax[0,0].set_xlabel("Commits Per Year")
        ax[0,0].set_title(self.data[ind]['topic']+": Top 10 Commits")

        # historgram distribution of devs
        bins = np.logspace(np.log10(0.1),np.log10(max(commits)), 100)
        # bins = np.append([0], bins)
        ax[0, 1].hist(commits, bins = bins)
        ax[0, 1].set_xlabel("Commits Per Year")
        ax[0, 1].set_ylabel("Developers")
        ax[0, 1].set_yscale('log')
        ax[0, 1].set_xscale('log')
        ax[0, 1].set_title(self.data[ind]['topic']+": Commits Distribution")

        # top 10 bar chart
        ax[1,0].barh(np.array(y_pos), additions, label="Additions")
        ax[1,0].barh(np.array(y_pos), deletions, left=additions, label="Deletions")
        ax[1,0].set_yticks(y_pos)
        ax[1,0].set_yticklabels(linesUsers)
        ax[1,0].invert_yaxis()  # labels read top-to-bottom
        ax[1,0].set_xscale('log')
        ax[1,0].set_xlabel("Lines Changed Per Year")
        ax[1,0].set_title(self.data[ind]['topic']+": Top 10 Lines Changed")
        ax[1,0].legend()

        # historgram distribution of devs
        bins = np.logspace(np.log10(0.1),np.log10(max(addFull+delFull)), 100)
        # bins = np.append([0], bins)
        amtsAdd, _ = np.histogram(addFull, bins = bins)
        amtsDel, _ = np.histogram(delFull, bins = bins)
        ax[1,1].bar(bins[:-1], amtsAdd, width=bins[1:]-bins[:-1], label="Additions")
        ax[1,1].bar(bins[:-1], -amtsDel, width=bins[1:]-bins[:-1], label="Deletions")
        ax[1, 1].set_xlabel("Lines Per Year")
        ax[1, 1].set_ylabel("Developers")
        # ax[1, 1].set_yscale('log')
        ax[1, 1].set_xscale('log')
        ax[1, 1].set_title(self.data[ind]['topic']+": Lines Changed Distribution")
        ax[1, 1].legend()


if __name__=='__main__':
    data = DevData("./data/devs_2020-11-25T18:12:13-05:00.json")
    data.run(plot=False)
