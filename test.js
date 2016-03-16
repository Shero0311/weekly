function ccc() {
var arr = ["aa","bb","cc","dd"];
var arrs = [];
arr.map(function(label) {
    console.log(label);
    arrs.push( {
        si: label,
        count: 1
    });
});
console.log(arrs);
}
ccc();
