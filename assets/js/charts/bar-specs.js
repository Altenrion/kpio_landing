var dom = document.getElementById("ChartTest8");
var myChart = echarts.init(dom);
var app = {};
option = null;
app.title = '世界人口总量 - 条形图';

option = {
    title: {
        text: 'Обращения',
        subtext: 'По специалистам '
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        },

    },
    legend: {
        data: ['Специалист 1', 'Специалист 2', 'Специалист 3', 'Специалист 4'],
        orient: 'vertical',
        right: 10,
        // top: 20,
        // bottom: 20,

        // align:'rigth'
        y: 'center'

    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
    },
    yAxis: {
        type: 'category',
        data:['Специалист 1', 'Специалист 2', 'Специалист 3', 'Специалист 4']
    },
    series: [
        {
            name: 'Специалист 1',
            type: 'bar',
            stack:'1',
            data: [0, 23489]
        },
        {
            name: 'Специалист 2',
            type: 'bar',
            stack:'1',

            data: [18203, 0, 0, 0]
        },
        {
            name: 'Специалист 3',
            stack:'1',
            type: 'bar',
            data: [0, 0, 29034, 0]
        },
        {
            name: 'Специалист 4',

            stack:'1',
            type: 'bar',
            data: [0, 0, 0, 121594]
        }
    ]
};
;
if (option && typeof option === "object") {
    myChart.setOption(option, true);
}
