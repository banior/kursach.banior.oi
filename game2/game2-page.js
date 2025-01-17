const canvas = document.getElementById("gameCanvas");
const roundDisplay = document.getElementById("roundDisplay"); 
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;
let totalScore = 0;
let userName;

const restartButton = document.getElementById("restart");

let currentRound = 1; 
const totalRounds = 3; 

let figure = null; 
let points = [];   
let firstLine = [];
let secondLine = [];

function updateRoundDisplay() {
    roundDisplay.textContent = `Раунд: ${currentRound} из ${totalRounds}`;
}

function createRandomFigure() {
    const figures = ["circle", "triangle"];
    const type = figures[Math.floor(Math.random() * figures.length)];
    const padding = 20; 

    if (type === "circle") {
        let maxRadius = Math.min(canvas.width, canvas.height) / 4;
        let radius = Math.floor(Math.random() * (maxRadius - 30)) + 30;
        let x = Math.floor(Math.random() * (canvas.width - 2 * radius - padding * 2)) + radius + padding;
        let y = Math.floor(Math.random() * (canvas.height - 2 * radius - padding * 2)) + radius + padding;

        figure = { type: "circle", x, y, radius };
    } 
    else if (type === "triangle") {
        let x1 = Math.floor(Math.random() * (canvas.width - 2 * padding)) + padding;
        let y1 = Math.floor(Math.random() * (canvas.height - 2 * padding)) + padding;

        let x2 = Math.min(x1 + Math.floor(Math.random() * 80) + 30, canvas.width - padding);
        let y2 = Math.min(y1 + Math.floor(Math.random() * 60) + 20, canvas.height - padding);

        let x3 = Math.max(x1 - Math.floor(Math.random() * 80) - 30, padding);
        let y3 = Math.min(y1 + Math.floor(Math.random() * 60) + 20, canvas.height - padding);

        figure = {
            type: "triangle",
            points: [
                { x: x1, y: y1 },
                { x: x2, y: y2 },
                { x: x3, y: y3 }
            ]
        };
    } 
    drawFigure();
}

