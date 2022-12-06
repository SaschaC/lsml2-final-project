FROM ubuntu:20.04

ENV APP_NAME="brats"
ENV USER=root
ENV HOME=/root

# Install dependencies
RUN apt-get update && apt-get install -y software-properties-common
RUN add-apt-repository ppa:deadsnakes/ppa

RUN apt-get install -y zip unzip

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
	build-essential \
        curl \
        gcc \
        g++ \
        python3.8-dev \
        python3-pip \
        python3.8 \
        libopenmpi-dev \
        libsm6 \
        libxext6 \
        libxrender-dev \
        libglib2.0-0

# install flask
RUN python3.8 -m pip install pip
RUN python3.8 -m pip install --upgrade pip

RUN python3.8 -m pip install flask==2.1.3 flask_cors flask_session werkzeug==2.0.2

# install numpy
RUN python3.8 -m pip install numpy

# install tritonclient
RUN python3.8 -m pip install tritonclient[all]

# install pymongo, nibabel
RUN python3.8 -m pip install pymongo nibabel

# install uwsgi
RUN python3.8 -m pip install uwsgi

# install pyyaml
RUN python3.8 -m pip install pyyaml

# install bcrypt
RUN python3.8 -m pip install bcrypt

# install jwt
RUN python3.8 -m pip install pyjwt

# install simpleitk
RUN python3.8 -m pip install SimpleITK

# install opencv
RUN python3.8 -m pip install opencv-python==4.1.2.30

# copy src  
COPY src /root/src

RUN ln -s /usr/bin/python3.8 /usr/bin/python

# set workdir
WORKDIR /root/src




