class Composite {
    constructor(obj) {
        this.Value = obj.Value;
        this.Name = obj.Name ? obj.Name : "name";
        this.level = obj.Level ? obj.Level : 0;
        this.children = [];
        this.parent = obj;
        this.Id = obj.Id;
        this.ParentId = obj.ParentId;
    }

    getAmount() {
        let amount = 1;
        // console.log("CounterInfo:", this.children.length, this.Id, this.ParentId, this.level);

        if (this.level == 2 && this.children.length > 0){
            console.log("strange object:",this)
        }

        if (this.children.length == 0) {
            return amount;
        }
        this.children.forEach(child => {
            amount += child.getAmount();
        });
        return amount;
    }

    //пока не корректно работает
    add(obj) {
        if (this.Id == obj.ParentId) {

            obj.parent = this;
            this.children.push(obj);
            return;
        }
        this.children.forEach(child => {

            child.add(obj);
        });
    }



    addRecursive(obj) {
        var BreakException = {};

        //если совпадает связка Id и ParentId - свяжи их
        if (this.Id == obj.ParentId) {
            obj.parent = this;
            this.children.push(obj);
            return true;
        }

        //если есть дети, пройдись по ним с тем же вопросом
        if(this.children.length > 0){
            try {
                this.children.forEach(child => {
                    let status = child.addRecursive(obj);
                    if (status === true) throw BreakException;

                });
            } catch (e) {
                if (e !== BreakException) return true;
            }
        }

        return false;
    }


    area() {
        let config = {};
        config.series = [{
            data: [],
        }];


        this.children.forEach(child => {
            config.series[0].data.push({
                name: child.parent.Name,
                y: Number(child.children[0].parent.Value)
            })
        });



        return config;
    }

    getConfig(grDeph) {

        // создаем объект конфига
        let nodeConfig = {
            series: [],
            xAxis: {
                categories: []
            }
        };

        //узел первой группировки
        if (this.level == 1) {
            nodeConfig.xAxis.categories.push(this.Name)

            // узлы 2 и более группировок
        } else if(this.level >1){

            //тут был switch
            // { name: Name, value: [ date, value ] }
            let dataObj = {
                name: this.Name,
                data: [[this.parent.Name, parseFloat(this.Value)]],
                type: 'bar', // todo: must be dynamic
            };
            nodeConfig.series.push(dataObj);
        }

        //если нет детей возвращаем конфиг
        if (this.children.length == 0) return nodeConfig;


        ////////////////////////////////////////
        // тут логика обработки детей //////////
        ////////////////////////////////////////

        let childrenData = [];

        // тут лежат поля группировки для Series
        let labels = [];

        // тут перебираем детей, должна быть рекурсия
        this.children.forEach((child => {

            let childConfig = child.getConfig(grDeph);

            if (child.level == 1) {
                //тут надо влить в childrenData  всех детей
                nodeConfig.xAxis.categories.push(childConfig.xAxis.categories[0]);
            }

            if(childConfig.series.length == 0) return;

            let obj = childConfig.series[0];
            let label = obj.name;
            let value = obj.data[0];
            // console.log("check for value:",value, "label:", label , labels,"children:", this.children.length, "level:", child.level);

            //если в любой из сериес есть лейбл добавь туда новое значение вэлью
            let labelId = labels.indexOf(label);


            if (child.level == 1) {

                childConfig.series.forEach(function (data, index, array) {
                    childrenData.push(data);
                });
                // console.log("childrenData:",childrenData);
            }

            if (child.level == 2) {

                // если в Сериес текущего объекта есть пришедшее название группировки от ребенка
                if (labelId != -1) {
                    nodeConfig.series[labelId].data.concat(value)
                } else {
                    // console.log("сливаю вместе:", nodeConfig.series, obj, labels,labelId, label);
                    nodeConfig.series.push(obj)
                }
            }

            nodeConfig.series.forEach((data, i) => {
                labels.push(data.name);

                let uniqueArray = labels.filter(function(item, pos, self) {
                    return self.indexOf(item) == pos;
                });
                labels = uniqueArray
            });
        }));

        let seriesTmp = [];
        childrenData.forEach(function (row, index, array) {

            (seriesTmp[row.name] = seriesTmp[row.name] ? seriesTmp[row.name] : []).push(row.data[0]);

        });

        let series = [];
        seriesTmp.forEach(function (row, index, array) {
            series.push({data: row, name: index, type:"bar"})
        });
        // console.log("Series:", series);
        // console.log("итог:", nodeConfig, "# ",this.level);


        // if(this.level)
        if(series.length > 0){
            nodeConfig.series = series
        }

        // console.log("nodeConfig:",nodeConfig);
        return nodeConfig
    }

