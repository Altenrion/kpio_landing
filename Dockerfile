FROM golang
RUN mkdir /app
ADD ./assets /app/assets/

ADD ./assets/index.html /app/assets/index.html
ADD ./assets/css /app/assets/css
ADD ./assets/scss /app/assets/scss
ADD ./assets/template /app/assets/template
ADD ./assets/js /app/assets/js

ADD kpio_landing /app/kpio_landing

ENTRYPOINT ["/app/kpio_landing"]
EXPOSE 80