const ethers = require('ethers');
const Promise = require('bluebird');
const request = require('request');

// TODO: add to atomic, use individual requests only as a fallback

module.exports = (api) => {
  api.get('/eth/gasprice', (req, res, next) => {
    api._getGasPrice()
    .then((gasprice) => {
      const retObj = {
        msg: gasprice ? 'success' : 'error',
        result: gasprice ? gasprice : 'unable to get gas price',
      };
      res.end(JSON.stringify(retObj));
    });
  });

  api._getGasPrice = () => {
    return new Promise((resolve, reject) => {
      const options = {
        url: 'https://ethgasstation.info/json/ethgasAPI.json',
        method: 'GET',
      };

      api.log('ethgasstation.info gas price req');

      request(options, (error, response, body) => {
        if (response &&
            response.statusCode &&
            response.statusCode === 200) {
          try {
            const _json = JSON.parse(body);

            if (_json &&
                _json.average &&
                _json.fast &&
                _json.safeLow) {
              api.eth.gasPrice = {
                fast: Number(_json.fast) / 10 * 1000000000, // 2 min
                average: Number(_json.average) / 10 * 1000000000,
                slow: Number(_json.safeLow) / 10 * 1000000000,
              };

              console.log(api.eth.gasPrice);
              resolve(api.eth.gasPrice);
            } else {
              resolve(false);
            }
          } catch (e) {
            api.log('ethgasstation.info gas price req parse error', 'eth.gasprice');
            api.log(e);
          }
        } else {
          api.log('ethgasstation.info gas price req failed', 'eth.gasprice');
        }
      });
    });
  };

  return api;
};