    getChildren() {
        return this.children;
    }

    getElement() {
        return this.parent;
    }
}


//
// let dataq = {
//     Series: [{
//         Type: "area",
//         Name: "ACSI",
//         Data: [{
//             Id: "0",
//             ParentId: "0",
//             Name: "000",
//             Value: "0",
//             BranchCount: "0",
//             GroupingName: "Id_tree_division"
//         }, {
//             Id: "1",
//             ParentId: "0",
//             Name: "617",
//             Value: "0",
//             BranchCount: "0",
//             GroupingName: "Id_tree_division"
//         },
//             {
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "2",
//                 ParentId: "0",
//                 Name: "835",
//                 Value: "0"
//             },
//             {
//                 GroupingName: "Id_tree_division",
//                 Id: "3",
//                 ParentId: "0",
//                 Name: "815",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "4",
//                 ParentId: "0",
//                 Name: "31",
//                 Value: "0",
//                 Level: "1",
//                 Children: "<nil>"
//             },
//             {
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "12",
//                 ParentId: "2",
//                 Name: "Other",
//                 Value: "4.779661016949152"
//             },
//             {
//                 Id: "5",
//                 ParentId: "0",
//                 Name: "860",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division"
//             },
//             {
//                 Id: "6",
//                 ParentId: "0",
//                 Name: "74",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division"
//             },
//             {
//                 GroupingName: "Hour",
//                 Id: "14",
//                 ParentId: "4",
//                 Name: "Other",
//                 Value: "4.82319391634981",
//                 Level: "2",
//                 BranchCount: "1"
//             },
//             {
//                 ParentId: "6",
//                 Name: "16",
//                 Value: "4.8076923076923075",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "16"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "7",
//                 ParentId: "0",
//                 Name: "608",
//                 Value: "0",
//                 Level: "1"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "8",
//                 ParentId: "0",
//                 Name: "606",
//                 Value: "0",
//                 Level: "1"
//             },
//             {
//                 Name: "75",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "9",
//                 ParentId: "0"
//             },
//             {
//                 Value: "4.773584905660377",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "15",
//                 ParentId: "5",
//                 Name: "Other"
//             },
//             {
//                 ParentId: "9",
//                 Name: "Other",
//                 Value: "4.88785046728972",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "19"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "10",
//                 ParentId: "0",
//                 Name: "71",
//                 Value: "0",
//                 Level: "1"
//             },
//             {
//                 Name: "616",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "11",
//                 ParentId: "0"
//             },
//             {
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "12",
//                 ParentId: "0",
//                 Name: "82",
//                 Value: "0"
//             },
//             {
//                 GroupingName: "Hour",
//                 Id: "18",
//                 ParentId: "8",
//                 Name: "Other",
//                 Value: "4.371584699453552",
//                 Level: "2",
//                 BranchCount: "1"
//             },
//             {
//                 ParentId: "3",
//                 Name: "Other",
//                 Value: "4.888610763454318",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "13"
//             },
//             {
//                 Name: "Other",
//                 Value: "4.789812067260138",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "2",
//                 ParentId: "1"
//             },
//             {
//                 Value: "4.670278637770898",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "20",
//                 ParentId: "10",
//                 Name: "Other"
//             },
//             {
//                 ParentId: "7",
//                 Name: "Other",
//                 Value: "4.701590784421284",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "17"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "13",
//                 ParentId: "0",
//                 Name: "653",
//                 Value: "0",
//                 Level: "1"
//             },
//             {
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "111",
//                 ParentId: "11",
//                 Name: "16",
//                 Value: "4.735849056603773",
//                 Level: "2"
//             },
//             {
//                 Name: "Other",
//                 Value: "4.789409368635438",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "112",
//                 ParentId: "12"
//             },
//             {
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "14",
//                 ParentId: "0",
//                 Name: "753"
//             },
//             {
//                 ParentId: "13",
//                 Name: "Other",
//                 Value: "4.918918918918919",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "113"
//             },
//             {
//                 Name: "834",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "15",
//                 ParentId: "0"
//             },
//             {
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "16",
//                 ParentId: "0",
//                 Name: "810",
//                 Value: "0"
//             },
//             {
//                 GroupingName: "Id_tree_division",
//                 Id: "17",
//                 ParentId: "0",
//                 Name: "640",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0"
//             },
//             {
//                 ParentId: "0",
//                 Name: "824",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "18"
//             },
//             {
//                 Name: "Other",
//                 Value: "4.833333333333333",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "118",
//                 ParentId: "18"
//             },
//             {
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "114",
//                 ParentId: "14",
//                 Name: "Other",
//                 Value: "4.74063670411985"
//             },
//             {
//                 GroupingName: "Id_tree_division",
//                 Id: "19",
//                 ParentId: "0",
//                 Name: "671",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0"
//             },
//             {
//                 ParentId: "0",
//                 Name: "29",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "20"
//             },
//             {
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "117",
//                 ParentId: "17",
//                 Name: "Other",
//                 Value: "4.687074829931973",
//                 Level: "2"
//             },
//             {
//                 Name: "Other",
//                 Value: "4.913412563667233",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "116",
//                 ParentId: "16"
//             },
//             {
//                 Value: "4.804911323328786",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "120",
//                 ParentId: "20",
//                 Name: "Other"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "21",
//                 ParentId: "0",
//                 Name: "81",
//                 Value: "0",
//                 Level: "1",
//                 Children: "<nil>"
//             },
//             {
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "22",
//                 ParentId: "0",
//                 Name: "855"
//             },
//             {
//                 ParentId: "0",
//                 Name: "79",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "23"
//             },
//
//             {
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "115",
//                 ParentId: "15",
//                 Name: "Other",
//                 Value: "4.746192893401015",
//                 Level: "2"
//             },
//             {
//                 Name: "607",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "24",
//                 ParentId: "0"
//             },
//             {
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "122",
//                 ParentId: "22",
//                 Name: "Other",
//                 Value: "4.730769230769231"
//             },
//             {
//                 GroupingName: "Hour",
//                 Id: "119",
//                 ParentId: "19",
//                 Name: "Other",
//                 Value: "4.813256180957391",
//                 Level: "2",
//                 BranchCount: "1"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "25",
//                 ParentId: "0",
//                 Name: "80",
//                 Value: "0",
//                 Level: "1",
//                 Children: "<nil>"
//             },
//             {
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "26",
//                 ParentId: "0",
//                 Name: "618",
//                 Value: "0"
//             },
//             {
//                 Id: "123",
//                 ParentId: "23",
//                 Name: "16",
//                 Value: "4.757612667478685",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour"
//             },
//             {
//                 GroupingName: "Hour",
//                 Id: "124",
//                 ParentId: "24",
//                 Name: "Other",
//                 Value: "4.589068825910931",
//                 Level: "2",
//                 BranchCount: "1"
//             },
//             {
//                 ParentId: "21",
//                 Name: "Other",
//                 Value: "4.8182119205298015",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "121"
//             },
//             {
//                 Name: "610",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "27",
//                 ParentId: "0"
//             },
//             {
//                 Value: "4.816301703163017",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "126",
//                 ParentId: "26",
//                 Name: "Other"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "28",
//                 ParentId: "0",
//                 Name: "654",
//                 Value: "0",
//                 Level: "1",
//                 Children: "<nil>"
//             },
//             {
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "127",
//                 ParentId: "27",
//                 Name: "Other",
//                 Value: "4.6686046511627906"
//             },
//             {
//                 GroupingName: "Id_tree_division",
//                 Id: "29",
//                 ParentId: "0",
//                 Name: "604",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "30",
//                 ParentId: "0",
//                 Name: "648",
//                 Value: "0",
//                 Level: "1",
//                 Children: "<nil>"
//             },
//             {
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "31",
//                 ParentId: "0",
//                 Name: "833"
//             },
//             {
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "129",
//                 ParentId: "29",
//                 Name: "Other",
//                 Value: "4.67984693877551",
//                 Level: "2",
//                 Children: "<nil>"
//             },
//             {
//                 Value: "4.776623376623377",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "125",
//                 ParentId: "25",
//                 Name: "Other"
//             },
//             {
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "128",
//                 ParentId: "28",
//                 Name: "Other",
//                 Value: "4.760233918128655",
//                 Level: "2",
//                 Children: "<nil>"
//             },
//             {
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "32",
//                 ParentId: "0",
//                 Name: "27",
//                 Value: "0"
//             },
//             {
//                 Id: "130",
//                 ParentId: "30",
//                 Name: "Other",
//                 Value: "4.840301003344481",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour"
//             },
//             {
//                 Id: "131",
//                 ParentId: "31",
//                 Name: "Other",
//                 Value: "4.816890292028414",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour"
//             },
//             {
//                 GroupingName: "Id_tree_division",
//                 Id: "33",
//                 ParentId: "0",
//                 Name: "636",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0"
//             },
//             {
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "132",
//                 ParentId: "32",
//                 Name: "Other",
//                 Value: "4.734104046242774",
//                 Level: "2",
//                 Children: "<nil>"
//             },
//             {
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "34",
//                 ParentId: "0",
//                 Name: "652",
//                 Value: "0"
//             },
//             {
//                 GroupingName: "Hour",
//                 Id: "134",
//                 ParentId: "34",
//                 Name: "Other",
//                 Value: "5",
//                 Level: "2",
//                 BranchCount: "1"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "35",
//                 ParentId: "0",
//                 Name: "1",
//                 Value: "0",
//                 Level: "1",
//                 Children: "<nil>"
//             },
//             {
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "36",
//                 ParentId: "0",
//                 Name: "613"
//             },
//             {
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "135",
//                 ParentId: "35",
//                 Name: "18",
//                 Value: "5",
//                 Level: "2",
//                 Children: "<nil>"
//             },
//             {
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "37",
//                 ParentId: "0",
//                 Name: "672",
//                 Value: "0"
//             },
//             {
//                 Id: "38",
//                 ParentId: "0",
//                 Name: "30",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division"
//             },
//             {
//                 GroupingName: "Id_tree_division",
//                 Id: "39",
//                 ParentId: "0",
//                 Name: "40",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0"
//             },
//             {
//                 ParentId: "0",
//                 Name: "752",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "40"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "41",
//                 ParentId: "0",
//                 Name: "78",
//                 Value: "0",
//                 Level: "1"
//             },
//             {
//                 Name: "637",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "42",
//                 ParentId: "0"
//             },
//             {
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "43",
//                 ParentId: "0",
//                 Name: "698",
//                 Value: "0"
//             },
//             {
//                 GroupingName: "Id_tree_division",
//                 Id: "44",
//                 ParentId: "0",
//                 Name: "94",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "45",
//                 ParentId: "0",
//                 Name: "619",
//                 Value: "0",
//                 Level: "1",
//                 Children: "<nil>"
//             },
//             {
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "46",
//                 ParentId: "0",
//                 Name: "42"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "47",
//                 ParentId: "0",
//                 Name: "87",
//                 Value: "0",
//                 Level: "1",
//                 Children: "<nil>"
//             },
//             {
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "48",
//                 ParentId: "0",
//                 Name: "650"
//             },
//
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "49",
//                 ParentId: "0",
//                 Name: "88",
//                 Value: "0",
//                 Level: "1",
//                 Children: "<nil>"
//             },
//             {
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "50",
//                 ParentId: "0",
//                 Name: "85",
//                 Value: "0"
//             },
//             {
//                 GroupingName: "Id_tree_division",
//                 Id: "51",
//                 ParentId: "0",
//                 Name: "32",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0"
//             },
//             {
//                 ParentId: "0",
//                 Name: "649",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "52"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "53",
//                 ParentId: "0",
//                 Name: "821",
//                 Value: "0",
//                 Level: "1"
//             },
//             {
//                 Name: "46",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "54",
//                 ParentId: "0"
//             },
//             {
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "55",
//                 ParentId: "0",
//                 Name: "84",
//                 Value: "0"
//             },
//             {
//                 GroupingName: "Id_tree_division",
//                 Id: "56",
//                 ParentId: "0",
//                 Name: "612",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0"
//             },
//             {
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "57",
//                 ParentId: "0",
//                 Name: "615",
//                 Value: "0",
//                 Level: "1",
//                 Children: "<nil>"
//             },
//             {
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division",
//                 Id: "58",
//                 ParentId: "0",
//                 Name: "39",
//                 Value: "0"
//             },
//             {
//                 Id: "59",
//                 ParentId: "0",
//                 Name: "83",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0",
//                 GroupingName: "Id_tree_division"
//             },
//             {
//                 GroupingName: "Id_tree_division",
//                 Id: "60",
//                 ParentId: "0",
//                 Name: "614",
//                 Value: "0",
//                 Level: "1",
//                 BranchCount: "0"
//             },
//             {
//                 ParentId: "40",
//                 Name: "Other",
//                 Value: "5",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "140"
//             },
//             {
//                 Name: "Other",
//                 Value: "5",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "154",
//                 ParentId: "54"
//             },
//             {
//                 Value: "4.842236024844721",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "139",
//                 ParentId: "39",
//                 Name: "Other"
//             },
//             {
//                 ParentId: "50",
//                 Name: "16",
//                 Value: "4.793303017775941",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "150"
//             },
//             {
//                 Name: "Other",
//                 Value: "4.810964083175803",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "159",
//                 ParentId: "59"
//             },
//             {
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "155",
//                 ParentId: "55",
//                 Name: "18",
//                 Value: "4.805821205821206"
//             },
//             {
//                 Id: "141",
//                 ParentId: "41",
//                 Name: "Other",
//                 Value: "4.787425149700598",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour"
//             },
//             {
//                 GroupingName: "Hour",
//                 Id: "138",
//                 ParentId: "38",
//                 Name: "Other",
//                 Value: "4.775291828793774",
//                 Level: "2",
//                 BranchCount: "1"
//             },
//             {
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "152",
//                 ParentId: "52",
//                 Name: "Other",
//                 Value: "4.867298578199052",
//                 Level: "2",
//                 Children: "<nil>"
//             },
//             {
//                 Value: "4.597966728280961",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "144",
//                 ParentId: "44",
//                 Name: "Other"
//             },
//             {
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "158",
//                 ParentId: "58",
//                 Name: "Other",
//                 Value: "4.82120253164557",
//                 Level: "2",
//                 Children: "<nil>"
//             },
//             {
//                 Value: "5",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "153",
//                 ParentId: "53",
//                 Name: "Other"
//             },
//             {
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "143",
//                 ParentId: "43",
//                 Name: "18",
//                 Value: "4.783018867924528",
//                 Level: "2",
//                 Children: "<nil>"
//             },
//             {
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "133",
//                 ParentId: "33",
//                 Name: "Other",
//                 Value: "4.7380170715692715"
//             },
//             {
//                 GroupingName: "Hour",
//                 Id: "148",
//                 ParentId: "48",
//                 Name: "Other",
//                 Value: "4.777777777777778",
//                 Level: "2",
//                 BranchCount: "1"
//             },
//             {
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "147",
//                 ParentId: "47",
//                 Name: "Other",
//                 Value: "4.828742937853107",
//                 Level: "2",
//                 Children: "<nil>"
//             },
//             {
//                 Value: "4.8243559718969555",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "151",
//                 ParentId: "51",
//                 Name: "Other"
//             },
//             {
//                 ParentId: "46",
//                 Name: "18",
//                 Value: "4.504424778761062",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "146"
//             },
//             {
//                 Name: "Other",
//                 Value: "4.815217391304348",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "145",
//                 ParentId: "45"
//             },
//             {
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "157",
//                 ParentId: "57",
//                 Name: "Other",
//                 Value: "4.8145977623867875"
//             },
//             {
//                 Id: "136",
//                 ParentId: "36",
//                 Name: "Other",
//                 Value: "4.765983860955928",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour"
//             },
//             {
//                 GroupingName: "Hour",
//                 Id: "149",
//                 ParentId: "49",
//                 Name: "Other",
//                 Value: "4.773787313432836",
//                 Level: "2",
//                 BranchCount: "1"
//             },
//             {
//                 ParentId: "60",
//                 Name: "Other",
//                 Value: "4.765486725663717",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "160"
//             },
//             {
//                 Name: "18",
//                 Value: "4.7707036859741505",
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "156",
//                 ParentId: "56"
//             },
//             {
//                 Level: "2",
//                 BranchCount: "1",
//                 GroupingName: "Hour",
//                 Id: "137",
//                 ParentId: "37",
//                 Name: "16",
//                 Value: "4.791648913506604"
//             },
//             {
//                 GroupingName: "Hour",
//                 Id: "142",
//                 ParentId: "42",
//                 Name: "18",
//                 Value: "4.6940836940836945",
//                 Level: "2",
//                 BranchCount: "1"
//             }
//         ]
//     }]
// };
//
// let list = dataq.Series[0].Data;
//
//
// // add 0 object to list
// let container = new Composite(data.Series[0].Data[0]);
//
// list.forEach((item, i) => {
//     if (i > 0) {
//         let comp = new Composite(item);
//         container.add(comp);
//     }
// });
//
// console.log(container.getAmount());
// let config = container.getConfig(2);
// console.log(config);
//
// config.yAxis = {
//     min: 0,
//     title: {
//         text: 'Rainfall (mm)'
//     }
// };
// config.plotOptions = {
//     column: {
//         pointPadding: 0.2,
//         borderWidth: 0
//     }
// };
// config.chart = {
//     type: 'column'
// };

// Highcharts.chart('container', config);
