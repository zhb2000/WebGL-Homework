/** 
 * 顶点数组，每个元素为一个三元组
 * @type {number[][]} 
 */
let g_points = [];
/**
 * 索引数组
 * @type {number[]}
 */
let g_indices = [];
/** @type {WebGLRenderingContext}*/
let g_gl;
/** @type {WebGLProgram} */
let g_program;

/**
 * 纬线圈顶点
 * @param {number} z 
 * @param {number} r 
 * @param {number} latitudeDiv 
 */
function latitudeCircle(z, r, latitudeDiv) {
    for (let i = 0; i < latitudeDiv; i++) {
        let theta = 2 * Math.PI * (i / latitudeDiv);
        let x = r * Math.cos(theta);
        let y = r * Math.sin(theta);
        g_points.push([x, y, z]);
    }
}

/**
 * 画三角形
 * @param {number} indexA 
 * @param {number} indexB 
 * @param {number} indexC 
 */
function drawTriangle(indexA, indexB, indexC) {
    g_indices.push(indexA, indexB);
    g_indices.push(indexB, indexC);
    g_indices.push(indexC, indexA);
}

/**
 * 画四边形
 * @param {number} indexA 
 * @param {number} indexB 
 * @param {number} indexC 
 * @param {number} indexD 
 */
function drawQuadrilateral(indexA, indexB, indexC, indexD) {
    drawTriangle(indexA, indexB, indexC);
    drawTriangle(indexA, indexC, indexD);
}

/**
 * 画南北极的盖子
 * @param {number} poleIndex
 * @param {number} circleI
 * @param {number} latitudeDiv
 */
function drawCap(poleIndex, circleI, latitudeDiv) {
    let poleZ = g_points[poleIndex][2];
    let circleStart = circleI * latitudeDiv;
    for (let offset = 0; offset + 1 < latitudeDiv; offset++) {
        let i = circleStart + offset;
        let j = i + 1;
        if (poleZ > 0) {
            drawTriangle(poleIndex, i, j);
        } else {
            drawTriangle(j, i, poleIndex);
        }
    }
    let i = circleStart + latitudeDiv - 1;
    let j = circleStart;
    if (poleZ > 0) {
        drawTriangle(poleIndex, i, j);
    } else {
        drawTriangle(j, i, poleIndex);
    }
}

/**
 * 画第 i 个圈和第 j 个圈之间的条带（圈的序号从 0 开始）
 * @param {number} circleI 第 i 个圈
 * @param {number} circleJ 第 j 个圈
 * @param {number} latitudeDiv 圈细分份数
 */
function drawBetweenCircle(circleI, circleJ, latitudeDiv) {
    let startI = circleI * latitudeDiv; //第 i 个圈的起始序号
    let startJ = circleJ * latitudeDiv; //第 j 个圈的起始序号
    for (let offset = 0; offset + 1 < latitudeDiv; offset++) {
        let i1 = startI + offset;
        let i2 = i1 + 1;
        let j1 = startJ + offset;
        let j2 = j1 + 1;
        drawQuadrilateral(i2, i1, j1, j2);
    }
    let i1 = startI + latitudeDiv - 1;
    let i2 = startI;
    let j1 = startJ + latitudeDiv - 1;
    let j2 = startJ;
    drawQuadrilateral(i2, i1, j1, j2);
}

/**
 * 画球
 * @param {number} r 球半径
 * @param {number} latitudeDiv 纬线圈细分的份数
 * @param {number} circleNum 纬线圈个数
 */
function drawSphere(r, latitudeDiv, circleNum) {
    //每个圈 latitudeDiv 个点
    //共 circleNum 个圈
    for (let i = 1; i <= circleNum; i++) {
        let gamma = Math.PI * (i / (circleNum + 1));
        let z = r * Math.cos(gamma);
        let circleR = r * Math.sin(gamma);
        latitudeCircle(z, circleR, latitudeDiv);
    }
    g_points.push([0, 0, r]);
    g_points.push([0, 0, -r]);
    for (let circleI = 0; circleI + 1 < circleNum; circleI++) {
        let circleJ = circleI + 1;
        drawBetweenCircle(circleI, circleJ, latitudeDiv);
    }
    drawCap(g_points.length - 2, 0, latitudeDiv);
    drawCap(g_points.length - 1, circleNum - 1, latitudeDiv);
}

