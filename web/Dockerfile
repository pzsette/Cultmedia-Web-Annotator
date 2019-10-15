FROM python:3.5
ENV PYTHONUNBUFFERED 1

WORKDIR /tmp/ffmpeg
COPY ./install/ffmpeg/ffmpeg-release-64bit-static.tar.xz ./docker-
RUN tar xf ffmpeg-release-64bit-static.tar.xz
RUN mv ./ffmpeg-3.4.2-64bit-static/ffmpeg /usr/bin/ffmpeg

RUN rm -R /tmp/ffmpeg

 RUN mkdir /code
 WORKDIR /code
 RUN apt-get update && apt-get install -y \
  default-mysql-client \
  zip \
  dtrx
 ADD requirements.txt /code/
 RUN pip install -r requirements.txt
 ADD . /code/