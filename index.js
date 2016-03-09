const request = require('request');
const fs = require('fs');
const parseString = require('xml2js').parseString;
const configFile = './config.json';
const config = require(configFile);

const weeklyApi = 'http://www.75team.com/weekly/admin/article.php?action=add';

config.sites.forEach(site => {
    init(site)
        .then(getRSS)
        .then(parseXml)
        .then(filterArticles)
        .then(setLastTime)
        .then(postArticles)
        .catch(ex => {
            console.log(ex);
        });
});

//初始化context
function init(site) {
    return Promise.resolve({site: site});
}

//用request获取rss
function getRSS(context) {
    return new Promise((resolve, reject) => {
        request(context.site.url, {timeout: 5000}, (error, response, body) => {
            if (error) {
                reject(error);
                return;
            }
            context.body = body;
            resolve(context);
        });
    });
}

//获取到的rss数据是xml格式，转换格式成json对象
function parseXml (context) {
    return new Promise((resolve, reject) => {
        parseString(context.body, (err, result) => {
            if (err) {
                reject(err);
            } else {
                context.articles = result.feed.entry;
                resolve(context);
            }
        });
    });
}

//根据发布时间筛选出符合要求的内容
function filterArticles (context) {
    //console.log(config);
    var lastTime = context.site.lastTime || (+new Date() - 3600*24*7*1000);
    //console.log(lastTime);
    context.articles = context.articles.filter(article => +new Date(article.published[0]) > lastTime);
    return context;
}

//标记网站访问时间
function setLastTime(context) {
    context.site.lastTime = +new Date();
    return new Promise((resolve, reject) => {
        fs.writeFile(configFile, JSON.stringify(config, null, 4), err => {
            if (err) {
                return reject(err);
            }
            resolve(context);
        });
    });
}

//将符合要求的内容发送到文章推荐的接口
function postArticles (context) {
    context.articles.forEach(article => {
        console.log(`推送文章 ${article.title[0]}`);
        request({
            uri: weeklyApi,
            method: 'POST',
            body: {
                title: article.title[0],
                url: article.link[0].$.href,
                description: '',
                provider: '梁幸芝',
                tags: ''
            },
            json: true
        }, (err, response, body) => {
            if (err) {
                console.log(err);
            } else {
                //console.log(body);
            }
        });
    });
}
