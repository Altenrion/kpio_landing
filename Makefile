BUILDPATH=$(CURDIR)
GO=$(shell which go)
GOINSTALL=$(GO) install
GOCLEAN=$(GO) clean

APPNAME=landing
EXENAME=github.com/altenrion/tests/$(APPNAME)
IMAGENAME=landing

LATESTIMAGENAME=cc-allplus-go:5000/$(IMAGENAME):latest
NUMIMAGENAME=cc-allplus-go:5000/$(IMAGENAME):$(tag)
GOHOMEDIR=/home/altenrion/.go/src/github.com/altenrion/tests/$(APPNAME)

PORT=8080
TAG=0.0.1

tag=$(TAG)

inittvendor:
	cd $(GOHOMEDIR); govendor init ; govendor add +external

update:
	@echo "Updating vendor dependencies"
	cd $(GOHOMEDIR); govendor update +v ;

	@echo "----------------------------------------"

build:
	@echo "Prepare building...setting OS & build..."
	@echo "----------------------------------------"

	GOOG=linux go build -compiler gc -o $(APPNAME)
	docker build -t $(IMAGENAME) -t $(LATESTIMAGENAME) -t $(NUMIMAGENAME)  .
	@echo "----------------------------------------"

cleanbinary:
	@echo "Removing binary from local machine! "
	@echo "----------------------------------------"
	@rm -f $(APPNAME)
	@echo "Binary removed successfully! "
	@echo "----------------------------------------"

container: update build cleanbinary

run:
	docker run -d -p $(PORT):$(PORT) --name $(IMAGENAME) $(IMAGENAME)

destroy:
	docker stop $(IMAGENAME)
	docker rm $(IMAGENAME)

rerun: destroy container run

push:
	@echo "----------------------------------------"
	@echo "push Docker container ..."
	@echo "----------------------------------------"
	docker push $(LATESTIMAGENAME)
	docker push $(NUMIMAGENAME)
	@echo "----------------------------------------"
	@echo "Container pushed successfully! "
	@echo "----------------------------------------"

deploy: container push
