let mimeUtils = {

  // the point of this is twofold:
  // 1) we'll have major type for a future DB field (video, audio, etc)
  // 2) normalizing to a single file extension per type (JPEG, jpg -> jpg)
  mimeTable: {

    // images
    "image/jpeg": {
      type: "image",
      ext: "jpg"
    },

    "image/png": {
      type: "image",
      ext: "png"
    },

    "image/bmp": {
      type: "image",
      ext: "bmp"
    },

    "image/gif": {
      type: "image",
      ext: "gif"
    },
    
    // audio
    "audio/x-wav": {
      type: "audio",
      ext: "wav"
    },
    
    "audio/mpeg": {
      type: "audio",
      ext: "mp3"
    },
    
    // video
    "video/mp4": {
      type: "video",
      ext: "mp4"
    },

    "video/x-m4v": {
      type: "video",
      ext: "m4v"
    },

    "video/ogg": {
      type: "video",
      ext: "ogv"
    },

  },

  getData(theFile) {
    console.dir(theFile);
    if (this.mimeTable[theFile.type]) {
      return this.mimeTable[theFile.type];
    }
  }
};

export default mimeUtils;
