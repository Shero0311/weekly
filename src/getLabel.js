const objlabels = require('../config/labels.json');
const debug = require('debug')('label');

function label(article) {
    var titleret = '';
    if(article.title) {
        titletext = article.title;
    }
    var htmltext = JSON.stringify(article).replace(/<[^>]+>/g,"");
    var labels = [];
    for (var prop in objlabels) {
        var count = 0;
        var arrlabel = objlabels[prop];
        var len = arrlabel.length;
        for (var i = 0; i < len; i++) {
            var pattern = new RegExp(arrlabel[i], 'gi');
            if(titletext) {
                var titleret = JSON.stringify(titletext).match(pattern);
            }
            var ret = htmltext.match(pattern);
            if (ret) {

                debug("标签是："+ pattern + "ret是：" + ret);
                count += ret.length;
                if (titleret) {
                    count += 5;
                }
            }
        }
        if (count) {
            labels.push({
                label: prop,
                count: count
            });
        }
    }

    labels.sort(function(a, b) {
        return b.count - a.count;
    });

    var flag = labels.length;
    var tags = '';

    if (flag > 0) {
        labels = labels.filter(label => label.count > 4).slice(0,5).map(labelvalue => labelvalue.label);
        tags = labels.join(",");
        debug("tags = " + tags);
        return tags;
    }
    return null;
}

module.exports = label;
