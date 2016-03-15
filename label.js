const labelFile = './labels.json';
const labelsFile = require(labelFile);
const arrlabel = labelsFile.arrlabel;        

function label(article) {
    var htmltext = JSON.stringify(article).replace(/<[^>]+>/g,"");
        var flag = 0;
        //console.log(arrlabel);
        var labels = arrlabel.map(function(label) {
            var pattern = new RegExp(label, 'gi');
            var ret = htmltext.match(pattern);
            if (ret) {
                flag += 1;
                console.log(ret[0] + ' ' +ret.length);
                return {
                    label: label,
                    count: ret.length
                };
            } else {
                return {
                    label: null,
                    count: 0
                };
            }

        });
        console.log('统计后的flag = ' + flag);
        labels.sort(function(a, b) {
            return b.count - a.count;
        });
        
        var tags = '';
        if (flag >= 1) {
            tags = labels[0].label;
            for (var i = 1; i < flag && i < 5; i++) {
                tags = tags + ',' + labels[i].label;
            }
            return tags;
        }
}
module.exports = label;
