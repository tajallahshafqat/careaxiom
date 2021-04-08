const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const RSVP = require('rsvp');
const async = require('async');
const { title } = require('process');
const router = express.Router();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

router.get('/I/want/title', async (req, res) => {
  const { address } = req.query;
  let urls = [];
  if (!address) {
    res.sendStatus(400);
    return;
  }
  if (typeof address === 'string') {
    urls.push(address);
  } else {
    urls = address;
  }

  const promises = [];
  for (const url of urls) {
    promises.push(getTitlesPromise(url));
  }

  Promise.allSettled(promises).then((values) => {
    const titles = values.map((value) => {
      if (value.status === 'fulfilled') {
        return value.value;
      } else {
        return value.reason;
      }
    });

    res.render('index', {
      titles,
    });
  });
});

app.use('/', router);
app.listen(process.env.port || 3000, () => console.log('Running at Port 3000'));

// TASK 1
const getTitlesPromise = (url) => {
  return new Promise((resolve, reject) => {
    let req = url.startsWith('http') ? url : 'http://' + url;
    axios
      .get(req)
      .then((res) => {
        if (res && res.status === 200) {
          const title = res.data.match(/<title[^>]*>([^<]+)<\/title>/);
          resolve({
            address: url,
            title: '"' + title[1] + '"',
          });
        } else {
          reject({
            address: url,
            title: 'NO RESPONSE',
          });
        }
      })
      .catch((err) => {
        reject({
          address: url,
          title: 'NO RESPONSE',
        });
      });
  });
};

// TASK 2
const getTitlesAsync = (titles, urls, res) => {
  async.each(
    urls,
    (url, callback) => {
      let req = url.startsWith('http') ? url : 'http://' + url;
      axios
        .get(req)
        .then((res) => {
          if (res && res.status === 200) {
            const title = res.data.match(/<title[^>]*>([^<]+)<\/title>/);
            titles.push({
              address: url,
              title: title[1],
            });
            callback();
          } else {
            callback(res);
          }
        })
        .catch((err) => {
          callback(err);
        });
    },
    (err) => {
      if (err) {
        titles.push({
          address: url,
          title: 'NO RESPONSE',
        });
      } else {
        res.render('index', {
          titles,
        });
      }
    }
  );
};

// TASK 3
const getTitlesRsvp = (url) => {
  return new RSVP.Promise((resolve, reject) => {
    let req = url.startsWith('http') ? url : 'http://' + url;
    axios
      .get(req)
      .then((res) => {
        if (res && res.status === 200) {
          const title = res.data.match(/<title[^>]*>([^<]+)<\/title>/);
          resolve({
            address: url,
            title: '"' + title[1] + '"',
          });
        } else {
          reject({
            address: url,
            title: 'NO RESPONSE',
          });
        }
      })
      .catch((err) => {
        reject({
          address: url,
          title: 'NO RESPONSE',
        });
      });
  });
};
