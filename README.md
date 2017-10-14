# Snapperstore

## Sample image, audio, and video upload client &amp; server


## Overview

This is an end-to-end example of how to upload images via paste or file drag/drop.  It also handles drag/drop of small audio(mp3) and video(mp4) files.  It's simply some scaffolding that uses these components:

* Vue.js, Vuetify
* Node.js, Express, Multer

It is not intended to be a production level example of validation, error handling, etc.  This is simply a quick example that I did for a friend.  It is mostly extracted from my <a href="https://github.com/DanielSmith/ThereThenThat-Server">ThereThenThat project</a>.

## Features

* display groups of images, audio(mp3), and video(mp4) by day uploaded
* drag one or more image, audio, or video files at a time to upload
* paste images from screen capture
* image preview as soon as dropped/pasted
* audio or video preview as soon as dropped
* auto-upload
* easy to set up - no database

## Build Setup

After cloning the repository, you will see this directory structure:
```
snapperstore
├── snapstore-client
│   ├── public
│   └── src
└── snapstore-server
```
You may want to open up two shells - one for server, one for client.

### Server Side
``` bash
cd snapstore-server

# install dependencies
npm install

# Node process will run at port 8081
npm run server
```

### Client Side

``` bash
cd snapstore-client

# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev
```

### Getting Started

Once the client and server sides are running, you will see a mostly empty page at http://localhost:8080/

Drag an image from your filesytem on to the page.  You should see an image preview of the file.  It should also automatically upload the file to the server side.

This should also work for audio(mp3) or small video(mp4) files.

If you refresh the browser, you will notice that there is now a button with today's date.  Snapperstore creates a new server side directory for each day (to avoid having to sift through more than a days worth of media at once)

Try a screen region capture, followed by a paste

