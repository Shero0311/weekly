const labelFile = require('./labeldata.js');
const objlabels = labelFile.labels;

function label(article) {
    //console.log("article = " + article);
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
            //console.log("标签是：" + arrlabel[i]);
            var pattern = new RegExp(arrlabel[i], 'gi');
            if(titletext)
                var titleret = JSON.stringify(titletext).match(pattern);
            //console.log("pattern = " + pattern);
            //console.log("pattern类型" + typeof(pattern));
            var ret = htmltext.match(pattern);
            if (ret) {

                console.log("标签是："+ pattern + "ret是：" + ret);
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
        labels = labels.filter(label => label.count > 5).slice(0,5).map(labelvalue => labelvalue.label);
        tags = labels.join(",");
        //for (var i = 1; i < flag && i < 5; i++) {
            
        //    tags = tags + ',' + labels[i].label;
        //}
        console.log("tags = " + tags);
        return tags;
    }
    return null;
}

module.exports = label;
