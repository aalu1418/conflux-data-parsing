import requests
from datetime import datetime
import matplotlib.pyplot as plt

pairs = {
    "ethereum": "eth",
    "eth-classic": "etc",
    "ravencoin": "rvn",
    "nervos": "ckb",
    "monero": "xmr",
    "callisto": "clo",
    "firo":"xzc",
    "metaverse": "etp",
    "expanse": "exp",
    "conflux": "cfx"
}

baseURL = "https://hr.2miners.com/api/v1/hashrate/1d/"

def pullData(token):
    URL = baseURL + pairs[token]

    if token == "conflux":
        data = requests.get("https://confluxscan.io/v1/plot?limit=100").json()
        return data["list"]

    return requests.get(URL).json()

def filterPlot(data, date, label, token):
    hashrate = "hashrate"
    if label == "conflux":
        hashrate = "hashRate"

    xdata = [int(obj["timestamp"]) for obj in data if int(obj["timestamp"]) > date]
    ydata = [float(obj[hashrate]) for obj in data if int(obj["timestamp"]) > date]
    plt.plot(xdata, ydata, label=label+" ("+token+")")


if __name__=="__main__":
    time = int(datetime.strptime("2020-01-01", '%Y-%m-%d').strftime('%s'))

    plt.figure()

    for token in pairs.keys():
        print(token)
        data = pullData(token)
        filterPlot(data, time, token, pairs[token])

    plt.title("Hashrate Comparison")
    plt.ylabel("Hashrate")
    plt.yscale("log")
    plt.legend(loc='center left', bbox_to_anchor=(1, 0.5))

    locs, labels = plt.xticks()
    labels = [datetime.utcfromtimestamp(i).strftime('%b %Y') for i in locs]
    plt.xticks(locs, labels, rotation=90)
    plt.subplots_adjust(right=0.7, bottom=0.2)
    plt.show()
