var dom = document.getElementById("ChartTest5");
var myChart = echarts.init(dom);
var app = {};

var defBarData = [];

//here i get specialists
specialists.forEach(function(specialist) {
    defBarData.push(specialist.name)
});


option = null;
    option = {
        title : {
            text: 'Специалисты',
            subtext: 'Всего за период',
            x:'left'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            type: 'scroll',
            orient: 'vertical',
            right: 10,
            top: 20,
            bottom: 20,
            data: data.legendData,

            selected: data.selected,
            orient: 'vertical',
            x: 'right',
            y: 'center',

            data: defBarData
        },
        series: [
            {
                name:'Специалист',
                type:'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontSize: '16',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data:[
                    {value:Math.random()*50, name: specialists[0].name},
                    {value:120, name:specialists[1].name},
                    {value:134, name:specialists[2].name},
                    {value:35, name:specialists[3].name},
                ]
            }
        ]
    };
if (option && typeof option === "object") {
    myChart.setOption(option, true);
}
