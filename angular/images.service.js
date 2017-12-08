angular.module('whiteboard')
  .factory('Images', function($firebaseArray){
    var imageDataRef = firebase.database().ref('/images');

    function saveCanvas(canvasId){
        var canvas = document.querySelector(canvasId);
        imageDataRef.push(canvas.toDataURL());
    }

    return {
        data: $firebaseArray(imageDataRef),
        saveCanvas: saveCanvas
    };

  });
