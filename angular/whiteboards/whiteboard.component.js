angular.module('lazHack6')
    .component("whiteboard", {
        templateUrl: "angular/whiteboards/whiteboard.html",
        controller: "whiteboardController",
        bindings: {
        }
    })
    .controller("whiteboardController", function(Images, whiteboard, utility){
        var ctrl = this;
        var canvas;
        var ctx;
        var lineId = null;
        var undo = {};
        var undoOrder = [];
        ctrl.colors = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
        ctrl.savedLineWidth = 1;
        ctrl.selectedColor = "black";
        ctrl.postItMode = false;

        ctrl.$onInit = function(){
            canvas = document.querySelector('canvas');
            ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth / 2;
            canvas.height = window.innerHeight / 2;

            canvas.addEventListener('mousedown', function(e){
                isDrawing = true;
                lineId = utility.createGuid();
                whiteboard.startDraw(e);
            });

            document.addEventListener('mouseup', function(e) {
                lineId = null;
                isDrawing = false;
            });

            canvas.addEventListener('mouseenter', function(e) {
                recordDrawEvent(e);
            });

            canvas.addEventListener('mouseout', function(e) {
                recordDrawEvent(e);
            });

            canvas.addEventListener('mousemove', function(e) {
                recordDrawEvent(e);
            });

            whiteboard.ref.on("child_added", function(snapshot){
                drawSegment(snapshot.val(), snapshot.key);
            });

            whiteboard.ref.on("child_removed", function(){
                clearHTML5Canvas();
            });
        };

        ctrl.setColor = function(color){
            ctrl.selectedColor = color;
        };

        ctrl.setDefaultMode = function () {
            ctx.shadowBlur = 0;
            ctx.shadowColor = '';
            ctrl.postItMode = false;
        };

        ctrl.setPostItMode = function() {
            ctx.shadowBlur = 70;
            ctx.shadowColor = 'rgb(0, 0, 0)';
            ctrl.postItMode = true;
        };

        ctrl.clearDrawingCanvas = function(){
            whiteboard.ref.remove();
        };

        ctrl.saveCanvas= function(){
            Images.saveCanvas();
        };

        ctrl.undo = function(){
          var lineToUndo = undo[undoOrder.pop()];

          whiteboard.deleteLineSegments(lineToUndo)
              .then(function(){
                  clearHTML5Canvas();
              });
        };

        function recordDrawEvent(e){
            if(!lineId) return;
            whiteboard.recordDrawEvent(e, ctrl.savedLineWidth, ctrl.selectedColor, ctrl.postItMode, lineId);
        }
        function clearHTML5Canvas(){
            undo = {};
            undoOrder = [];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function drawSegment(segmentData, key){
            if(!undo[segmentData.lineId]){
                undo[segmentData.lineId] = [];
                undoOrder.push(segmentData.lineId);
            }
            undo[segmentData.lineId].push(key);

            ctx.beginPath();
            ctx.strokeStyle = segmentData.strokeStyle;
            ctx.lineWidth = segmentData.lineWidth;

            if(segmentData.isPostItMode) {
                ctx.shadowBlur = 70;
                ctx.shadowColor = 'rgb(0, 0, 0)';
            }
            else {
                ctx.shadowBlur = 0;
                ctx.shadowColor = '';
            }
            let {x: startX, y: startY} = relativeToCanvasCoordinates({x: segmentData.startX, y: segmentData.startY});
            let {x: endX, y: endY} = relativeToCanvasCoordinates({x: segmentData.endX, y: segmentData.endY});
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        function relativeToCanvasCoordinates(relativeCoords){
            return {
                x: relativeCoords.x * canvas.width,
                y: relativeCoords.y * canvas.height
            }
        }

    });
