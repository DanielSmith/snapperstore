<template>
  <v-app light
    @dragover.native="dragOver"
    @drop.native="doDrop"
    @dragstart.native="dragOver"
    @dragend.native="dragEnd"
    @paste.native="onPaste($event)">

    <v-toolbar >
      <v-toolbar-title v-text="titleStr"></v-toolbar-title>
      <v-toolbar-title v-text="addedItemStr"></v-toolbar-title>
      <v-spacer></v-spacer>

    </v-toolbar>
    <main>
      <v-content class="blue-grey lighten-2">
        <v-container fluid>
          <v-layout row wrap>
              <v-flex xs4  v-if="this.$config.USE_DB">
                <v-text-field large
                  label="Search Tag"
                  v-model="name"
                ></v-text-field>

              </v-flex>
              <v-flex xs2 v-if="this.$config.USE_DB">
                <v-btn large
                  primary
                  @click="submit"
                >
                Submit
                </v-btn>
              </v-flex>
          </v-layout>
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

              <v-layout row v-for="curItem in this.pastedList" key="curKey++">
                <v-flex xs12>
                  <v-card flat pb-5 class="newItemBorder">
                    <img :src="curItem"> 
                  </v-card>
                  <v-spacer></v-spacer>

                </v-flex>
              </v-layout>

              <v-layout row v-for="curItem in this.addedList" key="curKey++">
                <v-flex xs12>
                  <v-card flat pb-5 class="newItemBorder">

                    <component :itemPath="curItem.data.src" key="curKey++" v-bind:is="curItem.componentType">
                    </component>
                  <v-spacer></v-spacer>

                  </v-card>
                </v-flex>
              </v-layout>


              <v-layout row v-for="curItem in this.itemList" key="curKey++">
                <v-flex xs12>
                  <v-card class="text-xs-left" flat pb-5>

                    <component :itemPath="getItemPath(curItem.data)" key="curKey++" v-bind:is="curItem.componentType">
                    </component>

                  </v-card>
                </v-flex>
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
import mimeUtils from '../../common/mimeUtils';


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

      titleStr: 'SnapperStore',
      curItemDir: '',
      addedItemStr: '',
      name: '',

      itemList: [],
      pastedList: [],
      addedList: [],
      dayList: []
    }
  },


  mounted: function() {
    this.getCollections();
  },

  methods: {
    submit() {
      // go query for the tag(s)
      this.getTags(this.name);
    },

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
        // get file type
        let curFileData = mimeUtils.getData(curFile);

        // am sure this should be reworked.. hacked it from being
        // image-only to image, audio, or video
        let reader = new FileReader();
        reader.onload = (inner) => {
          let droppedItem = this.getNewElementForType(curFileData.type);
          let newObj = {};
          newObj.componentType = mimeUtils.getItemType(curFileData.ext);
          newObj.data = droppedItem;

          droppedItem.onload = () => {
            this.showDropHelp = 0;
          }
          droppedItem.src = reader.result;
          this.addedList.push(newObj);
        }

        reader.readAsDataURL(curFile);
        this.doUpload(curFile, curFileData.ext);
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
        // if we want to do anything special here..
      }
      pastedImage.src = source;
      this.pastedList.unshift(pastedImage.src);
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

    getTags(theQueryStr = "") {
      const trimmedQueryStr = theQueryStr.trim();
      // let tagForm = new FormData();
      // tagForm.append('tagquery', trimmedQueryStr);


      // const config = {
      //   headers: { 'content-type': 'application/x-www-form-urlencoded' }
      // }

      const config = { headers: { 'Content-Type': 'application/json' } };

      axios.post(`http://${this.SERVER_HOST}:${this.SERVER_PORT}/api/gettags`,
        { tagquery: trimmedQueryStr },config)     
        .then(function (response) {
          // console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });


    },

    getDay(theDay) {
      this.curItemDir = theDay;
      this.addedItemStr = '';


      this.itemList = [];
      this.addedList = [];      
      this.pastedList = [];
      this.titleStr = `SnapperStore - for day: ${theDay}`;      

      fetch(`http://${this.SERVER_HOST}:${this.SERVER_PORT}/${theDay}`)
        .then(response => response.json())
        .then(response => {
          response.map(cur => {
            let newObj = {};
            newObj.data = cur;
            newObj.componentType = mimeUtils.getItemType(cur);

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

    doUpload(uploadFile, extension = "png") {
      const testTags = ['here', 'bridge', 'car'];
      const tagData = JSON.stringify(testTags);

      const uploadData = new FormData();
      uploadData.append('thefile', uploadFile);
      uploadData.append('extension', extension);
      uploadData.append('tags', tagData);

      const config = {
        headers: { 'content-type': 'multipart/form-data' }
      }

      this.addedItemStr = `adding items for today...`;
      axios.post(`http://${this.SERVER_HOST}:${this.SERVER_PORT}/api/fileupload`, uploadData, config)
        .then(function (response) {
          // console.log(response);
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
img {
  max-width: 400px;
}

.newItemBorder img,
.newItemBorder audio,
.newItemBorder video {
  border: solid 4px green;
}
</style>