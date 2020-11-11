/** @type {WebGLRenderingContext} */
let gl;
/** @type {WebGLProgram} */
let program;
/** @type {number[][]} */
let points = [];

/**
 * @param {number[]} a 
 * @param {number[]} b 
 * @param {number[]} c 
 * @param {number[]} d
 */
function tetrahedron(a, b, c, d) {
    points.push(a, b, c);
    points.push(a, c, d);
    points.push(a, d, b);
    points.push(b, d, c);
}

/**
 * @param {number[]} a 
 * @param {number[]} b 
 * @param {number[]} c 
 * @param {number[]} d
 * @param {number} count 
 */
function divideTetrahedron(a, b, c, d, count) {
    if (count === 0) {
        tetrahedron(a, b, c, d);
    } else {
        let ab = mix(a, b, 0.5);
        let ac = mix(a, c, 0.5);
        let ad = mix(a, d, 0.5);
        let bc = mix(b, c, 0.5);
        let bd = mix(b, d, 0.5);
        let cd = mix(c, d, 0.5);
        count--;
        divideTetrahedron(a, ab, ac, ad, count);
        divideTetrahedron(ab, b, bc, bd, count);
        divideTetrahedron(ac, bc, c, cd, count);
        divideTetrahedron(ad, bd, cd, d, count);
    }
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
function rotateX(theta) {
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
function rotateY(theta) {
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
function rotateZ(theta) {
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    return [
        [c, -s, 0, 0],
        [s, c, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];
}

function init() {
    /** @type {HTMLCanvasElement} */
    let canvas = document.getElementById('gl-canvas');
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("webgl isn't available.");
        return;
    }

    let l = 1.0;
    let a = [0 * l, 0 * l, Math.sqrt(6) / 4 * l];
    let b = [Math.sqrt(3) / 6 * l, -1 / 2 * l, -Math.sqrt(6) / 12 * l];
    let c = [Math.sqrt(3) / 6 * l, 1 / 2 * l, -Math.sqrt(6) / 12 * l];
    let d = [-Math.sqrt(3) / 3 * l, 0 * l, -Math.sqrt(6) / 12 * l];
    divideTetrahedron(a, b, c, d, 5);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    let vPositionLoc = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionLoc);

    rotateHandle();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

function rotateHandle() {
    let x = document.getElementById('x-range').value;
    let y = document.getElementById('y-range').value;
    let z = document.getElementById('z-range').value;
    x = x / 100 * Math.PI;
    y = y / 100 * Math.PI;
    z = z / 100 * Math.PI;

    let uViewMatrixLoc = gl.getUniformLocation(program, 'uViewMatrix');
    let viewMatrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
    viewMatrix = multMat4(rotateX(x), viewMatrix);
    viewMatrix = multMat4(rotateY(y), viewMatrix);
    viewMatrix = multMat4(rotateZ(z), viewMatrix);
    gl.uniformMatrix4fv(uViewMatrixLoc, false, flatten(viewMatrix));
    render();
}

window.onload = init;