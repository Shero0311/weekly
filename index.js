const request = require('request');
const parseString = require('xml2js').parseString;

const urls = [
    'http://taobaofed.org/atom.xml',
    'http://www.w3ctrain.com/atom.xml'
];
const weeklyApi = 'http://www.75team.com/weekly/admin/article.php?action=add';


urls.forEach(url => {
    getRSS(url)
        .then(parseXml)
        .then(filterArticles)
        .then(postArticles)
        .catch(ex => {
            console.log(ex);
        });
});

function getRSS(url) {
    return new Promise((resolve, reject) => {
         request(url, (error, response, body) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(body);
        });
    });
}

function parseXml (body) {
    return new Promise((resolve, reject) => {
        parseString(body, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.feed.entry);
            }
        });
    });
}

function filterArticles (articles) {
    var lastTime = +new Date() - 3600*24*7*1000;
    return articles.filter(article => +new Date(article.published[0]) > lastTime);
}

function postArticles (articles) {
    articles.forEach(article => {
        console.log(`推送文章 ${article.title[0]}`);
        request({
            uri: weeklyApi,
            method: 'POST',
            body: {
                title: article.title[0],
                url: article.link[0].$.href,
                description: '',
                provider: 'liangxingzhi',
                tags: ''
            },
            json: true
        }, (err, response, body) => {
            if (err) {
                console.log(err);
            } else {
                console.log(body);
            }
        });
    });
}
