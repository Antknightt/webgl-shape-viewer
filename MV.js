// Angel.js (Matrix and Vector Library)
// Full version should go here. For demonstration:
function vec4() {
    var result = [].concat.apply([], arguments);
    while (result.length < 4) result.push(result.length === 3 ? 1.0 : 0.0);
    return result.splice(0, 4);
}

function flatten(v) {
    if (Array.isArray(v[0])) {
        let floats = new Float32Array(v.length * v[0].length);
        for (let i = 0; i < v.length; ++i)
            for (let j = 0; j < v[i].length; ++j)
                floats[i * v[i].length + j] = v[i][j];
        return floats;
    } else {
        return new Float32Array(v);
    }
}
// Include other full vector/matrix helpers (add, mult, normalize, etc.)