package main

import (
	"net/http"
	"log"
	"github.com/sirupsen/logrus"
	"html/template"
)

const ServicePort = "80"
const ServiceHost = "dcsp.vtb.ru"

func main() {

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("/app/assets"))))
	http.HandleFunc("/", RenderMainView)
	log.Fatal(http.ListenAndServe(":"+ServicePort, nil))
}

type PageVariables struct {
	PageTitle        string
	Host             string
	Port             string
}


func RenderMainView(w http.ResponseWriter, r *http.Request) {

	Title := "Платформа ДКО Landing"

	MyPageVariables := PageVariables{
		PageTitle:        Title,
		Host:             ServiceHost,
		Port:             ServicePort,
	}

	t := template.Must(template.New("index.html").ParseFiles("/app/assets/index.html"))

	err := t.Execute(w, MyPageVariables)
	if err != nil {
		logrus.Printf("template executing error: %s", err.Error())
	}
}