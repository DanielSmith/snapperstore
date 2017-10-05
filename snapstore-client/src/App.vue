<template>
  <v-app light
    @dragover.native="dragOver"
    @drop.native="doDrop"
    @dragstart.native="dragOver"
    @dragend.native="dragEnd"
    @paste.native="onPaste($event)">
  >     
    <v-toolbar fixed>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <main>
      <v-container fluid>
        <v-slide-y-transition mode="out-in">
          <v-layout column align-center>
            <blockquote>

space for day list...

            </blockquote>

            <v-layout row v-for="curImage in this.imageList" key="curKey++">
              <v-flex xs12>

                <v-card flat pb-5
                      <img :src="curImage">
                </v-card>

              </v-flex>
            </v-layout>
          </v-layout>
        </v-slide-y-transition>
      </v-container>
    </main>
  </v-app>
</template>

<script>

  import axios from 'axios';

  export default {
    data () {
      return {

        curKey: 1,

        // put this in some global config
        SERVER_HOST: 'localhost',
        SERVER_PORT: '3100',

        title: 'SnapperStore',

        imageList: []
      }
    },

    methods: {

      // pasted from screen / region capture
      onPaste(event) {
        let index = 0;
        let items = (event.clipboardData || event.originalEvent.clipboardData).items;

        // TODO:  do a check here to see if it is an image...
        let imageItem = items[0];
        let imageFile = imageItem.getAsFile();

        if (imageItem.kind === 'file') {
          let reader = new FileReader();

          let URLObj = window.URL || window.webkitURL;
          let source = URLObj.createObjectURL(imageFile);
          this.createImage(source);

          reader.onload = (event) => {
            let myImage = new Image();
            myImage.src = event.target.result;

            myImage.onload = () => {
              // this.doUpload(myImage);
            }

          };
          reader.readAsDataURL(imageFile);
          this.doUpload(imageFile);
        }
      },

      doDroppedFiles: function(event) {
        let theFiles = Array.from(event.dataTransfer.files);
        let that = this;
        let myImageList = this.imageList;

        theFiles.map(curFile => {
          let reader = new FileReader();
          reader.onload = (inner) => {
            let droppedImage = new Image();
            droppedImage.onload = function() {
              myImageList.unshift(droppedImage.src);
            }
            droppedImage.src = reader.result;
          }

          reader.readAsDataURL(curFile);
          this.doUpload(curFile);
        })
      },

      dragEnd: function(args) {
        args.preventDefault();
      },

      dragOver: function(args) {
        args.preventDefault();
      },

      createImage: function(source) {
        let pastedImage = new Image();
        pastedImage.onload = function() {

          console.dir(pastedImage);
          let height = pastedImage.height;
          let width = pastedImage.width;
          let length = pastedImage.length;
        }
        pastedImage.src = source;
        this.imageList.unshift(pastedImage.src);
      },

      

      doDrop: function(event) {
        event.preventDefault();
        this.doDroppedFiles(event);

        let link = event.dataTransfer.getData('Text');

        if (event.dataTransfer.types) {
          // do a map in here...
        }

        let curImage = new Image();
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        curImage.onload = () => {
          canvas.width = curImage.width;
          canvas.height = curImage.height;
          ctx.drawImage(curImage, 0, 0);
          let image = document.createElement('img');
          image.src = canvas.toDataURL('image/png');

          // this.doUpload(image);
        }

        curImage.setAttribute('crossOrigin', 'anonymous');
        curImage.src = link;
      },

      

      doUpload(imageFile) {
        const uploadData = new FormData();
        uploadData.append('thefile', imageFile);
        // uploadData.append('title', 'image upload');
        // uploadData.append('description', 'image description');
        // uploadData.append('container', this.curCollectionList._id);

        const config = {
          headers: { 'content-type': 'multipart/form-data' }
        }

        axios.post(`http://${this.SERVER_HOST}:${this.SERVER_PORT}/api/fileupload`, uploadData, config)
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }
  }
</script>
