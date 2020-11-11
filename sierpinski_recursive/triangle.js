/** @type {number[][]} */
let points = [];

/**
 * @param {number[]} a 
 * @param {number[]} b 
 * @param {number[]} c 
 */
function triangle(a, b, c) {
    points.push(a, b, c);
}

/**
 * @param {number[]} a 
 * @param {number[]} b 
 * @param {number[]} c 
 * @param {number} count 
 */
function divideTriangle(a, b, c, count) {
    if (count === 0) {
        triangle(a, b, c);
    } else {
        let ab = mix(a, b, 0.5);
        let ac = mix(a, c, 0.5);
        let bc = mix(b, c, 0.5);
        count--;
        divideTriangle(a, ab, ac, count);
        divideTriangle(b, bc, ab, count);
        divideTriangle(c, ac, bc, count);
    }
}

function init() {
    let canvas = document.getElementById('gl-canvas');
    let gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("webgl isn't available.");
        return;
    }

    divideTriangle([-1, -1], [0, 1], [1, -1], 5);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    let program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    let vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render(gl);
}

window.onload = init;

/**
 * @param {WebGLRenderingContext} gl 
 */
function render(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}
