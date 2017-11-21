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
              <v-flex xs4 v-if="this.$config.USING_DB">
                <v-text-field large
                  label="Search Tag"
                  v-model="name"
                ></v-text-field>

              </v-flex>
              <v-flex xs2 v-if="this.$config.USING_DB">
                <v-btn large
                  primary
                  @click.prevent="submit"
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
            <v-flex xs6>
              <v-card flat pb-5 class="newItemBorder">

                <component :itemPath="curItem.data.src" key="curKey++" v-bind:is="curItem.componentType">
                </component>
              <v-spacer></v-spacer>

              </v-card>
            </v-flex>
          </v-layout>


          <!-- from simple directory listing -->
          <v-layout row v-for="curItem in this.itemList" key="curKey++">
            <v-flex xs12>
              <v-card class="text-xs-left" flat pb-5>

                <component :itemPath="getItemPath(curItem.data)" key="curKey++" v-bind:is="curItem.componentType">
                </component>

              </v-card>
            </v-flex>
          </v-layout>

          <!-- or from DB -->
          <v-layout pb-5 row v-for="curItem in this.itemDBList" key="curKey++">
            <v-flex xs12>
              <v-card class="text-xs-left" flat pb-5>

                <component :itemPath="curItem.data" key="curKey++" v-bind:is="curItem.componentType">
                </component>

                <v-btn color="indigo" dark @click="toggleEdit(curItem.id)"><v-icon dark left>mode_edit</v-icon></v-btn>

                <v-form v-if="showEditTags[curItem.id]" ref="form">
                  <v-layout pl-5 row>
                    <v-flex xs4>
                      <v-text-field
                      label="Enter new tags"
                      v-model="allTagEdits[curItem.id]"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-btn @click="submitTags(curItem.id)">Add Tags</v-btn>
                    </v-flex>
                  </v-layout>
                </v-form>
                <v-btn  v-for="curTag in allTags[curItem.id]" key="curKey++"
                  @click="chooseTag(curItem.id, curTag)"
                  >
                  <strong> {{ curTag }} </strong> 
                  <span class="showEditTag" v-if="showEditTags[curItem.id]"> X  </span>
                </v-btn>
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

      // search modes
      BY_DAY: 1,
      BY_KEYWORD: 2,

      titleStr: 'SnapperStore',
      curItemDir: '',
      addedItemStr: '',
      name: '',

      clickCount: 1,

      allTags: {},
      allTagEdits: {},
      showEditTags: {},

      itemList: [],
      itemDBList: [],
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
      // go query for the tag(s
      if (this.name !== undefined && this.name !== '') {        
        this.name = this.name.trim();
        this.getMediaWithDB(this.name, this.BY_KEYWORD);
      }
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

    toggleEdit(id) {
      this.showEditTags[id] = !this.showEditTags[id];
    },

    submitTags(id) {

      // rewrite this.. the empty and null cases can cause problems
      // am also being careful not to send an empty tag
      let tAry = (this.allTagEdits[id]).split(/ +/);
      tAry = tAry.filter(val => val !== '');

      if (tAry.length === 0) { tAry = ['']; }
      if (this.allTags[id] === null) { this.allTags[id] = []; }

      const newTagsAr = [...this.allTags[id], ...tAry].sort();
      let newTags = [...new Set(newTagsAr)];
      newTags = newTags.filter(val => val !== '');
      this.$set(this.allTags, id, newTags);

      this.showEditTags[id] = false;
      this.allTagEdits[id] = '';
      this.syncTags(id);
    },

    chooseTag(id, tag) {
      // are we editing, or doing a search?
      if (this.showEditTags[id]) {
        const newTags = this.allTags[id].filter(val => val !== tag);
        this.$set(this.allTags, id, newTags);
        this.syncTags(id);
      } else {
        tag = tag.trim();
        this.getMediaWithDB(tag, this.BY_KEYWORD);
      }
    },

    syncTags(id) {
      const tags = this.allTags[id];

      console.log(tags);
      let apiPath = `${this.$config.SERVER}${this.$config.SERVER_PORT}/api/synctags`,              
        dbArgs = { id: id, tagquery: tags };

      const config = { headers: { 'Content-Type': 'application/json' } };

      axios.post(apiPath, dbArgs, config)
        .then(response => {
          console.log(response);
        })
        .catch(err => {
          console.log(err);
        });
    },


    getCollections() {
      // call server for JSON data
      fetch(`${this.$config.SERVER}${this.$config.SERVER_PORT}`)
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

    getDaySimple(theDay) {
      fetch(`${this.$config.SERVER}${this.$config.SERVER_PORT}/${theDay}`)
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


    getMediaWithDB(theArg, theMode = this.BY_DAY) {
      const config = { headers: { 'Content-Type': 'application/json' } };

      let apiPath;
      let dbArgs = {};
    
      if (theMode === this.BY_DAY) {
        apiPath = `${this.$config.SERVER}${this.$config.SERVER_PORT}/api/getDayWithDB`;
        dbArgs = { dayDir: theArg };
      } else {
        apiPath = `${this.$config.SERVER}${this.$config.SERVER_PORT}/api/gettags`,              
        dbArgs = { tagquery: theArg };
      }

      this.itemDBList = [];
      axios.post(apiPath, dbArgs, config)
        .then(response => {
          const mediaInfo = response.data.mediaInfo;

          mediaInfo.map(cur => {
            let newObj = {};

            newObj.data = `${this.$config.SERVER}${this.$config.SERVER_PORT}/uploads/${cur.dayDir}/${cur.fileName}`;
            newObj.componentType = mimeUtils.getItemType(cur.path);
            newObj.tags = cur.tags;
            newObj.id = cur._id;

            this.$set(this.showEditTags, newObj.id, false);
            this.$set(this.allTagEdits, newObj.id, '');
            this.$set(this.allTags, newObj.id, cur.tags);
            this.itemDBList.push(newObj);
          })
        })
        .catch(err => {
          console.log(err);
        });
    },

    // use to switch between methods of access
    getDay(theDay) {
      this.curItemDir = theDay;
      this.addedItemStr = '';


      this.itemList = [];
      this.itemDBList = [];
      this.addedList = [];      
      this.pastedList = [];
      this.titleStr = `SnapperStore - for day: ${theDay}`;      

      // deliberate ==
      if (this.$config.USING_DB == 1) {
        this.getMediaWithDB(theDay, this.BY_DAY);
      } else {
        this.getDaySimple(theDay);
      }
    },

    getItemPath(curItem) {
      let itemPath =  `${this.$config.SERVER}${this.$config.SERVER_PORT}/uploads/${this.curItemDir}/${curItem}`;
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
      axios.post(`${this.$config.SERVER}${this.$config.SERVER_PORT}/api/fileupload`, uploadData, config)
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

.showEditTag {
  width: 100px;
}

.newItemBorder img,
.newItemBorder audio,
.newItemBorder video {
  border: solid 4px green;
}
</style>