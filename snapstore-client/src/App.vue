<template>
  <v-app light
    @dragover.native="dragOver"
    @drop.native="doDrop"
    @dragstart.native="dragOver"
    @dragend.native="dragEnd"
    @paste.native="onPaste($event)">


    <v-toolbar>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <main>
      <v-content>
        <v-container fluid>
            <v-layout row wrap>

              <v-layout row v-if="this.showDropHelp">
                <v-flex xs12>
                  <v-card flat pb-5>
                    Drag or Paste Images...
                  </v-card>
                </v-flex>
              </v-layout>
              <v-flex xs12>
            <span v-for="curDay in this.dayList" :key="curDay">
                    <v-btn round color="primary"
                      @click="getDay(curDay)">
                      {{ curDay }}
                    </v-btn>
                  </span>
              </v-flex>

              <v-layout row v-for="newImage in this.addedList" key="curKey++">
                <v-flex xs12>
                  <v-card flat pb-5>
      hello!
                      <audio :src="newImage" controls></audio>
                      <video :src="newImage" controls></video>
                  </v-card>
                </v-flex>
              </v-layout>


              <v-layout row v-for="curItem in this.itemList" key="curKey++">
                <v-flex xs12>



                  <v-card flat pb-5>
                      <!-- <img :src= "getImagePath(curItem.data)"> -->
                <component :itemPath="getItemPath(curItem.data)" key="curKey++" v-bind:is="curItem.mimeType">
                </component>
                  </v-card>

                  <!-- <v-card flat pb-5>
                      <video controls :src= "getItemPath(curItem.data)"></video>
                  </v-card> -->
                </v-flex>
              </v-layout>
            </v-layout>
        </v-container>
      </v-content>
    </main>
  </v-app>
</template>

<script>
import axios from 'axios';
import audioComponent from './Audio';
import videoComponent from './Video';
import imageComponent from './Image';
import mimeUtils from './mimeUtils';


export default {
    components: {
      audioComponent,
      videoComponent,
      imageComponent
    },

    data () {
    return {
      currentView: 'videoComponent',
      curKey: 1,
      showDropHelp: 1,

      // put this in some global config
      SERVER_HOST: 'localhost',
      SERVER_PORT: '8081',

      title: 'SnapperStore',
      curItemDir: '',

      itemList: [],
      addedList: [],
      dayList: []
    }
  },


  mounted: function() {
    this.getCollections();
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

      theFiles.map(curFile => {
        console.dir(curFile);
        // get file type
        let curFileData = mimeUtils.getData(curFile);
        console.log(curFileData);



        let reader = new FileReader();
        reader.onload = (inner) => {
          let droppedItem = this.getNewElementForType(curFileData.type);
          droppedItem.onload = () => {
            // this.addedList.unshift(droppedItem.src);
            console.log(this.addedList);
            this.showDropHelp = 0;
          }
          droppedItem.src = reader.result;
          this.addedList.unshift(droppedItem.src);
        }

        reader.readAsDataURL(curFile);
        this.doUpload(curFile);
      })
    },

    getNewElementForType(theType) {

      switch (theType) {
        case "image":
          return new Image();
          break;

        case "audio":
          return new Audio();
          break;

        case "video":
          return document.createElement('video');
          break;

        default:
          return ''; // what to use for this...?
          break;
      }
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
        let height = pastedImage.height;
        let width = pastedImage.width;
        let length = pastedImage.length;
      }
      pastedImage.src = source;
      this.addedList.unshift(pastedImage.src);
      this.showDropHelp = 0;
    },
  
    doDrop: function(event) {
      event.preventDefault();
      this.doDroppedFiles(event);
    },

    getCollections() {
      // call server for JSON data
      fetch(`http://${this.SERVER_HOST}:${this.SERVER_PORT}`)
        .then(response => response.json())
        .then(response => {
          this.dayList = response;

          // if we have something, let's show the first day we know about
          if (this.dayList.length > 0) {
            this.getDay(this.dayList[0]);
            this.showDropHelp = 0;
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    getDay(theDay) {
      this.curItemDir = theDay;

      this.itemList = [];
      this.addedList = [];      

      fetch(`http://${this.SERVER_HOST}:${this.SERVER_PORT}/${theDay}`)
        .then(response => response.json())
        .then(response => {
          response.map(cur => {
            let newObj = {};
            newObj.data = cur;
            newObj.mimeType = "imageComponent";
            this.itemList.push(newObj);
          })
        })
        .catch(err => {
          console.log(err);
        });
    },

    getItemPath(curItem) {
      let itemPath =  `http://${this.SERVER_HOST}:${this.SERVER_PORT}/uploads/${this.curItemDir}/${curItem}`;
      return itemPath;
    },

    doUpload(imageFile) {
      const uploadData = new FormData();
      uploadData.append('thefile', imageFile);

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

<style lang="stylus">
@import './stylus/main'
</style>