function init() {
    /** @type {HTMLCanvasElement} */
    let canvas = document.getElementById('gl-canvas');
    g_gl = WebGLUtils.setupWebGL(canvas);
    if (!g_gl) {
        alert("webgl isn't available.");
        return;
    }

    g_gl.viewport(0, 0, canvas.width, canvas.height);
    g_gl.clearColor(1.0, 1.0, 1.0, 1.0);

    g_program = initShaders(g_gl, 'vertex-shader', 'fragment-shader');
    g_gl.useProgram(g_program);

    drawSphere(1, 20, 10);

    //向 GPU 发送顶点数组
    let pointsBuffer = g_gl.createBuffer();//顶点数组缓冲区
    g_gl.bindBuffer(g_gl.ARRAY_BUFFER, pointsBuffer);
    g_gl.bufferData(g_gl.ARRAY_BUFFER, flatten(g_points), g_gl.STATIC_DRAW);

    //向 GPU 发送索引数组
    let indicesBuffer = g_gl.createBuffer();//顶点索引数组缓冲区
    g_gl.bindBuffer(g_gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    g_gl.bufferData(g_gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(g_indices), g_gl.STATIC_DRAW);

    //获取变量 vPosition 的位置，并为其绑定数据
    let vPositionLoc = g_gl.getAttribLocation(g_program, 'vPosition');
    g_gl.vertexAttribPointer(vPositionLoc, 3, g_gl.FLOAT, false, 0, 0);
    g_gl.enableVertexAttribArray(vPositionLoc);

    rotateHandle();
}

/**
 * 绘制
 */
function render() {
    //清空画布
    g_gl.clear(g_gl.COLOR_BUFFER_BIT);
    //绘制函数
    g_gl.drawElements(g_gl.LINES, g_indices.length, g_gl.UNSIGNED_BYTE, 0);
}

/**
 * @param {number[][]} a 
 * @param {number[][]} b 
 */
function multMat4(a, b) {
    let result = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return result;
}

/**
 * @param {number[][]} a 
 * @param {number[][]} b 
 */
function multMat4(a, b) {
    let result = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return result;
}

/**
 * @param {Number} theta
 */
function myRotateX(theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    return [
        [1, 0, 0, 0],
        [0, c, -s, 0],
        [0, s, c, 0],
        [0, 0, 0, 1]
    ];
}
/**
 * @param {Number} theta
 */
function myRotateY(theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    return [
        [c, 0, s, 0],
        [0, 1, 0, 0],
        [-s, 0, c, 0],
        [0, 0, 0, 1]
    ];
}
/**
 * @param {Number} theta
 */
function myRotateZ(theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    return [
        [c, -s, 0, 0],
        [s, c, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];
}

/**
 * 滑杆变化的回调函数
 */
function rotateHandle() {
    let x = document.getElementById('x-range').value;
    let y = document.getElementById('y-range').value;
    let z = document.getElementById('z-range').value;
    x = x / 100 * Math.PI;
    y = y / 100 * Math.PI;
    z = z / 100 * Math.PI;

    //获取 uViewMatrix 变量的位置
    let uViewMatrixLoc = g_gl.getUniformLocation(g_program, 'uViewMatrix');
    let viewMatrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
    viewMatrix = multMat4(myRotateX(x), viewMatrix);
    viewMatrix = multMat4(myRotateY(y), viewMatrix);
    viewMatrix = multMat4(myRotateZ(z), viewMatrix);
    viewMatrix.matrix = true;
    g_gl.uniformMatrix4fv(uViewMatrixLoc, false, flatten(viewMatrix));
    render();
}

window.onload = init;