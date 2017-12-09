angular.module('lazHack6')
  .factory('Images', function($firebaseArray){
    var imageDataRef = firebase.database().ref('/images');

    function saveCanvas(){
        var canvas = document.querySelector("canvas");
        imageDataRef.push(canvas.toDataURL());
    }

    return {
        data: $firebaseArray(imageDataRef),
        saveCanvas: saveCanvas
    };

  });
