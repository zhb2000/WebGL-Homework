/** @type {Number[][]} */
const gameMat = [];
const MATRIX_WIDTH = 10;
const MATRIX_HEIGHT = 20;
/** @type {AbstractTetromino} */
let currentTetromino = null;

/** @type {number[][]} */
const points = [];
/** @type {WebGLRenderingContext} */
let gl;

/** @type {Number} */
let gameTimer;
let userMark = 0;

/**
 * [min, max)，不含最大值，含最小值
 * @param {Number} min 
 * @param {Number} max 
 */
function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function fillMatrix() {
    for (let x = 0; x < MATRIX_HEIGHT; x++) {
        const row = [];
        for (let y = 0; y < MATRIX_WIDTH; y++) {
            row.push(0);
        }
        gameMat.push(row);
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
    //const type = randInt(0, 6);
    const ctor = ctors[randInt(0, ctors.length)];
    currentTetromino = new ctor(-1, centerY, angle);
    //currentTetromino = new ITetromino(-1, centerY, angle);
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
     * @param {Number} i 
     * @param {Number} j 
     */
    function pushRectangle(i, j) {
        const len = 2 / MATRIX_HEIGHT;
        const [x1, y1] = [-0.5 + j * len, 1 - i * len];
        const [x2, y2] = [x1 + len, y1];
        const [x3, y3] = [x1 + len, y1 - len];
        const [x4, y4] = [x1, y1 - len];
        points.push([x1, y1], [x4, y4], [x3, y3]);
        points.push([x1, y1], [x3, y3], [x2, y2]);
    }

    points.length = 0;
    for (let x = 0; x < MATRIX_HEIGHT; x++) {
        for (let y = 0; y < MATRIX_WIDTH; y++) {
            if (gameMat[x][y] !== 0) {
                pushRectangle(x, y);
            }
        }
    }
    sendDataAndRender();
    //console.log(gameMat);
}

function removeFullRows() {
    /** @param {Number} x */
    function isFullRow(x) {
        for (let y = 0; y < MATRIX_WIDTH; y++) {
            if (gameMat[x][y] === 0) {
                return false;
            }
        }
        return true;
    }

    /** @param {Number} x */
    function removeRow(x) {
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

function nextTick() {
    function isHitTop() {
        let minX = 100;
        for (let [x, _] of currentTetromino.getCoords()) {
            minX = Math.min(minX, x);
        }
        return minX <= 0;
    }

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
        }, 500);
    }
}

/**
 * @param {Number} x 
 * @param {Number} y 
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
        if (y >= MATRIX_WIDTH || isCoordInMatrix(x, y) && gameMat[x][y] > 0) {
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
            gameMat[x][y] = -1;
        }
    }
}

function setFinalColor() {
    for (let [x, y] of currentTetromino.getCoords()) {
        if (isCoordInMatrix(x, y)) {
            gameMat[x][y] = 1;
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
    drawMatrix();
    setTimeout(() => {
        removeFullRows();
        drawMatrix();
    }, 500);
}

function init() {
    fillMatrix();
    setNewRandTetromino();

    const canvas = document.getElementById('gl-canvas');
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("webgl isn't available.");
        return;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    const program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    let vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    render();
}



function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

function sendDataAndRender() {
    const program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    let vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    render();
}

function startBtnClick() {
    gameTimer = setInterval(nextTick, 1000);
}

window.onload = init;
