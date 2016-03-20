"use strict";

const request = require('request');
const fs = require('fs');
const parseString = require('xml2js').parseString;
const configFile = './config.json';
const config = require(configFile);
const getLabel = require('./getLabel.js');

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
        request(context.site.url, {
            timeout: 10000,
            gzip: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36'
            }
        }, (error, response, body) => {
            if (error) {
                reject(error);
                console.log(`获取内容出错：${context.site.url}`);
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
                console.log(`解析内容出错：${context.site.url}`);
                console.log(context.body);
            } else{
                context.articles = result.feed ? result.feed.entry : result.rss.channel[0].item;

                //文章描述description的处理
                context.articles.forEach(article => {
                    article.title[0] = article.title[0]._ ? article.title[0]._ : article.title[0];
                    let description = (article.content && article.content[0]) || (article.summary && article.summary[0]) || (article.description && article.description[0]) || '';
                    if (typeof description != 'string') {
                        description = description._;
                    }
                    description = description.replace(/<[^>]+>/g,"");
                    article.description = description.substr(0, 400);

                    article.link[0] = article.link[0].$ ? article.link[0].$.href : article.link[0];
                });
                //文章发布时间的处理
                if (context.site.type == "atom") {
                    context.articles.forEach(article => {
                        article.published = article.published ? article.published[0] : article.updated[0];
                    });
                } else {
                    context.articles.forEach(article => {article.published = article.pubDate;});
                }
                resolve(context);
            }
        });
    });
}

//根据发布时间筛选出符合要求的内容
function filterArticles (context) {
    context.site.lastTime = null;
    console.log("articles = " + context.articles[0].title);
    var lastTime = context.site.lastTime || (+new Date() - 3600*24*7*1000);
    context.articles = context.articles.filter(article => +new Date (article.published) > lastTime);
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
        //调用标签获取函数
        var tags = getLabel(article);
        let postData = {
            uri: weeklyApi,
            method: 'POST',
            body: {
                title: article.title[0],
                url: article.link[0],
                description: article.description,
                provider: '梁幸芝Shero',
                tags: tags
            },
            json: true
        };
        if (process.env.DEBUG) {
            console.log(`发送数据到周刊接口：${JSON.stringify(postData, null, 4)}`);
            return;
        }
        request(postData, (err, response, body) => {
            if (err) {
                console.log(err);
            } else {
                //console.log(context.body);
            }
        });
    });
}
