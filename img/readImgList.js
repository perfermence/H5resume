let fs=require('fs');
let ary=fs.readdirSync('./移动端/交互式简历/img');
console.log(ary);
let result=[];
ary.forEach(function (item) {
    if (/\.(png|gif|jpg)/i.test(item)){
        //=>图片
        result.push(`img/`+item);
    }
});
console.log(result);
fs.writeFileSync('./移动端/交互式简历/img/result.txt',JSON.stringify(result),'utf-8');