const cards = [
    { id: 1, x: -8, y: -8 },
    { id: 2, x: -7, y: -7 },
    { id: 3, x: -6, y: -8 },
    { id: 4, x: -8, y: -6 },
    { id: 5, x: -7, y: -6 },
    { id: 6, x: -6, y: -7 },
    { id: 7, x: -8, y: -5 },
    { id: 8, x: -5, y: -8 },
    { id: 9, x: -7, y: -5 }
];
const weights = [3, 2, 2, 1, 1, 1, 0.5, 0.5, 0];

let sumX = 0;
let sumY = 0;
let sumW = 0;

for (let i=0; i<9; i++) {
    sumX += cards[i].x * weights[i];
    sumY += cards[i].y * weights[i];
    sumW += weights[i];
}

console.log("Expected Centroid:", sumX/sumW, sumY/sumW);
