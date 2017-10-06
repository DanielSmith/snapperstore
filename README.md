# Snapperstore

## Sample image upload client &amp; server


## Overview

This is an end-to-end example of how to upload images via paste or file drag/drop.  It's simply some scaffolding that uses these components:

* Vue.js, Vuetify
* Node.js, Express, Multer

It is not intended to be a production level example of validation, error handling, etc.  This is simply a quick example that I did for a friend.  It is mostly extracted from my <a href="https://github.com/DanielSmith/ThereThenThat-Server">ThereThenThat project</a>.

## Features

* display groups of images by day uploaded
* drag one or more image files at a time to upload
* paste images from screen capture
* image preview as soon as dropped/pasted
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

### Server Side
``` bash
cd snapstore-server

# install dependencies
npm install

# Node process will run at port 8081
npm run server
```

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).
