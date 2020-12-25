/** @type {number[][]} */
const gameMat = [];
const MATRIX_WIDTH = 10;
const MATRIX_HEIGHT = 20;
/** @type {AbstractTetromino} */
let currentTetromino = null;
const colorArray = [
    null,
    [254 / 255, 171 / 255, 28 / 255, 1],
    [153 / 255, 153 / 255, 153 / 255, 1],
    [203 / 255, 84 / 255, 195 / 255, 1],
    [50 / 255, 163 / 255, 249 / 255, 1],
    [56 / 255, 196 / 255, 79 / 255, 1],
    [255 / 255, 0 / 255, 0 / 255, 1],
    [255 / 255, 102 / 255, 0 / 255, 1]
];

/**
 * 顶点数组
 * @type {number[][]} 
 */
const points = [];
/**
 * 顶点颜色数组
 * @type {number[][]}
 */
const pointColors = [];
/** @type {number[][]} */
const gridPoints = [];
/** @type {number[][]} */
const gridColors = [];
/** @type {WebGLRenderingContext} */
let gl;

/** @type {number} */
let gameTimer;
let userMark = 0;

/**
 * [min, max)，不含最大值，含最小值
 * @param {number} min 
 * @param {number} max 
 */
function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function initMatrix() {
    for (let x = 0; x < MATRIX_HEIGHT; x++) {
        const row = [];
        for (let y = 0; y < MATRIX_WIDTH; y++) {
            row.push(0);
        }
        gameMat.push(row);
    }
}

function initGrid() {
    const colors = [
        [248 / 255, 249 / 255, 250 / 255, 1],
        [243 / 255, 238 / 255, 232 / 255, 1]
    ];
    for (let i = 0; i < MATRIX_WIDTH; i++) {
        const color = colors[i % 2];
        const width = 2 / MATRIX_HEIGHT;
        const [x1, y1] = [-0.5 + width * i, 1];
        const [x2, y2] = [x1 + width, 1];
        const [x3, y3] = [x1 + width, -1];
        const [x4, y4] = [x1, -1];
        gridPoints.push([x1, y1], [x4, y4], [x3, y3]);
        gridColors.push(color, color, color);
        gridPoints.push([x1, y1], [x3, y3], [x2, y2]);
        gridColors.push(color, color, color);
    }
}

