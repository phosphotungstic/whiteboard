angular.module('whiteboard')
    .component("imageList", {
        templateUrl: "angular/image-list.html",
        controller: "imageListController",
        bindings: {
            canvasSelector: "@"
        }
    })
    .controller("imageListController", function(Images){
       var ctrl = this;
       ctrl.images = Images.data;

       ctrl.saveCanvas= function(){
           Images.saveCanvas(ctrl.canvasSelector);
       }

    });
