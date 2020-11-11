
//生成条带
function generateStrip(x, y, a, stripNum) {
    // console.log(x + ' ' + y + ' ' + a + ' ' + stripNum)
    let strip = [];
    let h = a / 2 * Math.sqrt(3);
    for (let i = 1; i <= stripNum; i++) {
        let ax, ay, bx, by, cx, cy;
        if (i % 2 == 0) {
            ax = x + i / 2 * a;
            ay = y;
            bx = ax - a / 2;
            by = ay + h;
            cx = ax + a / 2;
            cy = ay + h;
        } else {
            ax = x + (i - 1) / 2 * a;
            ay = y;
            bx = ax + a / 2;
            by = ay + h;
            cx = ax + a;
            cy = ay;
        }
        strip.push(ax, ay, bx, by, cx, cy);
    }
    return strip;
}

function lenNumToStripNum(lenNum) {
    return lenNum * 2 - 1;
}

//生成等边三角形
function generateTriangle(len, num) {
    let a = len / num;
    let h = a / 2 * Math.sqrt(3);
    let triangle = [];
    for (let i = 1; i <= num; i++) {
        let x = (i - 1) * (a / 2);
        let y = (i - 1) * h;
        let strip = generateStrip(x, y, a, lenNumToStripNum(num - i + 1));
        strip.forEach(e => triangle.push(e));
    }
    return triangle;
}

//移动数组中的点
function moveAll(arr, deltx, delty) {
    for (let i = 0; i < arr.length; i++) {
        if (i % 2 == 0) {
            arr[i] += deltx;
        } else {
            arr[i] += delty;
        }
    }
}

//缩放数组中的点
function scaleArray(arr, factor) {
    for (let i = 0; i < arr.length; i++) {
        arr[i] *= factor;
    }
}

function dist(x1, y1, x2, y2) {
    let delx = x1 - x2;
    let dely = y1 - y2;
    return Math.sqrt(delx * delx + dely * dely);
}

//旋转三角形中的点
function twist(triangle, theta, x0, y0) {
    for (let i = 0; i < triangle.length; i += 2) {
        let x = triangle[i];
        let y = triangle[i + 1];
        let d = dist(x, y, x0, y0);
        triangle[i] = x * Math.cos(d * theta) - y * Math.sin(d * theta);
        triangle[i + 1] = x * Math.sin(d * theta) + y * Math.cos(d * theta);
    }
}

function init() {
    /** @type {HTMLCanvasElement} */
    let canvas = document.getElementById('gl-canvas');
    /** @type {WebGLRenderingContext} */
    let gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("webgl isn't available.");
        return;
    }

    let len = 100;
    let triangle = generateTriangle(len, 100);//生成等边三角形
    moveAll(triangle, -len / 2, -len / 4);//将三角形中心移动到原点
    scaleArray(triangle, 1 / len);//缩放三角形
    twist(triangle, 1.44, 0, 0);//扭曲三角形


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    let program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render(gl, triangle);
}

window.onload = init;

function render(gl, arr) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, arr.length / 2);
}
