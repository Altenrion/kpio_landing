$(document).ready(function () {
    // FireUpdateForTest();


    $('body').on("click", "#RunFilters", function () {
        var dates = $("#date-range").val(),
            specialist = $("#SpecialistSelect").val(),
            filial = $("#FilialSelect").val(),
            uniq = $("#UniqCheck").is(":checked"),
            requestObject = {};


        var clearedDates = dates.split(" - ");
        var filtersList = {};

        if (specialist !== "") {
            filtersList["Lines"] = [specialist]
        }

        if (filial !== "") {
            filtersList["OrgStructure"] = [filial]
        }

        if (uniq === true) {
            filtersList["Uniq"] = ["true"]
        }


        requestObject = {
            "RequestId": 0,
            "RequestChannelHash": "",
            "VisualisationType": "area",
            "Model": "acsi",
            "Indicator": "VISITS",
            "Dates": [clearedDates[0], clearedDates[1]],
            "Filters": filtersList,
            "Groups": []
        };


        var visualisations = [
            {name: "SpecialistsPie", id: "ChartTest5"},
            {name: "AgesPie", id: "ChartTest7"},
            {name: "SpecialistsColumn", id: "ChartTest4"},
            {name: "FilialsPie", id: "ChartTest6"},
        ];


        visualisations.forEach(function (visualisation, i) {

            locObj = requestObject;
            var requestId = i + Math.floor(Date.now() / 1000),
                groups = [];

            switch (visualisation.name) {
                case "SpecialistsPie":

                    groups = [{"FieldName": "Id_line", "GroupType": "groupByField", "Criteria": []}];

                    break;
                case "AgesPie":
                    groups = [{"FieldName": "Hour", "GroupType": "groupByField", "Criteria": []}];

                    break;
                case "SpecialistsColumn":
                    groups = [
                        {"FieldName": "Date", "GroupType": "groupByField", "Criteria": []},
                        {"FieldName": "Id_line", "GroupType": "groupByField", "Criteria": []}
                    ];

                    break;

                case "FilialsPie":
                    groups = [{"FieldName": "Id_tree_division", "GroupType": "groupByField", "Criteria": []}];


                    break;
            }

            var ResponcedData = RequestBackend(locObj, groups, requestId, visualisation);


        });


    });
});

function RequestBackend(requestObject, gr, id, visualisation) {

    var FinishedRequest = requestObject;
    FinishedRequest.Groups = gr;
    FinishedRequest.RequestId = id;

    var url = 'http://'+window.location.hostname+'/count';

    $.post(url, JSON.stringify(FinishedRequest), function (data, textStatus) {

        // console.info(data, textStatus);

        var graphData = InitGraph(data);
        updateChartData(graphData, visualisation);

    }, "json");

}

function InitGraph(updatedData) {

    //todo: finish here correct logick of graph
    return updatedData
}

var UndefinedNodes=[];

function updateChartData(graphData, visualisation) {

    var Dom = document.getElementById(visualisation.id);
    var Chart = echarts.init(Dom);

    var adoptedData = AdoptGraphForVisualisation(graphData, visualisation.name);

    if (visualisation.name == "SpecialistsColumn") {


        var seriesFilled = [];
        adoptedData.series.forEach(function (row, i) {

            row.data.sort(function (a, b) {
                return new Date(a[0]) - new Date(b[0]);
            });
            seriesFilled.push({name: specialists[i].name, data: row.data, type: row.type})
        });

        adoptedData.xAxis.categories.shift();

        adoptedData.xAxis.categories.sort(function (a, b) {
            return new Date(a) - new Date(b);
        });

        // seriesFilled.

        var options = {
            plotOptions: adoptedData.plotOptions,
            yAxis: adoptedData.yAxis,
            legend: adoptedData.legend,
            xAxis: {
                data: adoptedData.xAxis.categories,
                silent: false,
                splitLine: {
                    show: false
                }
            },
            series: seriesFilled
        };

        var sum=0;
        seriesFilled.forEach(function(data, i, array){
            // console.log(data)
            sum +=data.data.length
        });
        console.log("finalised elements amount:", sum,"sum of finalised + undefined:", UndefinedNodes.length + sum,"series amount:", seriesFilled.length);

        console.log("finalised options:", options);
        Chart.setOption(options);

    } else {
        Chart.setOption({
            series: [
                {
                    data: adoptedData
                }
            ]
        });
    }

}

