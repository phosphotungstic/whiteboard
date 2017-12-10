angular.module('whiteboard')
    .component("replayDrawing", {
        templateUrl: "angular/replay-drawing.html",
        bindings: {
            canvasSelector: '@'
        },
        controller: "replayDrawingController"
    }).controller("replayDrawingController", function(replayService){
        let ctrl = this;
        ctrl.replayDrawing = function(){
            replayService.replayDrawing(ctrl.canvasSelector);
        }
});