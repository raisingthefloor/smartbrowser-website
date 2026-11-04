FROM nginx:1.30.5-alpine3.24
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY public/. /usr/share/nginx/html/.
