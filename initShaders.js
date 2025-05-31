
function loadFileAJAX(name) {
    var xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', name, false);
    xhr.send(null);
    return xhr.status == okStatus ? xhr.responseText : null;
}

function initShaders(gl, vertexId, fragmentId) {
    function getShader(gl, id, type) {
        var shader = gl.createShader(type);
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            alert("Shader script not found: " + id);
            return null;
        }
        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType === 3) str += k.textContent;
            k = k.nextSibling;
        }
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    var vertShdr = getShader(gl, vertexId, gl.VERTEX_SHADER);
    var fragShdr = getShader(gl, fragmentId, gl.FRAGMENT_SHADER);
    var program = gl.createProgram();
    gl.attachShader(program, vertShdr);
    gl.attachShader(program, fragShdr);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Shader program failed to link");
    }
    return program;
}
