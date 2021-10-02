var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

const padding = 50;

canvas.width = window.innerWidth - 2 * padding;
canvas.height = window.innerHeight - 2 * padding;

const size = Math.min(canvas.width, canvas.height);
const radius = size / 2 - 2; // we subtract 2 so that the clock fits fully in the window
const offsetX = canvas.width / 2;
const offsetY = canvas.height / 2;
context.translate(offsetX, offsetY);

const fullRotation = 2 * Math.PI;

const minutesPerTurn = 43200000 / 12.0;
const secondsPerTurn = 43200000 / 720;

const pointCount = Math.floor(canvas.width * canvas.height / 2000);

var mouseX = -offsetX - 1;
var mouseY = -offsetY - 1;
var pointsX = [];
var pointsY = [];
var momentX = [];
var momentY = [];
pointsX.length = pointCount;
pointsY.length = pointCount;
momentX.length = pointCount;
momentY.length = pointCount;

var mouse_clicked = false;

for (var i = 0; i < pointCount; i++){
    pointsX[i] = Math.floor(Math.random() * canvas.width) - offsetX;
    pointsY[i] = Math.floor(Math.random() * canvas.height) - offsetY;
    momentX[i] = 0;
    momentY[i] = 0;
}

document.onmousedown = function(){
    mouse_clicked = true;
}
document.onmouseup = function(){
    mouse_clicked = false;
}
document.onmousemove = function(e){
    mouseX = e.pageX - offsetX - padding;
    mouseY = e.pageY - offsetY - padding;
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
    context.fillStyle = '#fff';

    currTime = new Date();
    var milliseconds = getMsSinceMidnight(currTime) % 43200000; // 12 hour clock

    context.strokeStyle = "#000";
    drawCircle(radius, 2);
    drawNotches(radius, 1.5, 20);
    drawHand(6, radius / 5, milliseconds / 43200000);
    drawHand(4, radius / 1.4, milliseconds % minutesPerTurn / minutesPerTurn);
    context.strokeStyle = "#f00";
    drawHand(3, radius / 1.1, milliseconds % secondsPerTurn / secondsPerTurn);
    context.strokeStyle = "#000";
}

function drawCircle(radius, width){
    context.lineWidth = width;
    context.lineCap = "round";

    context.beginPath();

    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.stroke();
}

function drawNotches(radius, width, notchLength){
    context.lineWidth = width;
    context.lineCap = "butt";

    for (var i = 0; i < 12; i++){
        context.beginPath();
        context.moveTo(0, 0);

        context.rotate( i / 12 * fullRotation);

        context.moveTo(0, (radius - notchLength));
        context.lineTo(0, radius);
        context.stroke();

        context.rotate(-i / 12 * fullRotation);
    }
}

function drawHand(width, length, rotation){
    context.lineWidth = width;
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(0, 0);

    context.rotate(rotation * fullRotation);

    context.lineTo(0, -length);
    context.stroke();

    context.rotate(-rotation * fullRotation);
}

function drawPoints(){
    context.fillStyle = "#fff";

    for(var j = 0; j < pointsY.length; j++){
        if(-offsetX > mouseX || -offsetY > mouseY || mouseX >= offsetX || mouseY >= offsetY){
            continue;
        }
        var r = Math.sqrt(
            (pointsY[j] - mouseY) * (pointsY[j] - mouseY) +
            (pointsX[j] - mouseX) * (pointsX[j] - mouseX));
        var theta = Math.atan2(pointsY[j] - mouseY, pointsX[j] - mouseX);
        if(mouse_clicked){
            momentY[j] -= 1000/(r**2+1000)*Math.sin(theta);
            momentX[j] -= 1000/(r**2+1000)*Math.cos(theta);
        } else {
            momentY[j] += 1000/(r**2+1000)*Math.sin(theta);
            momentX[j] += 1000/(r**2+1000)*Math.cos(theta);
        }
    }

    for(var i = 0; i < pointsY.length; i++){
        pointsX[i] += momentX[i];
        momentX[i] *= 0.9;
        pointsY[i] += momentY[i];
        momentY[i] *= 0.9;
    }

    for (var i = 0; i < pointCount; i++){
        context.strokeStyle = "#008a";
        context.beginPath();
        context.arc(pointsX[i], pointsY[i], 2, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
    }
}

window.requestAnimationFrame(main);
function main(timestamp){
    context.fillStyle = '#fff';
    context.fillRect(-offsetX, -offsetY, canvas.width, canvas.height);
    drawPoints();
    drawClock();
    window.requestAnimationFrame(main);
}
