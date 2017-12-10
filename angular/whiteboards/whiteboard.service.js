angular.module('lazHack6')
  .factory('whiteboard', function($firebaseArray){
      var drawCommandsRef = firebase.database().ref('/drawCommands');
      var lastX = 0;
      var lastY = 0;
      var isDrawing = false;

      function canvasToRelativeCoordinates(canvasCoords){
          canvas = document.querySelector('canvas');
          if(canvas.width && canvas.height){
              return {
                  x: canvasCoords.x / canvas.width,
                  y: canvasCoords.y / canvas.height
              }
          }
          throw 'Cannot get canvasCoords on canvas with no x or y dimension';
      }

      function startDraw(e){
          ({x: lastX, y: lastY} = canvasToRelativeCoordinates({x: e.offsetX, y: e.offsetY}));
      }

      function deleteLineSegments(lineSegments){
          var keys = {};
          while(lineSegments.length > 0) {
              keys[lineSegments.pop()] = null;
          }
          return drawCommandsRef.update(keys);

      }

      function recordDrawEvent(e, savedLineWidth, savedStrokeStyle, postItMode, lineId) {
          let {x: newX, y: newY} = canvasToRelativeCoordinates({x: e.offsetX, y: e.offsetY});

          var segmentData = {
              startX: lastX,
              startY: lastY,
              endX: newX,
              endY: newY,
              strokeStyle: savedStrokeStyle,
              lineWidth: savedLineWidth,
              isPostItMode: postItMode,
              lineId: lineId,
              timeDrawn: (new Date()).getTime()
          };

          drawCommandsRef.push(segmentData);
          lastX = newX;
          lastY = newY;
      }

      return {
          ref:  drawCommandsRef,
          startDraw: startDraw,
          recordDrawEvent: recordDrawEvent,
          canvasToRelativeCoordinates: canvasToRelativeCoordinates,
          deleteLineSegments: deleteLineSegments,
          lineSegments: $firebaseArray(drawCommandsRef)
    };

  });
