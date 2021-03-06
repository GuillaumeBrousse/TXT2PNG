/**
 * JS2PNG v0.1.2
 * www.github.com/felixmaier/JS2PNG
 * @author Felix Maier
 */
(function() { 'use strict'

    var root = this;

    var JS2PNG = JS2PNG || {};

    var BYTE_STORE = {};
    
    BYTE_STORE.init = function() {

        this.mode = arguments[0];
        this.data = arguments[1];
        this.prefix = arguments[2];
        this.size = this.data.length;

        var width = Math.floor(Math.sqrt(this.size)),
            height = Math.ceil(this.size / width);

        return this.create_8b(this.mode, 'square', width, height);
    };
    
    BYTE_STORE.create_8b = function() {

        var mode = arguments[0],
            type = arguments[1],
            width = arguments[2],
            height = arguments[3];

        var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

        var ctx = canvas.getContext('2d');
        var imageData = ctx.createImageData(width, height);

        var cols = [];

        for (var ii = 0; ii < 256; ++ii) {
            cols[ii] = ii;
        }

        var data = this[this.prefix + mode];

        var ii = 0;
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                
                var b1 = parseInt(data[ii]),
                    col = cols[b1] ? cols[b1] : 0;

                col = JS2PNG.DEC2HEX(col);

                ctx.fillStyle = col;
                ctx.fillRect(x, y, 1, 1);

                ii++;
            }
        }

        return canvas;
            
    };

    
    /**
     * Convert decimal to hex color
     */
    JS2PNG.DEC2HEX = function(number) {
        if (number < 0) {
            number = 0xFFFFFFFF + number + 1;
        }
        var result = number.toString(16).toUpperCase();

        return "#" + result + result + result;
    };

    JS2PNG.Encode = function() {
    
        var results = [];

        var data = arguments[0],
            prefix = arguments[1] || "undefined",
            size = data.length;
            
        if (!data || !data.length) return;
        
        data = data.replace(/\s{2,}/g, '');

        data = data.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '');

        for (var ii = 0, bytes = []; ii < size; ++ii) {
            bytes.push(data.charCodeAt(ii));
        }

        BYTE_STORE[prefix + "_ascii"] = bytes;
        
        results.push(BYTE_STORE.init("_ascii", data, prefix));

        bytes = [];

        var sequences = Math.ceil((data.length) / 8);
        
        var byteObject = {
            c1: [],
            c2: [],
            c3: [],
            c4: [],
            c5: [],
            c6: [],
            c7: [],
            c8: []
        };

        for (var ii = 0; ii < sequences; ++ii) {
            byteObject.c1.push(data.substr( (ii * 8) + 0, 1).charCodeAt(0));
            byteObject.c2.push(data.substr( (ii * 8) + 1, 1).charCodeAt(0));
            byteObject.c3.push(data.substr( (ii * 8) + 2, 1).charCodeAt(0));
            byteObject.c4.push(data.substr( (ii * 8) + 3, 1).charCodeAt(0));
            byteObject.c5.push(data.substr( (ii * 8) + 4, 1).charCodeAt(0));
            byteObject.c6.push(data.substr( (ii * 8) + 5, 1).charCodeAt(0));
            byteObject.c7.push(data.substr( (ii * 8) + 6, 1).charCodeAt(0));
            byteObject.c8.push(data.substr( (ii * 8) + 7, 1).charCodeAt(0));
        }

        /**
         * Validate byte object array
         */
        for (var ii in byteObject) {
            for (var kk = 0; kk < byteObject[ii].length; ++kk) {
                byteObject[ii][kk] = !isNaN(byteObject[ii][kk]) ? byteObject[ii][kk] : 0;
            }
        }

        for (var ii = 0, resultArray = []; ii < sequences; ++ii) {
            byteObject.b1 = (( byteObject.c1[ii] << 1) | ( byteObject.c2[ii] >> 6 )) & 0xff;
            byteObject.b2 = (( byteObject.c2[ii] << 2) | ( byteObject.c3[ii] >> 5 )) & 0xff;
            byteObject.b3 = (( byteObject.c3[ii] << 3) | ( byteObject.c4[ii] >> 4 )) & 0xff;
            byteObject.b4 = (( byteObject.c4[ii] << 4) | ( byteObject.c5[ii] >> 3 )) & 0xff;
            byteObject.b5 = (( byteObject.c5[ii] << 5) | ( byteObject.c6[ii] >> 2 )) & 0xff;
            byteObject.b6 = (( byteObject.c6[ii] << 6) | ( byteObject.c7[ii] >> 1 )) & 0xff;
            byteObject.b7 = (((byteObject.c7[ii] << 7) & 0x80) | (byteObject.c8[ii] & 0x7f)) & 0xff;
            resultArray.push(byteObject.b1, byteObject.b2, byteObject.b3, byteObject.b4, byteObject.b5, byteObject.b6, byteObject.b7);
        }

        BYTE_STORE[prefix + "_seq8"] = resultArray;

        results.push(BYTE_STORE.init("_seq8", data, prefix));

        return results;

    };

    JS2PNG.Decode = function(element, resolve) {

        if (!element || !element.src) return;

        var image = new Image();
            image.src = element.src;

        image.addEventListener('load', function() {

            var canvas = document.createElement('canvas'),
                context = canvas.getContext('2d'),
                data, 
                content = '';

                canvas.width = this.width;
                canvas.height = this.height;
                context.drawImage(this, 0, 0);

                data = context.getImageData(0, 0, this.width, this.height).data;

                for (var ii = 0; ii < data.length; ii += 4) {
                    if (data[ii]) {
                        content += String.fromCharCode(data[ii])
                    } else break;
                }

            resolve(content);

        });

    };

    JS2PNG.Execute = function() {

        eval.call(window, arguments[0]);

    };


    root.JS2PNG = JS2PNG;

}).call(this);