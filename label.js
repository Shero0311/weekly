const labelFile = require('./labeldata.js');
const objlabels = labelFile.labels;

function label(article) {
    //console.log("article = " + article);
    var titletext = article.title;
    var htmltext = JSON.stringify(article).replace(/<[^>]+>/g,"");
    console.log("htmltext = " + htmltext);
    var labels = [];
    for (var prop in objlabels) {
        var count = 0;
        var arrlabel = objlabels[prop];
        var len = arrlabel.length;
        for (var i = 0; i < len; i++) {
            if(typeof(arrlabel[i]) != "string") {
                pattern = arrlabel[i].toString + 'gi';
            } else {
                var pattern = new RegExp(arrlabel[i], 'gi');
            }
            var ret = htmltext.match(pattern);
            var titleret = JSON.stringify(titletext).match(pattern);
            if (ret) {
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

    console.log(labels);
    var flag = labels.length;
    var tags = '';

    if (flag > 0) {
        tags = labels[0].label;
        for (var i = 1; i < flag && i < 5; i++) {
            tags = tags + ',' + labels[i].label;
        }
        console.log("tags = " + tags);
        return tags;
    }
    return null;
}

module.exports = label;
