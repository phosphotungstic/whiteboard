angular.module('lazHack6')
  .factory('Images', function($firebaseArray){
    var imageDataRef = firebase.database().ref('/images');
    var images = $firebaseArray(imageDataRef);

    function saveCanvas(){
        var canvas = document.querySelector("canvas");
        imageDataRef.push(canvas.toDataURL());
    }

      function deleteImage(image){
          images.$remove(image)
      }


      return {
          data: images,
          saveCanvas: saveCanvas,
          deleteImage: deleteImage
    };

  });
