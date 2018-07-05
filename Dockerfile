FROM golang
RUN mkdir /app
ADD ./assets /app/assets/

ADD ./assets/index.html /app/assets/index.html
ADD ./assets/css /app/assets/css
ADD ./assets/scss /app/assets/scss
ADD ./assets/template /app/assets/template
ADD ./assets/js /app/assets/js

ADD landing /app/landing

ENTRYPOINT ["/app/landing"]
EXPOSE 80