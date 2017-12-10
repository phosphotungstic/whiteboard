angular.module('whiteboard')
    .factory('replayService', function() {
        let originalDuration = null;
        let timeRedrawStarted = null;
        let modifiedTimeScale = null;
        let secondsToScaleTo = 10000;

        let replayDrawing = function(canvasSelector){
            let canvas = document.querySelector(canvasSelector);
            clearCanvas(canvas);
            getSegmentsDrawn().then(handleSegmentData);

        };

        function clearCanvas(canvas){
            let ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function getSegmentsDrawn(){
            drawCommandsFirebase = firebase.database().ref('/drawCommands');
            return drawCommandsFirebase.once("value");
        }

        function handleSegmentData(snapshot) {
            let entries = snapshot.val();
            let segmentsDrawn = [];
            for(key in entries){
                segmentsDrawn.push(entries[key]);
            }
            segmentsDrawn.sort((a, b) => {
                return a.timeDrawn - b.timeDrawn;
            });
            originalDuration = segmentsDrawn[segmentsDrawn.length - 1].timeDrawn - segmentsDrawn[0].timeDrawn;
            modifiedTimeScale = secondsToScaleTo / originalDuration;
            timeRedrawStarted = (new Date()).getTime();
            redrawSegments(segmentsDrawn);

        }

        function redrawSegments(segmentsDrawn, i){
            if(segmentsDrawn.length < 2) return;
            if(i >= segmentsDrawn.length) return;

            let originalDuration = segmentsDrawn[segmentsDrawn.length - 1].timeDrawn - segmentsDrawn[0].timeDrawn
            let modifiedTimeScale = secondsToScaleTo / originalDuration;
            let timeRedrawStarted = (new Date()).getTime();
            for(let i = 0; i < segmentsDrawn.length; ++i){
                let timeDrawn = segmentsDrawn[i].timeDrawn - segmentsDrawn[0].timeDrawn;
                let modifiedTimeDrawn = timeDrawn * modifiedTimeScale;
                let timeSinceStart = (new Date()).getTime() - timeRedrawStarted;

                console.log(i + ": " + "ModifiedTimeDrawn: "  + modifiedTimeDrawn + " TimeSinceStart: " + timeSinceStart);
                if(modifiedTimeDrawn <= timeSinceStart){
                    redrawSegment(segmentsDrawn[i]);
                } else {
                    let replayDelay = modifiedTimeDrawn - timeSinceStart;
                    console.log("setTimeout: " + replayDelay);
                    setTimeout(() => { redrawSegment(segmentsDrawn[i]) }, replayDelay);
                }
            }
        }

        function redrawSegment(segmentData){
            drawSegment(segmentData);
        }

        return {
            replayDrawing: replayDrawing
        }
    });
