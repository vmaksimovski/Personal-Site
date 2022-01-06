var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

const padding = 20;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const size = Math.min(canvas.width, canvas.height);
const radius = size / 2 - 2; // we subtract 2 so that the clock fits fully in the window
const offsetX = canvas.width / 2;
const offsetY = canvas.height / 2;
context.translate(offsetX, offsetY);

const tau = 2 * Math.PI;

const minutesPerTurn = 43200000 / 12.0;
const secondsPerTurn = 43200000 / 720;

const pointCount = Math.floor(canvas.width * canvas.height / 2000);

var pointers = new Map();
var pointerHistory = new Map();

var pointsX = [];
var pointsY = [];
var momentX = [];
var momentY = [];
pointsX.length = pointCount;
pointsY.length = pointCount;
momentX.length = pointCount;
momentY.length = pointCount;

for (var i = 0; i < pointCount; i++){
    pointsX[i] = Math.floor(Math.random() * canvas.width) - offsetX;
    pointsY[i] = Math.floor(Math.random() * canvas.height) - offsetY;
    momentX[i] = 0;
    momentY[i] = 0;
}

function convertTouch(touchEvent) {
    return {
        x: touchEvent.pageX - offsetX,
        y: touchEvent.pageY - offsetY,
        time: getMsSinceMidnight(new Date()),
        clicked: true
    }
}

function convertMouse(mouseEvent, isClicked) {
    return {
        x: mouseEvent.pageX - offsetX,
        y: mouseEvent.pageY - offsetY,
        time: getMsSinceMidnight(new Date()),
        clicked: isClicked
    }
}

function onTouchStart(event) {
    event.preventDefault();
    var touches = event.changedTouches;

    for(var i = 0; i < touches.length; i++){
        var identifier = touches[i].identifier;
        var touchEvent = convertTouch(touches[i]);
        pointers.set(identifier, touchEvent);
        pointerHistory.set(identifier, [touchEvent]);
    }
}

function onTouchEnd(event) {
    event.preventDefault();
    var touches = event.changedTouches;
    for(var i = 0; i < touches.length; i++){
        var identifier = touches[i].identifier;
        pointers.delete(identifier);
        pointerHistory.delete(identifier);
    }
}

function onTouchCancel(event) {
    event.preventDefault();
    var touches = event.changedTouches;
    for(var i = 0; i < touches.length; i++){
        var identifier = touches[i].identifier;
        pointers.delete(identifier);
        pointerHistory.delete(identifier);
    }
}

function onTouchMove(event) {
    event.preventDefault();
    var touches = event.changedTouches;
    for(var i = 0; i < touches.length; i++){
        var touchEvent = convertTouch(touches[i]);
        pointers.set(touches[i].identifier, touchEvent);

        var list = pointerHistory.get(touches[i].identifier);
        if(list === undefined){
            list = [];
        }
        list.push(touchEvent);
        while(list[list.length - 1].time - list[0].time > 150){
            list.shift();
        }
        pointerHistory.set(touches[i].identifier, list);
    }
}

function onMouseDown(event) {
    const mouseEvent = convertMouse(event, true);
    pointers.set('mouse', mouseEvent);
    pointerHistory.set('mouse', [mouseEvent]);
}

function onMouseUp(event) {
    const mouseEvent = convertMouse(event, false);
    pointers.set('mouse', mouseEvent);
    pointerHistory.set('mouse', [mouseEvent]);
}

function onMouseMove(event) {
    const mousePointer = pointers.get('mouse');
    var clicked = false;
    if(mousePointer !== undefined){
        clicked = mousePointer.clicked;
    }

    const mouseEvent = convertMouse(event, clicked);

    pointers.set('mouse', mouseEvent);
    var list = pointerHistory.get('mouse');
    if(list === undefined){
        list = [];
    }
    list.push(mouseEvent);
    while(list[list.length - 1].time - list[0].time > 150){
        list.shift();
    }
    pointerHistory.set('mouse', list);
}

function getMsSinceMidnight(d) {
    var start = new Date();
    start = new Date(start.getFullYear(),
                        start.getMonth(),
                        start.getDate() ,
                        0, 0, 0);

    return d - start;
}

