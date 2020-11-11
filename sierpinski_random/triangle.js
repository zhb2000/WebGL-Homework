let gl;
let points = [];
let numPoints = 10000;

function test(){
    
}

function makePoints() {
    let vertices = [vec2(-1, -1), vec2(0, 1), vec2(1, -1)];
    let u = add(vertices[0], vertices[1]);
    let v = add(vertices[0], vertices[2]);
    let p = scale(0.5, add(u, v));

    points.push(p);

    for (let i = 0; points.length < numPoints; i++) {
        let j = Math.floor(Math.random() * 3);
        p = add(points[i], vertices[j]);
        p = scale(0.5, p);
        points.push(p);
    }

    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

function init() {
    let canvas = document.getElementById('gl-canvas');
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("webgl isn't available.");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    let program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    let vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    makePoints();

    render();
}

window.onload = init;

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.drawArrays(gl.TRIANGLES, 0, 30);
    gl.drawArrays(gl.POINTS, 0, points.length);
}
