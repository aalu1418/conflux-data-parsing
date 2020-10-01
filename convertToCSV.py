from pandas import DataFrame
import time

from raw.etc_hashrate import hashRate
from raw.rvn import data as rvnData

def convertRowData(rowData, columnNames):
    df = DataFrame (rowData)
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


if __name__ == "__main__":
    # convertRowData(hashRate, ["timestamp", "hashrate"])
    convertRowDataDict(rvnData)