function AdoptGraphForVisualisation(graphData, visualisationType) {
    var data = [];

    // todo: finish here;
    switch (visualisationType) {
        case "SpecialistsPie":
            var data = graphData.series[0].data;

            reply = [];
            data.forEach(function (row, i) {
                num = parseInt(row.Name);
                console.log("num:", num, row.Name, specialists[num - 1]);
                reply.push({value: row.Value, name: specialists[num - 1] ? specialists[num - 1].name : "Other"})
            });

            return reply;

            break;
        case "FilialsPie":
            var data = graphData.series[0].data;

            reply = [];
            data.forEach(function (row, i) {
                num = parseInt(row.Name);
                reply.push({value: row.Value, name: filials[num - 1].name})
            });

            return reply;

            break;
        case "AgesPie":
            var data = graphData.series[0].data;

            reply = [];
            data.forEach(function (row, i) {
                num = parseInt(row.Name);
                reply.push({value: row.Value, name: age_groups[num - 1].name})
            });

            return reply;

            break;
        case "SpecialistsColumn":
            var data = graphData.series[0].data;

            let list = data;

            console.log("list amount:", list.length);


            //сортирую по нескольким полям
            list.sort(function(a, b) {
                return  a.Level - b.Level || a.ParentId - b.ParentId || a.Name > b.Name ;
            });

            var defColumnData = [];
            specialists.forEach(function (specialist) {
                defColumnData.push(specialist.name)
            });


            console.log("list",list);
            // add 0 object to list
            let container = new Composite(
            {
                Id: "0",
                ParentId: "0",
                Name: "000",
                Value: "0",
                BranchCount: "0",
                GroupingName: "Id_tree_division"
            }
            );

            UndefinedNodes=[];

            list.forEach((item, i) => {
                if (i <= 0) return;

                let comp = new Composite(item);
                container.add(comp);

                // let addStatus = container.addRecursive(comp);
                // console.log(addStatus);
                //
                // if (addStatus === false){
                //     UndefinedNodes.push(item);
                //     return;
                // };
            });

            // console.log("undefined amount:", UndefinedNodes.length, UndefinedNodes);
            console.log("container amount:", container.getAmount());

            let config = container.getConfig(2);

            // console.log("config:", config);

            config.plotOptions = {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            };
            config.legend = {
                data: defColumnData, //тут надо получать список полей динамиччески
                // align: 'left'
            };
            config.chart = {
                type: 'column'
            };

            return config;

            break;
    }

    return data;
}

function FireUpdateForTest() {
    var SpecialistsPieDom = document.getElementById("ChartTest5");
    var SpecialistsPie = echarts.init(SpecialistsPieDom);

    var SpecialistsColumnDom = document.getElementById("ChartTest4");
    var SpecialistsColumn = echarts.init(SpecialistsColumnDom);

    var FilialsPieDom = document.getElementById("ChartTest6");
    var FilialsPie = echarts.init(FilialsPieDom);


    var AgesPieDom = document.getElementById("ChartTest7");
    var AgesPie = echarts.init(AgesPieDom);


    //here i test updates of data
    setInterval(function () {
        console.log(specialists[0].name);

        SpecialistsPie.setOption({
            series: [
                {
                    data: [
                        {value: Math.random() * 50, name: specialists[0].name},
                        {value: 120, name: specialists[1].name},
                        {value: 134, name: specialists[2].name},
                        {value: 35, name: specialists[3].name},
                    ]
                }
            ]
        });

        FilialsPie.setOption({
            series: [
                {
                    data: genData().seriesData,
                }
            ]
        });

        AgesPie.setOption({
            series: [
                {
                    data: [
                        {value: (Math.floor(Math.random() * 70) + 1), name: age_groups[0].name},
                        {value: (Math.floor(Math.random() * 70) + 1), name: age_groups[1].name},
                        {value: (Math.floor(Math.random() * 70) + 1), name: age_groups[2].name},
                        {value: (Math.floor(Math.random() * 70) + 1), name: age_groups[3].name},
                        {value: (Math.floor(Math.random() * 70) + 1), name: age_groups[4].name},
                        {value: (Math.floor(Math.random() * 70) + 1), name: age_groups[5].name},
                        {value: (Math.floor(Math.random() * 70) + 1), name: age_groups[6].name},
                        {value: (Math.floor(Math.random() * 44) + 1), name: age_groups[7].name},
                        {value: (Math.floor(Math.random() * 70) + 1), name: age_groups[8].name},
                        {value: (Math.floor(Math.random() * 70) + 1), name: age_groups[9].name}
                    ]
                }
            ]
        });

        var data1 = [];
        var data2 = [];
        var data3 = [];
        for (var i = 0; i < 100; i++) {
            xAxisData.push('2017-' + i);
            data1.push((Math.sin(i / 5) * (i / 5 - (Math.floor(Math.random() * 6) + 1)) + i / 6) * (Math.floor(Math.random() * 5) + 1));
            data2.push((Math.cos(i / 5) * (i / 5 - Math.random()) + i / 6) * (Math.floor(Math.random() * 6) + 1));
            data3.push(((i / 5) - 20) * (i / 5 - Math.random()) + i / (Math.floor(Math.random() * 3) + 1));
        }

        SpecialistsColumn.setOption({
            series: [{
                name: specialists[0].name,
                type: 'bar',
                data: data1,
                animationDelay: function (idx) {
                    return idx * 10;
                }
            }, {
                name: specialists[1].name,
                type: 'bar',
                data: data2,
                animationDelay: function (idx) {
                    return idx * 10 + 100;
                },

            }, {
                name: specialists[2].name,
                type: 'bar',
                data: data3,
                animationDelay: function (idx) {
                    return idx * 10 + 200;
                },
            }]

        });

    }, 3000);
}

// {"FieldName":"Hour", "GroupType":"groupByCriteria", "Criteria": [
//         {"CriterionName":"Утро", "CriterionOperand":"between", "CriterionValues": [7, 13]},
//         {"CriterionName":"День", "CriterionOperand" : "between", "CriterionValues": [13, 17]},
//         {"CriterionName":"Вечер", "CriterionOperand":"between", "CriterionValues": [18, 21]}]}
