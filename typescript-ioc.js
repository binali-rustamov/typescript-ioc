System.register(["reflect-metadata"], function (exports_1, context_1) {
    'use strict';
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __moduleName = context_1 && context_1.id;
    function Singleton(target) {
        IoCContainer.bind(target).scope(Scope.Singleton);
    }
    exports_1("Singleton", Singleton);
    function Scoped(scope) {
        return function (target) {
            IoCContainer.bind(target).scope(scope);
        };
    }
    exports_1("Scoped", Scoped);
    function Provided(provider) {
        return function (target) {
            IoCContainer.bind(target).provider(provider);
        };
    }
    exports_1("Provided", Provided);
    function Provides(target) {
        return function (to) {
            IoCContainer.bind(target).to(to);
        };
    }
    exports_1("Provides", Provides);
    function AutoWired(target) {
        var newConstructor = InjectorHanlder.decorateConstructor(target);
        var config = IoCContainer.bind(target);
        config.toConstructor(newConstructor);
        return newConstructor;
    }
    exports_1("AutoWired", AutoWired);
    function Inject() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length < 3 || typeof args[2] === 'undefined') {
            return InjectPropertyDecorator.apply(this, args);
        }
        else if (args.length === 3 && typeof args[2] === 'number') {
            return InjectParamDecorator.apply(this, args);
        }
        throw new Error('Invalid @Inject Decorator declaration.');
    }
    exports_1("Inject", Inject);
    function InjectPropertyDecorator(target, key) {
        var t = Reflect.getMetadata('design:type', target, key);
        if (!t) {
            t = Reflect.getMetadata('design:type', target.constructor, key);
        }
        IoCContainer.injectProperty(target.constructor, key, t);
    }
    function InjectParamDecorator(target, propertyKey, parameterIndex) {
        if (!propertyKey) {
            var config = IoCContainer.bind(target);
            config.paramTypes = config.paramTypes || [];
            var paramTypes = Reflect.getMetadata('design:paramtypes', target);
            config.paramTypes.unshift(paramTypes[parameterIndex]);
        }
    }
    function checkType(source) {
        if (!source) {
            throw new TypeError('Invalid type requested to IoC ' +
                'container. Type is not defined.');
        }
    }
    var Container, IoCContainer, ConfigImpl, Scope, LocalScope, SingletonScope, InjectorHanlder;
    return {
        setters: [
            function (_1) {
            }
        ],
        execute: function () {
            Container = (function () {
                function Container() {
                }
                Container.bind = function (source) {
                    if (!IoCContainer.isBound(source)) {
                        AutoWired(source);
                        return IoCContainer.bind(source).to(source);
                    }
                    return IoCContainer.bind(source);
                };
                Container.get = function (source) {
                    return IoCContainer.get(source);
                };
                return Container;
            }());
            exports_1("Container", Container);
            IoCContainer = (function () {
                function IoCContainer() {
                }
                IoCContainer.isBound = function (source) {
                    checkType(source);
                    var baseSource = InjectorHanlder.getConstructorFromType(source);
                    var config = IoCContainer.bindings.get(baseSource);
                    return (!!config);
                };
                IoCContainer.bind = function (source) {
                    checkType(source);
                    var baseSource = InjectorHanlder.getConstructorFromType(source);
                    var config = IoCContainer.bindings.get(baseSource);
                    if (!config) {
                        config = new ConfigImpl(baseSource);
                        IoCContainer.bindings.set(baseSource, config);
                    }
                    return config;
                };
                IoCContainer.get = function (source) {
                    var config = IoCContainer.bind(source);
                    if (!config.iocprovider) {
                        config.to(config.source);
                    }
                    return config.getInstance();
                };
                IoCContainer.injectProperty = function (target, key, propertyType) {
                    var propKey = "__" + key;
                    Object.defineProperty(target.prototype, key, {
                        enumerable: true,
                        get: function () {
                            return this[propKey] ? this[propKey] : this[propKey] = IoCContainer.get(propertyType);
                        },
                        set: function (newValue) {
                            this[propKey] = newValue;
                        }
                    });
                };
                IoCContainer.assertInstantiable = function (target) {
                    if (target['__block_Instantiation']) {
                        throw new TypeError('Can not instantiate Singleton class. ' +
                            'Ask Container for it, using Container.get');
                    }
                };
                IoCContainer.bindings = new Map();
                return IoCContainer;
            }());
            ConfigImpl = (function () {
                function ConfigImpl(source) {
                    this.source = source;
                }
                ConfigImpl.prototype.to = function (target) {
                    checkType(target);
                    var targetSource = InjectorHanlder.getConstructorFromType(target);
                    if (this.source === targetSource) {
                        var configImpl_1 = this;
                        this.iocprovider = {
                            get: function () {
                                var params = configImpl_1.getParameters();
                                if (configImpl_1.decoratedConstructor) {
                                    return (params ? new ((_a = configImpl_1.decoratedConstructor).bind.apply(_a, [void 0].concat(params)))() : new configImpl_1.decoratedConstructor());
                                }
                                return (params ? new (target.bind.apply(target, [void 0].concat(params)))() : new target());
                                var _a;
                            }
                        };
                    }
                    else {
                        this.iocprovider = {
                            get: function () {
                                return IoCContainer.get(target);
                            }
                        };
                    }
                    if (this.iocscope) {
                        this.iocscope.reset(this.source);
                    }
                    return this;
                };
                ConfigImpl.prototype.provider = function (provider) {
                    this.iocprovider = provider;
                    if (this.iocscope) {
                        this.iocscope.reset(this.source);
                    }
                    return this;
                };
                ConfigImpl.prototype.scope = function (scope) {
                    this.iocscope = scope;
                    if (scope === Scope.Singleton) {
                        this.source['__block_Instantiation'] = true;
                        scope.reset(this.source);
                    }
                    else if (this.source['__block_Instantiation']) {
                        delete this.source['__block_Instantiation'];
                    }
                    return this;
                };
                ConfigImpl.prototype.withParams = function () {
                    var paramTypes = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        paramTypes[_i] = arguments[_i];
                    }
                    this.paramTypes = paramTypes;
                    return this;
                };
                ConfigImpl.prototype.toConstructor = function (newConstructor) {
                    this.decoratedConstructor = newConstructor;
                    return this;
                };
                ConfigImpl.prototype.getInstance = function () {
                    if (!this.iocscope) {
                        this.scope(Scope.Local);
                    }
                    return this.iocscope.resolve(this.iocprovider, this.source);
                };
                ConfigImpl.prototype.getParameters = function () {
                    if (this.paramTypes) {
                        return this.paramTypes.map(function (paramType) { return IoCContainer.get(paramType); });
                    }
                    return null;
                };
                return ConfigImpl;
            }());
            Scope = (function () {
                function Scope() {
                }
                Scope.prototype.reset = function (source) {
                };
                return Scope;
            }());
            exports_1("Scope", Scope);
            LocalScope = (function (_super) {
                __extends(LocalScope, _super);
                function LocalScope() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                LocalScope.prototype.resolve = function (provider, source) {
                    return provider.get();
                };
                return LocalScope;
            }(Scope));
            Scope.Local = new LocalScope();
            SingletonScope = (function (_super) {
                __extends(SingletonScope, _super);
                function SingletonScope() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                SingletonScope.prototype.resolve = function (provider, source) {
                    var instance = SingletonScope.instances.get(source);
                    if (!instance) {
                        source['__block_Instantiation'] = false;
                        instance = provider.get();
                        source['__block_Instantiation'] = true;
                        SingletonScope.instances.set(source, instance);
                    }
                    return instance;
                };
                SingletonScope.prototype.reset = function (source) {
                    SingletonScope.instances.delete(InjectorHanlder.getConstructorFromType(source));
                };
                SingletonScope.instances = new Map();
                return SingletonScope;
            }(Scope));
            Scope.Singleton = new SingletonScope();
            InjectorHanlder = (function () {
                function InjectorHanlder() {
                }
                InjectorHanlder.decorateConstructor = function (target) {
                    var newConstructor;
                    newConstructor = (function (_super) {
                        __extends(ioc_wrapper, _super);
                        function ioc_wrapper() {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            var _this = _super.apply(this, args) || this;
                            IoCContainer.assertInstantiable(target);
                            return _this;
                        }
                        return ioc_wrapper;
                    }(target));
                    newConstructor['__parent'] = target;
                    return newConstructor;
                };
                InjectorHanlder.getConstructorFromType = function (target) {
                    var typeConstructor = target;
                    if (typeConstructor['name'] && typeConstructor['name'] !== 'ioc_wrapper') {
                        return typeConstructor;
                    }
                    while (typeConstructor = typeConstructor['__parent']) {
                        if (typeConstructor['name'] && typeConstructor['name'] !== 'ioc_wrapper') {
                            return typeConstructor;
                        }
                    }
                    throw TypeError('Can not identify the base Type for requested target');
                };
                return InjectorHanlder;
            }());
        }
    };
});
//# sourceMappingURL=typescript-ioc.js.map