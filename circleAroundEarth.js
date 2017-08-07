var arc = require('./arc.js');
var fs = require("fs");

process.stdout.write('enter x1, y1, x2, y2 and points count:');
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (data) {
    var arrInput = data.split(" ");
    var x1 = Number(arrInput[0]),//防止变成字符串拼接
        y1 = Number(arrInput[1]),
        x2 = Number(arrInput[2]),
        y2 = Number(arrInput[3]),
        count = Number(arrInput[4]);

    var start = { x: x1, y: y1 };
    var end = { x: x2, y: y2 };
    var oStart = opposite(start);//取地球另一侧对应的点
    var oEnd = opposite(end);
    var strStart = "";//用来存第一行
    
    //把四段大圆航线拼起来
    var str = compute(start, end, count) + compute(end, oStart, count) + compute(oStart, oEnd, count) + compute(oEnd, start, count);
    str += strStart;//把第一行添加到最后一行形成闭合的圆

    //写入当前路径下，保存为circle.txt
    fs.writeFile("circle.txt", str, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("saved as circle.txt in the same directory");
        }
    });

    //计算两点之间的大圆航线
    function compute(start, end, count) { 
        var generator = new arc.GreatCircle(start, end);
        count = Math.round(count * (generator.g / (Math.PI * 2)));//根据总点数分配这一段点数，g是两点到圆心两条线的夹角，弧度制
        var line = generator.Arc(count);// 还有一个默认参数{ offset: 10 }，含义要参考GDAL源码
        var arrCoords = JSON.parse(JSON.stringify(line, null, 4)).geometries[0].coords;//读取大圆航线的坐标，转了两次，直接读有点问题
        var geometries1 = JSON.parse(JSON.stringify(line, null, 4)).geometries[1];//过日期分界线会分成两半，专门处理
        if (strStart === "") { 
            strStart = arrCoords[0][0] + "," + arrCoords[0][1] + "\r\n";//第一次计算的时候把第一行存起来
        }    
        var str = "";
        for (var i = 0; i < arrCoords.length-1; i++) {//-1，不要最后一个点，因为一下段的起始点也是它
            var element = arrCoords[i];
            str += element[0] + "," + element[1]  + "\r\n";
        }
        if (geometries1) {//如果穿过日期分界线，有两段
            arrCoords1 = geometries1.coords;
            for (var i = 1; i < arrCoords1.length-1; i++) {//第一和最后一个点都不要
                var element = arrCoords1[i];
                str += element[0] + "," + element[1]  + "\r\n";
            }
        }
        return str;
    }

    function opposite(point) { 
        var obj = {x:0,y:0};
        obj.x = point.x < 0 ? point.x + 180 : point.x - 180;//对应经度
        obj.y = -point.y;//对应纬度
        return obj;
    }

    process.stdin.pause();
});

process.stdin.resume();