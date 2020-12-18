# Data Parsing
Miscellaneous repository for various data parsing from various sources
### mining_data
* Confluxscan
   * `parseConfluxscan*.py` - pull data from Confluxscan API
* Mining metrics
   * `convertToCSV` - convert JSON objects from various sites to CSV
   * `hashrateComp` - compare hashrate to various networks

### github_data
* Github
   * `index.js` - pull Dev + Repo information from Github
   * `devAnalysis.py` - parse Dev data from github and return metrics

### bitquery_data
* Bitquery (GraphQL, transaction data)
   * `inefficientGetContractCreation.js` - cycle through all transactions to find contract creation (method for GraphQL API not available)
   * `tokenTransfers.js` - pull token data from bitquery
   * `miners.js` - pull Conflux specific miner information
   * `parse.js` - process transaction data + value of transactions
   * `plotter.js` - plot python figures


## Misc Data Resources
* https://api.coingecko.com/api/v3/coins/list
* https://docs.github.com/en/free-pro-team@latest/rest
* https://explorer.bitquery.io/conflux_tethys
