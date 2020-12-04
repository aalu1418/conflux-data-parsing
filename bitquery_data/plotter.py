import json
import matplotlib.pyplot as plt
import datetime
import time
import numpy as np

def load(filename):
    with open(filename) as f:
        return json.load(f)

def plotHist(data, bins):
    plt.figure()
    plt.hist(data, bins=bins)
    locs, labels = plt.xticks()
    labels = [datetime.datetime.fromtimestamp(i).strftime('%b %Y') for i in locs]
    plt.xticks(locs, labels, rotation=90)
    plt.subplots_adjust(bottom=0.25)
    plt.title("Contracts Deployed per Week")
    plt.xlabel("Week")

def plotLine(data, title):
    plt.figure()
    plt.plot(data, "-o")
    plt.xlim((0,52))
    locs, labels = plt.xticks()
    labels = ["Jan", "Mar", "May", "Jul", "Sep", "Dec", "Feb"]
    plt.xticks(locs, labels, rotation=90)
    plt.subplots_adjust(bottom=0.15)
    plt.title(title)
    plt.xlabel("Week")

def pieChart(data, labels):
    plt.figure()
    plt.pie(data, labels=labels)
    plt.title("Top 100 Miners (Yearly)")

def plotStack(data):
    plt.figure()
    bottom = np.zeros(52)
    total = np.zeros(52)
    for ind in data.values():
        total += np.array(ind)

    # prevent divide by zero error
    total += total == 0

    for ind in list(data.values()):
        ind = np.divide(ind, total)
        plt.bar(range(0,52), ind, bottom=bottom)
        bottom += np.array(ind)

    plt.title("Miner Shares of Blocks Mined")
    plt.xlabel("Week")
    plt.ylabel("Fraction")
    plt.xlim((0,52))
    locs, labels = plt.xticks()
    labels = ["Jan", "Mar", "May", "Jul", "Sep", "Dec", "Feb"]
    plt.xticks(locs, labels, rotation=90)
    plt.subplots_adjust(bottom=0.15)



if __name__=='__main__':
    data = load("./data/contractsCreated_2020-12-01T10:17:06-05:00.json");
    smartContract_dates = [time.mktime(datetime.datetime.strptime(i["block"]["timestamp"]["time"], '%Y-%m-%d %H:%M:%S').timetuple()) for i in data]
    currentTime = time.time()
    bins_pastYear = currentTime-np.arange(0,50)[::-1]*60*60*24*7

    plotHist(smartContract_dates, bins_pastYear)

    data = load("./data/tokenData_2020-12-03T17:15:36-05:00.json")
    weekly = data["weekly"]

    plotLine(weekly, "Token Transfers per Week")

    data = load("./data/mining_2020-12-04T10:59:13-05:00.json")
    totalData = [i["count"] for i in data["total"]]
    labels = [i["address"]["address"] for i in data["total"]]
    labels = labels[:10] + [None]*(len(labels)-10)
    pieChart(totalData, labels)

    # not that useful (only using top 1000 - maxes out)
    minerNum = np.zeros(52)
    for i in data["individual"].values():
        minerNum += np.array(i) > 0
    # plotLine(minerNum, "Unique Miners per Week")

    plotStack(data["individual"])

    plt.show()