function drawFigure() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "lightblue";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    if (figure.type === "circle") {
        ctx.beginPath();
        ctx.arc(figure.x, figure.y, figure.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(figure.points[0].x, figure.points[0].y);
        for (let i = 1; i < figure.points.length; i++) {
            ctx.lineTo(figure.points[i].x, figure.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

canvas.addEventListener("click", function (event) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (isInsideFigure(x, y)) return;

    points.push({ x, y });
    if (firstLine.length < 2){
        firstLine.push({x, y});
    } else{
        secondLine.push({x, y});
    } 

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    if (points.length === 2) {
        drawLine(points[0], points[1]);
    } else if (points.length === 4) {
        drawLine(points[2], points[3]);
        checkIntersections();
    }
});

function drawLine(p1, p2) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function checkIntersections() {
    const intersection = getIntersection(points[0], points[1], points[2], points[3]);

    if (!intersection || !isInsideFigure(intersection.x, intersection.y)) {
        alert("Фигура не разделилась на 4 части");
        restartButton.style.display = 'block';
    } else {
        calculateResult();
    }
}
function calculateResult(){
    let areas = [0, 0, 0, 0]; 
    if (figure.type === "circle") {
        areas = estimateAreasCircle(
            figure.x, figure.y, figure.radius,
            firstLine, secondLine);
    }
    if (figure.type === "triangle") {
        areas = estimateAreasTriangle(
            figure.points[0].x, figure.points[0].y,
            figure.points[1].x, figure.points[1].y,
            figure.points[2].x, figure.points[2].y,
            firstLine, secondLine);
    }
    alert(calculateOverallSuccess(areas) + "/100");
    totalScore += calculateOverallSuccess(areas);
    if (currentRound < totalRounds) {
        currentRound++;
        restartButton.style.display = 'block';
        
    } else {
        restartButton.style.display = 'none';

        window.location.href = `../index.html?showStats=true&user=${encodeURIComponent(userName)}&score=${totalScore}`;
    }
}
function resetRound() {
    points = [];
    firstLine = [];
    secondLine = [];
    createRandomFigure();
}

updateRoundDisplay();

restartButton.addEventListener("click", function () {
    updateRoundDisplay();
    resetRound();
});

function calculateOverallSuccess(areas) {
    const totalArea = areas.reduce((sum, area) => sum + area, 0);
    
    const idealArea = totalArea / 4;

    const deviationSum = areas.reduce((sum, area) => sum + Math.abs(area - idealArea), 0);
    
    const totalDeviation = (deviationSum / totalArea) * 100;
    
    const overallSuccess = 100 - totalDeviation;
    
    return overallSuccess;
}

function isInsideFigure(x, y) {
    if (figure.type === "circle") {
        const dx = x - figure.x;
        const dy = y - figure.y;
        return dx * dx + dy * dy <= figure.radius * figure.radius;
    } else {
        return pointInPolygon({ x, y }, figure.points);
    }
}

function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i].x, yi = polygon[i].y;
        let xj = polygon[j].x, yj = polygon[j].y;

        let intersect = ((yi > point.y) !== (yj > point.y)) &&
                        (point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function getIntersection(A, B, C, D) {
    let denominator = (A.x - B.x) * (C.y - D.y) - (A.y - B.y) * (C.x - D.x);
    if (denominator === 0) return null;

    let x = ((A.x * B.y - A.y * B.x) * (C.x - D.x) - (A.x - B.x) * (C.x * D.y - C.y * D.x)) / denominator;
    let y = ((A.x * B.y - A.y * B.x) * (C.y - D.y) - (A.y - B.y) * (C.x * D.y - C.y * D.x)) / denominator;

    if (isOnSegment(A, B, { x, y }) && isOnSegment(C, D, { x, y })) {
        return { x, y };
    }
    return null;
}

function isOnSegment(A, B, P) {
    return Math.min(A.x, B.x) <= P.x && P.x <= Math.max(A.x, B.x) &&
           Math.min(A.y, B.y) <= P.y && P.y <= Math.max(A.y, B.y);
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }


function triangleArea(x1, y1, x2, y2, x3, y3) {
    return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2);
  }
  
  function isPointInsideTriangle(px, py, x1, y1, x2, y2, x3, y3) {
    const A = triangleArea(x1, y1, x2, y2, x3, y3);
    const A1 = triangleArea(px, py, x2, y2, x3, y3);
    const A2 = triangleArea(x1, y1, px, py, x3, y3);
    const A3 = triangleArea(x1, y1, x2, y2, px, py);
    return (A === A1 + A2 + A3);  
  }
  
  function estimateAreasTriangle(x1, y1, x2, y2, x3, y3, line1, line2) {
    let areas = [0, 0, 0, 0]; 
    const resolution = 1000; 
    
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution - i; j++) {
        const px = (x1 * (1 - i / resolution - j / resolution) + x2 * (i / resolution) + x3 * (j / resolution));
        const py = (y1 * (1 - i / resolution - j / resolution) + y2 * (i / resolution) + y3 * (j / resolution));
        
        if (isPointInsideTriangle(px, py, x1, y1, line1[0].x, line1[0].y, line1[1].x, line1[1].y)) {
          areas[0] += 1;
        } else if (isPointInsideTriangle(px, py, line1[0].x, line1[0].y, line1[1].x, line1[1].y, x3, y3)) {
          areas[1] += 1;
        } else if (isPointInsideTriangle(px, py, x2, y2, line2[0].x, line2[0].y, line2[1].x, line2[1].y)) {
          areas[2] += 1;
        } else {
          areas[3] += 1;
        }
      }
    }
    
    return areas;
  }
 
  function estimateAreasCircle(cx, cy, r, line1, line2) {
    let areas = [0, 0, 0, 0];

    function getAngle(px, py, cx, cy) {
        return Math.atan2(py - cy, px - cx); 
    }

    function lineCircleIntersection(x1, y1, x2, y2, cx, cy, r) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const fx = x1 - cx;
        const fy = y1 - cy;
        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = (fx * fx + fy * fy) - r * r;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return []; 
        } else {
            const sqrtDiscriminant = Math.sqrt(discriminant);
            const t1 = (-b + sqrtDiscriminant) / (2 * a);
            const t2 = (-b - sqrtDiscriminant) / (2 * a);
            const intersection1 = { x: x1 + t1 * dx, y: y1 + t1 * dy };
            const intersection2 = { x: x1 + t2 * dx, y: y1 + t2 * dy };
            return [intersection1, intersection2]; 
        }
    }

    const intersections1 = lineCircleIntersection(line1[0].x, line1[0].y, line1[1].x, line1[1].y, cx, cy, r);
    const intersections2 = lineCircleIntersection(line2[0].x, line2[0].y, line2[1].x, line2[1].y, cx, cy, r);

    if (intersections1.length < 2 || intersections2.length < 2) {
        return []; 
    }

    const angle1_1 = getAngle(intersections1[0].x, intersections1[0].y, cx, cy);
    const angle1_2 = getAngle(intersections1[1].x, intersections1[1].y, cx, cy);
    const angle2_1 = getAngle(intersections2[0].x, intersections2[0].y, cx, cy);
    const angle2_2 = getAngle(intersections2[1].x, intersections2[1].y, cx, cy);

    const angles = [angle1_1, angle1_2, angle2_1, angle2_2];

    angles.sort((a, b) => a - b);

    let totalAngle = 2 * Math.PI;
    for (let i = 0; i < 4; i++) {
        let angleDifference = angles[(i + 1) % 4] - angles[i];
        if (angleDifference < 0) {
            angleDifference += totalAngle;
        }
        areas[i] = Math.floor(1000 * angleDifference / totalAngle); 
    }

    return areas;
}
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    userName = urlParams.get('user') || "Неизвестный игрок";
};

function displayStats(user, score) {
    const statsElement = document.getElementById('stats'); 
    statsElement.innerHTML = `Игрок: ${user}, Очки: ${score}`;
}

createRandomFigure();
restartButton.style.display = 'none';
