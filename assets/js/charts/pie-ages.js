var dom = document.getElementById("ChartTest7");
var myChart = echarts.init(dom);
var app = {};

option = null;

//here i get age_groups
var defAgesData = [];
age_groups.forEach(function(age_group) {
    defAgesData.push(age_group.name)
});

option = {
    title : {
        text: 'Возраст',
        subtext: 'По группам',
        x:'left'
    },
    tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
        x : 'right',
        orient: 'vertical',
        // right: "-20px",
        // top: 20,
        // bottom: 20,
        y : 'center',
        data: defAgesData //
    },
    toolbox: {
        // x: '80%',
        show : true,
        feature : {
            mark : {show: true},
            dataView : {show: true, readOnly: false},
            magicType : {
                show: true,
                type: ['pie', 'funnel']
            },
            restore : {show: true},
            saveAsImage : {show: true}
        }
    },
    calculable : true,
    series : [
        {
            name:'Возрастная группа',
            type:'pie',
            radius : [40, 170],
            center : ['45%', '50%'],
            roseType : 'area',
            data:[
                {value:10, name:age_groups[0].name},
                {value:5, name:age_groups[1].name},
                {value:25, name:age_groups[2].name},
                {value:65, name:age_groups[3].name},
                {value:20, name:age_groups[4].name},
                {value:55, name:age_groups[5].name},
                {value:80, name:age_groups[6].name},
                {value:40, name:age_groups[7].name},
                {value:20, name:age_groups[8].name},
                {value:40, name:age_groups[9].name}
            ]
        }
    ]
};
;
if (option && typeof option === "object") {
    myChart.setOption(option, true);
}
