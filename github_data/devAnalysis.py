import json
import matplotlib.pyplot as plt
import numpy as np

class DevData:
    def __init__(self, fileLocation):
        self.location = fileLocation
        self.ranges = { # define ranges for sorting (metrics per year)
            "additions": [1e2, 1e4],
            "deletions": [1e2, 1e4],
            "commits": [20, 100]
        }

    def run(self):
        self.dataTypes = ["additions", "deletions", "commits"]
        self.parse()

        print("Metrics for categorization:")
        for key in self.dataTypes:
            print(key, "low: =<"+str(self.ranges[key][0])+" high: >="+str(self.ranges[key][1]))

        self.active = {}
        self.total = {}
        for topic in self.data:
            print("--------------------------------------")
            print(topic['topic']+" tagged repos: "+str(topic["repositories"]))
            self.yearlyStats(topic)
            self.active[topic['topic']] = self.activeDevs(topic)
            self.total[topic['topic']] = topic["weekly"]

        self.comparisonPlot()

        plt.show()

    def parse(self):
        with open(self.location) as f:
            self.data = json.load(f)

    def setRanges(self, obj):
        self.ranges = obj

    def yearlyStats(self, topic):
        for key in self.dataTypes:
            param = key[0]

            parsed = [sum(topic["user"][user][param]) for user in topic["user"]]
            low = len([i for i in parsed if i <= self.ranges[key][0]])
            high = len([i for i in parsed if i >= self.ranges[key][1]])

            print(topic['topic']+" devs - "+key+"    ", "low: "+str(low), "medium: "+str(len(parsed)-low-high), "high: "+str(high))

    def activeDevs(self, topic):
        # committed at least once to a repository tagged with Conflux
        return sum([np.array(topic["user"][user]["c"]) > 0 for user in topic["user"]])

    def comparisonPlot(self):
        fig1, ax1 = plt.subplots()
        fig2, ax2 = plt.subplots(3,1)

        ax1.set_title("Weekly Developers")
        ax1.set_xlabel("Week Number (past year)")
        ax1.set_ylabel("Developers (submitted > 0 commits)")
        ax1.set_yscale('log')

        ax2[2].set_xlabel("Week Number (past year)")
        ax2[0].set_ylabel("Commits per Week")
        ax2[1].set_ylabel("Lines Added per Week")
        ax2[2].set_ylabel("Lines Deleted per Week")
        ax2[0].set_yscale("log")
        ax2[1].set_yscale("log")
        ax2[2].set_yscale("log")

        for topic in self.active:
            ax1.plot(self.active[topic], label=topic)

            ax2[0].plot(self.total[topic]["c"], label=topic)
            ax2[1].plot(self.total[topic]["a"], label=topic)
            ax2[2].plot(self.total[topic]["d"], label=topic)

        ax1.legend(loc='center left', bbox_to_anchor=(1, 0.5))
        ax2[1].legend(loc='center left', bbox_to_anchor=(1, 0.5))
        fig1.subplots_adjust(right=0.75)
        fig2.subplots_adjust(right=0.75)



if __name__=='__main__':
    # data = DevData("./data/devs_2020-12-02T12:15:41-05:00.json")
    data = DevData("./data/devs_2020-12-07T17:14:59-05:00.json")

    data.run()
