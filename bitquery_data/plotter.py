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

def plotLine(data):
    plt.figure()
    plt.plot(data, "-o")
    plt.xlim((0,52))
    locs, labels = plt.xticks()
    labels = ["Jan", "Mar", "May", "Jul", "Sep", "Dec", "Feb"]
    plt.xticks(locs, labels, rotation=90)
    plt.subplots_adjust(bottom=0.25)
    plt.title("Token Transfers per Week")
    plt.xlabel("Week")

if __name__=='__main__':
    data = load("./data/contractsCreated_2020-12-01T10:17:06-05:00.json");
    smartContract_dates = [time.mktime(datetime.datetime.strptime(i["block"]["timestamp"]["time"], '%Y-%m-%d %H:%M:%S').timetuple()) for i in data]
    currentTime = time.time()
    bins_pastYear = currentTime-np.arange(0,50)[::-1]*60*60*24*7

    plotHist(smartContract_dates, bins_pastYear)

    data = load("./data/tokenData_2020-12-03T17:15:36-05:00.json")
    weekly = data["weekly"]

    plotLine(weekly)

    plt.show()
