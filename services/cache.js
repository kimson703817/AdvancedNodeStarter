const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient();
client.get = util.promisify(client.get);
const execOG = mongoose.Query.prototype.exec;


// client.set('idol', 'passion');
// const set = (key, val) => {
//     client.set(key, val, console.log);
// }

const get = (key) => client.get(key);

const flush = () => client.flushall();

const keys = () => client.keys('*', (err, keys) => {
  if (err) return console.log(err);

  for(var i = 0, len = keys.length; i < len; i++) {
    console.log(keys[i]);
  }
});

mongoose.Query.prototype.exec = async function() {
    const key = JSON.stringify(Object.assign(
      {},
      this.getQuery(),
      { collection: this.mongooseCollection.name }
    ));

    // console.log(key);

    // Check redis to see if there is a matching value for key
    const cacheValue = await client.get(key);

    // If not null,
    if((cacheValue)) {
      const doc = JSON.parse(cacheValue);

      return Array.isArray(doc)?
        doc.map(d => new this.model(d))
        : new this.model(doc);
    }

    // Otherwise, run query
    const result = await execOG.apply(this, arguments);
    const value = JSON.stringify(result);
    // console.log(key + ': ' + value);
    
    client.set(key, await JSON.stringify(result));
    // console.log(result);
    
    return result;
};

module.exports = {
    flush: flush,
    get: get,
    keys: keys,
}