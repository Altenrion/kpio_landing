var dom = document.getElementById("ChartTest4");
var myChart = echarts.init(dom);
var app = {};
option = null;
var xAxisData = [];
var data1 = [];
var data2 = [];
var data3 = [];

for (var i = 0; i < 100; i++) {
    xAxisData.push('2017-' + i);
    data1.push((Math.sin(i / 5) * (i / 5 -10) + i / 6) * 5);
    data2.push((Math.cos(i / 5) * (i / 5 -10) + i / 6) * 5);
    data3.push(((i / 5)-20) * (i / 5 -10) + i / 6);
}


//here i get specialists
var defColumnData = [];
specialists.forEach(function(specialist) {
    defColumnData.push(specialist.name)
});


option = {
    title: {
        text: 'Период',
        subtext: 'По месяцам',

        x:'left'
    },
    legend: {
        data: ["Динамика"], //тут надо получать список полей динамиччески
        align: 'left'
    },
    toolbox: {
        y: 'top',
        x: '80%',

        feature: {
            magicType: {
                type: ['stack', 'tiled']
            },
            dataView: {},
            saveAsImage: {
                pixelRatio: 2
            }
        }
    },
    tooltip: {},
    xAxis: {
        data: xAxisData,
        silent: false,
        splitLine: {
            show: false
        }
    },
    yAxis: {
    },
    series: [{
            name: "Динамика", //тут надо получать список полей динамиччески
            type: 'bar',
            data: data1,
            animationDelay: function (idx) {
                return idx * 10;
            }
        },
        // {
        //     name: specialists[1].name,
        //     type: 'bar',
        //     data: data2,
        //     animationDelay: function (idx) {
        //         return idx * 10 + 100;
        //     },
        //
        // }, {
        //     name: specialists[2].name,
        //     type: 'bar',
        //     data: data3,
        //     animationDelay: function (idx) {
        //         return idx * 10 + 200;
        //     },
    // }
    ],
    animationEasing: 'elasticOut',
    animationDelayUpdate: function (idx) {
        return idx * 5;
    }
};
if (option && typeof option === "object") {
    myChart.setOption(option, true);
}
