Необходимо преодолеть следующие проблемы чтобы все получилось в срок: 

   
1. Reuse common fields for demonstration purposes +

```
 Date             string  = date
 Hour             int     = age_group_id
 Id_user          int     = policy_id
 Id_line          float64 = speciality_id
 Id_region        int     =
 Id_tree_division int     = filial_id
 A1_1                     = 1 - кол-во обращений

```
Пример заполнения поля :

```
policy_id:       61351096,    //уникальные/не уникальные  - фильтровать надо
date:            13.06.2017,  //преобразовать в нужный формат YYYY-mm-dd
speciality_id:   Акушерство и гинекология,
filial_id:       Филиал Краснодарский,
age_group_id:    3
```

Структура отправки запроса на расчет : 
```
type KpiCountRequest struct {
	RequestId          int
	RequestChannelHash string
	VisualisationType  string
	Model              string
	Indicator          string

	Dates   []string
	Filters models.Filters
	Groups  models.GroupInstruction
}
    
```


Актуальные списки полей: 
```
Специалист:
1 "Акушерство и гинекология"
2 "Терапия"
3 "Хирургия"
4 "Прочие"

Филиал:
1 Филиал Владивостокский
2 Филиал Волгоградский
3 Филиал Ижевский
4 Филиал Иркутский
5 Филиал Казанский
6 Филиал Калининградский
7 Филиал Кемеровский
8 Филиал Краснодарский
9 Филиал Нижегородский
10 Филиал Оренбургский
11 Филиал Пермский
12 Филиал Ростовский
13 Филиал Самарский
14 Филиал Саратовский
15 Филиал Ставропольский
16 Филиал Тюменский
17 Филиал Уфимский
18 Филиал Хабаровский
19 Иное

Группы возрастов
1 20+
2 25+
3 30+
4 35+
5 40+
6 45+
7 50+
8 55+
9 60+
10 65+

```

**Milestone**:
- [x] Write correct requests for all charts independantly to fire
- [x] Start counter and cash-manager containers

- [x] Open Http interface on Counter side to get requests
- [x] Insert data into Redis cache some how

- [x] Connect all stuff
- [x] Write descriptor that will know how to give data to any chart on JS side (graph, charts specific adoptions)

- [ ] Create new filters on Go side (Specialist, unique...)
- [ ] Test all
- [ ] Run in cloud