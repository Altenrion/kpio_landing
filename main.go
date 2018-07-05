package main

import (
	"net/http"
	"log"
	"github.com/sirupsen/logrus"
	"html/template"
	"encoding/json"
	"github.com/altenrion/kpio/models"
	"time"
	"github.com/nats-io/go-nats"
	"bytes"
	"gopkg.in/redis.v5"
	"os"
	"crypto/md5"
	"encoding/hex"
	"github.com/rs/cors"
)


var RedisClient *redis.Client
var NatsClient *nats.EncodedConn

var RedisIP = os.Getenv("REDIS_HOST")
var cachePassword = ""
var NatsHost = os.Getenv("NATS_HOST")

var ServicePort = os.Getenv("PORT")
var ServiceHost = os.Getenv("HOST")


//const ServicePort = "80"
//const ServiceHost = "dcsp.vtb.ru"
//const ServiceHost = "localhost"



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

type KpiCountResponse struct {
	RequestId int      `json:"requestId"`
	Series    []Series `json:"series"`
	Error     string   `json:"error"`
}

type Series struct {
	Type string      `json:"type"`
	Name string      `json:"name"`
	Data interface{} `json:"data"`
}

func CoverHttp(w http.ResponseWriter, r *http.Request) {

	log.Printf("Entered HTTP")
	var request KpiCountRequest

	decoder := json.NewDecoder(r.Body)
	defer r.Body.Close()

	err := decoder.Decode(&request)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err != nil {
		log.Printf("JSON HTTP unmarshal error: %s", err.Error())
	} else {
		log.Printf("JSON HTTP SUCCESS ++++++")
		response := PublishRequest(request)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
	}
}

func GetMD5Hash(text string) string {
	hasher := md5.New()
	hasher.Write([]byte(text))
	return hex.EncodeToString(hasher.Sum(nil))
}

func PublishRequest(template KpiCountRequest) KpiCountResponse{

	timeStamp := time.Now()
	queueHash := GetMD5Hash(timeStamp.String())

	request := &KpiCountRequest{
		RequestId:          template.RequestId,
		Dates:              template.Dates,
		Model:              template.Model,
		VisualisationType:  template.VisualisationType,
		Indicator:          template.Indicator,
		RequestChannelHash: queueHash,
		Groups:             template.Groups,
	}

	responseChannel := make(chan KpiCountResponse)

	errPub := NatsClient.Publish("kpio.count", request)
	if errPub != nil {
		logrus.Printf("Error on  sending : %d, %+v", template.RequestId, request)
	} else {

		NatsClient.Subscribe(queueHash, func(m *nats.Msg) {

			response := KpiCountResponse{}

			dec := json.NewDecoder(bytes.NewReader(m.Data))
			if err := dec.Decode(&response); err != nil {
				logrus.Printf("Error while parsing buffer: %s", m.Data)
			} else {
				logrus.Infof("Data parsed successfully : amount of treeNodes: %+d", len(response.Series))
				responseChannel <- response
			}

			unSubErr := m.Sub.Unsubscribe()
			if unSubErr != nil {
				logrus.Infof("Error on un subscribing from %s with %b ", m.Sub.Subject, m.Data)
			}
		})
	}

	incomeResponce := <-responseChannel
	return incomeResponce
}


func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}


func init() {

	cacheAddr := getEnv("REDIS_HOST", "0.0.0.0:6379")
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     cacheAddr,
		Password: cachePassword,
	})

	logrus.Printf("Redis status : %s", RedisClient.Ping())

	natsAddr := getEnv("NATS_HOST", "nats://0.0.0.0:4222")
	nc, err1 := nats.Connect(natsAddr)
	if err1 != nil {
		logrus.Printf("Nats error 1: %s", err1)
	}
	var natsErr error
	NatsClient, natsErr = nats.NewEncodedConn(nc, nats.JSON_ENCODER)
	if natsErr != nil {
		logrus.Printf("Nats error 2: %s", natsErr)
	} else {
		//@todo: make here messaging that the service was added to the pipe of MQ
		//NatsClient.Publish("connection", "Service: cache_scheduler")
		logrus.Printf("Nats success connection: %s", NatsClient.Conn.ConnectedServerId())
	}
}


func main() {


	mux := http.NewServeMux()
	//mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
	//	w.Header().Set("Content-Type", "application/json")
	//	w.Write([]byte("{\"hello\": \"world\"}"))
	//})
	mux.HandleFunc("/count", CoverHttp)
	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("/app/assets"))))
	mux.HandleFunc("/", RenderMainView)

	handler := cors.Default().Handler(mux)
	http.ListenAndServe(":"+ServicePort, handler)


	//http.HandleFunc("/count", CoverHttp)
	//http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("/app/assets"))))
	//http.HandleFunc("/", RenderMainView)
	//log.Fatal(http.ListenAndServe(":"+ServicePort, nil))
}

type PageVariables struct {
	PageTitle        string
	Host             string
	Port             string
}


func RenderMainView(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

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