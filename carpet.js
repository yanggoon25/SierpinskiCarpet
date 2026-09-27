"use strict";

var gl;
var points = [];
var NumTimesToSubdivide = 3;
var program;
var bufferId;
var uColorLoc;
var carpetColor = [0.0, 0.0, 0.0, 1.0]; // 검은색

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 ); // 배경 흰색

    // 세팅
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    uColorLoc = gl.getUniformLocation( program, "uColor" );

    
    // 분할 횟수 슬라이더
    document.getElementById("subdivision").oninput = function(event) {
        NumTimesToSubdivide = parseInt(event.target.value);
        document.getElementById("subdivValue").innerText = NumTimesToSubdivide;
        generateCarpet(); // 다시 그리기
    };

    // 색상 선택
    document.getElementById("colorPicker").oninput = function(event) {
        var hex = event.target.value;
        var r = parseInt(hex.substr(1, 2), 16) / 255.0;
        var g = parseInt(hex.substr(3, 2), 16) / 255.0;
        var b = parseInt(hex.substr(5, 2), 16) / 255.0;
        carpetColor = [r, g, b, 1.0];
        render(); // 렌더링만 다시 그리기
    };

    // 그리기
    generateCarpet();
};

function generateCarpet() {
    points = [];
    
    var bottomLeft = vec2(-1.0, -1.0);
    var topRight = vec2(1.0, 1.0);

    divideSquare(bottomLeft, topRight, NumTimesToSubdivide);

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    render();
}

function divideSquare(bottomLeft, topRight, count) {
    if (count === 0) {
        // 삼각형 2개로 나눠서 그리기
        var x0 = bottomLeft[0];
        var y0 = bottomLeft[1];
        var x1 = topRight[0];
        var y1 = topRight[1];

        // 삼각형 1
        points.push(vec2(x0, y0)); // 좌측 하단
        points.push(vec2(x1, y0)); // 우측 하단
        points.push(vec2(x0, y1)); // 좌측 상단
        
        // 삼각형 2
        points.push(vec2(x0, y1)); // 좌측 상단
        points.push(vec2(x1, y0)); // 우측 하단
        points.push(vec2(x1, y1)); // 우측 상단

    } else {
        // 사각형 9등분
        var x0 = bottomLeft[0];
        var y0 = bottomLeft[1];
        var x3 = topRight[0];
        var y3 = topRight[1];
        
        var dx = (x3 - x0) / 3.0;
        var dy = (y3 - y0) / 3.0;

        var x1 = x0 + dx;
        var x2 = x0 + 2.0 * dx;
        var y1 = y0 + dy;
        var y2 = y0 + 2.0 * dy;

        count--;

        // 아래
        divideSquare(vec2(x0, y0), vec2(x1, y1), count);
        divideSquare(vec2(x1, y0), vec2(x2, y1), count);
        divideSquare(vec2(x2, y0), vec2(x3, y1), count);
        // 중간
        divideSquare(vec2(x0, y1), vec2(x1, y2), count);
        divideSquare(vec2(x2, y1), vec2(x3, y2), count);
        // 위
        divideSquare(vec2(x0, y2), vec2(x1, y3), count);
        divideSquare(vec2(x1, y2), vec2(x2, y3), count);
        divideSquare(vec2(x2, y2), vec2(x3, y3), count);
    }
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.uniform4fv(uColorLoc, carpetColor);
    
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}