from pandas import DataFrame
import time

from raw.etc_hashrate import hashRate
from raw.rvn import data as rvnData
from raw.rvn_price import data as rvnPrice
from raw.zcoin import data as zcoinData
from raw.zcoin_price import data as zcoinPrice

def convertRowData(rowData, columnNames):
    df = DataFrame (rowData)
    export(df, columnNames)

def convertColData(colData, columnNames):
    df = DataFrame (colData).transpose()
    export(df, columnNames)

def export(df, columnNames):
    df.columns = columnNames
    df.to_csv('./csv/data_'+str(int(time.time()))+'.csv')

def convertRowDataDict(rowData):
    parsedData = [None]*len(rowData)
    columnNames = list(rowData[0].keys())
    for ii in range(len(rowData)):
        temp = [None]*len(columnNames)
        for jj in range(len(columnNames)):
            temp[jj] = rowData[ii][columnNames[jj]]
        parsedData[ii] = temp
    convertRowData(parsedData, columnNames)

def minerstat2Hashrate(jsonData):
    token = list(jsonData.keys())[0]
    rawData = jsonData[token]
    timestamps = []
    hashrates = []
    for timestamp in rawData.keys():
        timestamps.append(timestamp)
        hashrates.append(rawData[timestamp][1])
    convertColData([timestamps, hashrates], ["timestamp", "hashrate"])


if __name__ == "__main__":
    # convertRowData(hashRate, ["timestamp", "hashrate"])
    # convertRowDataDict(rvnData)
    # convertRowData(rvnPrice["stats"], ["timestamp", "price"])
    # minerstat2Hashrate(zcoinData)
    # convertRowData(zcoinPrice["stats"], ["timestamp", "price"])
