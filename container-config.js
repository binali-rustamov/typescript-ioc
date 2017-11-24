System.register([], function (exports_1, context_1) {
    'use strict';
    var __moduleName = context_1 && context_1.id;
    var ContainerConfig;
    return {
        setters: [],
        execute: function () {
            ContainerConfig = (function () {
                function ContainerConfig() {
                }
                ContainerConfig.addSource = function (patterns, baseDir) {
                    var requireGlob = require('require-glob');
                    baseDir = baseDir || process.cwd();
                    requireGlob.sync(patterns, {
                        cwd: baseDir
                    });
                };
                return ContainerConfig;
            }());
            exports_1("ContainerConfig", ContainerConfig);
        }
    };
});
//# sourceMappingURL=container-config.js.map