function setNewRandTetromino() {
    let centerY = randInt(0, MATRIX_WIDTH + 1);
    const angle = randInt(0, 3 + 1);
    const ctors = [
        ITetromino,
        OTetromino,
        TTetromino,
        JTetromino,
        LTetromino,
        STetromino,
        ZTetromino
    ];
    const ctor = ctors[randInt(0, ctors.length)];
    currentTetromino = new ctor(-1, centerY, angle);
    let maxX = -100;
    let minY = 100;
    let maxY = -100;
    for (let p of currentTetromino.getCoords()) {
        const [x, y] = p;
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    if (maxX > -1) {
        currentTetromino.centerX -= maxX - (-1);
    }
    if (minY < 0) {
        currentTetromino.centerY += 0 - minY;
    } else if (maxY >= MATRIX_WIDTH) {
        currentTetromino.centerY -= maxY - (MATRIX_WIDTH - 1);
    }
}

function drawMatrix() {
    /**
     * @param {number} i 
     * @param {number} j 
     */
    function pushRectangle(i, j) {
        const len = 2 / MATRIX_HEIGHT;
        let [x1, y1] = [-0.5 + j * len, 1 - i * len];
        let [x2, y2] = [x1 + len, y1];
        let [x3, y3] = [x1 + len, y1 - len];
        let [x4, y4] = [x1, y1 - len];
        const d = 5e-3;
        x1 += d; y1 -= d;
        x2 -= d; y2 -= d;
        x3 -= d; y3 += d;
        x4 += d; y4 += d;
        points.push([x1, y1], [x4, y4], [x3, y3]);
        points.push([x1, y1], [x3, y3], [x2, y2]);
    }

    /**
     * @param {number} i 
     * @param {number} j 
     */
    function pushRectangleColor(i, j) {
        const color = colorArray[Math.abs(gameMat[i][j])];
        console.assert(color != null);
        pointColors.push(color, color, color);
        pointColors.push(color, color, color);
    }

    points.length = 0;
    pointColors.length = 0;
    for (let x = 0; x < MATRIX_HEIGHT; x++) {
        for (let y = 0; y < MATRIX_WIDTH; y++) {
            if (gameMat[x][y] !== 0) {
                pushRectangle(x, y);
                pushRectangleColor(x, y);
            }
        }
    }

    gl.clear(gl.COLOR_BUFFER_BIT); //清屏
    drawBackground();
    sendDataAndRender();
}

function removeFullRows() {
    /** @param {number} x */
    function isFullRow(x) {
        for (let y = 0; y < MATRIX_WIDTH; y++) {
            if (gameMat[x][y] === 0) {
                return false;
            }
        }
        return true;
    }

    /** @param {number} x */
    function removeRow(x) {
        console.log('Remove row ' + x);
        if (x === 0) {
            for (let y = 0; y < MATRIX_WIDTH; y++) {
                gameMat[x][y] = 0;
            }
            //FIXME
        } else {
            for (let i = x; i > 0; i--) {
                for (let j = 0; j < MATRIX_WIDTH; j++) {
                    gameMat[i][j] = gameMat[i - 1][j];
                }
            }
        }
    }

    function addUserMark() {
        userMark += 1;
        //TODO set text
    }

    for (let x = MATRIX_HEIGHT - 1; x >= 0; x--) {
        if (isFullRow(x)) {
            removeRow(x);
            addUserMark();
        }
    }
}

function isHitTop() {
    let minX = 100;
    for (let [x, _] of currentTetromino.getCoords()) {
        minX = Math.min(minX, x);
    }
    return !canMoveDown() && minX <= 0;
}

function nextTick() {
    if (canMoveDown()) {
        clearToZero();
        currentTetromino.moveDown();
        setTempColor();
        drawMatrix();
    } else {
        setFinalColor();
        drawMatrix();
        setTimeout(() => {
            removeFullRows();
            drawMatrix();
            if (isHitTop()) {
                clearInterval(gameTimer);
                alert('You lose.');
            } else {
                setNewRandTetromino();
            }
        }, 300);
    }
}

/**
 * @param {number} x 
 * @param {number} y 
 */
function isCoordInMatrix(x, y) {
    return 0 <= x && x < MATRIX_HEIGHT && 0 <= y && y < MATRIX_WIDTH;
}

function canMoveDown() {
    currentTetromino.moveDown();
    let result = true;
    for (let [x, y] of currentTetromino.getCoords()) {
        if (x >= MATRIX_HEIGHT
            || isCoordInMatrix(x, y) && gameMat[x][y] > 0) {
            result = false;
            break;
        }
    }
    currentTetromino.moveUp();
    return result;
}

function canMoveLeft() {
    currentTetromino.moveLeft();
    let result = true;
    for (let [x, y] of currentTetromino.getCoords()) {
        if (y < 0) {
            result = false;
            break;
        }
        if (isCoordInMatrix(x, y) && gameMat[x][y] > 0) {
            result = false;
            break;
        }
    }
    currentTetromino.moveRight();
    return result;
}

function canMoveRight() {
    currentTetromino.moveRight();
    let result = true;
    for (let [x, y] of currentTetromino.getCoords()) {
        if (y >= MATRIX_WIDTH
            || isCoordInMatrix(x, y) && gameMat[x][y] > 0) {
            result = false;
            break;
        }
    }
    currentTetromino.moveLeft();
    return result;
}

function canRotate() {
    currentTetromino.rotateClockwise();
    let result = true;
    for (let [x, y] of currentTetromino.getCoords()) {
        if (y < 0 || y >= MATRIX_WIDTH || x >= MATRIX_HEIGHT
            || isCoordInMatrix(x, y) && gameMat[x][y] > 0) {
            result = false;
            break;
        }
    }
    currentTetromino.rotateCounterclockwise();
    return result;
}

function clearToZero() {
    for (let [x, y] of currentTetromino.getCoords()) {
        if (isCoordInMatrix(x, y)) {
            gameMat[x][y] = 0;
        }
    }
}

/**
 * @param {BlobCallback} isTemp 
 */
function setTempColor() {
    for (let [x, y] of currentTetromino.getCoords()) {
        if (isCoordInMatrix(x, y)) {
            console.assert(currentTetromino.colorIndex != null);
            gameMat[x][y] = -currentTetromino.colorIndex;
        }
    }
}

function setFinalColor() {
    for (let [x, y] of currentTetromino.getCoords()) {
        if (isCoordInMatrix(x, y)) {
            console.assert(currentTetromino.colorIndex != null);
            gameMat[x][y] = currentTetromino.colorIndex;
        }
    }
}

function moveLeftBtnClick() {
    if (canMoveLeft()) {
        clearToZero();
        currentTetromino.moveLeft();
        setTempColor();
        drawMatrix();
    }
}

function moveRightBtnClick() {
    if (canMoveRight()) {
        clearToZero();
        currentTetromino.moveRight();
        setTempColor();
        drawMatrix();
    }
}

function rotateBtnClick() {
    if (canRotate()) {
        clearToZero();
        currentTetromino.rotateClockwise();
        setTempColor();
        drawMatrix();
    }
}

function moveToBottomBtnClick() {
    while (canMoveDown()) {
        clearToZero();
        currentTetromino.moveDown();
        setTempColor();
    }
    setFinalColor();
    drawMatrix();
    setTimeout(() => {
        removeFullRows();
        drawMatrix();
        if (isHitTop()) {
            clearInterval(gameTimer);
            alert('You lose.');
        } else {
            setNewRandTetromino();
        }
    }, 300);
}

function init() {
    initMatrix();
    initGrid();
    setNewRandTetromino();

    const canvas = document.getElementById('gl-canvas');
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("webgl isn't available.");
        return;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    drawBackground();
}

function sendDataAndRender() {
    const program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);
    //发送顶点数据
    const pointBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    const vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    //发送顶点颜色数据
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointColors), gl.STATIC_DRAW);
    const vColor = gl.getAttribLocation(program, 'vColor');
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

function drawBackground() {//TODO
    const program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);
    //发送网格顶点数据
    const pointBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(gridPoints), gl.STATIC_DRAW);
    const vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    //发送网格颜色数据
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(gridColors), gl.STATIC_DRAW);
    const vColor = gl.getAttribLocation(program, 'vColor');
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.drawArrays(gl.TRIANGLES, 0, gridPoints.length);
}

function startBtnClick() {
    gameTimer = setInterval(nextTick, 1000);
    /** @type {HTMLButtonElement} */
    const btn = document.getElementById('start-btn');
    btn.disabled = true;
}

window.onload = init;

document.onkeydown = e => {
    if (e.key === 'ArrowLeft') {
        moveLeftBtnClick();
    } else if (e.key === 'ArrowRight') {
        moveRightBtnClick();
    } else if (e.key === 'ArrowDown') {
        moveToBottomBtnClick();
    } else if (e.key === ' ') {
        rotateBtnClick();
    }
}