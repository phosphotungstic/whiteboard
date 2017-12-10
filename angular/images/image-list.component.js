angular.module('lazHack6')
    .component("imageList", {
        templateUrl: "angular/images/image-list.html",
        controller: "imageListController"
    })
    .controller("imageListController", function(Images){
       var ctrl = this;
       ctrl.images = Images.data;

    });
