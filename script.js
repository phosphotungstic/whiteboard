// Initialize Firebase
var config = {
    apiKey: "AIzaSyD1UpC3qnghh_tnubRqRRaEAJ0-3yKY-eo",
    authDomain: "whiteboard-57ece.firebaseapp.com",
    databaseURL: "https://whiteboard-57ece.firebaseio.com",
    projectId: "whiteboard-57ece",
    storageBucket: "whiteboard-57ece.appspot.com",
    messagingSenderId: "233386822869"
};

firebase.initializeApp(config);
let drawCommandsFirebase = firebase.database().ref('/drawCommands');
let imagesRef = firebase.database().ref('/images');

const canvas = document.querySelector('#draw');
const ctx = canvas.getContext('2d');
const imageList = document.querySelector('#imageList');
canvas.width = window.innerWidth * 0.6;
canvas.height = canvas.width * ( 9 / 16);
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let postItMode = false;
let savedStrokeStyle = "Black";
let savedLineWidth = 1;
var CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];

CSS_COLOR_NAMES.forEach(color => {
    var colorSquareDiv = document.createElement('div');
    colorSquareDiv.className= 'colorsquare';
    colorSquareDiv.id = color;
    colorSquareDiv.style.backgroundColor=color.toUpperCase();
    colorSquareDiv.addEventListener('click', () => {
        savedStrokeStyle = colorSquareDiv.id;
    });
    document.querySelector('.squareholder').append(colorSquareDiv);
});

function recordDrawEvent(e) {
    let {x: newX, y: newY} = canvasToRelativeCoordinates({x: e.offsetX, y: e.offsetY});
    if (!isDrawing) return;

    console.log('drawing');

    let segmentData = {
        startX: lastX,
        startY: lastY,
        endX: newX,
        endY: newY,
        strokeStyle: savedStrokeStyle,
        lineWidth: savedLineWidth,
        isPostItMode: postItMode
    };

    drawCommandsFirebase.push(segmentData);
    [lastX, lastY] = [newX, newY];
}

function drawSegment(segmentData){
    ctx.beginPath();
    ctx.strokeStyle = segmentData.strokeStyle;
    ctx.lineWidth = segmentData.lineWidth;
    let {x: startX, y: startY} = relativeToCanvasCoordinates({x: segmentData.startX, y: segmentData.startY});
    let {x: endX, y: endY} = relativeToCanvasCoordinates({x: segmentData.endX, y: segmentData.endY});
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineCap = 'round';
    ctx.stroke();
}

function clearHTML5Canvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function clearDrawingCanvas(){
    drawCommandsFirebase.remove().then(function(){

    });
}

function updateRange(val) {
    document.querySelector('#rangeval').innerHTML = val;
    savedLineWidth = val;
}

drawCommandsFirebase.on("child_added", function(child, prevKey){
    drawSegment(child.val());
});

firebase.database().ref('/').on("child_removed", function(child){
    clearHTML5Canvas();
});

registerDrawingListiners();

function setDefaultMode() {
    ctx.shadowBlur = 0;
    ctx.shadowColor = '';
    postItMode = false;
}

function setPostItMode() {
    ctx.shadowBlur = 70;
    ctx.shadowColor = 'rgb(0, 0, 0)';
    postItMode = true;
}

function registerDrawingListiners(){
    window.addEventListener('mousedown', (e) => {
        isDrawing = true;
        ({x: lastX, y: lastY} = canvasToRelativeCoordinates({x: e.offsetX, y: e.offsetY}));
    });
    window.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    canvas.addEventListener('mousemove', recordDrawEvent);

    canvas.addEventListener('mouseenter', (e) => {
        ({x: lastX, y: lastY} = canvasToRelativeCoordinates({x: e.offsetX, y: e.offsetY}));
    });
    canvas.addEventListener('mouseout', (e) => {
        recordDrawEvent(e);
    });
}


function canvasToRelativeCoordinates(canvasCoords){
    if(canvas.width && canvas.height){
        return {
            x: canvasCoords.x / canvas.width,
            y: canvasCoords.y / canvas.height
        }
    }
    throw 'Cannot get canvasCoords on canvas with no x or y dimension';
}

function relativeToCanvasCoordinates(relativeCoords){
    return {
        x: relativeCoords.x * canvas.width,
        y: relativeCoords.y * canvas.height
    }
}