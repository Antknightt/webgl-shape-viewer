var canvas, gl;
var points = [], normals = [];
var xAxis = 0, yAxis = 1, zAxis = 2;
var axis = 0;
var theta = [0, 0, 0];
var spinning = true;
var selectedColor = [1.0, 0.0, 0.0, 1.0];

var thetaLoc, uColorLoc, lightPosLoc;
var kaLoc, kdLoc, ksLoc, shininessLoc;

window.onload = function () {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE); // Show all pyramid faces

  document.getElementById("xButton").onclick = () => axis = xAxis;
  document.getElementById("yButton").onclick = () => axis = yAxis;
  document.getElementById("zButton").onclick = () => axis = zAxis;
  document.getElementById("stopButton").onclick = () => {
    spinning = !spinning;
    document.getElementById("stopButton").textContent = spinning ? "Stop Spinning" : "Start Spinning";
  };
  document.getElementById("shapeSelect").onchange = e => updateShape(e.target.value);
  document.getElementById("colorPicker").oninput = e => {
    selectedColor = hexToRgbArray(e.target.value);
    updateShape(document.getElementById("shapeSelect").value);
  };

  updateShape("cube");
  render();
};

function updateShape(shape) {
  points = []; normals = [];
  if (shape === "cube") colorCube(); else colorPyramid();

  const program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  bindBuffer(points, "vPosition", 4, program);
  bindBuffer(normals, "vNormal", 3, program);

  thetaLoc = gl.getUniformLocation(program, "theta");
  uColorLoc = gl.getUniformLocation(program, "uColor");
  lightPosLoc = gl.getUniformLocation(program, "lightPosition");

  kaLoc = gl.getUniformLocation(program, "ka");
  kdLoc = gl.getUniformLocation(program, "kd");
  ksLoc = gl.getUniformLocation(program, "ks");
  shininessLoc = gl.getUniformLocation(program, "shininess");

  gl.uniform4fv(uColorLoc, selectedColor);
  gl.uniform3fv(lightPosLoc, [1.0, 1.0, 1.0]);

  gl.uniform1f(kaLoc, 0.3);
  gl.uniform1f(kdLoc, 0.6);
  gl.uniform1f(ksLoc, 0.6);
  gl.uniform1f(shininessLoc, 20.0);
}

function bindBuffer(data, attribute, size, program) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);

  const loc = gl.getAttribLocation(program, attribute);
  gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(loc);
}

function colorCube() {
  const vertices = [
    vec4(-0.5, -0.5,  0.5, 1.0), vec4(-0.5,  0.5,  0.5, 1.0),
    vec4( 0.5,  0.5,  0.5, 1.0), vec4( 0.5, -0.5,  0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0), vec4(-0.5,  0.5, -0.5, 1.0),
    vec4( 0.5,  0.5, -0.5, 1.0), vec4( 0.5, -0.5, -0.5, 1.0)
  ];

  const faces = [
    [1, 0, 3, 2, [ 0,  0,  1]], // front
    [2, 3, 7, 6, [ 1,  0,  0]], // right
    [3, 0, 4, 7, [ 0, -1,  0]], // bottom
    [6, 5, 1, 2, [ 0,  1,  0]], // top
    [4, 5, 6, 7, [ 0,  0, -1]], // back
    [5, 4, 0, 1, [-1,  0,  0]]  // left
  ];

  for (const [a, b, c, d, normal] of faces) {
    quad(vertices, a, b, c, d, normal);
  }
}

function quad(verts, a, b, c, d, normal) {
  const indices = [a, b, c, a, c, d];
  for (const i of indices) {
    points.push(verts[i]);
    normals.push(normal);
  }
}

function colorPyramid() {
  const verts = [
    vec4( 0.0,  0.5,  0.0, 1.0),  // Apex
    vec4(-0.5, -0.5,  0.5, 1.0),
    vec4( 0.5, -0.5,  0.5, 1.0),
    vec4( 0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0)
  ];

  // Side faces
  triangle(verts, 0, 1, 2); // front
  triangle(verts, 0, 2, 3); // right
  triangle(verts, 0, 3, 4); // back
  triangle(verts, 0, 4, 1); // left

  // Base
  triangle(verts, 1, 2, 3, [0, -1, 0]);
  triangle(verts, 1, 3, 4, [0, -1, 0]);
}

function triangle(verts, a, b, c, customNormal) {
  const p1 = verts[a], p2 = verts[b], p3 = verts[c];
  const normal = customNormal || normalize(cross(subtract(p2, p1), subtract(p3, p1)));

  points.push(p1, p2, p3);
  normals.push(normal, normal, normal);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (spinning) theta[axis] += 2.0;
  gl.uniform3fv(thetaLoc, theta);
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
  requestAnimationFrame(render);
}

function hexToRgbArray(hex) {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
    1.0
  ];
}

// ✅ MISSING MATH FUNCTIONS (now included)
function subtract(a, b) {
  return [
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2]
  ];
}

function cross(a, b) {
  return [
    a[1]*b[2] - a[2]*b[1],
    a[2]*b[0] - a[0]*b[2],
    a[0]*b[1] - a[1]*b[0]
  ];
}

function normalize(v) {
  const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  return len > 0.00001 ? [v[0]/len, v[1]/len, v[2]/len] : [0, 0, 0];
}
