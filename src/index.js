// assume the module is being compiled with libraryTarget: 'var'
class Var2EsmPlugin {
    constructor(libraryObjName, outputFile, isCompat=true) {
        this.libraryObjName = libraryObjName;
        this.outputFile = outputFile;
        this.isCompat = isCompat;
    }
    apply(compiler) {
        compiler.hooks.emit.tapAsync('Var2EsmPlugin', (compilation, callback) => {
            // https://webpack.js.org/contribute/plugin-patterns/
            // https://github.com/webpack/docs/wiki/how-to-write-a-plugin#a-simple-example
            // console.log('======== debug ========');
            // for (const [key, asset] of Object.entries(compilation.assets)) {
            //     let src = asset.source();
            //     let len = src.length;
            //     console.log('key, len:', key, len); // this.outputFile nnnn
            //     console.log('starts with:', src.substring(0, 64));
            //     console.log('ends with:', src.substring(len-64, len));
            // }
            // console.log('======== ========');

            // template, e.g.
            //   https://github.com/riot/riot/blob/master/riot.js
            //   node_modules/three/build/three.js
            let src = compilation.assets[this.outputFile].source();
            // console.log('src:', src); // `var ${this.libraryObjName} = ...`
            let srcNew = this.isCompat ? `
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.${this.libraryObjName} = {})));
}(this, (function (exports) { 'use strict';
    ${src}
    exports.default = ${this.libraryObjName};
    Object.defineProperty(exports, '__esModule', { value: true });
})));` : `
${src}
export default ${this.libraryObjName};
`;

            // https://github.com/webpack/docs/wiki/how-to-write-a-plugin
            // Insert this list into the Webpack build as a new file asset:
            compilation.assets[this.outputFile] = {
                source: () => srcNew,
                size: () => srcNew.length,
            };

            callback();
        });
    }
}
module.exports = Var2EsmPlugin;
