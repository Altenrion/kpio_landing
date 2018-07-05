var dom = document.getElementById("ChartTest6");
var myChart = echarts.init(dom);
var app = {};
option = null;

var defFilialsData = [];

//here i get specialists
filials.forEach(function(filial) {
    defFilialsData.push(filial.name)
});


var data = genData(50);

option = {
    title : {
        text: 'Филиалы',
        subtext: '',
        x:'left'
    },
    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20,
        data: data.legendData,
        selected: data.selected,
    },
    series : [
        {
            name: 'Обращений',
            type: 'pie',
            radius : '55%',
            center: ['40%', '50%'],
            data: data.seriesData,
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};

function genData(count) {

    var legendData = [];
    var seriesData = [];
    var selected = {};
    for (var i = 0; i < defFilialsData.length; i++) {
        var name = defFilialsData[i];
        legendData.push(name);
        seriesData.push({
            name: name,
            value: Math.round(Math.random() * 100000)
        });
        selected[name] = i < 10;
    }

    return {
        legendData: legendData,
        seriesData: seriesData,
        selected: selected
    };
}
;
if (option && typeof option === "object") {
    myChart.setOption(option, true);
}