function drawClock(){
    currTime = new Date();
    var milliseconds = getMsSinceMidnight(currTime) % 43200000; // 12 hour clock

    drawCircle(radius, 2);
    drawNotches(radius, 1.5, 20);
    drawHand(6, radius / 5, milliseconds / 43200000, false);
    drawHand(4, radius / 1.4, milliseconds % minutesPerTurn / minutesPerTurn, false);
    drawHand(3, radius / 1.1, milliseconds % secondsPerTurn / secondsPerTurn, true);
}

function drawCircle(radius, width){
    context.lineWidth = width;
    context.lineCap = "round";
    context.strokeStyle = "#000";

    context.beginPath();

    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.stroke();
}

function drawNotches(radius, width, notchLength){
    context.lineWidth = width;
    context.lineCap = "butt";
    context.strokeStyle = "#000";

    for (var i = 0; i < 12; i++){
        context.beginPath();
        context.moveTo(0, 0);

        context.rotate( i / 12 * tau);

        context.moveTo(0, (radius - notchLength));
        context.lineTo(0, radius);
        context.stroke();

        context.rotate(-i / 12 * tau);
    }
}

function drawHand(width, length, rotation, isSecondHand){
    context.lineWidth = width;
    context.lineCap = "round";
    if(isSecondHand){
        context.strokeStyle = "#f00";
    } else {
        context.strokeStyle = "#000";
    }

    context.beginPath();
    context.moveTo(0, 0);

    context.rotate(rotation * tau);

    context.lineTo(0, -length);
    context.stroke();

    context.rotate(-rotation * tau);
}

function drawPoints(width){
    context.lineWidth = width;
    context.fillStyle = "#fff";
    context.strokeStyle = "#008a";

    for(var j = 0; j < pointsY.length; j++){
        pointers.forEach(function(ptr){
            if(
                -(offsetX - padding) > ptr.x ||
                -(offsetY - padding) > ptr.y ||
                ptr.x >= (offsetX - padding) ||
                ptr.y >= (offsetY - padding)
            ){
                return;
            }
            var r = Math.sqrt(
                (pointsY[j] - ptr.y) * (pointsY[j] - ptr.y) +
                (pointsX[j] - ptr.x) * (pointsX[j] - ptr.x));
            var theta = Math.atan2(pointsY[j] - ptr.y, pointsX[j] - ptr.x);
            if(ptr.clicked){
                momentY[j] += 1000/(r**2+1000)*Math.sin(theta);
                momentX[j] += 1000/(r**2+1000)*Math.cos(theta);
            }
        });
    }

    for(var i = 0; i < pointsY.length; i++){
        pointsX[i] += momentX[i];
        momentX[i] *= 0.9;
        pointsY[i] += momentY[i];
        momentY[i] *= 0.9;
    }

    for (var i = 0; i < pointCount; i++){
        context.beginPath();
        context.arc(pointsX[i], pointsY[i], 2, 0, 2 * Math.PI);
        context.lineWidth = 3;
        context.stroke();
        context.fill();
    }
}

function drawTouches(){
    context.fillStyle = '#fff';
    context.lineCap = "round";

    var currMs = getMsSinceMidnight(new Date());
    pointerHistory.forEach(function(history){
        for(var i = 0; i < history.length - 1; i++){
            var prevCoords = history[i];
            var currCoords = history[i + 1];

            var avg_age = (history[i].time + history[i + 1].time) / 2;
            var age_ratio = (currMs - avg_age) / 150;
            if(age_ratio > 1.0){
                continue;
            }
            var age_hex = Math.round((1 - age_ratio) * 16).toString(16);

            context.lineWidth = 4;
            context.strokeStyle = '#00f' + age_hex;
            context.beginPath();
            context.moveTo(prevCoords.x, prevCoords.y);
            context.lineTo(currCoords.x, currCoords.y);
            context.stroke();
        }
    });
}

function startup() {
    canvas.addEventListener("touchstart", onTouchStart, false);
    canvas.addEventListener("touchend", onTouchEnd, false);
    canvas.addEventListener("touchcancel", onTouchCancel, false);
    canvas.addEventListener("touchmove", onTouchMove, false);
    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mousemove", onMouseMove, false);
}

document.addEventListener("DOMContentLoaded", startup);


window.requestAnimationFrame(main);
function main(timestamp){
    context.fillStyle = '#fff';
    context.fillRect(-offsetX, -offsetY, canvas.width, canvas.height);
    drawPoints(3);
    drawClock();
    drawTouches();
    window.requestAnimationFrame(main);
}
