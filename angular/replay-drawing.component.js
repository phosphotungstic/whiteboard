angular.module('lazHack6')
    .component("replayDrawing", {
        templateUrl: "angular/replay-drawing.html",
        controller: "replayDrawingController"
    }).controller("replayDrawingController", function($rootScope, whiteboard){
        let ctrl = this;

        let msToScaleTo = 10000;

        ctrl.replayDrawing = function(){
            $rootScope.$broadcast('external_local_clear_command');
            let segmentsDrawn = whiteboard.lineSegments;
            segmentsDrawn.sort((a, b) => {
                return a.timeDrawn - b.timeDrawn;
            });
            originalDuration = segmentsDrawn[segmentsDrawn.length - 1].timeDrawn - segmentsDrawn[0].timeDrawn;
            modifiedTimeScale = msToScaleTo / originalDuration;
            timeRedrawStarted = (new Date()).getTime();
            redrawSegments(segmentsDrawn);
        };

        function redrawSegments(segmentsDrawn, i){
            if(segmentsDrawn.length < 2) return;
            if(i >= segmentsDrawn.length) return;

            let originalDuration = segmentsDrawn[segmentsDrawn.length - 1].timeDrawn - segmentsDrawn[0].timeDrawn
            let modifiedTimeScale = msToScaleTo / originalDuration;
            let timeRedrawStarted = (new Date()).getTime();
            for(let i = 0; i < segmentsDrawn.length; ++i){
                let timeDrawn = segmentsDrawn[i].timeDrawn - segmentsDrawn[0].timeDrawn;
                let modifiedTimeDrawn = timeDrawn * modifiedTimeScale;
                let timeSinceStart = (new Date()).getTime() - timeRedrawStarted;

                if(modifiedTimeDrawn <= timeSinceStart){
                    redrawSegment(segmentsDrawn[i]);
                } else {
                    let replayDelay = modifiedTimeDrawn - timeSinceStart;
                    setTimeout(() => { redrawSegment(segmentsDrawn[i]) }, replayDelay);
                }
            }
        }

        function redrawSegment(segmentData){
            $rootScope.$broadcast('external_draw_command', segmentData);
        }
});