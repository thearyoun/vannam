(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {exports: {}};
            t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }

    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})
({
    "../app/js/constants.js": [function (require, module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        var AppSettings = {
            appTitle: 'Utile',
            //apiUrl: 'http://api.utiledev.vanam.fr/',
            //apiUrl: 'http://devapivanam.ithubkh.com/',
            apiUrl: 'http://vannam.backend.localhost:81/',
        };

        exports.default = AppSettings;
    }, {}],
    "../app/js/controllers/auth.js": [function (require, module, exports) {
        'use strict';

        authController.$inject = ["$scope", "$rootScope", "$state", "WS", "$localStorage"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function authController($scope, $rootScope, $state, WS, $localStorage) {
            'ngInject';

            var vm = this;
            vm.error = '';
            $localStorage.data = {};
            $localStorage.companies = {};

            $rootScope.$on('$stateChangeSuccess', function () {
                vm.error = '';
                vm.user = {};
            });

            vm.user = {
                mail: 'loic@vanam.fr',
                passwd: 'loic13$$'

                // vm.user = {
                //     mail : 'gwendoline@vanam.fr',
                //     passwd : 'gwendoline'
                // }

            };
            vm.login = function () {
                WS.post('login', vm.user).then(function (data) {
                    if (data.error) {
                        vm.error = data.error;
                        $scope.$apply();
                    } else {
                        $localStorage.data = data.data;
                        $state.go('app.index', {}, {
                            reload: true
                        });
                    }
                }).then(function (error) {
                    console.error(error);
                    vm.error = 'Un problème est survenu. Merci de contacter l’administrateur.';
                    $scope.$apply();
                });
            };
            vm.forgotPassword = function () {
                WS.forgot({email: vm.email}).then(function (data) {
                    if (data.error) {
                        vm.error = data.error;
                        $scope.$apply();
                    } else {
                        notif('success', 'Vérifier votre boite mail');
                    }
                }).then(null, function (error) {
                    console.log(error);
                });
            };
        }

        exports.default = {
            name: 'authController',
            fn: authController
        };

    }, {}],
    "../app/js/controllers/categories.js": [function (require, module, exports) {
        'use strict';
        categoriesController.$inject = ["$scope", "$rootScope", "$state", "WS", "$localStorage"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function categoriesController($scope, $rootScope, $state, WS, $localStorage) {
            'ngInject';

            var vm = this;
            vm.categories = [];
            vm.category = {};
            var table = null;
            vm.getCategories = function () {
                WS.get('category').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.categories = res.data.categories;
                        $scope.$apply();
                        table = $('#categories').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                }).then(null, function (error) {
                });
            };
            vm.addCategory = function () {
                WS.post('category', vm.category).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        table.destroy();
                        vm.getCategories();
                        vm.category = {};
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                });
            };

            vm.updateCategory = function (value) {
                value.category_id = value.id;
                WS.put('category', value).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        table.destroy();
                        vm.getCategories();
                        vm.category = {};
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                });
            };

            vm.deleteCategory = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('category', {category_id: id}).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            table.destroy();
                            vm.getCategories();
                        }
                    }).then(null, function (error) {
                    });
                });
            };
        }

        exports.default = {
            name: 'categoriesController',
            fn: categoriesController
        };

    }, {}],
    "../app/js/controllers/clients.js": [function (require, module, exports) {
        'use strict';

        clientsController.$inject = ["$scope", "$rootScope", "$state", "WS", "$localStorage", "AppSettings"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function clientsController($scope, $rootScope, $state, WS, $localStorage, AppSettings) {
            'ngInject';

            var vm = this;
            var table = null;
            vm.editing = 0;
            vm.update_client = 0;
            vm.address = {
                is_delivery_address: 0,
                is_billing_address: 0
            };
            vm.info = {};
            vm.search = '';
            vm.link = '';
            vm.info.authorization = {};
            vm.managers = [];
            vm.brands = [];
            vm.categories = [];
            vm.countries = [];
            vm.total_commands = 0;
            vm.total_quotations = 0;
            vm.total_invoices = 0;

            vm.calculCA = function (list, type) {
                var s = 0;
                angular.forEach(list, function (i) {
                    s += i.total * 1;
                });
                if (type == 1) {
                    vm.total_commands = s;
                }
                if (type == 2) {
                    vm.total_invoices = s;
                }
                if (type == 3) {
                    vm.total_quotations = s;
                }
                $scope.$apply();
            };
            vm.getStats = function (id) {
                WS.get('client/stats', 'client_id=' + id).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.stats = res.data.stats;
                        $scope.$apply();
                        vm.calculCA(vm.stats.commands, 1);
                        vm.calculCA(vm.stats.invoices, 2);
                        vm.calculCA(vm.stats.quotations, 3);
                        $('.loader').addClass('hidden');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getCountries = function () {
                WS.get('country').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.countries = res.data.countries;
                        $scope.$apply();
                        $('.loader').addClass('hidden');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getCountries();
            vm.getCountryName = function (id) {
                var c = vm.countries.find(function (item) {
                    return item.id == id;
                });
                if (!c) {
                    return '--';
                }
                return c.name;
            };
            vm.getFile = function (type) {
                WS.get('client', 'file_type=' + type + '&query=' + vm.search).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.open(AppSettings.apiUrl + '' + res.data.url_file);
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getClientById = function (id) {
                WS.get('client/' + id).then(function (res) {
                    $('.loader').addClass('hidden');

                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.info = res.data.client;
                        vm.editing = 1;
                        vm.tous_categories = 0;
                        vm.tous_marques = 0;
                        if (!vm.info.authorization) {
                            vm.info.authorization = {};
                        }
                        vm.info.authorization.authorization_contact_mail = vm.info.contact_email;
                        vm.update_client = 1;
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
                vm.getAddresses(id);
                vm.getStats(id);
            };
            vm.getClients = function (search) {
                vm.search = search;
                WS.get('client', 'query=' + search).then(function (res) {

                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.clients = res.data.clients;
                        if (table) {
                            table.destroy();
                        }
                        $scope.$apply();
                        table = $('#clients').DataTable({
                            'bFilter': false,
                            dom: '<"top"f>rt<"bottom"lip>',
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.delete = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('client/' + id).then(function (res) {
                        if (res.data.success == 'false') {
                            console.log(res.data.msg);
                        } else {
                            $('.loader').addClass('hidden');
                            window.notif(res.data.msg, 'success');
                            $('#c-' + id).remove();
                        }
                    }).then(null, function (error) {
                        $('.loader').addClass('hidden');
                        window.notif('' + error.msg, 'error');
                    });
                });
            };
            // vm.getClients();
            vm.addAddress = function () {
                var t = [];
                angular.copy(vm.addresses, t);
                t = t.concat([vm.address]);
                if (!checkAddress(t)) {
                    return;
                }
                vm.address.client_id = vm.info.id;
                WS.post('address', vm.address).then(function (res) {
                    $('.loader').addClass('hidden');

                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif(res.data.msg, 'success');
                        vm.getAddresses(vm.address.client_id);
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };

            function checkAddress(adresses) {
                var adresse_liv = 0;
                var nb_adresse_liv = 0;
                var adresse_fact = 0;
                var nb_adresse_fact = 0;
                angular.forEach(adresses, function (adresse) {
                    if (adresse.is_billing_address == 1) {
                        adresse_fact = 1;
                        nb_adresse_fact++;
                    }
                    if (adresse.is_delivery_address == 1) {
                        adresse_liv = 1;
                        nb_adresse_liv++;
                    }
                });

                if (nb_adresse_liv > 1) {
                    window.notif('Merci de désigner une seule adresse de livraison.', 'error');
                    return false;
                }
                if (nb_adresse_fact > 1) {
                    window.notif('Merci de désigner une seule adresse de facturation.', 'error');
                    return false;
                }
                if (!adresse_fact || !adresse_liv) {
                    if (adresses.length == 1) {
                        window.notif('Cette adresse est unique pour ce client, elle doit être l\'adresse de facturation et de livraison.', 'error');
                    } else {
                        window.notif('Merci de désigner l’adresse de facturation et/ou l’adresse de livraison.', 'error');
                    }
                    return false;
                }
                return true;
            }

            vm.updateAddress = function (value) {
                if (!checkAddress(vm.addresses)) {
                    return;
                }

                WS.put('address', value).then(function (res) {
                    $('.loader').addClass('hidden');

                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif(res.data.msg, 'success');
                        vm.getAddresses(value.client_id);
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteAddress = function (id, idClient) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('address', {address_id: id}).then(function (res) {
                        $('.loader').addClass('hidden');

                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            vm.getAddresses(idClient);
                        }
                    }).then(null, function (error) {

                        window.notif('' + error.msg, 'error');

                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.getAddresses = function (id) {
                if (!id) {
                    id = vm.info.id;
                }
                if (id == undefined) {
                    return;
                }
                WS.get('address', 'client_id=' + id).then(function (res) {
                    $('.loader').addClass('hidden');

                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.addresses = res.data.addresses;
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.initDatatable = function () {
                $('#clients').DataTable({
                    initComplete: function initComplete(settings, json) {
                        $('.loader').addClass('hidden');
                    }
                });
            };
            vm.getManagers = function () {
                WS.get('manager').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.managers = res.data.managers;
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.saveInfos = function () {
                WS.post('client/informations', vm.info).then(function (res) {
                    $('.loader').addClass('hidden');

                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        console.log(res.data);
                        vm.info = res.data.client;
                        if (!vm.info.authorization) {
                            vm.info.authorization = {};
                        }
                        vm.info.authorization.authorization_contact_mail = vm.info.contact_email;
                        vm.editing = 1;
                        window.notif(res.data.msg, 'success');

                        $('form')[0].reset();
                        vm.getClients(vm.search);
                        $('.modal').modal('hide');
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateInfos = function () {
                vm.info.client_id = vm.info.id;

                WS.put('client/informations', vm.info).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        console.log(res.data);
                        vm.info = res.data.client;
                        $scope.$apply();
                        $('.modal').modal('hide');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.saveAuthorization = function () {
                var o = {};
                angular.copy(vm.info.authorization, o);
                o.client_id = vm.info.id;
                o.contact_direct_line = vm.info.contact_tel_line;
                o.contact_firstname = vm.info.contact_firstname;
                o.contact_mobile_line = vm.info.contact_mobile_line;
                o.contact_name = vm.info.contact_name;

                if (o.brands.length) {
                    o.brands = o.brands.map(function (b) {
                        return {id: b.id};
                    });
                }
                if (o.categories) {
                    o.categories = o.categories.map(function (c) {
                        return {id: c.id};
                    });
                }
                WS.post('client/authorization', o).then(function (res) {
                    $('.loader').addClass('hidden');

                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif(res.data.msg, 'success');
                        vm.info.is_authorization_access = 1;
                        $('#c-' + vm.info.id).find('.fa-circle').removeClass('text-danger').addClass('text-success');
                        // vm.getClients(vm.search);
                        $('.modal').modal('hide');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateAuthorization = function () {
                var o = {};
                angular.copy(vm.info.authorization, o);
                o.is_authorization_access = vm.info.is_authorization_access;
                o.client_id = vm.info.id;
                delete o.contact_direct_line;
                delete o.contact_firstname;
                delete o.contact_mobile_line;
                delete o.contact_name;

                if (o.brands.length) {
                    o.brands = o.brands.map(function (b) {
                        return {id: b};
                    });
                }

                if (o.categories) {
                    o.categories = o.categories.map(function (c) {
                        return {id: c};
                    });
                }

                angular.forEach(o.brands, function (item) {
                    delete item.name;
                    delete item.picture;
                });

                angular.forEach(o.categories, function (item) {
                    delete item.name;
                    delete item.company_id;
                });

                WS.put('client/authorization', o).then(function (res) {
                    $('.loader').addClass('hidden');

                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif(res.data.msg, 'success');
                        $('#c-' + vm.info.id).find('.fa-circle').removeClass('text-danger').removeClass('text-success').addClass(vm.info.is_authorization_access == 1 ? 'text-success' : 'text-danger');

                        $('.modal').modal('hide');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getBrands = function () {
                WS.get('brand').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.brands = res.data.brands;
                        $('.loader').addClass('hidden');
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getCategories = function () {
                WS.get('category').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        vm.categories = res.data.categories;
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateCategories = function (e) {
                console.log(e);

                var o = [];
                angular.copy(e, o);
                angular.forEach(o, function (item) {
                    delete item.name;
                    delete item.company_id;
                });
                WS.post('client/category', {client_id: vm.info.id, categories: o}).then(function (res) {
                    $('.loader').addClass('hidden');

                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        console.log(res.data);
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateBrands = function (e) {
                var o = [];
                angular.copy(e, o);
                angular.forEach(o, function (item) {
                    delete item.name;
                    delete item.picture;
                });

                WS.post('client/brand', {client_id: vm.info.id, brands: o}).then(function (res) {
                    $('.loader').addClass('hidden');

                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        console.log(res.data);
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.triggerSelectAllCategories = function (action) {
                if (action == 1) {
                    vm.info.authorization.categories = vm.categories;
                } else {
                    vm.info.authorization.categories = [];
                }
                setTimeout(function () {
                    vm.updateCategories();
                }, 100);
            };
            vm.triggerSelectAllBrands = function (action) {
                if (action == 1) {
                    vm.info.authorization.brands = vm.brands;
                } else {
                    vm.info.authorization.brands = [];
                }
                setTimeout(function () {
                    vm.updateBrands();
                }, 10);
            };
        }

        exports.default = {
            name: 'clientsController',
            fn: clientsController
        };

    }, {}],
    "../app/js/controllers/commandes.js": [function (require, module, exports) {
        'use strict';

        commandeController.$inject = ["$scope", "$rootScope", "$uibModal", "$state", "WS", "$localStorage", "AppSettings"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function commandeController($scope, $rootScope, $uibModal, $state, WS, $localStorage, AppSettings) {
            'ngInject';

            var vm = this;
            vm.command = {};
            vm.command.command_details = [];
            var addProductModalInstance = void 0;
            vm.total = 0;
            vm.somme_stock = 0;
            vm.proforma = {};
            vm.isChanged = 0;
            var table = null;
            vm.url = AppSettings.apiUrl;

            vm.calculTotal = function () {
                vm.total = 0;
                angular.forEach(vm.command.command_details, function (value) {
                    value.qte = vm.calculerStock(value.stock);
                    vm.total += value.sale_price * value.qte;
                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                });
            };
            vm.getClients = function (search) {
                WS.get('client', 'query=' + search).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.clients = res.data.clients;
                        $scope.$apply();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getProduits = function () {
                var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

                console.log('getProduits');
                var o = {};
                o.format = 0;
                o.qtr_exhausted = 0;
                o.quantite = 1;
                o.with_stock = 1;
                o.lissage = 2;

                WS.post('product/search', o).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        vm.produits = res.data.products;
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif(error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getDevises = function () {
                WS.get('change').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.devises = res.data.changes;
                        $.each(vm.devises, function (index, item) {
                            if (item.name == '€') {
                                if (!vm.command.change_id) {
                                    vm.command.change_id = item.id;
                                }
                            }
                        });

                        $scope.$apply();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getCommand = function (id) {
                if (!id) {
                    id = $state.params.id;
                }
                WS.get('command/' + id).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.command = res.data.command;
                        vm.print_id = id;
                        $scope.$apply();
                        vm.calculTotal();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getProforma = function (id) {
                vm.proforma.command_id = id;
                WS.get('command/proforma', $.param(vm.proforma)).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        if (res.data.url_file) {
                            $('#exports').modal('hide');
                            window.open(AppSettings.apiUrl + '' + res.data.url_file);
                        }
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.facturer = function (id) {
                WS.post('command/invoice/create', {command_id: id}).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        swal({
                            text: 'Voulez vous consulter la facture ajoutée ?',
                            type: 'success',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Oui',
                            cancelButtonText: 'Non'
                        }).then(function (choice) {
                            $state.go('app.facture.index');
                        }, function (choice) {
                            $state.go('app.commande.index');
                        });
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.dupliquerEnDevis = function (id) {
                WS.post('command/convert/quotation', {command_id: id}).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {

                        if (res.data.success == 'false') {
                            console.log(res.data.msg);
                        } else {
                            swal({
                                text: 'Voulez vous éditer le devis copié ?',
                                type: 'success',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Oui',
                                cancelButtonText: 'Non'
                            }).then(function (choice) {
                                $state.go('app.devis.details', {id: res.data.quotation_id});
                            }, function (choice) {
                                $state.go('app.commande.index');
                            });
                            $scope.$apply();
                        }
                        $('.loader').addClass('hidden');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.bonPreparation = function (id) {
                WS.get('command/bp/print', $.param({command_id: id})).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        if (res.data.url_file) {
                            $('#exports').modal('hide');
                            window.open(AppSettings.apiUrl + '' + res.data.url_file);
                        }
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.dupliquer = function (id) {
                WS.post('command/duplicate', {command_id: id}).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {

                        $state.go('app.commande.details', {id: res.data.command.id});
                        $scope.$apply();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getCommands = function () {
                var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

                var o = '';
                if (filter) {
                    o = $.param(filter);
                }
                WS.get('command', o).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        if (table) {
                            table.destroy();
                        }
                        vm.commands = res.data.commands;
                        $scope.$apply();
                        table = $('#liste_commands').DataTable({
                            'pageLength': 100,
                            'bFilter': false,
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteCommand = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('command/' + id).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            vm.getCommands();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.addCommand = function () {
                var o = {};
                angular.copy(vm.command, o);

                o.client_id = o.client.originalObject.id;
                delete o.client;
                WS.post('command', o).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.notif('' + res.data.msg, 'success');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateCommand = function () {
                var o = {};
                angular.copy(vm.command, o);
                if (o.client && o.client.originalObject) {
                    o.client_id = o.client.originalObject.id;
                    delete o.client;
                }
                WS.put('command/' + $state.params.id, o).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.notif('' + res.data.msg, 'success');
                        vm.getCommand();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.calculerStock = function (tailles) {
                var s = 0;
                angular.forEach(tailles, function (t) {
                    if (t.value && t.value != NaN) {
                        s += t.value * 1;
                    }
                });
                return s;
            };
            vm.lissage = function (produit_id, qte) {
                var showModal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

                var url = 'product_id=' + produit_id + '&quantity=' + qte;
                var produit = vm.command.command_details.filter(function (obj) {
                    return obj.product_id == produit_id;
                })[0];

                if (!qte) return;
                if (vm.command && vm.command.id) {
                    url += '&command_id=' + vm.command.id;
                }
                WS.get('command/lissage', url).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        var produit = vm.command.command_details.filter(function (obj) {
                            return obj.product_id == produit_id;
                        })[0];
                        if (produit) {
                            $scope.$apply();

                            angular.forEach(produit.stock, function (item) {
                                item.qtr = res.data.stock.filter(function (obj) {
                                    return obj.name == item.name;
                                })[0].qtr * 1;
                                item.qtt = res.data.stock.filter(function (obj) {
                                    return obj.name == item.name;
                                })[0].qtt * 1;
                                item.value = res.data.lissage[item.name] * 1;
                            });
                            vm.selected = produit;
                            vm.isChanged = 1;
                            $scope.$apply();
                            vm.calculTotal();
                            if (showModal) {
                                $('#lissage').modal('show');
                            }
                        }
                    }
                }).then(null, function (error) {
                    window.notif('' + error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.selectedProduct = function (item) {
                if (!item) {
                    return;
                }
                var exist = vm.command.command_details.filter(function (obj) {
                    return obj.id == item.originalObject.id;
                });
                if (exist.length > 0) {
                    window.notif('Produit exsite déjà dans la liste', 'error');
                    return;
                }
                vm.selected = item.originalObject;
                vm.selected.product_id = item.originalObject.id;
                vm.selected.qte = item.originalObject.qtt * 1;
                vm.selected.sale_price = item.originalObject.sale_vanam_price * 1;
                vm.command.command_details.unshift(vm.selected);
                vm.lissage(vm.selected.id, vm.selected.qte, 0);
                vm.isChanged = 1;
            };
            vm.removeProduct = function (index) {
                var call_ws = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
                var product_id = arguments[2];

                if (call_ws) {
                    swal({
                        title: 'Êtes-vous sûr?',
                        text: 'Vous ne pourrez pas revenir à cela!',
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Oui, supprimez-le!',
                        cancelButtonText: 'Annuler'
                    }).then(function () {
                        WS.delete('command/products/' + vm.command.id + '/' + product_id).then(function (res) {
                            $('.loader').addClass('hidden');
                            if (res.data.succes == 'false') {
                                console.log(res.data.msg);
                            } else {
                                vm.command.command_details.splice(index, 1);
                                window.notif(res.data.msg, 'success');
                                vm.getCommand(vm.command.id);
                                vm.calculTotal();
                            }
                        }).then(null, function (error) {
                            window.notif('' + error.msg, 'error');
                            $('.loader').addClass('hidden');
                        });
                    });
                }
                vm.isChanged = 1;
            };
            vm.transformerCommand = function (data) {
                console.log('transformerCommand', data);
                vm.command = {};
                vm.command.command_details = [];
                vm.command.change_id = '1';
                angular.forEach(data, function (product) {
                    WS.get('product/' + product.id).then(function (res) {
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            var p = res.data.product;
                            p.sale_price = 0;
                            vm.command.command_details.push(p);
                            $scope.$apply();
                            $('.loader').addClass('hidden');
                        }
                    }).then(null, function (error) {
                        window.notif(error.data.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.imprimer = function (params) {
                var id = vm.print_id;
                WS.get('command/file/' + id, $.param(params)).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        if (res.data.url_file) {
                            $('#exports').modal('hide');
                            window.open(AppSettings.apiUrl + '' + res.data.url_file);
                        }
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif(error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.fermer = function () {
                if (vm.isChanged) {
                    swal({
                        text: 'Voulez vous vraiment quitter cette page sans enregister les informations en cours ?',
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Oui, quitter',
                        cancelButtonText: 'Rester'
                    }).then(function () {
                        $state.go('app.commande.index');
                    });
                } else {
                    $state.go('app.commande.index');
                }
            };
            vm.uploadFile = function () {
                var formData = new FormData();
                formData.append('command_id', vm.command.id);
                formData.append('file', $('[name="file"]')[0].files[0]);
                WS.post('command/media', formData, undefined).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif(res.data.msg, 'success');
                        vm.getCommand(vm.command.id);
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteFile = function (media_id) {
                swal({
                    title: 'Voulez vous vraiment supprimer le fichier?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('command/media/' + vm.command.id + '/' + media_id).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            vm.getCommand(vm.command.id);
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.openDetailsProduit = function (product_id) {

                if ($('meta[name="product_id"]').length) {
                    $('meta[name="product_id"]').attr('content', product_id * 1);
                } else {
                    $('head').append('<meta name="product_id" content="' + product_id * 1 + '" />');
                }

                addProductModalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'detailsProduit.html',
                    controller: 'produitsController',
                    controllerAs: 'vm',
                    size: 'lg'
                });
            };
            vm.closeModalLissage = function () {
                $('.modal').modal('hide');
            };
            $rootScope.$on('transformerCommand', function (event, data) {
                vm.transformerCommand(data);
            });
            jQuery(document).ready(function ($) {

                var ua = navigator.userAgent,
                    event = ua.match(/iP/i) ? 'touchstart' : 'click';
                $(document).off(event, '.btn-add-file');
                $(document).on(event, '.btn-add-file', function (event) {

                    $('[name=file]').trigger('click');
                });

                $(document).off(event, '.closeModal');
                $(document).on(event, '.closeModal', function (event) {
                    addProductModalInstance.close();
                    event.preventDefault();
                    event.stopPropagation();
                });

                $(document).on('change', '[name="file"]', function (event) {
                    var input = this;
                    var url = $(this).val();
                    var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        vm.uploadFile();
                        $('[name="file"]').val('');
                        $scope.$apply();
                    };
                    reader.readAsDataURL(input.files[0]);
                });

                $('.modal').on('shown.bs.modal', function () {
                    $(this).find('[autofocus]').focus();
                });
            });
        }


        exports.default = {
            name: 'commandeController',
            fn: commandeController
        };

    }, {}],
    "../app/js/controllers/devices.js": [function (require, module, exports) {
        'use strict';

        devisesController.$inject = ["$scope", "$rootScope", "$state", "WS", "$localStorage"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function devisesController($scope, $rootScope, $state, WS, $localStorage) {
            'ngInject';

            var vm = this;
            vm.devises = [];
            vm.devise = {};
            vm.img_edit = 0;
            var table = null;
            vm.getDevises = function () {
                WS.get('change').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.devises = res.data.changes;
                        $('.loader').addClass('hidden');
                        $scope.$apply();
                        table = $('#devises').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                }).then(null, function (error) {

                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.addDevise = function () {
                WS.post('change', vm.devise).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        table.destroy();
                        vm.getDevises();
                        vm.devise = {};
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateDevise = function (value) {
                value.change_id = value.id;
                WS.put('change', value).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        table.destroy();
                        vm.getDevises();
                        vm.devise = {};
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteDevise = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('change', {change_id: id}).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            table.destroy();
                            vm.getDevises();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
        }

        exports.default = {
            name: 'devisesController',
            fn: devisesController
        };

    }, {}],
    "../app/js/controllers/devis.js": [function (require, module, exports) {
        'use strict';

        devisController.$inject = ["$scope", "$rootScope", "$uibModal", "$state", "WS", "$localStorage", "AppSettings"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function devisController($scope, $rootScope, $uibModal, $state, WS, $localStorage, AppSettings) {
            'ngInject';

            var vm = this;
            var addProductModalInstance = void 0;
            vm.quotation = {};
            vm.quotation.quotation_details = [];
            vm.total = 0;
            vm.somme_stock = 0;
            vm.isChanged = 0;
            var table = null;

            vm.log = function (e) {
                console.log(e);
            };
            vm.calculTotal = function () {
                vm.total = 0;
                angular.forEach(vm.quotation.quotation_details, function (value) {
                    value.qte = vm.calculerStock(value.stock);
                    vm.total += value.sale_price * value.qte;
                    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                        $scope.$apply();
                    }
                });
            };
            vm.getClients = function (search) {
                WS.get('client', 'query=' + search).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.clients = res.data.clients;
                        $scope.$apply();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getProduits = function () {
                var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

                var o = {};
                o.format = 0;
                o.qtr_exhausted = 0;
                o.quantite = 1;
                o.with_stock = 1;
                o.lissage = 1;

                WS.post('product/search', o).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        vm.produits = res.data.products;
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif(error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getDevises = function () {
                WS.get('change').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.devises = res.data.changes;
                        $.each(vm.devises, function (index, item) {
                            if (item.name == '€') {
                                if (!vm.quotation.change_id) {
                                    vm.quotation.change_id = item.id;
                                }
                            }
                        });

                        $scope.$apply();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getQuotation = function (id) {
                alert('test');
                if (!id) {
                    id = $state.params.id;
                }
                WS.get('quotation/' + id).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.quotation = res.data.quotation;
                        vm.print_id = id;
                        $scope.$apply();
                        vm.calculTotal();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.dupliquer = function (id) {
                WS.post('quotation/duplication', {quotation_id: id}).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        console.log(res.data);
                        window.notif('Devis dupliquer avec succée', 'success');
                        swal({
                            text: 'Voulez vous éditer le nouveau devis ?',
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Oui',
                            cancelButtonText: 'Non'
                        }).then(function (result) {
                            $state.go('app.devis.details', {id: res.data.quotation.id});
                        });

                        $scope.$apply();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getQuotations = function () {
                var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

                var o = '';
                if (filter) {
                    o = $.param(filter);
                }
                WS.get('quotation', o).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        if (table) {
                            table.destroy();
                        }
                        vm.quotations = res.data.quotations;
                        $scope.$apply();
                        table = $('#liste_devis').DataTable({
                            'pageLength': 100,
                            'bFilter': false,
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteDevis = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('quotation/' + id).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            vm.getQuotations();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.addQuotation = function () {
                var o = {};
                angular.copy(vm.quotation, o);

                if (o.client && o.client.originalObject) {
                    o.client_id = o.client.originalObject.id;
                }
                delete o.client;
                WS.post('quotation', o).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.notif(res.data.msg, 'success');
                        $state.go('app.devis.index');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateQuotation = function () {
                var o = {};
                angular.copy(vm.quotation, o);
                if (o.client && o.client.originalObject) {
                    o.client_id = o.client.originalObject.id;
                    delete o.client;
                }
                WS.put('quotation/' + $state.params.id, o).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.notif('' + res.data.msg, 'success');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.calculerStock = function (stock) {
                var s = 0;
                angular.forEach(stock, function (t) {
                    if (t.value && t.value != NaN) {
                        if (parseInt(t.qtr) < parseInt(t.value)) {
                            t.value = t.qtr;
                        }
                        s += t.value * 1;
                    }
                });
                return s;
            };
            vm.lissage = function (produit_id, qte) {
                var showModal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

                vm.isChanged = 1;
                var url = 'product_id=' + produit_id + '&quantity=' + qte;
                if (vm.quotation && vm.quotation.id) {
                    url += '&quotation_id=' + vm.quotation.id;
                }
                WS.get('quotation/lissage', url).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        var produit = vm.quotation.quotation_details.filter(function (obj) {
                            return obj.product_id == produit_id;
                        })[0];
                        if (produit) {
                            $scope.$apply();
                            vm.somme_stock = 0;
                            angular.forEach(produit.stock, function (item) {
                                item.qtr = res.data.stock.filter(function (obj) {
                                    return obj.name == item.name;
                                })[0].qtr * 1;
                                item.qtt = res.data.stock.filter(function (obj) {
                                    return obj.name == item.name;
                                })[0].qtt * 1;
                                item.value = res.data.lissage[item.name] * 1;

                                vm.somme_stock += item.qtr;
                            });
                            vm.selected = produit;
                            vm.isChanged = 1;

                            // vm.selected.product_id = produit.product_id;
                            $scope.$apply();
                            vm.calculTotal();

                            if (showModal) {
                                $('#lissage').modal('show');
                            }
                        }
                    }
                }).then(null, function (error) {
                    window.notif('' + error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.selectedProduct = function (item) {
                if (!item) {
                    return;
                }
                var exist = vm.quotation.quotation_details.filter(function (obj) {
                    return obj.id == item.originalObject.id;
                });
                if (exist.length > 0) {
                    window.notif('Produit exsite déjà dans la liste', 'error');
                    return;
                }
                vm.selected = item.originalObject;
                vm.selected.product_id = item.originalObject.id;
                vm.selected.qte = item.originalObject.qtt * 1;
                vm.selected.sale_price = item.originalObject.sale_vanam_price * 1;
                vm.quotation.quotation_details.unshift(vm.selected);
                vm.lissage(vm.selected.id, vm.selected.qte, 0);
                vm.isChanged = 1;
            };
            vm.removeProduct = function (index) {
                var call_ws = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
                var product_id = arguments[2];

                vm.quotation.quotation_details.splice(index, 1);
                if (call_ws) {
                    swal({
                        title: 'Êtes-vous sûr?',
                        text: 'Vous ne pourrez pas revenir à cela!',
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Oui, supprimez-le!',
                        cancelButtonText: 'Annuler'
                    }).then(function () {
                        WS.delete('quotation/products/' + vm.quotation.id + '/' + product_id).then(function (res) {
                            $('.loader').addClass('hidden');
                            if (res.data.succes == 'false') {
                                console.log(res.data.msg);
                            } else {
                                window.notif(res.data.msg, 'success');
                                vm.getQuotation(vm.quotation.id);
                                vm.calculTotal();
                            }
                        }).then(null, function (error) {
                            window.notif('' + error.msg, 'error');
                            $('.loader').addClass('hidden');
                        });
                    });
                }
                vm.isChanged = 1;
            };
            vm.transformer = function (id) {
                WS.post('quotation/convert', {quotation_id: id}).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');

                        swal({
                            text: 'Voulez vous éditer la nouvelle commande créée',
                            type: 'success',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Oui',
                            cancelButtonText: 'Non'
                        }).then(function (result) {
                            $state.go('app.commande.details', {id: res.data.command_id});
                        });
                    }
                }).then(null, function (error) {
                    window.notif('' + error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.transformerDevis = function (data) {
                console.log('transformerDevis', data);
                vm.quotation = {};
                vm.getDevises();
                vm.quotation.quotation_details = [];
                // vm.quotation.change_id = '1';
                angular.forEach(data, function (product) {
                    WS.get('product/' + product.id).then(function (res) {
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            var p = res.data.product;
                            p.product_id = p.id;
                            p.qte = p.qtt * 1;
                            p.sale_price = p.sale_vanam_price * 1;
                            vm.quotation.quotation_details.unshift(p);
                            vm.lissage(p.id, p.qte, 0);
                            $scope.$apply();
                            $('.loader').addClass('hidden');
                        }
                    }).then(null, function (error) {
                        window.notif(error.data.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.imprimer = function (params) {
                var id = vm.print_id;
                WS.get('quotation/file/' + id, $.param(params)).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        if (res.data.url_file) {
                            $('#exports').modal('hide');
                            window.open(AppSettings.apiUrl + '' + res.data.url_file);
                        }
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif(error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.fermer = function () {
                if (vm.isChanged) {
                    swal({
                        text: 'Voulez vous vraiment quitter cette page sans enregister les informations en cours ?',
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Oui, quitter',
                        cancelButtonText: 'Rester'
                    }).then(function () {
                        $state.go('app.devis.index');
                    });
                } else {
                    $state.go('app.devis.index');
                }
            };
            vm.openDetailsProduit = function (product_id) {
                if ($('meta[name="product_id"]').length) {
                    $('meta[name="product_id"]').attr('content', product_id * 1);
                } else {
                    $('head').append('<meta name="product_id" content="' + product_id * 1 + '" />');
                }

                addProductModalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'detailsProduit.html',
                    controller: 'produitsController',
                    controllerAs: 'vm',
                    size: 'lg'
                });
            };
            vm.closeModalLissage = function () {
                $('.modal').modal('hide');
            };
            vm.showprice = function () {
                vm.showPrice = 1;
                setTimeout(function () {
                    vm.showPrice = 0;
                    $scope.$apply();
                }, 200);
            };
            vm.affectCompany = function (user) {
                console.log('user : ', user);
                // vm.quotation.client = user;
            };
            $rootScope.$on('transformerDevis', function (event, data) {
                vm.transformerDevis(data);
            });

            jQuery(document).ready(function ($) {
                var ua = navigator.userAgent,
                    event = ua.match(/iP/i) ? 'touchstart' : 'click';

                $('.modal').on('shown.bs.modal', function () {
                    $(this).find('[autofocus]').focus();
                });

                $('.input-search-produit').keydown(function (event) {
                    if (event.keyCode === 13) {
                        console.log($(this).val());
                    }
                });

                $(document).off(event, '.closeModal');
                $(document).on(event, '.closeModal', function (event) {
                    addProductModalInstance.close();
                    event.preventDefault();
                    event.stopPropagation();
                });
            });
        }

        exports.default = {
            name: 'devisController',
            fn: devisController
        };

    }, {}],
    "../app/js/controllers/factures.js": [function (require, module, exports) {
        'use strict';

        factureController.$inject = ["$scope", "$rootScope", "$uibModal", "$state", "WS", "$localStorage", "moment", "AppSettings"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function factureController($scope, $rootScope, $uibModal, $state, WS, $localStorage, moment, AppSettings) {
            'ngInject';

            var vm = this;
            vm.invoice = {};
            var table = null;
            var date = new Date(),
                y = date.getFullYear(),
                m = date.getMonth();

            vm.filter = {
                start_date: new Date(moment(new Date(y, m, 1)).format('YYYY-MM-DD')),
                end_date: new Date(moment(new Date(y, m + 1, 0)).format('YYYY-MM-DD'))
            };

            vm.getDevises = function () {
                WS.get('change').then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.devises = res.data.changes;
                        $scope.$apply();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getInvoice = function (id) {
                if (!id) {
                    id = $state.params.id;
                }
                WS.get('invoices/' + id).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.invoice = res.data.invoice;
                        vm.print_id = id;
                        $scope.$apply();
                        vm.calculTotal();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getInvoices = function () {
                var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

                var o = '';
                var f = {};
                angular.copy(filter, f);
                if (filter) {
                    if (filter.start_date) {
                        f.start_date = moment(filter.start_date).format('YYYY-MM-DD');
                    }
                    if (filter.end_date) {
                        f.end_date = moment(filter.end_date).format('YYYY-MM-DD');
                    }

                    o = $.param(f);
                }
                WS.get('invoice', o).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        if (table) {
                            table.destroy();
                        }
                        vm.invoices = res.data.invoices;
                        $scope.$apply();
                        table = $('#liste_invoices').DataTable({
                            'pageLength': 100,
                            'bFilter': false,
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteInvoice = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('invoice/' + id).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            vm.getInvoices();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.addInvoice = function () {
                var o = {};
                angular.copy(vm.invoice, o);

                o.client_id = o.client.originalObject.id;
                delete o.client;
                WS.post('invoice', o).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.notif('' + res.data.msg, 'success');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateInvoice = function () {
                var o = {};
                angular.copy(vm.invoice, o);
                if (o.client && o.client.originalObject) {
                    o.client_id = o.client.originalObject.id;
                    delete o.client;
                }
                WS.put('invoices/' + $state.params.id, o).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.notif('' + res.data.msg, 'success');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.print = function (command_id, type) {
                WS.get('invoice/print', $.param({type: type, command_id: command_id})).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        if (res.data.url_file) {
                            $('#exports').modal('hide');
                            window.open(AppSettings.apiUrl + '' + res.data.url_file);
                        }
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
        }

        exports.default = {
            name: 'factureController',
            fn: factureController
        };

    }, {}],
    "../app/js/controllers/gammes.js": [function (require, module, exports) {
        'use strict';

        gammesController.$inject = ["$scope", "$rootScope", "$state", "WS", "$localStorage"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function gammesController($scope, $rootScope, $state, WS, $localStorage) {
            'ngInject';

            var vm = this;
            vm.gammes = [];
            vm.range_details = [];
            vm.gamme = {};
            vm.details_gamme = {};

            vm.img_edit = 0;
            var table = null;
            var table2 = null;
            vm.getGammes = function () {
                WS.get('range').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.gammes = res.data.ranges;
                        $scope.$apply();
                        table = $('#gammes').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.addGamme = function () {
                WS.post('range', vm.gamme).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        table.destroy();
                        vm.getGammes();
                        vm.gamme = {};
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateGamme = function (value) {
                value.range_id = value.id;
                WS.put('range', value).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        table.destroy();
                        vm.getGammes();
                        vm.gamme = {};
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteGamme = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('range', {range_id: id}).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            table.destroy();
                            vm.getGammes();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.getDetails = function (gamme) {

                if (gamme) {
                    vm.details_gamme = gamme;
                }
                WS.get('range/detail', 'range_id=' + vm.details_gamme.id).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.range_details = res.data.range_details;
                        $scope.$apply();
                        $('.loader').addClass('hidden');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.addDetailsGamme = function () {
                WS.post('range/detail', {
                    name: vm.details_gamme_name,
                    range_detail_id: vm.details_gamme.id
                }).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.details_gamme_name = '';
                        $scope.$apply();
                        vm.getDetails();
                        $('.loader').addClass('hidden');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateDetailsGamme = function (value) {
                value.range_detail_id = value.id;
                WS.put('range/detail', value).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.getDetails();
                        $('.loader').addClass('hidden');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteDetailsGamme = function (id) {
                WS.delete('range/detail', {range_detail_id: id}).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.getDetails();
                        $('.loader').addClass('hidden');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.sortableOptions = {
                update: function update(e, ui) {
                    setTimeout(function () {
                        angular.forEach(vm.range_details, function (item, index) {
                            item.range_detail_id = item.id;
                            item.rang = index + 1;
                            console.log(item);
                            WS.put('range/detail', item).then(function (res) {
                                if (res.data.succes == 'false') {
                                    console.log(res.data.msg);
                                } else {
                                    // vm.getDetails();
                                    $('.loader').addClass('hidden');
                                }
                            }).then(null, function (error) {
                                window.notif('' + error.msg, 'error');
                                $('.loader').addClass('hidden');
                            });
                        });
                    }, 10);
                }
            };
        }

        exports.default = {
            name: 'gammesController',
            fn: gammesController
        };


    }, {}],
    "../app/js/controllers/genres.js": [function (require, module, exports) {
        'use strict';

        genresController.$inject = ["$scope", "$rootScope", "$state", "WS", "$localStorage"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function genresController($scope, $rootScope, $state, WS, $localStorage) {
            'ngInject';

            var vm = this;
            vm.genders = [];
            vm.gender = {};
            vm.img_edit = 0;
            var table = null;
            vm.getGenders = function () {
                WS.get('gender').then(function (res) {
                    if (res.data.success === 'true') {
                        vm.genders = res.data.genders;
                        $scope.$apply();
                        table = $('#genres').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    } else {
                        console.error(res.data.msg);
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.addGender = function () {
                WS.post('gender', vm.gender).then(function (res) {
                    if (res.data.success === 'true' && res.data.gender) {
                        vm.gender = res.data.gender;
                        vm.genders.push(vm.gender);
                        vm.gender = {};
                        table.destroy();
                        table = $('#genres').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                        $scope.$apply();
                    } else {
                        console.log(res.data.msg);
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateGender = function (value) {
                value.gender_id = value.id;
                WS.put('gender', value).then(function (res) {
                    if (res.data.success === 'true') {
                        vm.gender = res.data.gender;
                        for (var i = 0; i < vm.genders.length; i++) {
                            if (vm.genders[i].id == vm.gender.id) {
                                vm.genders[i] = vm.gender;
                            }
                        }
                        vm.gender = {};
                        table.destroy();
                        table = $('#genres').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                        $scope.$apply();
                    } else {
                        console.log(res.data.msg);
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteGender = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('gender', {gender_id: id}).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            table.destroy();
                            vm.getGenders();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
        }

        exports.default = {
            name: 'genresController',
            fn: genresController
        };

    }, {}],
    "../app/js/controllers/global.js": [function (require, module, exports) {
        'use strict';

        globalController.$inject = ["$localStorage", "$state", "WS", "$scope", "$rootScope", "AppSettings"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function globalController($localStorage, $state, WS, $scope, $rootScope, AppSettings) {
            'ngInject';

            var vm = this;
            vm.companies = [];
            vm.devis = [];
            vm.settings = AppSettings;
            vm.colors = {
                'RESERVED': '#b9e7ff',
                'TO_PREPARE': '#ffe1e1',
                'PREPARED': '#e6eaba',
                'READY_TO_SENT': '#ecf59b',
                'READY_NOT_TO_SENT': '#d7e4ea',
                'SENT': '#cddc39'
            };

            vm.getCompanies = function () {
                WS.get('company').then(function (res) {
                    if (res.error) {
                        vm.error = res.error;
                    } else {
                        $localStorage.companies = res.data.compagnies;
                        vm.companies = res.data.compagnies;
                        $scope.$apply();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    $('.loader').addClass('hidden');
                });
            };

            if ($localStorage.data) {
                vm.data = $localStorage.data;
                // vm.data.user.role_id = 4;
                vm.getCompanies();
            } else {
                $state.go('access.login');
            }
            if ($localStorage.companies) {
                vm.companies = $localStorage.companies;
            }

            if ($localStorage.devis) {
                vm.devis = $localStorage.devis;
            } else {
                $localStorage.$default({
                    devis: []
                });
            }
            console.log('data : ', vm.data);

            vm.changeCompany = function (company) {
                vm.data.user.company = company;
                $localStorage.data = vm.data;
                $state.go('app.index');
            };
            vm.deleteLigneDevis = function (i) {
                vm.devis.splice(i, 1);
                $localStorage.devis = vm.devis;
            };
            vm.logout = function () {
                WS.post('logout', {}).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $localStorage.data = {};
                        $localStorage.companies = [];
                        $state.go('access.login');
                    }
                }).then(null, function (error) {
                });
                $state.go('access.login');
            };
            vm.ifSref = function (condition, url1, url2) {
                if (condition) {
                    return url1;
                }
                return url2;
            };
            vm.getRole = function (role) {
                var roles = {
                    'SUPER_ADMIN': 'Super administrateur',
                    'ADMIN': 'Administrateur',
                    'CLIENT': 'Client',
                    'AGENT': 'Agent'
                };
                return roles[role];
            };
            vm.viderDevis = function () {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, videz-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    vm.devis.splice(i, vm.devis.length);
                    $localStorage.devis = vm.devis;
                    $scope.$apply();
                });
            };
            vm.transformerDevis = function () {
                $state.go('app.devis.add').then(function () {
                    $rootScope.$broadcast('transformerDevis', vm.devis);
                    swal({
                        title: 'voulez-vous vider le devis',
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Oui, videz-le!',
                        cancelButtonText: 'Non'
                    }).then(function () {
                        vm.devis.splice(i, vm.devis.length);
                        $localStorage.devis = vm.devis;
                        $scope.$apply();
                    });
                });
            };
        }

        exports.default = {
            name: 'globalController',
            fn: globalController
        };

    }, {}],
    "../app/js/controllers/index.js": [function (require, module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        var _angular = require('angular');

        var _angular2 = _interopRequireDefault(_angular);

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {default: obj};
        }

        var controllersModule = _angular2.default.module('app.controllers', []);
        var controllers = ({
            "auth": require("./auth.js"),
            "categories": require("./categories.js"),
            "clients": require("./clients.js"),
            "commandes": require("./commandes.js"),
            "devices": require("./devices.js"),
            "devis": require("./devis.js"),
            "factures": require("./factures.js"),
            "gammes": require("./gammes.js"),
            "genres": require("./genres.js"),
            "global": require("./global.js"),
            "marques": require("./marques.js"),
            "mouvements": require("./mouvements.js"),
            "pays": require("./pays.js"),
            "produits": require("./produits.js"),
            "profile": require("./profile.js"),
            "sports": require("./sports.js"),
            "users": require("./users.js"),
            "zonages": require("./zonages.js")
        });

        function declare(controllerMap) {
            Object.keys(controllerMap).forEach(function (key) {
                var item = controllerMap[key];

                if (!item) {
                    return;
                }

                if (item.fn && typeof item.fn === 'function') {
                    controllersModule.controller(item.name, item.fn);
                } else {
                    declare(item);
                }
            });
        }

        declare(controllers);

        exports.default = controllersModule;

    }, {
        "./auth.js": "../app/js/controllers/auth.js",
        "./categories.js": "../app/js/controllers/categories.js",
        "./clients.js": "../app/js/controllers/clients.js",
        "./commandes.js": "../app/js/controllers/commandes.js",
        "./devices.js": "../app/js/controllers/devices.js",
        "./devis.js": "../app/js/controllers/devis.js",
        "./factures.js": "../app/js/controllers/factures.js",
        "./gammes.js": "../app/js/controllers/gammes.js",
        "./genres.js": "../app/js/controllers/genres.js",
        "./global.js": "../app/js/controllers/global.js",
        "./marques.js": "../app/js/controllers/marques.js",
        "./mouvements.js": "../app/js/controllers/mouvements.js",
        "./pays.js": "../app/js/controllers/pays.js",
        "./produits.js": "../app/js/controllers/produits.js",
        "./profile.js": "../app/js/controllers/profile.js",
        "./sports.js": "../app/js/controllers/sports.js",
        "./users.js": "../app/js/controllers/users.js",
        "./zonages.js": "../app/js/controllers/zonages.js",
        "angular": "../node_modules/angular/index.js"
    }],
    "../app/js/controllers/marques.js": [function (require, module, exports) {
        'use strict';

        marquesController.$inject = ["$scope", "$rootScope", "$state", "WS", "$localStorage"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function _defineProperty(obj, key, value) {
            if (key in obj) {
                Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
            } else {
                obj[key] = value;
            }
            return obj;
        }

        function marquesController($scope, $rootScope, $state, WS, $localStorage) {
            'ngInject';

            var vm = this;
            vm.brands = [];
            vm.brand = {};
            vm.img_edit = 0;
            var table = null;

            function callback(json) {
                alert('test');
            }

            vm.getBrands = function () {
                WS.get('brand').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.brands = res.data.brands;
                        $scope.$apply();
                        if (table) {
                            table.destroy();
                        }
                        table = $('#marques').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.addBrand = function () {
                WS.post('brand', vm.brand).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.brand = res.data.brand;
                        vm.brands.push(vm.brand);
                        vm.brand = {};
                        $scope.$apply();
                        if (table) {
                            table.destroy();
                        }
                        table = $('#marques').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
                table.reload();
            };
            vm.updateBrand = function (value) {
                value.brand_id = value.id;
                WS.put('brand', value).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.getBrands();
                        vm.brand = {};
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteBrand = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('brand', {brand_id: id}).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            vm.getBrands();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.uploadPhoto = function (id) {
                var formData = new FormData();
                formData.append('id', id);
                formData.append('picture', $('[name="picture"]')[0].files[0]);
                WS.post('brand/media', formData, undefined).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif(res.data.msg, 'success');
                        // $('#c-'+id).find('.btn-hide').removeClass('hidden');
                        vm.getBrands();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };

            vm.deleteLogo = function (id) {
                console.log(id);
                WS.delete('brand/media', _defineProperty({id: id}, 'id', id)).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif(res.data.msg, 'success');
                        vm.getBrands();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };

            var ua = navigator.userAgent,
                event = ua.match(/iP/i) ? 'touchstart' : 'click';

            $(document).off(event, '.img');
            $(document).on(event, '.img', function (event) {
                $('[name=picture]').trigger('click');
                event.stopPropagation();
            });
            $(document).on('change', '[name="picture"]', function (event) {

                var input = this;
                var url = $(this).val();
                var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
                if (input.files && input.files[0] && (ext == 'gif' || ext == 'png' || ext == 'jpeg' || ext == 'jpg')) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $('.img' + vm.img_edit).attr('src', e.target.result);
                        vm.uploadPhoto(vm.img_edit);
                        $('[name="picture"]').val('');
                        $scope.$apply();
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            });
            $(document).on('mouseenter', 'td', function (event) {
                $(this).find('.btn-rounded').removeClass('hidden');
            });
            $(document).on('mouseleave', 'td', function (event) {
                $(this).find('.btn-rounded').addClass('hidden');
            });
        }

        exports.default = {
            name: 'marquesController',
            fn: marquesController
        };

    }, {}],
    "../app/js/controllers/mouvements.js": [function (require, module, exports) {
        'use strict';

        mouvementsController.$inject = ["$scope", "$rootScope", "$state", "WS", "$uibModal", "AppSettings", "moment"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function mouvementsController($scope, $rootScope, $state, WS, $uibModal, AppSettings, moment) {
            'ngInject';

            var vm = this;

            var table = null;
            var addProductModalInstance = void 0;
            vm.produits = [];
            vm.liersItems = [];
            vm.entry_event_details = [];
            vm.headers = [];
            vm.canUpload = 1;
            vm.nb_elements = 50;
            vm.current_page = 1;

            //stock
            vm.selectedStock = [];

            vm.url = AppSettings.apiUrl;
            vm.mouvement = {
                entry_event_details: []
            };
            vm.selected = {};
            vm.search = {
                start_date: moment().subtract(30, 'days').toDate(),
                end_date: moment().toDate()
            };
            vm.print = {
                rate_price: 0,
                purchase_price: 0
            };
            vm.listItems = [{
                i: 0,
                value: 'Référence',
                obligatoire: 1
            }, {
                i: 2,
                value: 'Description',
                obligatoire: 1
            }, {
                i: 3,
                value: 'Categorie',
                obligatoire: 1
            }, {
                i: 4,
                value: 'Marque',
                obligatoire: 1
            }, {
                i: 5,
                value: 'Genre'
            }, {
                i: 6,
                value: 'Sport'
            }, {
                i: 7,
                value: 'Color'
            }, {
                i: 8,
                value: 'Prix vente public'
            }, {
                i: 9,
                value: 'Prix vente tarif'
            }, {
                i: 10,
                value: 'Prix vente vanam'
            }, {
                i: 11,
                value: 'Prix achat',
                obligatoire: 1
            }, {
                i: 12,
                value: 'Aisle'
            }, {
                i: 13,
                value: 'Palette'
            }, {
                i: 14,
                value: 'Ville zonage'
            }];

            vm.getDevises = function () {
                WS.get('change').then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.devises = res.data.changes;
                        $.each(vm.devises, function (index, item) {
                            if (item.name == '€') {
                                if (!vm.mouvement.change_id) {
                                    console.log(item.id);
                                    vm.mouvement.change_id = item.id;
                                }
                            }
                        });

                        $scope.$apply();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };

            vm.openMouvement = function (id) {
                $state.go('app.traitements.mouvements.details', {
                    id: id
                });
            };
            vm.removeProduct = function (index) {
                vm.mouvement.entry_event_details.splice(index, 1);
            };
            vm.updateStock = function (range_detail_id, produit_id, entry_event_detail_id, new_value, keyCode) {
                alert(keyCode);
                WS.put('entry/product', {
                    product_id: produit_id,
                    range_detail_id: range_detail_id,
                    entry_event_detail_id: entry_event_detail_id,
                    new_value: new_value
                }).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif('Stock modifié avec succès.', 'success');
                    }
                    if (keyCode == 13) {
                        $('.modal').modal('hide');
                    }
                    $('.loader').addClass('hidden');

                    vm.getMouvementByID();
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };

            vm.closeModal = function () {
                $('.modal').modal('hide');
            };

            vm.initMouvement = function () {
                vm.mouvement = {
                    entry_event_details: []
                };
            };
            vm.calculerStock = function (tailles) {
                var s = 0;
                angular.forEach(tailles, function (t) {
                    if (t.value && t.value != NaN) {
                        s += t.value * 1;
                    }
                });
                return s;
            };

            vm.getMouvementByID = function (id) {
                vm.entry_event_details = [];
                if (!id) {
                    id = $state.params.id;
                }
                ;
                WS.get('entry/' + id, 'nb_elements=' + vm.nb_elements + '&current_page=' + vm.entry_event_details.length).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        vm.mouvement = res.data.entry_event;
                        // vm.entry_event_details = vm.entry_event_details.concat(res.data.entry_event.entry_event_details);
                        $scope.$apply();
                        // if (res.data.entry_event.entry_event_details.length > 0) {
                        // vm.current_page++;
                        // vm.getMouvementByID();
                        // } else {
                        // $('.loader').removeClass('hide');
                        // }
                    }
                }).then(null, function (error) {
                    window.notif(error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };

            vm.imprimer = function (id) {
                if (!id) {
                    id = vm.mouvement.id;
                }
                if (vm.print_id) {
                    id = vm.print_id;
                }

                var url = 'rate_price=' + vm.print.rate_price + '&purchase_price=' + vm.print.purchase_price;

                WS.get('entry/print/' + id, url).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.open(AppSettings.apiUrl + '' + res.data.url_file);
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif(error.data.msg, 'error');

                    $('.loader').addClass('hidden');
                });
            };
            vm.getProduits = function () {
                WS.get('product').then(function (res) {
                    if (res.data.success === 'true') {
                        $('.loader').addClass('hidden');
                        vm.produits = res.data.products;
                        $scope.$apply();
                    } else {
                        window.notif(error.data.msg, 'error');
                    }
                }).then(null, function (error) {
                    window.notif(error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getStock = function (ligne) {
                WS.get('entry/product/' + ligne.id, 'is_entry_event=1').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        vm.selected = res.data;
                        vm.entry_event_detail_id = ligne.id;
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif(error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getMouvements = function (search) {
                var url = '';
                if (search && search.num_inf_value) {
                    url += 'num_inf_value=' + search.num_inf_value;
                }
                if (search && search.start_date) {
                    url += '&start_date=' + moment(search.start_date).format('YYYY/MM/DD');
                }
                if (search && search.end_date) {
                    url += '&end_date=' + moment(search.end_date).format('YYYY/MM/DD');
                }
                WS.get('entry', url).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.mouvements = res.data.entry_events;
                        if (table) {
                            table.destroy();
                        }
                        $scope.$apply();
                        table = $('#mouvements').DataTable({
                            'bFilter': false,
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                }).then(null, function (error) {
                    window.notif(error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };

            // selected product when auto complete press enter
            vm.selectedProduct = function (item) {
                if (!item) {
                    return;
                }
                var exist = vm.mouvement.entry_event_details.filter(function (obj) {
                    return obj.product_id == item.originalObject.id;
                });
                if (exist.length > 0) {
                    window.notif('Produit exsite déjà dans la liste', 'error');
                    return;
                }

                WS.get('product/' + item.originalObject.id, 'is_entry_event=1').then(function (res) {
                    if (res.data.success === 'true') {
                        vm.selected = res.data.product;
                        vm.selected.product_id = res.data.product.id;
                        $scope.$broadcast('angucomplete-alt:clearInput');
                        vm.mouvement.entry_event_details.push(vm.selected);
                        $('.loader').addClass('hidden');
                        $('#ajoutStock').modal('show');
                        $scope.$apply();
                    } else {
                        console.log(res.data.msg);
                    }
                }).then(null, function (error) {
                    window.notif(error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.saveMouvement = function () {
                WS.post('entry', vm.mouvement).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif('Mouvement ajouté avec succès.', 'success');
                    }
                    $state.go('app.traitements.mouvements.details', {id: res.data.entry_event_id});
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateMouvement = function () {
                vm.closeModal();

                return;
                if ($state.current.name == 'app.traitements.mouvements.add') {
                    return;
                }
                WS.put('entry', vm.mouvement).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif('Mouvement modifié avec succès.', 'success');
                        vm.getMouvementByID();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteProduct = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('entry/product?entry_event_detail_id=' + id).then(function (res) {
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif('Produit supprimé avec succès.', 'success');
                            vm.getMouvementByID();
                        }
                        $('.loader').addClass('hidden');
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.openDetailsProduit = function (product_id) {

                if ($('meta[name="product_id"]').length) {
                    $('meta[name="product_id"]').attr('content', product_id * 1);
                } else {
                    $('head').append('<meta name="product_id" content="' + product_id * 1 + '" />');
                }

                addProductModalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'detailsProduit.html',
                    controller: 'produitsController',
                    controllerAs: 'vm',
                    size: 'lg'
                });
            };
            vm.delete = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('entry?entry_event_id=' + id).then(function (res) {
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif('Mouvement supprimé avec succès.', 'success');
                            vm.getMouvements();
                        }
                        $('.loader').addClass('hidden');
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.getGammes = function () {
                WS.get('range').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.gammes = res.data.ranges;
                        vm.gammeItems = res.data.ranges;
                        $scope.$apply();
                    }
                    $('.loader').addClass('hidden');
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getGammes();
            vm.getDetails = function (gamme) {
                if (gamme) {
                    vm.details_gamme = gamme;
                }
                WS.get('range/detail', 'range_id=' + vm.details_gamme.id).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.range_details = res.data.range_details;
                        $scope.$apply();
                        $('.loader').addClass('hidden');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };

            //TODO : à optimiser
            vm.modalNewGamme = function (product, value, name) {
                vm.parent_gamme_id = 0;
                var gamme_id;
                angular.forEach(product.ranges, function (gamme) {
                    if (gamme.range_id || product.range_id) {
                        if (gamme.range_id) {
                            gamme_id = gamme.range_id;
                        }
                        if (product.range_id) {
                            gamme_id = product.range_id;
                        }
                        angular.forEach(vm.gammes, function (gamme) {
                            var g = gamme.ranges.find(function (item) {
                                return item.id == gamme_id;
                            });
                            if (g) {
                                vm.parent_gamme_id = g.id;
                            }
                        });
                        return;
                    }
                });

                $('#accordion .collapse.in').removeClass('in');
                vm.gamme = value;
                vm.gamme.range_detail_id = gamme_id;
                vm.gamme.old_name = name;
                vm.new = 0;
                $('#gamme').modal('show');
            };
            vm.addGamme = function () {
                var gamme = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                if (gamme) {
                    angular.forEach(vm.products, function (product) {
                        angular.forEach(product.ranges, function (range, key) {
                            if (vm.gamme.old_name == key) {
                                range.status = true;
                                range.name = gamme.name;
                                range.range_id = gamme.id;
                                if (vm.parent_gamme_id == 0) {
                                    angular.forEach(vm.gammes, function (_gamme) {
                                        var g = _gamme.ranges.find(function (item) {
                                            return item.id == gamme.id;
                                        });
                                        if (g) {
                                            vm.parent_gamme_id = _gamme.id;
                                        }
                                    });
                                }
                                product.range_id = vm.parent_gamme_id;
                            }
                        });
                    });
                    $('#gamme').modal('hide');
                } else {
                    WS.post('range/detail', vm.gamme).then(function (res) {
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            angular.forEach(vm.products, function (product) {
                                angular.forEach(product.ranges, function (range, key) {
                                    if (vm.gamme.old_name == key) {
                                        range.status = true;
                                        range.name = vm.gamme.name;
                                    }
                                });
                            });
                            $('#gamme').modal('hide');
                            $scope.$apply();
                        }
                        $('.loader').addClass('hidden');
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                }
            };
            vm.openModalAddProduct = function () {
                WS.get('product/exist/' + $('[ng-model="searchStr"]').val()).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.exist == false) {
                        if ($('meta[name="reference"]').length) {
                            $('meta[name="reference"]').attr('content', $('[ng-model="searchStr"]').val());
                        } else {
                            $('head').append('<meta name="reference" content="' + $('[ng-model="searchStr"]').val() + '" />');
                        }
                        addProductModalInstance = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'addProduct.html',
                            controller: 'produitsController',
                            controllerAs: 'vm',
                            size: 'lg'
                        });

                        addProductModalInstance.result.then(function (selectedItem) {
                            setTimeout(function () {
                                vm.getProduits();
                            }, 2000);
                        }, function () {
                            console.info('Modal dismissed at: ' + new Date());
                        });
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.uploadFile = function () {
                vm.file_name = $('[name="file"]').val().replace('C:\\fakepath\\', '');
                vm.canUpload = 0;
                var formData = new FormData();
                formData.append('file', $('[name="file"]')[0].files[0]);
                WS.post('entry/import/stepone', formData, undefined).then(function (res) {

                    $('.loader').addClass('hidden');
                    if (res.data.success == 'false') {
                        console.error(res.data.msg);
                    } else {
                        vm.canUpload = 1;
                        var t = [];
                        angular.forEach(res.data.headers, function (val, key) {
                            t.push({
                                i: i++,
                                key: key,
                                value: val
                            });
                        });
                        vm.headers = t;

                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                    console.error(error);
                });
            };
            vm.uploadImages = function () {
                vm.file_name = $('[name="file"]').val().replace('C:\\fakepath\\', '');
                vm.canUpload = 0;
                var formData = new FormData();
                formData.append('file', $('[name="file"]')[0].files[0]);
                WS.post('entry/import/pictures', formData, undefined).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.report = res.data;
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.lier = function () {
                var items1 = [];
                var items2 = [];
                vm.liersItem = {};
                if ($('#list1 option:selected').length == 0 || $('#list2 option:selected').length == 0) {
                    return;
                }
                $('#list1 option:selected').each(function (index, el) {
                    items1.push({
                        i: $(el).data('i'),
                        key: $(el).data('key'),
                        value: $(el).text()
                    });
                    vm.headers = vm.headers.filter(function (c) {
                        return c.key != $(el).data('key');
                    });
                });
                $('#list2 option:selected').each(function (index, el) {
                    items2.push({
                        i: $(el).data('i'),
                        value: $(el).data('value'),
                        obligatoire: $(el).data('obligatoire'),
                        type: $(el).data('type'),
                        is_range: $(el).data('is_range')
                    });
                    vm.listItems = vm.listItems.filter(function (c) {
                        return c.value != $(el).data('value');
                    });
                    vm.gammeItems = vm.gammeItems.filter(function (c) {
                        return c.name != $(el).data('value');
                    });
                });
                $('#list1 option:selected').prop('selected', false);
                $('#list2 option:selected').prop('selected', false);
                if (items1.length && items2.length) {
                    vm.liersItems.push([items1, items2]);
                    console.log(vm.liersItems);
                }
            };
            vm.dissocier = function (index, value1, value2) {
                vm.liersItems.splice(index, 1);
                angular.forEach(value1, function (el) {
                    vm.headers.push(el);
                });
                angular.forEach(value2, function (el) {
                    if (el.type == 'gamme') {
                        el.name = el.value;
                        vm.gammeItems.push(el);
                    } else {
                        vm.listItems.push(el);
                    }
                });
            };
            vm.envoyerLiaisons = function () {
                var obligatoires = vm.listItems.filter(function (c) {
                    return c.obligatoire == 1;
                });

                if (obligatoires.length) {
                    window.notif('Veuillez choisir tous les elements obligatoires <i>contenant *</i>', 'error');
                    return;
                }
                var o = {};
                o.data = vm.liersItems;
                o.file_name = vm.file_name;
                WS.post('entry/import/steptwo', o).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.step = 2;
                        vm.products = res.data.data;
                        console.log(res.data);
                        $scope.$apply();
                        $('[href="#etape2"]').trigger('click');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getBrands = function () {
                WS.get('brand').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data);
                    } else {
                        vm.brands = res.data.brands;
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    console.error(error);
                    //window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getGenders = function () {
                WS.get('gender').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.genders = res.data.genders;
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getSports = function () {
                WS.get('sport').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.sports = res.data.sports;
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getCategories = function () {
                WS.get('category').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.categories = res.data.categories;
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.verifStatusRanges = function (product) {
                var status = true;
                angular.forEach(product.ranges, function (range, key) {
                    if (range.status == false || range.status == 'false') {
                        status = false;
                    }
                });
                if (product['Marque'] && !product.marque) {
                    status = false;
                }
                if (product['Genre'] && !product.genre) {
                    status = false;
                }
                if (product['Sport'] && !product.sport) {
                    status = false;
                }
                if (product['Categorie'] && !product.categorie) {
                    status = false;
                }
                return status;
            };
            vm.lierMarque = function (_marque, v) {
                angular.forEach(vm.products, function (product) {
                    if (vm._marque == product['Marque']) {
                        product.marque = v;
                    }
                });
                $('[data-marque="' + _marque + '"]').html(v.name).attr('data-id', v.id).removeClass('badge-danger').addClass('badge-success');
                $('.modal').modal('hide');
            };
            vm.lierGenre = function (_genre, v) {
                angular.forEach(vm.products, function (product) {
                    if (vm._genre == product['Genre']) {
                        product.gender = v;
                    }
                });
                $('[data-genre="' + _genre + '"]').html(v.name).attr('data-id', v.id).removeClass('badge-danger').addClass('badge-success');
                $('.modal').modal('hide');
            };
            vm.lierSport = function (_sport, v) {
                angular.forEach(vm.products, function (product) {
                    if (vm._sport == product['Sport']) {
                        product.sport = v;
                    }
                });
                $('[data-sport="' + _sport + '"]').html(v.name).attr('data-id', v.id).removeClass('badge-danger').addClass('badge-success');
                $('.modal').modal('hide');
            };
            vm.lierCategorie = function (_categorie, v) {
                angular.forEach(vm.products, function (product) {
                    if (vm._categorie == product['Categorie']) {
                        product.categorie = v;
                    }
                });
                $('[data-categorie="' + _categorie + '"]').html(v.name).attr('data-id', v.id).removeClass('badge-danger').addClass('badge-success');
                $('.modal').modal('hide');
            };
            vm.envoyerProduits = function () {
                console.error($('.rouge'));
                if ($('.rouge').length && $('.badge-danger').length) {
                    window.notif('Veuillez compléter toutes les correspondances attendues', 'error');
                    return;
                }
                var o = {};
                o.data = vm.products;
                o.file_name = vm.file_name;
                WS.post('entry/import/stepthree', o).then(function (res) {
                    console.log(res);
                    console.error(res);
                    $('.loader').addClass('hidden');
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.step = 3;
                        vm.step3 = res.data;
                        $scope.$apply();
                        $('[href="#etape3"]').trigger('click');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.toggleProductStatus = function () {
                if (vm.product_status == 1) {
                    $('.completed').removeClass('completed');
                } else {
                    $('#table_produits tr').each(function (index, el) {
                        console.log($(el).find('.rouge').length, $(el).find('.badge-danger').length);
                        if ($(el).find('.rouge').length || $(el).find('.badge-danger').length) {
                            $(el).removeClass('completed');
                        } else {
                            $(el).addClass('completed');
                        }
                    });
                }
            };
            vm.getDeviseName = function (id) {
                var devise = vm.devises.filter(function (d) {
                    return d.id == id;
                });
                return devise[0] ? devise[0].name : '';
            };
            $rootScope.$on('addProductSuccess', function (event, data) {
                var o = {};
                o.originalObject = {};
                o.originalObject.id = data.product_id;
                vm.selectedProduct(o);

                addProductModalInstance.close();
                vm.getProduits();
            });
            $(document).ready(function ($) {
                var ua = navigator.userAgent,
                    event = ua.match(/iP/i) ? 'touchstart' : 'click';
                $(document).off(event, '[ng-bind="textNoResults"]');
                $(document).on(event, '[ng-bind="textNoResults"]', function (event) {
                    vm.openModalAddProduct();
                });

                $(document).off(event, '.btn-upload-images');
                $(document).on(event, '.btn-upload-images', function (event) {
                    $('[name=images]').trigger('click');
                });

                $(document).off(event, '.closeModal');
                $(document).on(event, '.closeModal', function (event) {
                    addProductModalInstance.close();
                    event.preventDefault();
                    event.stopPropagation();
                });

                $(document).on('change', '[name="file"]', function (event) {
                    event.preventDefault();
                    vm.file_name = $.trim($(this).val().replace('C:\\fakepath\\', ''));
                    $scope.$apply();
                });
            });
        }

        exports.default = {
            name: 'mouvementsController',
            fn: mouvementsController
        };


    }, {}],
    "../app/js/controllers/pays.js": [function (require, module, exports) {
        'use strict';

        paysController.$inject = ["$scope", "$rootScope", "$state", "WS", "$localStorage"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function paysController($scope, $rootScope, $state, WS, $localStorage) {
            'ngInject';

            var vm = this;
            vm.countries = [];
            vm.country = {};
            vm.img_edit = 0;
            var table = null;
            vm.getCountries = function () {
                WS.get('country').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.countries = res.data.countries;
                        $scope.$apply();
                        table = $('#pays').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.addCountry = function () {
                WS.post('country', vm.country).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif(res.data.msg, 'success');
                        $('.loader').addClass('hidden');
                        table.destroy();
                        vm.getCountries();
                        vm.country = {};
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateCountry = function (value) {
                value.country_id = value.id;
                WS.put('country', value).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif(res.data.msg, 'success');
                        $('.loader').addClass('hidden');
                        table.destroy();
                        vm.getCountries();
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteCountry = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('country', {country_id: id}).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            $('.loader').addClass('hidden');
                            table.destroy();
                            vm.getCountries();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
        }

        exports.default = {
            name: 'paysController',
            fn: paysController
        };

    }, {}],
    "../app/js/controllers/produits.js": [function (require, module, exports) {
        'use strict';

        produitsController.$inject = ["$scope", "$q", "$rootScope", "$state", "WS", "$localStorage", "AppSettings", "moment"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function produitsController($scope, $q, $rootScope, $state, WS, $localStorage, AppSettings, moment) {
            'ngInject';

            var vm = this;
            var table = null;
            vm.data = $localStorage.data;

            vm.produit = {};
            vm.produits = [];
            vm.devis = [];
            vm.search = {
                categories: [],
                sports: [],
                brands: [],
                gammes: [],
                genders: [],
                quantite: 1,
                qtr_exhausted: 0,
                is_no_pictures: 0,
                entry_event_after_before: '<'
            };
            vm.optionsSlider = {
                ceil: 1000,
                max: 1000,
                hideLimitLabels: true,
                translate: function translate(value) {
                    if (value == vm.optionsSlider.ceil) {
                        return 'MAX';
                    }
                    return value;
                }
            };

            if ($localStorage.devis) {
                vm.devis = $localStorage.devis;
            }
            $localStorage.devis = vm.devis;
            vm.moy_commands = 0;
            vm.moy_quotations = 0;
            vm.moy_invoices = 0;

            vm.calculCA = function (list, type) {
                var total = 0;
                var qte = 0;
                angular.forEach(list, function (i) {
                    total += i.total * 1;
                    qte += i.qte_total * 1;
                });
                if (type == 1) {
                    vm.moy_commands = total / qte;
                }
                if (type == 2) {
                    vm.moy_invoices = total / qte;
                }
                if (type == 3) {
                    vm.moy_quotations = total / qte;
                }
                $scope.$apply();
            };
            vm.getStats = function (id) {
                WS.get('product/stats', 'product_id=' + id).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.stats = res.data.stats;
                        $scope.$apply();
                        vm.calculCA(vm.stats.commands, 1);
                        vm.calculCA(vm.stats.invoices, 2);
                        vm.calculCA(vm.stats.quotations, 3);
                        $('.loader').addClass('hidden');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getProduits = function () {
                var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;


                var o = {};
                angular.copy(vm.search, o);
                o.format = format;

                if (o.genders.length) {
                    o.genders = o.genders.map(function (c) {
                        return c.id;
                    });
                }
                if (o.categories.length) {
                    o.categories = o.categories.map(function (c) {
                        return c.id;
                    });
                }

                if (o.brands.length) {
                    o.brands = o.brands.map(function (c) {
                        return c.id;
                    });
                }

                if (o.sports.length) {
                    o.sports = o.sports.map(function (c) {
                        return c.id;
                    });
                }

                if (o.entry_event_date) {
                    o.entry_event_date = moment(o.entry_event_date).format('YYYY/MM/DD');
                }

                o.qte_min = vm.search.quantite;

                if (vm.optionsSlider.max < 1000) {
                    o.qte_max = vm.optionsSlider.max;
                }

                WS.post('product/search', o).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        if (res.data.url_file) {
                            window.open(AppSettings.apiUrl + '' + res.data.url_file);
                        } else {
                            vm.produits = res.data.products;
                            if (table) {
                                table.destroy();
                            }
                            $scope.$apply();
                            table = $('#liste-produits').DataTable({
                                'pageLength': table ? table.page.len() : 50,
                                'bFilter': false,
                                initComplete: function initComplete(settings, json) {
                                    $('.loader').addClass('hidden');
                                }
                            });
                        }
                    }
                }).then(null, function (error) {
                    window.notif(error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getProduitById = function (id) {
                if (!id) {
                    id = $state.params.id;
                }
                if ($('meta[name="product_id"]').attr('content')) {
                    id = $('meta[name="product_id"]').attr('content') * 1;
                }

                WS.get('product/' + id).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.produit = res.data.product;
                        vm.produit.zonage_city_id = '1';
                        $scope.$apply();
                        vm.getStats(vm.produit.id);
                        $('.loader').addClass('hidden');
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif(error.data.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteProduct = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('product/' + id).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.success == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            vm.getProduits();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.resetSearch = function () {
                vm.search = {
                    categories: [],
                    sports: [],
                    brands: [],
                    gammes: [],
                    quantite: 1,
                    qtr_exhausted: 0,
                    is_no_pictures: 0,
                    entry_event_after_before: '<'
                };
                $scope.$apply();
            };
            vm.resetProduit = function () {
                vm.produit = {};
                if ($('meta[name="reference"]').length) {
                    vm.produit.reference = $('meta[name="reference"]').attr('content');
                }
            };
            vm.goToProductList = function () {
                if (!$('body').hasClass('modal-open')) {
                    $state.go('app.produits.index');
                    vm.getProduits();
                }
            };
            if ($state.params) {
                if ($state.params.tab) {
                    jQuery(document).ready(function ($) {
                        $('.nav-tabs a[href="#' + $state.params.tab + '"]').tab('show');
                    });
                }
            }
            $rootScope.$on('$stateChangeSuccess', function (event, toState) {
                if ($state.params) {
                    if ($state.params.tab) {
                        jQuery(document).ready(function ($) {
                            $('.nav-tabs a[href="#' + $state.params.tab + '"]').tab('show');
                        });
                    }
                }
            });
            vm.addProduit = function () {
                WS.post('product', vm.produit).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.notif(res.data.msg, 'success');
                        $rootScope.$broadcast('addProductSuccess', {
                            product_id: res.data.id
                        });
                        vm.produit = {};
                        if (!$('body').hasClass('modal-open')) {
                            $state.go('app.produits.index');
                            vm.getProduits();
                        }
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateProduit = function () {
                vm.produit.product_id = vm.produit.id;
                WS.put('product', vm.produit).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.notif(res.data.msg, 'success');
                        vm.getProduits();
                        $state.go('app.produits.index');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.setDefault = function (id) {
                WS.post('product/picture/default', {product_id: vm.produit.id, picture_id: id}).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.notif(res.data.msg, 'success');
                        vm.getProduitById($state.params.id);
                        vm.getProduits();
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.addPhotos = function () {
                var err = '';
                var formData = new FormData();
                formData.append('product_id', vm.produit.id);
                $.each($('[name="picture"]')[0].files, function (i, file) {
                    if (file.size / 1048576 > 5) {
                        err += file.name + ' ';
                    }
                    formData.append('picture[]', file);
                });

                if (err) {
                    window.notif('La taille maximale d\'un fichier est 5 Mo. Merci de vérifier les fichiers suivants : ' + err, 'error');
                    return;
                }
                WS.post('product/picture', formData, undefined).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif(res.data.msg, 'success');
                        $('.modal').modal('hide');
                        vm.getProduitById(vm.produit.id);
                        vm.getProduits();
                        console.log(res);
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deletePhoto = function (id) {

                WS.delete('product/picture', {picture_id: id}).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.notif(res.data.msg, 'success');
                        vm.getProduitById($state.params.id);
                        vm.getProduits();
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getCategories = function () {
                WS.get('category').then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.categories = res.data.categories;
                        $('.loader').addClass('hidden');
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getZonages = function () {
                WS.get('zonage').then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.zonages = res.data.zonage_cities;
                        $('.loader').addClass('hidden');
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getMarques = function () {
                WS.get('brand').then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.marques = res.data.brands;
                        $('.loader').addClass('hidden');
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getGenders = function () {
                WS.get('gender').then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.genders = res.data.genders;
                        $('.loader').addClass('hidden');
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getSports = function () {
                WS.get('sport').then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.sports = res.data.sport;
                        $('.loader').addClass('hidden');
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getGammes = function () {
                WS.get('range').then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.gammes = res.data.ranges;
                        $('.loader').addClass('hidden');
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.getSports = function () {
                WS.get('sport').then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.sports = res.data.sports;
                        $('.loader').addClass('hidden');
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateStock = function (value) {
                var o = {};
                o.id = value.id;
                o.qtr = value.qtr;
                WS.put('product/stock', o).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.notif(res.data.msg, 'success');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateZonage = function (value) {
                var o = {};

                o.product_id = value.id;
                o.aisle = value.aisle;
                o.palette = value.palette;
                WS.put('product/utils/zonage', o).then(function (res) {
                    if (res.data.success == 'false') {
                        console.log(res.data.msg);
                    } else {
                        $('.loader').addClass('hidden');
                        window.notif(res.data.msg, 'success');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.showprice = function () {
                vm.showPrice = 1;
                setTimeout(function () {
                    vm.showPrice = 0;
                    $scope.$apply();
                }, 1000);
            };
            vm.deleteLigneDevis = function (i) {
                vm.devis.splice(i, 1);
            };
            var dragged_product = {};
            vm.registerDraggedItem = function (e, ui, item) {
                dragged_product = item;
            };
            vm.beforeDrop = function (e, ui) {
                var deferred = $q.defer();
                if (vm.devis.find(function (item) {
                    return item.id == dragged_product.id;
                })) {
                    deferred.reject();
                } else {
                    deferred.resolve();
                }
                return deferred.promise;
            };
            vm.selectAll = function () {
                console.log(vm.search.categories);
            };
            vm.addToDevis = function (produits) {
                angular.forEach(produits, function (produit) {
                    if (!vm.devis.find(function (item) {
                        return item.id == produit.id;
                    })) {
                        vm.devis.push(produit);
                    } else {
                        window.notif('Produit existe déjà', 'error');
                    }
                });
                $localStorage.devis = vm.devis;
            };
            vm.eventsGenders = {
                onSelectAll: function onSelectAll() {
                    if (vm.search.genders.length) {
                        vm.search.genders = [];
                    }
                }
            };
            vm.eventsCategories = {
                onSelectAll: function onSelectAll() {
                    if (vm.search.categories.length) {
                        vm.search.categories = [];
                    }
                }
            };
            vm.eventsBrands = {
                onSelectAll: function onSelectAll() {
                    if (vm.search.brands.length) {
                        vm.search.brands = [];
                        $scope.$apply();
                    }
                }
            };
            vm.eventsSports = {
                onSelectAll: function onSelectAll() {
                    if (vm.search.sports.length) {
                        vm.search.sports = [];
                        $scope.$apply();
                    }
                }
            };
            vm.eventsGammes = {
                onSelectAll: function onSelectAll() {
                    if (vm.search.gammes.length) {
                        vm.search.gammes = [];
                        $scope.$apply();
                    }
                }
            };
            vm.multiSelectSettings = {
                checkBoxes: true,
                enableSearch: true,
                showUncheckAll: false,
                displayProp: 'name',
                scrollableHeight: '300px',
                scrollable: true
            };
            var ua = navigator.userAgent,
                event = ua.match(/iP/i) ? 'touchstart' : 'click';
            $(document).off('change', '#check-all');
            $(document).on('change', '#check-all', function (event) {
                if ($(this).is(':checked')) {
                    $('[type="checkbox"]').prop('checked', true);
                } else {
                    $('[type="checkbox"]').prop('checked', false);
                }
            });
            $(document).off(event, '.add-photo-box');
            $(document).on(event, '.add-photo-box', function (event) {
                $('[name=picture]').trigger('click');
            });
            $(document).on('change', '[name="picture"]', function (event) {
                var input = this;
                var url = $(this).val();
                var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
                if (input.files && input.files[0] && (ext == 'gif' || ext == 'png' || ext == 'jpeg' || ext == 'jpg')) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $('.add-photo-box').find('img').attr('src', e.target.result);
                        vm.addPhotos();
                        $scope.$apply();
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            });

            $(document).off(event, '.drop');
            $(document).on(event, '.drop', function (event) {
                event.preventDefault();
                $('.devis_produits').toggleClass('open');
            });
            $(document).on(event, '.toCopy', function (event) {
                var $temp = $('<input>');
                $('body').append($temp);
                $temp.val($(this).text()).select();
                document.execCommand('copy');
                $temp.remove();
            });
        }

        exports.default = {
            name: 'produitsController',
            fn: produitsController
        };

    }, {}],
    "../app/js/controllers/profile.js": [function (require, module, exports) {
        'use strict';

        profileController.$inject = ["$scope", "$rootScope", "$state", "WS", "$localStorage"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function profileController($scope, $rootScope, $state, WS, $localStorage) {
            'ngInject';

            var vm = this;
            vm.user = {};
            if ($localStorage.data.user) {
                angular.copy($localStorage.data.user, vm.user);
                console.log(vm.user);
            }

            vm.editUser = function () {
                WS.put('user', vm.user).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        angular.copy(vm.user, $localStorage.data.user);
                        window.notif('Profile mis à ajour avec succès.', 'success');
                        $state.go('app.index');
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };

            vm.deletePhoto = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-la!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('account/picture', {user_id: id}).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif('l\'image a été supprimé.', 'success');
                            vm.user.url_picture = null;
                            angular.copy(vm.user, $localStorage.data.user);
                            $scope.$apply();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.uploadPhoto = function (id) {
                var formData = new FormData();
                formData.append('user_id', id);
                formData.append('picture', $('[name="picture"]')[0].files[0]);
                WS.post('account/picture', formData, undefined).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif(res.data.msg, 'success');
                        vm.user.url_picture = res.data.url_logo;
                        vm.canUpload = 0;
                        angular.copy(vm.user, $localStorage.data.user);
                        $scope.$apply();
                        $state.go('app.index');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };

            var ua = navigator.userAgent,
                event = ua.match(/iP/i) ? 'touchstart' : 'click';

            $(document).off(event, '.img');
            $(document).on(event, '.img', function (event) {
                $('[name=picture]').trigger('click');
                event.stopPropagation();
            });
            $(document).on('change', '[name="picture"]', function (event) {
                var input = this;
                var url = $(this).val();
                var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
                if (input.files && input.files[0] && (ext == 'gif' || ext == 'png' || ext == 'jpeg' || ext == 'jpg')) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $('.img').attr('src', e.target.result);
                        vm.canUpload = 1;
                        $scope.$apply();
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            });
        }

        exports.default = {
            name: 'profileController',
            fn: profileController
        };

    }, {}],
    "../app/js/controllers/sports.js": [function (require, module, exports) {
        'use strict';

        sportsController.$inject = ["$scope", "$rootScope", "$state", "WS", "$localStorage"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function sportsController($scope, $rootScope, $state, WS, $localStorage) {
            'ngInject';

            var vm = this;
            vm.sports = [];
            vm.sport = {};
            vm.img_edit = 0;
            var table = null;
            vm.getSports = function () {
                WS.get('sport').then(function (res) {
                    if (res.data.success === 'true') {
                        vm.sports = res.data.sports;
                        $scope.$apply();
                        table = $('#sports').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    } else {
                        console.log(res.data.msg);
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.addSport = function () {
                WS.post('sport', vm.sport).then(function (res) {
                    if (res.data.success === 'true' && res.data.sport) {
                        vm.sport = res.data.sport;
                        vm.sports.push(vm.sport);
                        vm.sports = vm.sports.sort();
                        vm.sport = {};
                        table.destroy();
                        table = $('#sports').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                        $scope.$apply();
                    } else {
                        console.log(res.data.msg);
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateSport = function (value) {
                value.sport_id = value.id;
                console.error(value);
                if (value.name) {
                    WS.put('sport', value).then(function (res) {
                        if (res.data.success === 'true' && res.data.sport) {
                            vm.sport = res.data.sport;
                            for (var i = 0; i < vm.sports.length; i++) {
                                if (vm.sports[i].id == vm.sport.id) {
                                    vm.sports[i] = vm.sport;
                                }
                            }
                            vm.sport = {};
                            table.destroy();
                            table = $('#sports').DataTable({
                                initComplete: function initComplete(settings, json) {
                                    $('.loader').addClass('hidden');
                                }
                            });
                            $scope.$apply();
                        } else {
                            console.log(res.data.msg);
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                } else {
                    alert('Please fill Name');
                    table.destroy();
                    table = $('#sports').DataTable({
                        initComplete: function initComplete(settings, json) {
                            $('.loader').addClass('hidden');
                        }
                    });
                    $scope.$apply();
                }
            };
            vm.deleteSport = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('sport', {sport_id: id}).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            table.destroy();
                            vm.getSports();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
        }

        exports.default = {
            name: 'sportsController',
            fn: sportsController
        };

    }, {}],
    "../app/js/controllers/users.js": [function (require, module, exports) {
        'use strict';

        usersController.$inject = ["$scope", "$rootScope", "$state", "WS", "$localStorage"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function usersController($scope, $rootScope, $state, WS, $localStorage) {
            'ngInject';

            var vm = this;
            vm.error = '';
            vm.users = {};
            vm.user = {};
            vm.editing = 0;
            vm.canUpload = 0;
            var table = null;

            vm.getUsers = function () {
                WS.get('user').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.users = res.data.users;
                        $scope.$apply();
                        table = $('#users').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.addUser = function () {
                WS.post('user', vm.user).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.user = {};
                        table.destroy();
                        $('form')[0].reset();
                        window.notif('l\'utilisateur ajouté avec succès.', 'success');
                        vm.getUsers();
                        $('.modal').modal('hide');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.editUser = function () {
                WS.put('user', vm.user).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.user = {};
                        $('form')[0].reset();
                        window.notif('l\'utilisateur mis à ajour avec succès.', 'success');
                        table.destroy();
                        vm.getUsers();
                        $('.modal').modal('hide');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.delete = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('user/' + id).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif('l\'utilisateur a été supprimé.', 'success');
                            table.destroy();
                            vm.getUsers();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.edit = function (user) {
                vm.user = user;
                vm.editing = 1;
            };
            vm.deletePhoto = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('account/picture', {user_id: id}).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif('l\'image a été supprimé.', 'success');
                            $('.modal').modal('hide');
                            table.destroy();
                            vm.getUsers();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
            vm.uploadPhoto = function (id) {
                var formData = new FormData();
                formData.append('user_id', id);
                formData.append('picture', $('[name="picture"]')[0].files[0]);
                WS.post('account/picture', formData, undefined).then(function (res) {
                    $('.loader').addClass('hidden');
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        window.notif(res.data.msg, 'success');
                        vm.canUpload = 0;
                        table.destroy();
                        vm.getUsers();
                        $('.modal').modal('hide');
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };

            var ua = navigator.userAgent,
                event = ua.match(/iP/i) ? 'touchstart' : 'click';

            $(document).off(event, '.img');
            $(document).on(event, '.img', function (event) {
                $('[name=picture]').trigger('click');
            });
            $(document).on('change', '[name="picture"]', function (event) {
                var input = this;
                var url = $(this).val();
                var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
                if (input.files && input.files[0] && (ext == 'gif' || ext == 'png' || ext == 'jpeg' || ext == 'jpg')) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $('.img').attr('src', e.target.result);
                        vm.canUpload = 1;
                        $scope.$apply();
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            });
        }

        exports.default = {
            name: 'usersController',
            fn: usersController
        };

    }, {}]
    ,
    "../app/js/controllers/zonages.js": [function (require, module, exports) {
        'use strict';

        zonagesController.$inject = ["$scope", "$rootScope", "$state", "WS", "$localStorage"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function zonagesController($scope, $rootScope, $state, WS, $localStorage) {
            'ngInject';

            var vm = this;
            vm.zonages = [];
            vm.zonage = {};
            vm.img_edit = 0;
            var table = null;
            vm.getZonages = function () {
                WS.get('zonage').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        vm.zonages = res.data.zonage_cities;
                        $scope.$apply();
                        table = $('#zonages').DataTable({
                            initComplete: function initComplete(settings, json) {
                                $('.loader').addClass('hidden');
                            }
                        });
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.addZonage = function () {
                WS.post('zonage', vm.zonage).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        table.destroy();
                        vm.getZonages();
                        vm.zonage = {};
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.updateZonage = function (value) {
                value.zonage_city_id = value.id;
                WS.put('zonage', value).then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        table.destroy();
                        vm.getZonages();
                        vm.zonage = {};
                        $scope.$apply();
                    }
                }).then(null, function (error) {
                    window.notif('' + error.msg, 'error');
                    $('.loader').addClass('hidden');
                });
            };
            vm.deleteZonage = function (id) {
                swal({
                    title: 'Êtes-vous sûr?',
                    text: 'Vous ne pourrez pas revenir à cela!',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Oui, supprimez-le!',
                    cancelButtonText: 'Annuler'
                }).then(function () {
                    WS.delete('zonage', {zonage_city_id: id}).then(function (res) {
                        $('.loader').addClass('hidden');
                        if (res.data.succes == 'false') {
                            console.log(res.data.msg);
                        } else {
                            window.notif(res.data.msg, 'success');
                            table.destroy();
                            vm.getZonages();
                        }
                    }).then(null, function (error) {
                        window.notif('' + error.msg, 'error');
                        $('.loader').addClass('hidden');
                    });
                });
            };
        }

        exports.default = {
            name: 'zonagesController',
            fn: zonagesController
        };


    }, {}],
    "../app/js/directives/example.js": [function (require, module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function ExampleDirective() {

            return {
                restrict: 'EA',
                templateUrl: 'directives/example.html',
                scope: {
                    title: '@',
                    message: '@clickMessage'
                },
                link: function link(scope, element) {
                    element.on('click', function () {
                        window.alert('Element clicked: ' + scope.message);
                    });
                }
            };
        }

        exports.default = {
            name: 'exampleDirective',
            fn: ExampleDirective
        };

    }, {}],
    "../app/js/directives/index.js": [function (require, module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        var _angular = require('angular');

        var _angular2 = _interopRequireDefault(_angular);

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {default: obj};
        }


        var directivesModule = _angular2.default.module('app.directives', []);
        var directives = ({
            "example": require("./example.js"),
            "select2": require("./select2.js"),
            "summernote": require("./summernote.js")
        });

        function declare(directiveMap) {
            Object.keys(directiveMap).forEach(function (key) {
                var item = directiveMap[key];

                if (!item) {
                    return;
                }

                if (item.fn && typeof item.fn === 'function') {
                    directivesModule.directive(item.name, item.fn);
                } else {
                    declare(item);
                }
            });
        }

        declare(directives);

        exports.default = directivesModule;
    }, {
        "./example.js": "../app/js/directives/example.js",
        "./select2.js": "../app/js/directives/select2.js",
        "./summernote.js": "../app/js/directives/summernote.js",
        "angular": "../node_modules/angular/index.js"
    }],
    "../app/js/directives/select2.js": [function (require, module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function select2() {

            return {
                restrict: 'AC',
                require: 'ngModel',
                link: function link(scope, element, attr, ngModel) {

                    //$this becomes element


                    element.select2({
                        'language': {
                            'noResults': function noResults() {
                                return 'Aucun résultat trouvé';
                            }
                        }
                    });
                }
            };
        }

        exports.default = {
            name: 'select2',
            fn: select2
        };

    }, {}],
    "../app/js/directives/summernote.js": [function (require, module, exports) {
        'use strict';

        summernoteDirective.$inject = ["WS"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function summernoteDirective(WS) {
            'ngInject';

            return {
                restrict: 'C',
                scope: {
                    ngModel: '='
                },
                link: function link(scope, element, attrs) {
                    $(element).summernote({
                        focus: true,
                        minHeight: 200,
                        toolbar: [['style', ['bold', 'italic', 'underline', 'clear']], ['font', ['strikethrough', 'superscript', 'subscript']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['height', ['height']], ['Misc', ['fullscreen']]],
                        change: function change(e) {
                            console.log(222);
                            scope.ngModel = $(element).summernote('code');
                            console.log($(element).summernote('code'));
                        }
                    });
                }
            };
        }

        exports.default = {
            name: 'summernote',
            fn: summernoteDirective
        };


    }, {}],
    "../app/js/filters/example.js": [function (require, module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function ExampleFilter() {

            return function (input) {
                return input.replace(/keyboard/ig, 'leopard');
            };
        }

        exports.default = {
            name: 'ExampleFilter',
            fn: ExampleFilter
        };

    }, {}],
    "../app/js/filters/index.js": [function (require, module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        var _angular = require('angular');

        var _angular2 = _interopRequireDefault(_angular);

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {default: obj};
        }


        var filtersModule = _angular2.default.module('app.filters', []);
        var filters = ({
            "example": require("./example.js"),
            "moment": require("./moment.js"),
            "startFrom": require("./startFrom.js"),
            "toArray": require("./toArray.js")
        });

        function declare(filterMap) {
            Object.keys(filterMap).forEach(function (key) {
                var item = filterMap[key];

                if (!item) {
                    return;
                }

                if (item.fn && typeof item.fn === 'function') {
                    filtersModule.filter(item.name, item.fn);
                } else {
                    declare(item);
                }
            });
        }

        declare(filters);

        exports.default = filtersModule;

    }, {
        "./example.js": "../app/js/filters/example.js",
        "./moment.js": "../app/js/filters/moment.js",
        "./startFrom.js": "../app/js/filters/startFrom.js",
        "./toArray.js": "../app/js/filters/toArray.js",
        "angular": "../node_modules/angular/index.js"
    }],
    "../app/js/filters/moment.js": [function (require, module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        var _moment = require('moment');

        var _moment2 = _interopRequireDefault(_moment);

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {default: obj};
        }

        function momentFilter() {
            return function (date, format) {
                if (date == '') {
                    return;
                }
                if (format) {
                    return (0, _moment2.default)(new Date(date)).locale('fr').format(format);
                }
                return (0, _moment2.default)(new Date(date)).locale('fr').format('DD MMMM YYYY');
            };
        }

        exports.default = {
            name: 'moment',
            fn: momentFilter
        };

    }, {"moment": "../node_modules/moment/moment.js"}],
    "../app/js/filters/startFrom.js": [function (require, module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function startFrom() {

            return function (input, start) {
                start = +start; //parse to int
                return input.slice(start);
            };
        }

        exports.default = {
            name: 'startFrom',
            fn: startFrom
        };


    }, {}],
    "../app/js/filters/toArray.js": [function (require, module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function toArrayFilter() {
            return function (obj) {
                if (!(obj instanceof Object)) return obj;
                var t = [];
                var i = 0;
                angular.forEach(obj, function (val, key) {
                    t.push({i: i++, key: key, value: val});
                });
                return t;
            };
        }

        exports.default = {
            name: 'toArray',
            fn: toArrayFilter
        };

    }, {}],
    "../app/js/main.js": [function (require, module, exports) {
        'use strict';

        var _angular = require('angular');

        var _angular2 = _interopRequireDefault(_angular);

        require('summernote');

        require('angucomplete-alt');

        require('angular-ui-bootstrap');

        require('bootstrap-select');

        require('vendors/detect.js');

        require('vendors/jquery.blockUI.js');

        require('vendors/jquery.slimscroll.js');

        require('vendors/jquery.scrollTo.min.js');

        require('vendors/plugins/waypoints/jquery.waypoints.min.js');

        require('vendors/plugins/counterup/jquery.counterup.min.js');

        require('angular-dragdrop');

        require('angularjs-dropdown-multiselect');

        require('angularjs-slider');

        require('vendors/plugins/select2/js/select2.min.js');

        require('vendors/plugins/multiselect/js/jquery.multi-select.js');

        require('vendors/plugins/morris/morris.min.js');

        require('vendors/jquery.core.js');

        require('vendors/jquery.app.js');

        require('ngstorage');

        require('angular-sanitize');

        require('moment/locale/fr.js');

        require('angular-moment');

        require('angular-cookies');

        require('angular-ui-sortable');

        require('angular-translate');

        require('angular-translate-loader-static-files');

        require('angular-translate-storage-cookie');

        require('angular-translate-storage-local');

        require('bootstrap-tagsinput');

        require('ui-select');

        require('./scripts.js');

        var _constants = require('./constants');

        var _constants2 = _interopRequireDefault(_constants);

        var _on_config = require('./on_config');

        var _on_config2 = _interopRequireDefault(_on_config);

        var _on_run = require('./on_run');

        var _on_run2 = _interopRequireDefault(_on_run);

        require('angular-ui-router');

        require('./templates');

        require('./filters');

        require('./controllers');

        require('./services');

        require('./directives');

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {default: obj};
        }

        window.notif = function (message, type) {
            jQuery(document).ready(function ($) {
                $('#alert').fadeIn().removeClass('hidden');
                $('#alert').removeClass('alert-error').removeClass('alert-success');
                $('#alert').addClass('alert-' + type);
                $('#alert').find('.' + type).removeClass('hidden');
                if (message == 'undefined') {
                    $('#alert').find('p').html('500 : Erreur serveur');
                } else {
                    $('#alert').find('p').html(message);
                }

                setTimeout(function () {
                    $('#alert').fadeOut().addClass('hidden');
                }, 5000);
            });
        };


        require('bootstrap');
        require('jquery-slimscroll');

        require('switchery');


        var dt = require('datatables.net')(window, $);
        require('datatables.net-buttons')(window, $);
        require('pdfmake');
        require('jszip')(window, $);
        require('datatables.net-buttons/js/buttons.colVis.js')(window, $);
        require('datatables.net-buttons/js/buttons.flash.js')(window, $);
        require('datatables.net-buttons/js/buttons.html5.js')(window, $);
        require('datatables.net-buttons/js/buttons.print.js')(window, $);
        (function ($, DataTable) {
            // Datatable global configuration
            $.extend(true, DataTable.defaults, {
                pageLength: 50,
                'dom': '<"top"f>rt<"bottom"lip>',
                lengthMenu: [10, 25, 50, 75, 100, 200, 1000],
                language: {
                    'sProcessing': 'Traitement en cours...',
                    'sSearch': 'Rechercher&nbsp;:',
                    'sLengthMenu': 'Afficher _MENU_ &eacute;l&eacute;ments',
                    'sInfo': 'Affichage de l\'&eacute;l&eacute;ment _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments',
                    'sInfoEmpty': 'Affichage de l\'&eacute;l&eacute;ment 0 &agrave; 0 sur 0 &eacute;l&eacute;ment',
                    'sInfoFiltered': '(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)',
                    'sInfoPostFix': '',
                    'sLoadingRecords': 'Chargement en cours...',
                    'sZeroRecords': 'Aucun &eacute;l&eacute;ment &agrave; afficher',
                    'sEmptyTable': 'Aucune donn&eacute;e disponible dans le tableau',
                    'oPaginate': {
                        'sFirst': 'Premier',
                        'sPrevious': 'Pr&eacute;c&eacute;dent',
                        'sNext': 'Suivant',
                        'sLast': 'Dernier'
                    },
                    'oAria': {
                        'sSortAscending': ': activer pour trier la colonne par ordre croissant',
                        'sSortDescending': ': activer pour trier la colonne par ordre d&eacute;croissant'
                    }
                }
            });
        })(jQuery, jQuery.fn.dataTable);

        require('raphael');

        window.alert = alert = window.sweetAlert;

        var requires = ['ui.router', 'ui.sortable', 'ngSanitize', 'ngCookies', 'rzModule', 'ngStorage', 'ngDragDrop', 'ui.select', 'angularjs-dropdown-multiselect', 'angularMoment', 'ui.bootstrap', 'angucomplete-alt', 'templates', 'app.filters', 'app.controllers', 'app.services', 'app.directives', 'pascalprecht.translate'];

        window.app = _angular2.default.module('app', requires);

        _angular2.default.module('app').constant('AppSettings', _constants2.default);

        _angular2.default.module('app').config(_on_config2.default);

        _angular2.default.module('app').run(_on_run2.default);

        _angular2.default.bootstrap(document, ['app'], {
            strictDi: true
        });

    }, {
        "./constants": "../app/js/constants.js",
        "./controllers": "../app/js/controllers/index.js",
        "./directives": "../app/js/directives/index.js",
        "./filters": "../app/js/filters/index.js",
        "./on_config": "../app/js/on_config.js",
        "./on_run": "../app/js/on_run.js",
        "./scripts.js": "../app/js/scripts.js",
        "./services": "../app/js/services/index.js",
        "./templates": "../app/js/templates.js",
        "angucomplete-alt": "../node_modules/angucomplete-alt/angucomplete-alt.js",
        "angular": "../node_modules/angular/index.js",
        "angular-cookies": "../node_modules/angular-cookies/index.js",
        "angular-dragdrop": "../node_modules/angular-dragdrop/src/angular-dragdrop.js",
        "angular-moment": "../node_modules/angular-moment/angular-moment.js",
        "angular-sanitize": "../node_modules/angular-sanitize/index.js",
        "angular-translate": "../node_modules/angular-translate/dist/angular-translate.js",
        "angular-translate-loader-static-files": "../node_modules/angular-translate-loader-static-files/angular-translate-loader-static-files.js",
        "angular-translate-storage-cookie": "../node_modules/angular-translate-storage-cookie/angular-translate-storage-cookie.js",
        "angular-translate-storage-local": "../node_modules/angular-translate-storage-local/angular-translate-storage-local.js",
        "angular-ui-bootstrap": "../node_modules/angular-ui-bootstrap/index.js",
        "angular-ui-router": "../node_modules/angular-ui-router/release/angular-ui-router.js",
        "angular-ui-sortable": "../node_modules/angular-ui-sortable/src/sortable.js",
        "angularjs-dropdown-multiselect": "../node_modules/angularjs-dropdown-multiselect/dist/angularjs-dropdown-multiselect.min.js",
        "angularjs-slider": "../node_modules/angularjs-slider/dist/rzslider.js",
        "bootstrap": "../node_modules/bootstrap/dist/js/npm.js",
        "bootstrap-select": "../node_modules/bootstrap-select/dist/js/bootstrap-select.js",
        "bootstrap-tagsinput": "../node_modules/bootstrap-tagsinput/dist/bootstrap-tagsinput.js",
        "datatables.net": "../node_modules/datatables.net/js/jquery.dataTables.js",
        "datatables.net-buttons": "../node_modules/datatables.net-buttons/js/dataTables.buttons.js",
        "datatables.net-buttons/js/buttons.colVis.js": "../node_modules/datatables.net-buttons/js/buttons.colVis.js",
        "datatables.net-buttons/js/buttons.flash.js": "../node_modules/datatables.net-buttons/js/buttons.flash.js",
        "datatables.net-buttons/js/buttons.html5.js": "../node_modules/datatables.net-buttons/js/buttons.html5.js",
        "datatables.net-buttons/js/buttons.print.js": "../node_modules/datatables.net-buttons/js/buttons.print.js",
        "jquery-slimscroll": "../node_modules/jquery-slimscroll/jquery.slimscroll.js",
        "jszip": "../node_modules/jszip/lib/index.js",
        "moment/locale/fr.js": "../node_modules/moment/locale/fr.js",
        "ngstorage": "../node_modules/ngstorage/ngStorage.js",
        "pdfmake": "../node_modules/pdfmake/src/printer.js",
        "raphael": "../node_modules/raphael/raphael.min.js",
        "summernote": "../node_modules/summernote/dist/summernote.js",
        "switchery": "../node_modules/switchery/switchery.js",
        "ui-select": "../node_modules/ui-select/index.js",
        "vendors/detect.js": "../node_modules/vendors/detect.js",
        "vendors/jquery.app.js": "../node_modules/vendors/jquery.app.js",
        "vendors/jquery.blockUI.js": "../node_modules/vendors/jquery.blockUI.js",
        "vendors/jquery.core.js": "../node_modules/vendors/jquery.core.js",
        "vendors/jquery.scrollTo.min.js": "../node_modules/vendors/jquery.scrollTo.min.js",
        "vendors/jquery.slimscroll.js": "../node_modules/vendors/jquery.slimscroll.js",
        "vendors/plugins/counterup/jquery.counterup.min.js": "../node_modules/vendors/plugins/counterup/jquery.counterup.min.js",
        "vendors/plugins/morris/morris.min.js": "../node_modules/vendors/plugins/morris/morris.min.js",
        "vendors/plugins/multiselect/js/jquery.multi-select.js": "../node_modules/vendors/plugins/multiselect/js/jquery.multi-select.js",
        "vendors/plugins/select2/js/select2.min.js": "../node_modules/vendors/plugins/select2/js/select2.min.js",
        "vendors/plugins/waypoints/jquery.waypoints.min.js": "../node_modules/vendors/plugins/waypoints/jquery.waypoints.min.js"
    }],
    "../app/js/on_config.js": [function (require, module, exports) {
        'use strict';

        OnConfig.$inject = ["$stateProvider", "$locationProvider", "$urlRouterProvider", "$compileProvider", "$httpProvider", "$provide"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function OnConfig($stateProvider, $locationProvider, $urlRouterProvider, $compileProvider, $httpProvider, $provide) {
            'ngInject';

            if ("development" === 'production') {
                $compileProvider.debugInfoEnabled(false);
            }

            $locationProvider.html5Mode(true).hashPrefix('!');
            $httpProvider.defaults.useXDomain = true;
            $httpProvider.defaults.withCredentials = true;

            $stateProvider.state('app', {
                abstract: true,
                templateUrl: 'layouts/default.html',
                controller: 'globalController as app'
            }).state('app.index', {
                url: '/',
                title: 'Accueil',
                templateUrl: 'modules/dashboard/index.html'
                // controller: 'homeController as vm'
            }).state('app.users', {
                abstract: true,
                url: '/users',
                template: '<div ui-view></div>',
                controller: 'usersController as vm'
            }).state('app.users.index', {
                url: '/',
                title: 'Utilisateurs',
                templateUrl: 'modules/utilisateurs/index.html'
                // controller: 'homeController as vm'
            }).state('app.clients', {
                abstract: true,
                url: '/clients',
                template: '<div ui-view></div>',
                controller: 'clientsController as vm'
            }).state('app.clients.index', {
                url: '/',
                title: 'Clients',
                templateUrl: 'modules/clients/index.html'
            }).state('app.categories', {
                abstract: true,
                url: '/categories',
                template: '<div ui-view></div>',
                controller: 'categoriesController as vm'
            }).state('app.categories.index', {
                url: '/',
                title: 'Catégories',
                templateUrl: 'modules/categories/index.html'
            }).state('app.marques', {
                abstract: true,
                url: '/marques',
                template: '<div ui-view></div>',
                controller: 'marquesController as vm'
            }).state('app.marques.index', {
                url: '/',
                title: 'Marques',
                templateUrl: 'modules/marques/index.html'
            }).state('app.gammes', {
                abstract: true,
                url: '/gammes',
                template: '<div ui-view></div>',
                controller: 'gammesController as vm'
            }).state('app.gammes.index', {
                url: '/',
                title: 'Gammes',
                templateUrl: 'modules/gammes/index.html'
            }).state('app.sports', {
                abstract: true,
                url: '/sports',
                template: '<div ui-view></div>',
                controller: 'sportsController as vm'
            }).state('app.sports.index', {
                url: '/',
                title: 'sports',
                templateUrl: 'modules/sport/index.html'
            }).state('app.zonages', {
                abstract: true,
                url: '/zonages',
                template: '<div ui-view></div>',
                controller: 'zonagesController as vm'
            }).state('app.zonages.index', {
                url: '/',
                title: 'Zonages',
                templateUrl: 'modules/zonages/index.html'
            }).state('app.genres', {
                abstract: true,
                url: '/genres',
                template: '<div ui-view></div>',
                controller: 'genresController as vm'
            }).state('app.genres.index', {
                url: '/',
                title: 'Genres',
                templateUrl: 'modules/genres/index.html'
            }).state('app.devises', {
                abstract: true,
                url: '/devises',
                template: '<div ui-view></div>',
                controller: 'devisesController as vm'
            }).state('app.devises.index', {
                url: '/',
                title: 'Devise',
                templateUrl: 'modules/devises/index.html'
            }).state('app.countries', {
                abstract: true,
                url: '/Pays',
                template: '<div ui-view></div>',
                controller: 'paysController as vm'
            }).state('app.countries.index', {
                url: '/',
                title: 'Pays',
                templateUrl: 'modules/pays/index.html'
            }).state('app.traitements', {
                abstract: true,
                url: '/produits',
                template: '<div ui-view></div>'
            }).state('app.traitements.mouvements', {
                abstract: true,
                url: '/mouvements',
                template: '<div ui-view></div>',
                controller: 'mouvementsController as vm'
            }).state('app.traitements.mouvements.index', {
                url: '/',
                title: 'Mouvement',
                templateUrl: 'modules/mouvements/index.html'
            }).state('app.traitements.mouvements.add', {
                url: '/ajouter',
                title: 'Ajouter mouvement',
                templateUrl: 'modules/mouvements/add.html'
            }).state('app.traitements.mouvements.details', {
                url: '/details/{id}',
                title: 'Détails mouvement',
                templateUrl: 'modules/mouvements/details.html'
            }).state('app.traitements.mouvements.importer', {
                url: '/importer',
                title: 'Importer mouvements',
                templateUrl: 'modules/mouvements/importer.html'
            }).state('app.traitements.mouvements.importer_images', {
                url: '/importer_images',
                title: 'Importer images',
                templateUrl: 'modules/mouvements/importer_images.html'
            }).state('app.produits', {
                abstract: true,
                url: '/produits',
                template: '<div ui-view></div>',
                controller: 'produitsController as vm'
            }).state('app.produits.index', {
                url: '/',
                title: 'Produits',
                templateUrl: 'modules/produits/index.html'
            }).state('app.produits.add', {
                url: '/ajouter',
                title: 'ajouter Produits',
                templateUrl: 'modules/produits/add.html'
            }).state('app.produits.details', {
                url: '/details/{id}/:tab?',
                title: 'details Produits',
                templateUrl: 'modules/produits/details.html'
            }).state('app.devis', {
                abstract: true,
                url: '/devis',
                template: '<div ui-view></div>',
                controller: 'devisController as vm'
            }).state('app.devis.index', {
                url: '/',
                title: 'devis',
                templateUrl: 'modules/devis/index.html'
            }).state('app.devis.add', {
                url: '/ajouter',
                title: 'ajouter devis',
                templateUrl: 'modules/devis/add.html'
            }).state('app.devis.details', {
                url: '/details/{id}',
                title: 'details devis',
                templateUrl: 'modules/devis/details.html'
            }).state('app.commande', {
                abstract: true,
                url: '/commande',
                template: '<div ui-view></div>',
                controller: 'commandeController as vm'
            }).state('app.commande.index', {
                url: '/',
                title: 'commande',
                templateUrl: 'modules/commandes/index.html'
            }).state('app.commande.add', {
                url: '/ajouter',
                title: 'ajouter commande',
                templateUrl: 'modules/commandes/add.html'
            }).state('app.commande.details', {
                url: '/details/{id}',
                title: 'details commande',
                templateUrl: 'modules/commandes/details.html'
            }).state('app.facture', {
                abstract: true,
                url: '/facture',
                template: '<div ui-view></div>',
                controller: 'factureController as vm'
            }).state('app.facture.index', {
                url: '/',
                title: 'facture',
                templateUrl: 'modules/factures/index.html'
            }).state('app.facture.add', {
                url: '/ajouter',
                title: 'ajouter facture',
                templateUrl: 'modules/factures/add.html'
            }).state('app.facture.details', {
                url: '/details/{id}',
                title: 'details facture',
                templateUrl: 'modules/factures/details.html'
            }).state('app.profile', {
                url: '/profile',
                title: 'Mon profile',
                templateUrl: 'modules/profile/index.html',
                controller: 'profileController as vm'
            }).state('access', {
                abstract: true,
                template: '<div ui-view></div>',
                controller: 'authController as vm'
            }).state('access.login', {
                url: '/login',
                title: 'Se connecter',
                templateUrl: 'modules/access/login.html'
            });

            $urlRouterProvider.otherwise('/');

            $provide.decorator('$locale', ['$delegate', function ($delegate) {
                $delegate.NUMBER_FORMATS = {
                    'CURRENCY_SYM': '\u20AC',
                    'DECIMAL_SEP': ',',
                    'GROUP_SEP': '\xA0',
                    'PATTERNS': [{
                        'gSize': 3,
                        'lgSize': 3,
                        'maxFrac': 2,
                        'minFrac': 0,
                        'minInt': 1,
                        'negPre': '-',
                        'negSuf': '',
                        'posPre': '',
                        'posSuf': ''
                    }, {
                        'gSize': 3,
                        'lgSize': 3,
                        'maxFrac': 2,
                        'minFrac': 3,
                        'minInt': 1,
                        'negPre': '-',
                        'negSuf': '\xA0\xA4',
                        'posPre': '',
                        'posSuf': '\xA0\xA4'
                    }]

                };
                return $delegate;
            }]);
        }

        exports.default = OnConfig;

    }, {}],
    "../app/js/on_run.js": [function (require, module, exports) {
        'use strict';

        OnRun.$inject = ["$rootScope", "AppSettings", "$state", "$localStorage"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function OnRun($rootScope, AppSettings, $state, $localStorage) {
            'ngInject';

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
                if (toState.name == 'access.login') {
                    // event.preventDefault();
                    // $state.go('app.index');
                }
                if (!Object.keys($localStorage.data).length && toState.name != 'access.login') {
                    $state.go('access.login', {}, {reload: true});
                    event.preventDefault();
                }

                var ua = navigator.userAgent,
                    event = ua.match(/iP/i) ? function () {
                        console.log('iphone');
                        $('#wrapper').toggleClass('enlarged');
                        $('#wrapper').addClass('forced');
                    } : null;
            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState) {
                if ($('body').hasClass('mobile')) {
                    $('#wrapper').addClass('enlarged');
                    $('#wrapper').addClass('forced');
                }
                $('meta[name="product_id"]').remove();
                $('meta[name="reference"]').remove();

                $rootScope.pageTitle = '';

                if (toState.title) {
                    $rootScope.pageTitle += toState.title;
                    $rootScope.pageTitle += ' \u2014 ';
                }
                $rootScope.pageTitle += AppSettings.appTitle;
                $('body').attr('class', '');
                $('body').addClass('fixed-left');
                if (toState.bodyClass) {
                    $('body').addClass(toState.bodyClass);
                }
                $('body').animate({scrollTop: 0}, 'slow');

                jQuery(document).ready(function ($) {

                    // $('.select2').select2({
                    //  'language': {
                    //       'noResults': function(){
                    //           return 'Aucun résultat trouvé';
                    //       }
                    //   },
                    // });

                    var ua = navigator.userAgent,
                        event = ua.match(/iP/i) ? 'touchstart' : 'click';

                    $('.dropdown-toggle-devis').unbind(event);
                    $('.dropdown-toggle-devis').bind(event, function (event) {
                        $(this).parent().toggleClass('open');
                    });

                    var Sidemenu = function Sidemenu() {
                        this.$body = $('body'), this.$openLeftBtn = $('.open-left');
                    };
                    Sidemenu.prototype.openLeftBar = function () {
                        $('#wrapper').toggleClass('enlarged');
                        $('#wrapper').addClass('forced');

                        if ($('#wrapper').hasClass('enlarged') && $('body').hasClass('fixed-left')) {
                            $('body').removeClass('fixed-left').addClass('fixed-left-void');
                        } else if (!$('#wrapper').hasClass('enlarged') && $('body').hasClass('fixed-left-void')) {
                            $('body').removeClass('fixed-left-void').addClass('fixed-left');
                        }

                        if ($('#wrapper').hasClass('enlarged')) {
                            $('.left ul').removeAttr('style');
                        } else {
                            $('.subdrop').siblings('ul:first').show();
                        }

                        toggle_slimscroll('.slimscrollleft');
                        $('body').trigger('resize');
                    },

                        //init sidemenu
                        Sidemenu.prototype.init = function () {
                            var $this = this;

                            var ua = navigator.userAgent,
                                event = ua.match(/iP/i) ? 'touchstart' : 'click';

                            //bind on click
                            this.$openLeftBtn.unbind(event);
                            this.$openLeftBtn.bind(event, function (e) {
                                e.stopPropagation();
                                $this.openLeftBar();
                            });

                            $('#sidebar-menu > ul > li > a').unbind(event);
                            $('#sidebar-menu > ul > li > a').bind(event, function (event) {
                                $(this).parents('li').siblings('.has_sub').each(function (index, el) {
                                    $(el).find('.subdrop').removeClass('subdrop');
                                    $(el).find('.active').removeClass('active');
                                    $(el).find('ul').slideUp(350);
                                });
                            });

                            $('#sidebar-menu .has_sub > a').unbind(event);
                            $('#sidebar-menu .has_sub > a').bind(event, function (event) {
                                $(this).parent().siblings('.has_sub').each(function (index, el) {
                                    $(el).find('.subdrop').removeClass('subdrop');
                                    $(el).find('.active').removeClass('active');
                                    $(el).find('ul').slideUp(350);
                                });
                                if ($(this).hasClass('subdrop')) {
                                    $(this).next('ul').slideUp(350);
                                    $(this).removeClass('subdrop');
                                } else {
                                    $(this).addClass('active');
                                    $(this).next('ul').slideDown(350);
                                    $(this).addClass('subdrop');
                                }
                            });

                            $('#sidebar-menu a').each(function () {
                                if (window.location.href.indexOf(this.href) > -1) {
                                    $(this).parent('li').addClass('active');
                                    $(this).parent('li').siblings().removeClass('active');
                                    $(this).parents('.has_sub').find('ul').slideDown(350);
                                    $(this).parents('.has_sub').find('a').first().addClass('subdrop');
                                }
                            });
                        },

                        //init Sidemenu
                        $.Sidemenu = new Sidemenu(), $.Sidemenu.Constructor = Sidemenu;

                    var FullScreen = function FullScreen() {
                        this.$body = $('body'), this.$fullscreenBtn = $('#btn-fullscreen');
                    };

                    //turn on full screen
                    // Thanks to http://davidwalsh.name/fullscreen
                    FullScreen.prototype.launchFullscreen = function (element) {
                        if (element.requestFullscreen) {
                            element.requestFullscreen();
                        } else if (element.mozRequestFullScreen) {
                            element.mozRequestFullScreen();
                        } else if (element.webkitRequestFullscreen) {
                            element.webkitRequestFullscreen();
                        } else if (element.msRequestFullscreen) {
                            element.msRequestFullscreen();
                        }
                    }, FullScreen.prototype.exitFullscreen = function () {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                        }
                    },
                        //toggle screen
                        FullScreen.prototype.toggle_fullscreen = function () {
                            var $this = this;
                            var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
                            if (fullscreenEnabled) {
                                if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                                    $this.launchFullscreen(document.documentElement);
                                } else {
                                    $this.exitFullscreen();
                                }
                            }
                        },
                        //init sidemenu
                        FullScreen.prototype.init = function () {
                            var $this = this;
                            //bind
                            var ua = navigator.userAgent,
                                event = ua.match(/iP/i) ? 'touchstart' : 'click';
                            $this.$fullscreenBtn.unbind(event);
                            $this.$fullscreenBtn.bind(event, function () {
                                $this.toggle_fullscreen();
                            });
                        },
                        //init FullScreen
                        $.FullScreen = new FullScreen(), $.FullScreen.Constructor = FullScreen;

                    var App = function App() {
                        this.VERSION = '1.3.0', this.AUTHOR = 'Coderthemes', this.SUPPORT = 'coderthemes@gmail.com', this.pageScrollElement = 'html, body', this.$body = $('body');
                    };

                    //on doc load
                    App.prototype.onDocReady = function (e) {
                        // FastClick.attach(document.body);
                        // resizefunc.push('initscrolls');
                        // resizefunc.push('changeptype');

                        $('.animate-number').each(function () {
                            $(this).animateNumbers($(this).attr('data-value'), true, parseInt($(this).attr('data-duration')));
                        });

                        //RUN RESIZE ITEMS
                        $(window).resize(debounce(resizeitems, 100));
                        $('body').trigger('resize');

                        // right side-bar toggle
                        var ua = navigator.userAgent,
                            event = ua.match(/iP/i) ? 'touchstart' : 'click';
                        $('.right-bar-toggle').unbind(event);
                        $('.right-bar-toggle').bind(event, function (e) {
                            $('#wrapper').toggleClass('right-bar-enabled');
                        });
                    },
                        //initilizing
                        App.prototype.init = function () {
                            var $this = this;
                            //document load initialization
                            $(document).ready($this.onDocReady);
                            //init side bar - left
                            $.Sidemenu.init();
                            //init fullscreen
                            $.FullScreen.init();
                        }, $.App = new App(), $.App.Constructor = App;

                    $.App.init();

                    /* ------------ some utility functions ----------------------- */
                    //this full screen
                    var toggle_fullscreen = function toggle_fullscreen() {
                    };

                    function executeFunctionByName(functionName, context /*, args */) {
                        var args = [].slice.call(arguments).splice(2);
                        var namespaces = functionName.split('.');
                        var func = namespaces.pop();
                        for (var i = 0; i < namespaces.length; i++) {
                            context = context[namespaces[i]];
                        }
                        return context[func].apply(this, args);
                    }

                    var w, h, dw, dh;
                    var changeptype = function changeptype() {
                        w = $(window).width();
                        h = $(window).height();
                        dw = $(document).width();
                        dh = $(document).height();

                        if (window.mobileAndTabletcheck() === true) {
                            $('body').addClass('mobile').removeClass('fixed-left');
                        }

                        if (!$('#wrapper').hasClass('forced')) {
                            if (w > 1024) {
                                $('body').removeClass('smallscreen').addClass('widescreen');
                                $('#wrapper').removeClass('enlarged');
                            } else {
                                $('body').removeClass('widescreen').addClass('smallscreen');
                                $('#wrapper').addClass('enlarged');
                                $('.left ul').removeAttr('style');
                            }
                            if ($('#wrapper').hasClass('enlarged') && $('body').hasClass('fixed-left')) {
                                $('body').removeClass('fixed-left').addClass('fixed-left-void');
                            } else if (!$('#wrapper').hasClass('enlarged') && $('body').hasClass('fixed-left-void')) {
                                $('body').removeClass('fixed-left-void').addClass('fixed-left');
                            }
                        }
                        toggle_slimscroll('.slimscrollleft');
                    };

                    var debounce = function debounce(func, wait, immediate) {
                        var timeout, result;
                        return function () {
                            var context = this,
                                args = arguments;
                            var later = function later() {
                                timeout = null;
                                if (!immediate) result = func.apply(context, args);
                            };
                            var callNow = immediate && !timeout;
                            clearTimeout(timeout);
                            timeout = setTimeout(later, wait);
                            if (callNow) result = func.apply(context, args);
                            return result;
                        };
                    };

                    function resizeitems() {
                        initscrolls();
                        changeptype();
                        if ($.isArray(resizefunc)) {
                            for (i = 0; i < resizefunc.length; i++) {
                                window[resizefunc[i]]();
                            }
                        }
                    }

                    window.mobileAndTabletcheck = function () {
                        var check = false;
                        (function (a) {
                            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
                        })(navigator.userAgent || navigator.vendor || window.opera);
                        return check;
                    };

                    function initscrolls() {
                        if (window.mobileAndTabletcheck() !== true) {
                            //SLIM SCROLL
                            $('.slimscroller').slimscroll({
                                height: 'auto',
                                size: '5px'
                            });

                            $('.slimscrollleft').slimScroll({
                                height: 'auto',
                                position: 'right',
                                size: '7px',
                                color: '#bbb',
                                wheelStep: 7
                            });
                        }
                    }

                    function toggle_slimscroll(item) {
                        if ($('#wrapper').hasClass('enlarged')) {
                            $(item).css('overflow', 'inherit').parent().css('overflow', 'inherit');
                            $(item).siblings('.slimScrollBar').css('visibility', 'hidden');
                        } else {
                            $(item).css('overflow', 'hidden').parent().css('overflow', 'hidden');
                            $(item).siblings('.slimScrollBar').css('visibility', 'visible');
                        }
                    }

                    var dropdown = $('#setting-dropdown');

                    // Add slidedown animation to dropdown
                    dropdown.unbind('show.bs.dropdown');
                    dropdown.bind('show.bs.dropdown', function (e) {
                        $(this).find('.dropdown-menu').first().stop(true, true).slideDown();
                    });

                    // Add slideup animation to dropdown
                    dropdown.unbind('hide.bs.dropdown');
                    dropdown.bind('hide.bs.dropdown', function (e) {
                        $(this).find('.dropdown-menu').first().stop(true, true).slideUp();
                    });

                    // Loader

                    $('#status').fadeOut();
                    $('#preloader').delay(350).fadeOut('slow');
                    $('body').delay(350).css({
                        'overflow': 'visible'
                    });
                });
            });
        }

        exports.default = OnRun;


    }, {}],
    "../app/js/scripts.js": [function (require, module, exports) {
        'use strict';

        window.$ = window.jQuery = require('jquery');

        $(function () {

            'use strict';

            var ua = navigator.userAgent,
                event = ua.match(/iP/i) ? 'touchstart' : 'click';

            $(document).off(event, '.disabled');
            $(document).on(event, '.disabled', function (event) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            });

            // Disable demonstrative links!
            $('a[href="#"]').on('click', function (e) {
                e.preventDefault();
            });
        });

    }, {"jquery": "../node_modules/jquery/dist/jquery.js"}],
    "../app/js/services/Country.js": [function (require, module, exports) {
        'use strict';

        Countries.$inject = ["WS"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function Countries(WS) {
            'ngInject';

            var service = {};
            var countries = [];

            var getCountries = function getCountries() {
                WS.get('country').then(function (res) {
                    if (res.data.succes == 'false') {
                        console.log(res.data.msg);
                    } else {
                        countries = res.data.countries;
                        $('.loader').addClass('hidden');
                    }
                }).then(null, function (error) {
                    swal('Erreur!', error.msg, 'error');
                    $('.loader').addClass('hidden');
                    console.log(error);
                });
            };
            getCountries();

            service.get = function () {
                return countries;
            };

            return service;
        }

        exports.default = {
            name: 'Countries',
            fn: Countries
        };


    }, {}],
    "../app/js/services/WS.js": [function (require, module, exports) {
        'use strict';

        WS.$inject = ["$http", "AppSettings", "$localStorage", "$state"];
        Object.defineProperty(exports, "__esModule", {
            value: true
        });

        function WS($http, AppSettings, $localStorage, $state) {
            'ngInject';

            var service = {};
            var token = '';
            var company_id = '';
            var headers = {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json'
            };

            var updateData = function updateData() {
                $('.loader').removeClass('hidden');
                if ($localStorage.data) {
                    var data = $localStorage.data;
                    token = data.key;
                    if (data.user && data.user.company) {
                        company_id = data.user.company.id;
                    }
                    // console.log( 'TOKEN', token, 'COMPANY_ID', company_id );
                }
            };
            updateData();

            service.get = function (route, data) {
                var cache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
                var withToken = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

                updateData();
                var url = AppSettings.apiUrl + route;
                if (data) {
                    url += '?' + data;
                }
                if (company_id) {
                    if (data) {
                        url += '&';
                    } else {
                        url += '?';
                    }
                    url += 'company_id=' + company_id;
                }
                if (cache) {
                    url += '?' + Date.now();
                }
                if (withToken) {
                    token ? headers.token = token : null;
                } else {
                    delete headers.token;
                }
                return new Promise(function (resolve, reject) {
                    $http({
                        method: 'GET',
                        url: url,
                        headers: headers
                    }).then(function (res) {
                        if (res.data.succes == 'false') {
                            notif(res.data.msg);
                        }
                        resolve(res);
                    }).catch(function (err) {
                        if (err.status == 401 && err.data.err_code == 100) {
                            notif(err.data.msg);
                            $state.go('access.login');
                        }
                        reject(err);
                    });
                });
            };

            service.post = function (route, data, headerType) {
                updateData();
                var url = AppSettings.apiUrl + route;
                // url += '?' + Date.now();
                token ? headers.token = token : null;

                if (company_id) {
                    data.company_id = company_id;
                }

                if (headerType || headerType == undefined) {
                    headers['Content-Type'] = headerType;
                }
                return new Promise(function (resolve, reject) {
                    $http({
                        method: 'POST',
                        url: url,
                        headers: headers,
                        data: data
                    }).then(function (res) {
                        if (res.data.succes == 'false') {
                            notif(res.data.msg);
                        }
                        resolve(res);
                        if (route == 'login') {
                            token = res.data.key;
                        }
                    }).catch(function (err) {
                        if (err.status == 401 && err.data.err_code == 100) {
                            notif(err.data.msg);
                            $state.go('access.login');
                        }
                        reject(err);
                    });
                });
            };

            service.put = function (route, data) {
                updateData();
                var url = AppSettings.apiUrl + route;
                token ? headers.token = token : null;
                // if (data) {
                //     url += '/' + data._id;
                // }
                if (company_id) {
                    data.company_id = company_id;
                }
                return new Promise(function (resolve, reject) {
                    $http({
                        method: 'PUT',
                        url: url,
                        headers: headers,
                        data: data
                    }).then(function (res) {
                        if (res.data.succes == 'false') {
                            notif(res.data.msg);
                        }
                        resolve(res);
                    }).catch(function (err) {
                        if (err.status == 401 && err.data.err_code == 100) {
                            notif(err.data.msg);
                            $state.go('access.login');
                        }
                        reject(err);
                    });
                });
            };

            service.delete = function (route, data) {
                updateData();
                var url = AppSettings.apiUrl + route;
                token ? headers.token = token : null;
                // if (data) {
                //     url += '/' + data;
                // }
                if (company_id) {
                    if (!data) {
                        data = {};
                    }
                    data.company_id = company_id;
                }
                return new Promise(function (resolve, reject) {
                    $http({
                        method: 'DELETE',
                        url: url,
                        headers: headers,
                        data: data
                    }).then(function (res) {
                        if (res.data.succes == 'false') {
                            notif(res.data.msg);
                        }
                        resolve(res);
                    }).catch(function (err) {
                        if (err.status == 401 && err.data.err_code == 100) {
                            notif(err.data.msg);
                            $state.go('access.login');
                        }
                        reject(err);
                    });
                });
            };
            return service;
        }

        exports.default = {
            name: 'WS',
            fn: WS
        };

    }, {}],
    "../app/js/services/category.js": [function (require, module, exports) {
        "use strict";

    }, {}],
    "../app/js/services/index.js": [function (require, module, exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
            value: true
        });


        var _angular = require('angular');

        var _angular2 = _interopRequireDefault(_angular);

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {default: obj};
        }


        var servicesModule = _angular2.default.module('app.services', []);
        var services = ({
            "category": require("./category.js"),
            "Country": require("./Country.js"),
            "WS": require("./WS.js")
        });

        function declare(serviceMap) {
            Object.keys(serviceMap).forEach(function (key) {
                var item = serviceMap[key];

                if (!item) {
                    return;
                }

                if (item.fn && typeof item.fn === 'function') {
                    servicesModule.service(item.name, item.fn);
                } else {
                    declare(item);
                }
            });
        }

        declare(services);

        exports.default = servicesModule;


    }, {
        "./Country.js": "../app/js/services/Country.js",
        "./WS.js": "../app/js/services/WS.js",
        "./category.js": "../app/js/services/category.js",
        "angular": "../node_modules/angular/index.js"
    }],
    "../app/js/templates.js": [function (require, module, exports) {
        "use strict";

        angular.module("templates", []).run(["$templateCache", function ($templateCache) {
            $templateCache.put("directives/example.html", "<div class=\"example-directive\">\n  <h1>Directive title: {{title}}</h1>\n  <p>This is an example of a directive, click me!</p>\n</div>\n");
            $templateCache.put("layouts/default.html", "<div id=\"preloader\">\n  <div id=\"status\">\n    <div class=\"spinner\">\n      <div class=\"spinner-wrapper\">\n        <div class=\"rotator\">\n          <div class=\"inner-spin\"></div>\n          <div class=\"inner-spin\"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n<div id=\"wrapper\">\n  <div class=\"topbar\" data-ng-include=\" \'partials/topbar.html\' \"></div>\n  <div class=\"left side-menu\" data-ng-include=\" \'partials/navbar.html\' \"></div>\n  <div class=\"content-page\">  \n    <div class=\"content\">\n      <div class=\"container\">\n          <div ui-view></div>\n      </div>\n    </div>\n    <footer class=\"footer text-right\" data-ng-include=\" \'partials/footer.html\' \"></footer>\n  </div>\n</div>\n\n\n<div class=\"loader hidden\">\n  <svg class=\"circular\" viewBox=\"25 25 50 50\">\n    <circle class=\"path\" cx=\"50\" cy=\"50\" r=\"20\" fill=\"none\" stroke-width=\"2\" stroke-miterlimit=\"10\"/>\n  </svg>\n</div>");
            $templateCache.put("partials/footer.html", "2017 © UTILE.\n\n<div class=\"alert hidden\" id=\"alert\">\n	<i class=\"danger hidden fa fa-exclamation-triangle\"></i> \n	<i class=\"success hidden fa fa-check\"></i> \n	<p></p>\n</div>\n");
            $templateCache.put("partials/navbar.html", "<div class=\"sidebar-inner slimscrollleft\">\n  <div id=\"sidebar-menu\">\n    <div class=\"user-details\">\n      <ul class=\"menu-companies\" ng-if=\"app.showChangeCompany && app.companies.length > 1\">\n        <li ng-repeat=\"(key, value) in app.companies track by $index\"><a ng-click=\"app.showChangeCompany=false; app.changeCompany(value);\">{{ value.name }}</a></li>\n      </ul>\n      <div class=\"overlay\"></div>\n      <div class=\"text-center\">\n        <img ng-src=\"http://api.utiledev.vanam.fr/{{ app.data.user.url_picture }}\" ng-if=\"app.data.user.url_picture\" alt=\"{{app.data.user.name }}\" class=\"thumb-md img-circle\">\n        <img ng-src=\"images/user.png\" ng-if=\"app.data.user.role_id != 4 && !app.data.user.url_picture\"  alt=\"{{app.data.user.name }}\" class=\"thumb-md img-circle\">\n        <div style=\"height: 30px\" ng-if=\"app.data.user.role_id == 4\"></div>\n        <div class=\"label label-info company-name\" ng-click=\"app.showChangeCompany = !app.showChangeCompany\">\n          {{ app.data.user.company.name }}\n        </div>\n        <div class=\"label-role label label-success\">{{ app.getRole( app.data.user.role.role ) }}</div>\n      </div>\n      <div class=\"user-info\">\n        <div>\n          <a href=\"#setting-dropdown\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" aria-expanded=\"false\"> {{app.data.user.name }} <br> {{app.data.user.firstname }} <span class=\"mdi mdi-menu-down\"></span></a>\n        </div>\n      </div>\n    </div>\n    <div class=\"dropdown\" id=\"setting-dropdown\">\n      <ul class=\"dropdown-menu\">\n        <li><a ui-sref=\"app.profile\"><i class=\"mdi mdi-face-profile m-r-5\"></i> Profile</a></li>\n        <li><a ng-click=\"app.logout()\"><i class=\"mdi mdi-logout m-r-5\"></i> Logout</a></li>\n      </ul>\n    </div>\n    <ul>\n      <li class=\"menu-title\">Navigation</li>\n      <li ng-if=\"app.data.user.role_id != 4 && app.data.user.role_id != 5 \">\n        <a ui-sref=\"app.index\" ui-sref-active=\"active\" class=\"waves-effect\">\n          <i class=\"mdi mdi-view-dashboard\"></i> \n          <span> Accueil </span> \n        </a>\n      </li>\n\n      <li class=\"has_sub\" ng-if=\"app.data.user.role_id != 4 \">\n        <a href=\"javascript:void(0);\" class=\"waves-effect\"><i class=\"fa fa-users\"></i> <span> Comptes </span> <span class=\"menu-arrow\"></span></a>\n        <ul class=\"list-unstyled\">\n          <li ng-if=\"app.data.user.role_id <= 2 \">\n            <a ui-sref=\"app.users.index\" ui-sref-active=\"active\" class=\"waves-effect\"><i class=\"fa fa-user\"></i><span> Utilisateurs </span></a>\n          </li>\n          <li ng-if=\"app.data.user.role_id != 4\">\n            <a ui-sref=\"app.clients.index\" ui-sref-active=\"active\" class=\"waves-effect\"><i class=\"fa fa fa-black-tie\"></i> <span> Clients </span> </a>\n          </li>\n        </ul>\n      </li>\n      <li class=\"has_sub\" ng-if=\"app.data.user.role_id <= 3 \">\n        <a href=\"javascript:void(0);\" class=\"waves-effect\"><i class=\"fa fa-cogs\"></i> <span> Preférences </span> <span class=\"menu-arrow\"></span></a>\n        <ul class=\"list-unstyled\">\n          <li><a ui-sref=\"app.categories.index\" class=\"waves-effect\"><i class=\"fa fa-server\"></i><span> Catégories </span></a></li>\n          <li>\n            <a ui-sref=\"app.marques.index\" class=\"waves-effect\"><i class=\"fa fa-ioxhost\"></i> <span> Marques </span> </a>\n          </li>\n          <li>\n            <a ui-sref=\"app.countries.index\" class=\"waves-effect\"><i class=\"fa fa-globe\"></i> <span> Pays </span> </a>\n          </li>\n          <li>\n            <a ui-sref=\"app.gammes.index\" class=\"waves-effect\"><i class=\"fa fa-gift\"></i> <span> Gammes </span> </a>\n          </li>\n          <li>\n            <a ui-sref=\"app.genres.index\" class=\"waves-effect\"><i class=\"fa fa-qrcode\"></i> <span> Genres </span> </a>\n          </li>\n          <li>\n            <a ui-sref=\"app.sports.index\" class=\"waves-effect\"><i class=\"fa fa-soccer-ball-o\"></i> <span> Sports </span> </a>\n          </li>\n          <li>\n            <a ui-sref=\"app.zonages.index\" class=\"waves-effect\"><i class=\"fa fa-crosshairs\"></i> <span> Zonages </span> </a>\n          </li>\n          <li>\n            <a ui-sref=\"app.devises.index\" class=\"waves-effect\"><i class=\"fa fa-money\"></i> <span> Devises </span> </a>\n          </li>\n        </ul>\n      </li>\n      <li>\n        <a ui-sref=\"app.produits.index\" class=\"waves-effect\"><i class=\"fa fa-tags\"></i> <span> Produits </span> </a>\n      </li>\n\n      <li class=\"has_sub\">\n        <a href=\"javascript:void(0);\" class=\"waves-effect\"><i class=\"fa fa-th\"></i> <span> Traitements </span> <span class=\"menu-arrow\"></span></a>\n        <ul class=\"list-unstyled\">\n          <li ng-if=\"app.data.user.role_id != 4\"><a ui-sref=\"app.traitements.mouvements.index\" class=\"waves-effect\"><i class=\"fa fa-sliders\"></i><span> Mouvements </span></a></li>\n          <li ng-if=\"app.data.user.role_id != 3\">\n            <a ui-sref=\"app.devis.index\" class=\"waves-effect\"><i class=\"fa fa-file-o\"></i> <span> Devis </span> </a>\n          </li>\n          <li ui-sref-active=\"active\">\n            <a ui-sref=\"app.commande.index\" class=\"waves-effect\"><i class=\"fa fa-file\"></i> <span> Commandes </span> </a>\n          </li>\n          <li ui-sref-active=\"active\">\n            <a ui-sref=\"app.facture.index\" class=\"waves-effect\"><i class=\"fa fa-file-text\"></i> <span> Factures </span> </a>\n          </li>\n        </ul>\n      </li>\n\n    </ul>\n  </div>\n</div>\n<div class=\"bloc-responsable\" ng-show=\"app.data.user.role_id == 4 && showContact\" ng-click=\"showContact=!showContact\">\n  <div class=\"head\">\n    <img ng-src=\"images/user.png\" ng-if=\"!app.data.user.referer_contact.url_picture\" class=\"thumb-md img-circle m-t-xs\">\n    <img ng-src=\"http://api.utiledev.vanam.fr/{{app.data.user.referer_contact.url_picture}}\" ng-if=\"app.data.user.referer_contact.url_picture\" class=\"thumb-md img-circle m-t-xs\">\n  </div>\n  <div class=\"foot\">\n    <h5>{{app.data.user.referer_contact.name }} {{app.data.user.referer_contact.firstname }}</h5>\n    <h6>{{app.data.user.referer_contact.mail }}</h6>\n    <h6>{{app.data.user.referer_contact.mobile_line }}</h6>\n  </div>\n</div>\n<div class=\"row m-n bg-light bloc-responsable-societe\" ng-init=\"showContact=1\" ng-show=\"app.data.user.role_id == 4\" ng-click=\"showContact=!showContact\">\n  <div class=\"col-md-3 text-right\" ng-show=\"!showContact\">\n    <img ng-src=\"images/user.png\" ng-if=\"!app.data.user.referer_contact.url_picture\" class=\"thumb-sm img-circle m-t-xs\">\n    <img ng-src=\"http://api.utiledev.vanam.fr/{{app.data.user.referer_contact.url_picture}}\" ng-if=\"app.data.user.referer_contact.url_picture\" class=\"thumb-sm img-circle m-t-xs\">\n  </div>\n  <div class=\"text-center\" ng-class=\"{\'col-md-12\': showContact,\'col-md-9\': !showContact}\">\n    <label class=\"padder-v text-xs\">Your contact</label>\n  </div>\n</div>\n");
            $templateCache.put("partials/settings.html", "<a href=\"javascript:void(0);\" class=\"right-bar-toggle\">\n                    <i class=\"mdi mdi-close-circle-outline\"></i>\n                </a>\n    <h4 class=\"\">Settings</h4>\n    <div class=\"setting-list nicescroll\">\n      <div class=\"row m-t-20\">\n        <div class=\"col-xs-8\">\n          <h5 class=\"m-0\">Notifications</h5>\n          <p class=\"text-muted m-b-0\"><small>Do you need them?</small></p>\n        </div>\n        <div class=\"col-xs-4 text-right\">\n          <input type=\"checkbox\" checked data-plugin=\"switchery\" data-color=\"#7fc1fc\" data-size=\"small\" />\n        </div>\n      </div>\n      <div class=\"row m-t-20\">\n        <div class=\"col-xs-8\">\n          <h5 class=\"m-0\">API Access</h5>\n          <p class=\"m-b-0 text-muted\"><small>Enable/Disable access</small></p>\n        </div>\n        <div class=\"col-xs-4 text-right\">\n          <input type=\"checkbox\" checked data-plugin=\"switchery\" data-color=\"#7fc1fc\" data-size=\"small\" />\n        </div>\n      </div>\n      <div class=\"row m-t-20\">\n        <div class=\"col-xs-8\">\n          <h5 class=\"m-0\">Auto Updates</h5>\n          <p class=\"m-b-0 text-muted\"><small>Keep up to date</small></p>\n        </div>\n        <div class=\"col-xs-4 text-right\">\n          <input type=\"checkbox\" checked data-plugin=\"switchery\" data-color=\"#7fc1fc\" data-size=\"small\" />\n        </div>\n      </div>\n      <div class=\"row m-t-20\">\n        <div class=\"col-xs-8\">\n          <h5 class=\"m-0\">Online Status</h5>\n          <p class=\"m-b-0 text-muted\"><small>Show your status to all</small></p>\n        </div>\n        <div class=\"col-xs-4 text-right\">\n          <input type=\"checkbox\" checked data-plugin=\"switchery\" data-color=\"#7fc1fc\" data-size=\"small\" />\n        </div>\n      </div>\n    </div>");
            $templateCache.put("partials/topbar.html", "<!-- LOGO -->\n<div class=\"topbar-left\">\n  <a class=\"logo\">\n  <span>\n  <!-- <img src=\"images/logo.png\" alt=\"\" height=\"60\"> -->\n    <img ng-if=\"app.data.user.company.url_logo\" ng-src=\"http://api.utiledev.vanam.fr/{{ app.data.user.company.url_logo }}\"  height=\"60\" alt=\"{{ app.data.user.company.name }}\">\n    <h3 ng-if=\"!app.data.user.company.url_logo\" class=\"m-t-md\">{{ app.data.user.company.name }}</h3>\n\n  </span>\n  <i>\n  <h3>V</h3>\n  </i>\n  </a>\n</div>\n<!-- Button mobile view to collapse sidebar menu -->\n<div class=\"navbar navbar-default\" role=\"navigation\">\n  <div class=\"container\">\n    <!-- Navbar-left -->\n    <ul class=\"nav navbar-nav navbar-left\">\n      <li>\n        <button class=\"button-menu-mobile open-left waves-effect waves-light\">\n          <i class=\"mdi mdi-menu\"></i>\n        </button>\n      </li>\n    </ul>\n    <!-- Right(Notification) -->\n    <ul class=\"nav navbar-nav navbar-right\">\n      <li>\n        <a href=\"#\" class=\"right-menu-item dropdown-toggle dropdown-toggle-devis\">\n            \n            <i class=\"fa fa-file-text-o\"></i>\n            <span class=\"badge up bg-primary\">{{ app.devis.length }}</span>\n        </a>\n        <div class=\"dropdown-menu dropdown-devis dropdown-menu-right w-xl\" data-ng-include=\" \'modules/devis/box.html\' \">\n            \n        </div> \n      </li>\n       \n      <li class=\"dropdown user-box\">\n        <a href=\"\" class=\"dropdown-toggle waves-effect waves-light user-link\" data-toggle=\"dropdown\" aria-expanded=\"true\">\n            <span class=\"text-white\">{{app.data.user.email }}</span>\n          \n          <span class=\"avatar-sm-box bg-info m-t\" style=\"margin-top: 7px;\" ng-if=\"app.data.user.role_id == 4\" >P</span>\n\n          <img ng-src=\"http://api.utiledev.vanam.fr/{{ app.data.user.url_picture }}\" ng-if=\"app.data.user.role_id != 4 && app.data.user.url_picture\" alt=\"{{app.data.user.name }}\" class=\"img-circle user-img\">\n          <img ng-src=\"images/user.png\" ng-if=\"app.data.user.role_id != 4 && !app.data.user.url_picture\" alt=\"{{app.data.user.name }}\" class=\"img-circle user-img\">\n\n        </a>\n        <ul class=\"dropdown-menu dropdown-menu-right arrow-dropdown-menu arrow-menu-right user-list notify-list\">\n          <li>\n            <h5>{{app.data.user.firstname }} {{app.data.user.name }}</h5>\n          </li>\n          <li><a ui-sref=\"app.profile\"><i class=\"ti-user m-r-5\"></i> Profile</a></li>\n          <li><a ng-click=\"app.logout()\"><i class=\"ti-power-off m-r-5\"></i> Logout</a></li>\n        </ul> \n      </li>\n    </ul>\n    <!-- end navbar-right -->\n  </div>\n  <!-- end container -->\n</div>\n<!-- end navbar -->\n");
            $templateCache.put("modules/access/login.html", "<div class=\"container-alt\">\n  <div class=\"row\">\n    <div class=\"col-sm-12\">\n      <div class=\"wrapper-page\">\n        <div class=\"m-t-40 account-pages\">\n          <div class=\"text-center account-logo-box\">\n            <h2 class=\"text-uppercase\">\n              <div class=\"text-success\">\n                <h2>Connexion</h2>\n              </div>\n            </h2>\n          </div>\n          <div class=\"account-content\" ng-init=\"lostPassword=0\">\n            <form class=\"form-horizontal\" ng-submit=\"vm.login()\" ng-if=\"!lostPassword\">\n              <div class=\"form-group \">\n                  <input class=\"form-control\" type=\"email\" ng-model=\"vm.user.mail\" required=\"\" placeholder=\"Adresse mail\">\n              </div>\n              <div class=\"form-group\">\n                  <input class=\"form-control\" type=\"password\" ng-model=\"vm.user.passwd\" required=\"\" placeholder=\"Mot de passe\">\n              </div>\n \n              <div class=\"form-group text-center m-t-20\">\n                  <button class=\"btn w-md btn-bordered btn-danger waves-effect waves-light\" type=\"submit\">Se connecter</button>\n              </div>\n\n              <div ng-if=\"vm.error\" class=\"alert alert-danger text-center\">{{ vm.error }} </div>\n            </form>\n\n            <form class=\"form-horizontal\" ng-submit=\"vm.linkResetPassword()\"  ng-if=\"lostPassword\">\n              <div class=\"form-group \">\n                  <input class=\"form-control\" type=\"email\" ng-model=\"vm.reset_mail\" required=\"\" placeholder=\"Adresse mail\">\n              </div>\n              <div class=\"form-group text-center m-t-20\">\n                  <button class=\"btn w-md btn-bordered btn-danger waves-effect waves-light\" type=\"submit\">Envoyer</button>\n              </div>\n            </form>\n\n            <div class=\"clearfix\"></div>\n          </div>\n        </div>\n        <div class=\"form-group text-center m-t-30\">\n          <div class=\"col-sm-12\">\n            <a ng-click=\"lostPassword = !lostPassword\" ng-hide=\"lostPassword\" class=\"text-muted\"><i class=\"fa fa-lock m-r-5\"></i> Mot de passe oublié?</a>\n            <a ng-click=\"lostPassword = !lostPassword\" ng-show=\"lostPassword\" class=\"text-muted\"><i class=\"fa fa-lock m-r-5\"></i> Se connecter</a>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
            $templateCache.put("modules/categories/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Categories</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"card-box w-xxl no-padder\">\n  <form class=\"row wrapper-sm\" ng-submit=\"vm.addCategory();\">\n    <div class=\"col-md-9\">\n      <div class=\"form-group m-n\">\n        <input type=\"text\" class=\"form-control\" ng-model=\"vm.category.name\" placeholder=\"Categorie\" required=\"\">\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <button type=\"submit\" class=\"btn btn-success\">Ajouter</button>\n    </div>\n  </form>\n</div>\n    <div class=\"card-box table-responsive\">\n      <table id=\"categories\" class=\"table table-striped\" ng-init=\"vm.getCategories()\">\n        <thead>\n          <tr>\n             <th>Nom</th>\n             <th width=\"60\">Actions</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.categories\">\n            <td>\n              <span ng-hide=\"edit\">{{ value.name }}</span>\n              <input ng-show=\"edit\" type=\"text\" ng-model=\"value.name\" ng-keydown=\"$event.keyCode === 13 && vm.updateCategory(value)\" class=\"form-control\">\n            </td>\n            <td>\n              <div class=\"btn btn-xs btn-info\" ng-hide=\"edit\" ng-click=\"edit=true\"><i class=\"fa fa-pencil\"></i></div>\n              <div class=\"btn btn-xs btn-success\" ng-click=\"vm.updateCategory(value); edit=false;\" ng-show=\"edit\" ng-click=\"edit=false\"><i class=\"fa fa-check\"></i></div>\n              <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteCategory(value.id)\"><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr> \n        </tbody>\n      </table>\n    </div>\n");
            $templateCache.put("modules/clients/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Clients</h4>\n      <div class=\"pull-right\">\n        <button class=\"btn btn-primary btn-sm waves-effect waves-light\" data-toggle=\"modal\" ng-click=\"vm.editing=0; vm.addresses= {}; vm.update_client = 0; vm.info = {referer_contact_id: \'1\'}\" data-target=\"#addUser\">Ajouter client</button>\n      </div>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"modal fade\" id=\"addUser\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">{{ vm.editing ? \'Modifier\':\'Ajouter\' }} client</h3>\n        </div>\n        <div class=\"panel-body\">\n          <ul class=\"nav nav-tabs\">\n            <li class=\"active\">\n              <a href=\"#informations\" data-toggle=\"tab\" aria-expanded=\"true\">\n                <span class=\"visible-xs\"><i class=\"fa fa-home\"></i></span>\n                <span class=\"hidden-xs\">Information</span>\n              </a>\n            </li>\n            <li>\n              <a href=\"#adresse\" data-toggle=\"tab\" aria-expanded=\"false\">\n                <span class=\"visible-xs\"><i class=\"fa fa-envelope\"></i></span>\n                <span class=\"hidden-xs\">Adresses</span>\n              </a>\n            </li>\n            <li>\n              <a href=\"#live\" data-toggle=\"tab\" aria-expanded=\"false\">\n                <span class=\"visible-xs\"><i class=\"fa fa-lock\"></i></span>\n                <span class=\"hidden-xs\">Live</span>\n              </a>\n            </li>\n            <li>\n              <a href=\"#stats\" data-toggle=\"tab\" aria-expanded=\"false\">\n                <span class=\"visible-xs\"><i class=\"mdi mdi-view-dashboard\"></i></span>\n                <span class=\"hidden-xs\">Stats</span>\n              </a>\n            </li>\n          </ul>\n          <div class=\"tab-content\">\n            <form  class=\"tab-pane active\" id=\"informations\" ng-submit=\"vm.editing?vm.updateInfos():vm.saveInfos()\">\n              <div class=\"row\">\n                <div class=\"col-md-4\">\n                  <h5>Société</h5>\n                  <div class=\"form-group\">\n                    <input type=\"text\" required=\"\" class=\"form-control\" ng-model=\"vm.info.company_name\" placeholder=\" \">\n                    <label>Société*</label>\n                  </div>\n                  <div class=\"form-group\">\n                    <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.info.siret\">\n                    <label>Siret</label>\n                  </div>\n                  <div class=\"form-group\">\n                    <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.info.tva_intra\">\n                    <label>TVA intra</label>\n                  </div>\n                  <div class=\"portlet no-box\">\n                    <div class=\"portlet-heading portlet-default no-padder\">\n                      <h3 class=\"portlet-title text-dark\" data-toggle=\"collapse\" data-parent=\"#accordion1\">\n                      <a data-toggle=\"collapse\" data-parent=\"#accordion1\" href=\"#bg-default\" class=\"collapsed\"  aria-expanded=\"false\"> Plus d’informations </a>\n                      </h3>\n                      <div class=\"portlet-widgets\">\n                        <a data-toggle=\"collapse\" data-parent=\"#accordion1\" href=\"#bg-default\" class=\"collapsed\" aria-expanded=\"false\"><i class=\"ion-minus-round\"></i></a>\n                      </div>\n                      <div class=\"clearfix\"></div>\n                    </div>\n                    \n                    <div id=\"bg-default\" class=\"panel-collapse collapse\" aria-expanded=\"false\">\n                      <div class=\"form-group\">\n                        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.info.ape_code\">\n                        <label>Code APE</label>\n                      </div>\n                      <div class=\"form-group\">\n                        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.info.capital\">\n                        <label>Capital</label>\n                      </div>\n                      <div class=\"form-group\">\n                        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.info.site_url\">\n                        <label>Site</label>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n                <div class=\"col-md-8\">\n                  <h5>Contact</h5>\n                  <div class=\"row b-light b-l\">\n                    <div class=\"col-md-6\">\n                      <div class=\"form-group\">\n                        <input required=\"\" type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.info.contact_name\">\n                        <label>Nom*</label>\n                      </div>\n                      <div class=\"form-group\">\n                        <input type=\"text\" required=\"\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.info.contact_firstname\">\n                        <label>Prénom*</label>\n                      </div>\n                      <div class=\"form-group\">\n                        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.info.contact_tel_line\">\n                        <label>Téléphone</label>\n                      </div>\n                    </div>\n                    <div class=\"col-md-6\">\n                      <div class=\"form-group\">\n                        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.info.contact_mobile_line\">\n                        <label>Portable</label>\n                      </div>\n                      <div class=\"form-group\">\n                        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.info.contact_fax\">\n                        <label>Fax</label>\n                      </div>\n                      <div class=\"form-group\">\n                        <input type=\"email\" required=\"\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.info.contact_email\">\n                        <label>Email*</label>\n                      </div>\n                    </div>\n                  </div>\n                  <h5>Contact du compte</h5>\n                  <div class=\"form-group w-lg\" ng-init=\"vm.getManagers();\">\n                    <select class=\"form-control\" ng-model=\"vm.info.referer_contact_id\">\n                      <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.managers track by $index\">{{value.name}} {{value.firstname}}</option>\n                    </select>\n                  </div>\n                </div>\n              </div>\n              <div class=\"text-right\">\n                <button type=\"submit\" class=\"btn btn-primary waves-effect waves-light\">Enregistrer</button>\n              </div>\n            </form>\n            <div class=\"tab-pane\" id=\"adresse\">\n              <div class=\"panel-group panel-group-joined\" id=\"accordion-adresse\" ng-init=\"vm.getAddresses()\">\n                <div class=\"panel panel-primary\">\n                  <div class=\"panel-heading\">\n                    <h4 class=\"panel-title\">\n                    <a data-toggle=\"collapse\" data-parent=\"#accordion-adresse\" href=\"#collapseOne\">\n                      Ajouter une nouvelle adresse\n                    </a>\n                    </h4>\n                  </div>\n                  <div id=\"collapseOne\" class=\"panel-collapse collapse\"  ng-class=\"{\'in\': vm.addresses.length == 0}\">\n                    <div class=\"panel-body\">\n                      <form ng-submit=\"vm.addAddress()\">\n                        <div class=\"form-group\">\n                          <input type=\"text\" required=\"\" class=\"form-control w-xxl\" ng-model=\"vm.address.name\" placeholder=\" \">\n                          <label>Nom de l\'adresse</label>\n                        </div>\n                        <div class=\"form-group\">\n                          <input type=\"text\" required=\"\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.address.address\">\n                          <label>Adresse</label>\n                        </div>\n                        <div class=\"row\">\n                          <div class=\"col-md-4\">\n                            <div class=\"form-group\">\n                              <input type=\"text\" class=\"form-control\" required=\"\" placeholder=\" \" ng-model=\"vm.address.postal_code\">\n                              <label>Code postal</label>\n                            </div>\n                          </div>\n                          <div class=\"col-md-4\">\n                            <div class=\"form-group\">\n                              <input type=\"text\" class=\"form-control\" required=\"\" placeholder=\" \" ng-model=\"vm.address.city\">\n                              <label>Ville</label>\n                            </div>\n                          </div>\n                          <div class=\"col-md-4\">\n                            <div class=\"form-group\">\n                              <select class=\"form-control\" required=\"\"  ng-model=\"vm.address.country\">\n                                <option value=\"\" class=\"hidden\">Pays</option>\n                                <option value=\"{{ value.id }}\"   ng-repeat=\"(key, value) in vm.countries | orderBy:\'name\' track by $index\">{{ value.name }}</option>\n                              </select>\n                            </div>\n                          </div>\n                        </div>\n                        <div class=\"form-group\">\n                          <textarea class=\"form-control\" placeholder=\"Commentaire\" rows=\"3\" ng-model=\"vm.address.comment\"></textarea>\n                        </div>\n                        <div class=\"form-group\">\n                          <div class=\"row\">\n                            <div class=\"col-md-4\">\n                              <label>Adresse principale de livraison</label>\n                            </div>\n                            <div class=\"col-md-2\">\n                              <input type=\"checkbox\" id=\"switch1\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.address.is_delivery_address\" switch=\"bool\" />\n                              <label for=\"switch1\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n                            </div>\n                          </div>\n                        </div>\n                        <div class=\"form-group\">\n                          <div class=\"row\">\n                            <div class=\"col-md-4\">\n                              <label>Adresse principale de facturation</label>\n                            </div>\n                            <div class=\"col-md-2\">\n                              <input type=\"checkbox\" id=\"switch2\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.address.is_billing_address\" switch=\"bool\" />\n                              <label for=\"switch2\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n                            </div>\n                          </div>\n                        </div>\n                        <div class=\"text-right\">\n                          <button type=\"reset\" class=\"btn btn-default waves-effect\">Annuler</button>\n                          <button type=\"submit\" class=\"btn btn-primary waves-effect waves-light\">Enregistrer</button>\n                        </div>\n                      </form>\n                    </div>\n                  </div>\n                </div>\n                <div class=\"panel panel-primary\" ng-repeat=\"(key, value) in vm.addresses track by $index\">\n                  <div class=\"panel-heading\">\n                    <h4 class=\"panel-title\">\n                    <a data-toggle=\"collapse\" data-parent=\"#accordion-adresse\" href=\"#collapse{{ $index }}\"  class=\"collapsed\">\n                      {{ value.name || value.address }}\n                    </a>\n                    </h4>\n                  </div>\n                  <form id=\"collapse{{ $index }}\" class=\"panel-collapse collapse\" ng-class=\"{\'in\': $index == 0}\" ng-submit=\"vm.updateAddress(value)\">\n                    <div class=\"panel-body\">\n                      <div class=\"form-group\">\n                        <input type=\"text\" required=\"\" ng-model=\"value.name\" class=\"form-control w-xxl\" placeholder=\" \">\n                        <label>Nom de l\'adresse</label>\n                      </div>\n                      <div class=\"form-group\">\n                        <input type=\"text\" required=\"\" ng-model=\"value.address\" class=\"form-control\" placeholder=\" \">\n                        <label>Adresse</label>\n                      </div>\n                      <div class=\"row\">\n                        <div class=\"col-md-4\">\n                          <div class=\"form-group\">\n                            <input type=\"text\" class=\"form-control\" required=\"\" ng-model=\"value.postal_code\" placeholder=\" \">\n                            <label>Code postal</label>\n                          </div>\n                        </div>\n                        <div class=\"col-md-4\">\n                          <div class=\"form-group\">\n                            <input type=\"text\" class=\"form-control\" required=\"\" ng-model=\"value.city\" placeholder=\" \">\n                            <label>Ville</label>\n                          </div>\n                        </div>\n                        <div class=\"col-md-4\">\n                          <div class=\"form-group\">\n                            <select class=\"form-control\" required=\"\"  ng-model=\"value.country\">\n                              <option value=\"\" class=\"hidden\">Pays</option>\n                              <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.countries  track by $index\">{{ value.name }}</option>\n                            </select>\n                          </div>\n                        </div>\n                      </div>\n                      <div class=\"form-group\">\n                        <textarea class=\"form-control\" placeholder=\"Commentaire\" ng-model=\"value.comment\" rows=\"3\"></textarea>\n                      </div>\n                      <div class=\"form-group\">\n                        <div class=\"row\">\n                          <div class=\"col-md-4\">\n                            <label>Adresse principale de livraison</label>\n                          </div>\n                          <div class=\"col-md-2\">\n                            <input type=\"checkbox\" id=\"delivery{{ $index }}\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"value.is_delivery_address\" switch=\"bool\" />\n                            <label for=\"delivery{{ $index }}\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n                          </div>\n                        </div>\n                      </div>\n                      <div class=\"form-group\">\n                        <div class=\"row\">\n                          <div class=\"col-md-4\">\n                            <label>Adresse principale de facturation</label>\n                          </div>\n                          <div class=\"col-md-2\">\n                            <input type=\"checkbox\" id=\"billing{{ $index }}\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"value.is_billing_address\" switch=\"bool\" />\n                            <label for=\"billing{{ $index }}\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n                          </div>\n                        </div>\n                      </div>\n                      <div class=\"text-right\">\n                        <div ng-click=\"vm.deleteAddress( value.id, value.client_id )\" class=\"btn btn-danger waves-effect\"> <i class=\"fa fa-trash\"></i> Supprimer l\'adresse</div>\n                        <button type=\"submit\" class=\"btn btn-primary waves-effect waves-light\">Enregistrer</button>\n                      </div>\n                    </div>\n                  </form>\n                </div>\n              </div>\n            </div>\n            <div class=\"tab-pane\" id=\"live\">\n              \n              <div class=\"row\">\n                <div class=\"col-md-3\">\n                  <label> Autorisation accès UTILE </label>\n                </div>\n                <div class=\"col-md-2\">\n                  <input type=\"checkbox\" id=\"switch3\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.info.is_authorization_access\" switch=\"bool\" />\n                  <label for=\"switch3\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n                </div>\n              </div>\n              <form  ng-submit=\"vm.info.authorization.id?vm.updateAuthorization():vm.saveAuthorization()\">\n                <div ng-show=\"vm.info.is_authorization_access == 1\" class=\"row\">\n                  <div class=\"col-md-7\">\n                    <div class=\"form-group\">\n                      <input type=\"email\" required=\"\" class=\"form-control\" placeholder=\"email\" ng-model=\"vm.info.authorization.authorization_contact_mail\">\n                    </div>\n                  </div>\n                  <div class=\"col-md-5\">\n                    <div class=\"input-group\">\n                      <div>\n                        <span class=\"input-group-btn\">\n                          <input type=\"{{ vm.passVisible ? \'text\':\'password\' }}\" id=\"password\" required=\"\" class=\"form-control\" placeholder=\"Mot de passe\" ng-model=\"vm.info.authorization.authorization_contact_passwd\">\n                          <button type=\"button\" class=\"btn waves-effect waves-light btn-primary\" ng-click=\"vm.passVisible = !vm.passVisible\"><i class=\"fa fa-eye\"></i></button>\n                        </span>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n                \n                <div ng-show=\"vm.info.is_authorization_access == 1\" class=\"row\">\n                  <div class=\"col-md-12\" ng-init=\"vm.getCategories()\">\n                    <div class=\"row m-b-xs\">\n                      <div class=\"col-md-2\">\n                        <small>Catégories</small>\n                      </div>\n                      <div class=\"col-md-6\">\n                        <div class=\"btn btn-xs btn-info\" ng-click=\"vm.triggerSelectAllCategories(1)\" > <i class=\" fa fa-hand-pointer-o\"></i> Affecter toutes les catégories</div>\n                        <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.triggerSelectAllCategories(0)\" > <i class=\" fa fa-trash\"></i> Retirer toutes les catégories</div>\n                      </div>\n                    </div>\n                    <div class=\"form-group\">\n                      <ui-select multiple ng-model=\"vm.info.authorization.categories\" theme=\"bootstrap\" on-select=\"vm.updateCategories(vm.info.authorization.categories)\"  on-remove=\"vm.updateCategories(vm.info.authorization.categories)\"  close-on-select=\"true\"  >\n                      <ui-select-match allow-clear=\"true\">{{$item.name}}</ui-select-match>\n                      <ui-select-choices repeat=\"value in vm.categories | orderBy:\'name\' | filter:$select.search\">\n                      {{value.name}}\n                      </ui-select-choices>\n                      </ui-select>\n                    </div>\n                  </div>\n                  <div class=\"col-md-12\" ng-init=\"vm.getBrands()\">\n                    <div class=\"row m-b-xs\">\n                      <div class=\"col-md-2\">\n                        <small>Marques</small>\n                      </div>\n                      <div class=\"col-md-6\">\n                        <div class=\"btn btn-xs btn-info\" ng-click=\"vm.triggerSelectAllBrands(1)\"> <i class=\" fa fa-hand-pointer-o\"></i> Affecter toutes les marques</div>\n                        <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.triggerSelectAllBrands(0)\" > <i class=\" fa fa-trash\"></i> Retirer toutes les marques</div>\n                      </div>\n                    </div>\n                    <div class=\"form-group\" >\n                      <ui-select multiple ng-model=\"vm.info.authorization.brands\" theme=\"bootstrap\" on-select=\"vm.updateBrands(vm.info.authorization.brands)\" on-remove=\"vm.updateBrands(vm.info.authorization.brands)\"  close-on-select=\"true\"  >\n                      <ui-select-match allow-clear=\"true\">{{$item.name}}</ui-select-match>\n                      <ui-select-choices repeat=\"value in vm.brands| orderBy:\'name\' | filter:$select.search\">\n                      {{value.name}}\n                      </ui-select-choices>\n                      </ui-select>\n                    </div>\n                  </div>\n                </div>\n                <div class=\"text-right\">\n                  <button type=\"submit\" class=\"btn btn-primary waves-effect waves-light\">Enregistrer</button>\n                </div>\n              </form>\n              \n            </div>\n            <div class=\"tab-pane\" id=\"stats\">\n              <div class=\"row text-center\">\n                <div class=\"col-md-3\">\n                  <div class=\"card-box widget-box-one\">\n                    <div class=\"wigdet-one-content\">\n                      <p class=\"m-0 text-uppercase font-600 font-secondary text-overflow\">Chiffre d\'affaires</p>\n                      <h2 class=\"text-danger\"><span>{{ vm.total_commands | currency }} </span></h2>\n                      <p class=\"text-muted m-0\">Commande en cours</p>\n                    </div>\n                  </div>\n                </div>\n                <div class=\"col-md-3\">\n                  <div class=\"card-box widget-box-one\">\n                    <div class=\"wigdet-one-content\">\n                      <p class=\"m-0 text-uppercase font-600 font-secondary text-overflow\">Chiffre d\'affaires</p>\n                      <h2 class=\"text-dark\"><span>{{ vm.total_invoices | currency }}</span> </h2>\n                      <p class=\"text-muted m-0\">Factures</p>\n                    </div>\n                  </div>\n                </div>\n                <div class=\"col-md-3\">\n                  <div class=\"card-box widget-box-one\">\n                    <div class=\"wigdet-one-content\">\n                      <p class=\"m-0 text-uppercase font-600 font-secondary text-overflow\">Chiffre d\'affaires</p>\n                      <h2 class=\"text-primary\"><span>{{ vm.total_quotations | currency }}</span> </h2>\n                      <p class=\"text-muted m-0\">Devis</p>\n                    </div>\n                  </div>\n                </div>\n                 \n                <div class=\"col-md-3\">\n                  <div class=\"card-box widget-box-one\">\n                    <div class=\"wigdet-one-content\">\n                      <p class=\"m-0 text-uppercase font-600 font-secondary text-overflow\">Chiffre d\'affaires</p>\n                      <h2 class=\"text-warning\"><span>{{ (vm.total_commands + vm.total_invoices) | currency }}</span> </h2>\n                      <p class=\"text-muted m-0\">Total</p>\n                    </div>\n                  </div>\n                </div>\n              </div>\n              <div class=\"panel-group panel-group-joined\" id=\"accordion-listing\">\n                <div class=\"panel panel-primary\">\n                  <div class=\"panel-heading\">\n                    <h4 class=\"panel-title\">\n                    <a data-toggle=\"collapse\" data-parent=\"#accordion-listing\" href=\"#devis\">\n                      Devis\n                    </a>\n                    </h4>\n                  </div>\n                  <div id=\"devis\" class=\"panel-collapse collapse  in\">\n                    <div class=\"panel-body\">\n                      <table class=\"table table-striped\">\n                        <thead>\n                          <tr>\n                            <th>N°</th>\n                            <th>Date</th>\n                            <th>Total</th>\n                            <th width=\"80\">Actions</th>\n                          </tr>\n                        </thead>\n                        <tbody>\n                          <tr ng-repeat=\"(key, value) in vm.stats.quotations track by $index\">\n                            <td>{{value.id}}</td>\n                            <td>{{value.creation_date}}</td>\n                            <td>{{value.total | currency}}</td>\n                            <td class=\"text-center\">\n                              <a data-dismiss=\"modal\" ui-sref=\"app.devis.details({id : value.id})\" class=\"btn btn-xs btn-info\"><i class=\"fa fa-eye\"></i></a>\n                            </td>\n                          </tr>\n                        </tbody>\n                      </table>\n                    </div>\n                  </div>\n                </div>\n                <div class=\"panel panel-primary\">\n                  <div class=\"panel-heading\">\n                    <h4 class=\"panel-title\">\n                    <a data-toggle=\"collapse\" data-parent=\"#accordion-listing\" href=\"#commandes\"  class=\"collapsed\">\n                      Commandes\n                    </a>\n                    </h4>\n                  </div>\n                  <div id=\"commandes\" class=\"panel-collapse collapse\">\n                    <div class=\"panel-body\">\n                      <table class=\"table table-striped\">\n                        <thead>\n                          <tr>\n                            <th>N°</th>\n                            <th>Date</th>\n                            <th>Total</th>\n                            <th width=\"80\">Actions</th>\n                          </tr>\n                        </thead>\n                        <tbody>\n                          <tr ng-repeat=\"(key, value) in vm.stats.commands track by $index\">\n                            <td>{{value.id}}</td>\n                            <td>{{value.creation_date}}</td>\n                            <td>{{value.total | currency}}</td>\n                            <td class=\"text-center\">\n                              <a data-dismiss=\"modal\" ui-sref=\"app.commande.details({id : value.id})\" class=\"btn btn-xs btn-info\"><i class=\"fa fa-eye\"></i></a>\n                            </td>\n                          </tr>\n                        </tbody>\n                      </table>\n                    </div>\n                  </div>\n                </div>\n                <div class=\"panel panel-primary\">\n                  <div class=\"panel-heading\">\n                    <h4 class=\"panel-title\">\n                    <a data-toggle=\"collapse\" data-parent=\"#accordion-listing\" href=\"#factures\"  class=\"collapsed\">\n                      Factures\n                    </a>\n                    </h4>\n                  </div>\n                  <div id=\"factures\" class=\"panel-collapse collapse\">\n                    <div class=\"panel-body\">\n                      <table class=\"table table-striped\">\n                        <thead>\n                          <tr>\n                            <th>N°</th>\n                            <th>Date</th>\n                            <th>Total</th>\n                            <th width=\"80\">Actions</th>\n                          </tr>\n                        </thead>\n                        <tbody>\n                          <tr ng-repeat=\"(key, value) in vm.stats.invoices track by $index\">\n                            <td>{{value.id}}</td>\n                            <td>{{value.creation_date}}</td>\n                            <td>{{value.total | currency}}</td>\n                            <td class=\"text-center\">\n                              <a data-dismiss=\"modal\" ui-sref=\"app.facture.details({id : value.id})\" class=\"btn btn-xs btn-info\"><i class=\"fa fa-eye\"></i></a>\n                            </td>\n                          </tr>\n                        </tbody>\n                      </table>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"card-box w-xxl no-padder\">\n  <form class=\"row wrapper-sm\" ng-submit=\"vm.getClients( vm.search )\">\n    <div class=\"col-md-8\">\n      <div class=\"form-group m-n\">\n        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.search\">\n        <label>Rechercher...</label>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <button type=\"submit\" class=\"btn btn-success\">Chercher</button>\n    </div>\n  </form>\n</div>\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <div class=\"dropdown pull-right\">\n        <a href=\"#\" class=\"dropdown-toggle card-drop\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n          <h3 class=\"m-0 text-muted\"><i class=\"mdi mdi-dots-vertical\"></i></h3>\n        </a>\n        <ul class=\"dropdown-menu\" role=\"menu\">\n          <li><a ng-click=\"vm.getFile(1)\">Export Excel</a></li>\n        </ul>\n      </div>\n      <table id=\"clients\" class=\"table table-striped\">\n        <thead>\n          <tr>\n            <th>Nom société </th>\n            <th>Nom contact </th>\n            <th>mail</th>\n            <th>ville</th>\n            <th>Pays</th>\n            <th>Live</th>\n            <th>Actions</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.clients track by $index\" id=\"c-{{ value.id }}\">\n            <td>{{ value.company_name }} </td>\n            <td>{{ value.contact }} </td>\n            <td>{{ value.contact_email }}</td>\n            <td>{{ value.city }}</td>\n            <td width=\"140\">{{ value.country }}</td>\n            <td>\n              <i ng-if=\"value.is_authorization_access == 0\" class=\"fa fa-circle text-danger\"><span style=\"visibility: hidden;\">non</span></i>\n              <i ng-if=\"value.is_authorization_access == 1\" class=\"fa fa-circle text-success\"><span style=\"visibility: hidden;\">oui</span></i>\n            </td>\n            <td style=\"width: 100px; text-align: center;\">\n              <div class=\"btn btn-xs btn-info\" ng-click=\"vm.info={}; vm.getClientById( value.id )\" data-toggle=\"modal\" data-target=\"#addUser\" ng-click=\"vm.edit( value )\"><i class=\"fa fa-pencil\"></i></div>\n              <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.delete(value.id)\"><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n  </div>\n</div>");
            $templateCache.put("modules/commandes/add.html", "<div class=\"row\" ng-init=\"vm.command={}; vm.command.command_details = []\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Nouvelle Commande</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"card-box no-padder\">\n  <form class=\"wrapper-sm\"  ng-init=\"vm.getClients(\'\')\">\n    <div class=\"row\">\n      <div class=\"col-md-6\">\n        <div class=\"form-group m-n\">\n          <angucomplete-alt \n                placeholder=\"Choisir un client...\"\n                pause=\"100\"\n                selected-object=\"vm.command.client\"\n                local-data=\"vm.clients\"\n                search-fields=\"company_name\"\n                title-field=\"company_name\"\n                match-class=\"highlight\"\n                minlength=\"3\"\n                text-no-results=\"Aucun client\"\n                template-url=\"custom-template.html\"\n                input-class=\"form-control w-full\"/>\n        </div>\n        <h4>{{ vm.command.client.originalObject.company_name }}  </h4>\n        <h5 ng-if=\"vm.command.originalObject.client.contact_tel_line\">Tél : {{ vm.command.originalObject.client.contact_tel_line }} </h5>\n        <h5 ng-if=\"vm.command.client.originalObject.contact_email\">{{ vm.command.client.originalObject.contact_email }} </h5>\n        <h5>{{ vm.command.client.originalObject.address }} </h5>\n        <h6>{{ vm.command.client.originalObject.city }} {{ vm.command.client.originalObject.postal_code }} </h6>\n      </div>\n      <div class=\"col-md-6\">\n        <div class=\"form-group m-n\" ng-init=\"vm.getProduits()\">\n          <input type=\"text\" readonly=\"\" placeholder=\"Chargement des produits...\" class=\"form-control w-full\" ng-if=\"!vm.produits\">\n          <angucomplete-alt \n                placeholder=\"Choisir un article...\"\n                pause=\"100\"\n                selected-object=\"vm.selectedProduct\"\n                local-data=\"vm.produits\"\n                search-fields=\"reference\"\n                title-field=\"reference\"\n                match-class=\"highlight\"\n                minlength=\"3\"\n                clear-selected=\"true\"\n                text-no-results=\"Aucun produit\"\n                template-url=\"custom-template-produit.html\"\n                input-class=\"form-control w-full\"/>\n        </div>\n        <div class=\"form-group b b-light wrapper-xs m-t-xs\">\n          <h3 class=\"text-2x\">Total\n            <div class=\"pull-right\">{{ vm.total| currency }}</div>\n          </h3>\n        </div>\n      </div>\n    </div>\n  </form>\n</div>\n\n<script type=\"text/ng-template\" id=\"custom-template-produit.html\">\n  <div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n    <input ng-model=\"searchStr\"\n      ng-disabled=\"disableInput\"\n      type=\"text\"\n      placeholder=\"{{placeholder}}\"\n      ng-focus=\"onFocusHandler()\"\n      class=\"{{inputClass}}\"\n      ng-focus=\"resetHideResults()\"\n      ng-blur=\"hideResults($event)\"\n      autocapitalize=\"off\"\n      autocorrect=\"off\"\n      autocomplete=\"off\"\n      ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n    <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n      <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n      <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n      <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n        <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n          <div class=\"row\">\n            <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n              <img class=\"img-responsive\" ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n            </div>\n            <div class=\"col-md-10\">\n              <h4 ng-bind-html=\"result.title\"></h4>\n              <p>{{result.originalObject.description}}</p>\n            </div>\n             \n          </div>\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"!matchClass\">\n          {{ result.title }}\n        </div>\n        <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n        <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n      </div>\n      \n    </div>\n  </div>\n</script>\n\n<script type=\"text/ng-template\" id=\"custom-template.html\">\n  <div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n    <input ng-model=\"searchStr\"\n      ng-disabled=\"disableInput\"\n      type=\"text\"\n      placeholder=\"{{placeholder}}\"\n      ng-focus=\"onFocusHandler()\"\n      class=\"{{inputClass}}\"\n      ng-focus=\"resetHideResults()\"\n      ng-blur=\"hideResults($event)\"\n      autocapitalize=\"off\"\n      autocorrect=\"off\"\n      autocomplete=\"off\"\n      ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n    <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n      <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n      <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n      <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n        <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n          <div class=\"row\">\n            <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n              <img class=\"img-responsive\" ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n            </div>\n            <div class=\"col-md-10\">\n              <h4 ng-bind-html=\"result.title\"></h4>\n              <p>{{result.originalObject.description}}</p>\n            </div>\n          </div>\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"!matchClass\">{{ result.title }}</div>\n        <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n        <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n      </div>\n      \n    </div>\n  </div>\n</script>\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box\">\n      <div class=\"row\">\n        <!-- <div class=\"col-md-4\">\n          <div class=\"form-group\">\n            <input type=\"text\" style=\"width: 100%\" ng-model=\"vm.command.transport_address\" placeholder=\" \">\n            <label>Addresse transport</label>\n          </div>\n        </div> -->\n        <div class=\"col-md-2\">\n          <div class=\"form-group\">\n            <input type=\"text\" style=\"width: 100%\" ng-model=\"vm.command.transport_amount\" placeholder=\" \">\n            <label>Frais transport</label>\n          </div>\n        </div>\n        <div class=\"col-md-2 text-center\">\n          Exonération TVA \n          <div>\n            <input type=\"checkbox\" id=\"switch_tva\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.command.tva_exoneration\" switch=\"bool\">\n            <label for=\"switch_tva\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n          </div>\n        </div>\n        <div class=\"col-md-2 text-center\">\n          Facture PDF  \n          <div>\n            <input type=\"checkbox\" id=\"switch_pdf\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.command.is_invoice_pdf\" switch=\"bool\">\n            <label for=\"switch_pdf\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n          </div>\n        </div>\n        <div class=\"col-md-2 text-center\">\n          Facture EXCEL \n          <div>\n            <input type=\"checkbox\" id=\"switch_excel\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.command.is_invoice_excel\" switch=\"bool\">\n            <label for=\"switch_excel\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <h3>Liste des produits</h3>\n      <table id=\"mouvement_entree\" class=\"table table-striped\">\n        <thead>\n          <tr>\n            <th width=\"120\">Référence </th>\n            <th>Désignation </th>\n            <th width=\"100\">Categorie</th>\n            <th width=\"100\">Marque</th>\n            <th width=\"130\">Qte</th>\n            <th width=\"100\">Prix Unit HT</th>\n            <th width=\"80\">Prix total</th>\n            <th width=\"50\">Action</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.command.command_details track by $index\" title=\"rate price : {{value.sale_rate_public}}  vanam price : {{value.sale_vanam_price}}\">\n            <td>{{value.reference}}</td>\n            <td>{{value.description}}</td>\n            <td>{{value.category}}</td>\n            <td>{{value.brand}}</td>\n            <td><input type=\"number\" min=\"0\" ng-model=\"value.qte\" ng-blur=\"vm.lissage(value.id, value.qte,0)\" ng-keydown=\"$event.keyCode === 13 && vm.lissage(value.id, value.qte)\" class=\"w-xxs\">/{{::value.qte}}</td>\n            <td><input type=\"number\" min=\"0\" ng-model=\"value.sale_price\" ng-keyup=\"vm.calculTotal()\" class=\"w-xxs\" placeholder=\"Prix U/ht\"></td>\n            <td><input type=\"text\" disabled=\"\" value=\"{{ value.sale_price * vm.calculerStock(value.stock) }}\" class=\"w-xxs\" placeholder=\"Prix total\"></td>\n            <td>\n              <div class=\"btn btn-xs btn-info\" data-toggle=\"modal\" data-target=\"#ajoutStock\" ng-click=\"vm.selected=value\" ><i class=\"fa fa-info\"></i></div>\n              <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.removeProduct( $index )\" ><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n        <tfoot>\n          <tr>\n            <td colspan=\"2\">\n              <div class=\"row\">\n                <div class=\"col-md-8\">\n                  <textarea class=\"form-control\" ng-model=\"vm.command.comment\" placeholder=\"Commentaire\"></textarea>    \n                </div>\n                <div class=\"col-md-4\">\n                  <a ng-click=\"vm.fermer()\" class=\"btn btn-sm btn-danger\">Fermer</a>\n                  <div class=\"btn btn-sm btn-success\" ng-click=\"vm.addCommand()\">Enregistrer</div> \n                </div>\n              </div>\n              \n            </td>\n            <td colspan=\"3\">\n              <div class=\"row\">\n                <div class=\"col-md-4\">Personne</div>\n                <div class=\"col-md-8\">{{app.data.user.firstname }} {{app.data.user.name }}</div>\n                <div class=\"col-md-4\"><label class=\"m-t\">Monnaie</label></div>\n                <div class=\"col-md-8\">\n                  <select class=\"form-control\" ng-model=\"vm.command.change_id\" required=\"\" ng-init=\"vm.getDevises();\">\n                    <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.devises track by $index\">{{ value.name }} </option>\n                  </select>\n                </div>  \n              </div>  \n              <div class=\"row\">\n                <div class=\"col-md-4\"><label class=\"m-t\">Statut</label></div>\n                <div class=\"col-md-8\">\n                  <select class=\"form-control\" ng-model=\"vm.command.status\">\n                    <option value=\"RESERVED\">Réservé</option>\n                    <option value=\"TO_PREPARE\">À préparer</option>\n                    <option value=\"PREPARED\">Prêt</option>\n                    <option value=\"READY_TO_SENT\">Prêt expédiable</option>\n                    <option value=\"READY_NOT_TO_SENT\">Prêt non expédiable</option>\n                    <option value=\"SENT\">Expédié</option>\n                  </select>\n                </div>  \n              </div>\n            </td>\n          </tr>\n        </tfoot>\n      </table>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"lissage\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Lissage</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/commandes/lissage.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"modal fade\" id=\"ajoutStock\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Stock</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/commandes/stock.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>");
            $templateCache.put("modules/commandes/details.html", "<div class=\"row\" ng-init=\"vm.getMarques(); vm.getCommand()\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Détails commande</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"card-box no-padder\">\n  <form class=\"wrapper-sm\"  ng-init=\"vm.getClients(\'\')\">\n    <div class=\"row\">\n      <div class=\"col-md-6\">\n        <div class=\"form-group m-n\" ng-if=\"app.data.user.role_id != 4\">\n          <angucomplete-alt \n                placeholder=\"Choisir un client...\"\n                pause=\"100\"\n                selected-object=\"vm.command.client\"\n                local-data=\"vm.clients\"\n                search-fields=\"company_name\"\n                title-field=\"company_name\"\n                match-class=\"highlight\"\n                minlength=\"3\"\n                text-no-results=\"Aucun client\"\n                template-url=\"custom-template.html\"\n                input-class=\"form-control w-full\"/>\n        </div>\n        <h4>{{ vm.command.client.company_name || vm.command.client.description.company_name }}  </h4>\n        <h5>Tél : {{ vm.command.client.contact_tel_line || vm.command.client.description.contact_tel_line }} </h5>\n        <h5>{{ vm.command.client.contact_email || vm.command.client.description.contact_email }} </h5>\n        <h5>{{ vm.command.client.address }} </h5>\n        <h6>{{ vm.command.client.city }} {{ vm.command.client.postal_code }} </h6>\n      </div>\n\n      <div class=\"col-md-6\">\n        <div class=\"form-group m-n\" ng-init=\"vm.getProduits()\">\n          <input type=\"text\" readonly=\"\" placeholder=\"Chargement des produits...\" class=\"form-control w-full\" ng-if=\"!vm.produits\">\n          <angucomplete-alt \n                placeholder=\"Choisir un article...\"\n                pause=\"100\"\n                selected-object=\"vm.selectedProduct\"\n                local-data=\"vm.produits\"\n                search-fields=\"reference\"\n                title-field=\"reference\"\n                match-class=\"highlight\"\n                minlength=\"3\"\n                text-no-results=\"Aucun produit\"\n                template-url=\"custom-template-produit.html\"\n                input-class=\"form-control w-full\"/>\n        </div>\n        <div class=\"form-group b b-light wrapper-xs m-t-xs\">\n          <h3 class=\"text-2x\">Total\n            <div class=\"pull-right\">{{ (vm.total + vm.command.transport_amount*1) | currency }}</div>\n          </h3>\n        </div>\n      </div>\n    </div>\n  </form>\n</div>\n\n<script type=\"text/ng-template\" id=\"custom-template-produit.html\">\n  <div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n    <input ng-model=\"searchStr\"\n      ng-disabled=\"disableInput\"\n      type=\"text\"\n      placeholder=\"{{placeholder}}\"\n      ng-focus=\"onFocusHandler()\"\n      class=\"{{inputClass}}\"\n      ng-focus=\"resetHideResults()\"\n      ng-blur=\"hideResults($event)\"\n      autocapitalize=\"off\"\n      autocorrect=\"off\"\n      autocomplete=\"off\"\n      ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n    <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n      <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n      <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n      <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n        <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n          <div class=\"row\">\n            <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n              <img class=\"img-responsive\" ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n            </div>\n            <div class=\"col-md-10\">\n              <h4 ng-bind-html=\"result.title\"></h4>\n              <p>{{result.originalObject.description}}</p>\n            </div>\n             \n          </div>\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"!matchClass\">\n          {{ result.title }}\n        </div>\n        <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n        <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n      </div>\n      \n    </div>\n  </div>\n</script>\n\n<script type=\"text/ng-template\" id=\"custom-template.html\">\n  <div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n    <input ng-model=\"searchStr\"\n      ng-disabled=\"disableInput\"\n      type=\"text\"\n      placeholder=\"{{placeholder}}\"\n      ng-focus=\"onFocusHandler()\"\n      class=\"{{inputClass}}\"\n      ng-focus=\"resetHideResults()\"\n      ng-blur=\"hideResults($event)\"\n      autocapitalize=\"off\"\n      autocorrect=\"off\"\n      autocomplete=\"off\"\n      ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n    <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n      <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n      <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n      <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n        <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n          <div class=\"row\">\n            <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n              <img class=\"img-responsive\" ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n            </div>\n            <div class=\"col-md-10\">\n              <h4 ng-bind-html=\"result.title\"></h4>\n              <p>{{result.originalObject.description}}</p>\n            </div>\n          </div>\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"!matchClass\">{{ result.title }}</div>\n        <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n        <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n      </div>\n      \n    </div>\n  </div>\n</script>\n\n\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box\">\n      <div class=\"row\">\n        <!-- <div class=\"col-md-4\">\n          <div class=\"form-group\">\n            <input type=\"text\" style=\"width: 100%\" ng-model=\"vm.command.transport_address\" placeholder=\" \">\n            <label>Addresse transport</label>\n          </div>\n        </div> -->\n        <div class=\"col-md-2\">\n          <div class=\"form-group\">\n            <input type=\"text\" style=\"width: 100%\" ng-disabled=\"app.data.user.role_id == 4\" ng-model=\"vm.command.transport_amount\" placeholder=\" \">\n            <label>Frais transport</label>\n          </div>\n        </div>\n        <div class=\"col-md-2 text-center\">\n          Exonération TVA \n          <div>\n            <input type=\"checkbox\" ng-disabled=\"app.data.user.role_id == 4\" id=\"switch_tva\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.command.tva_exoneration\" switch=\"bool\">\n            <label for=\"switch_tva\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n          </div>\n        </div>\n        <div class=\"col-md-2 text-center\">\n          Facture PDF  \n          <div>\n            <input type=\"checkbox\" ng-disabled=\"app.data.user.role_id == 4\" id=\"switch_pdf\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.command.is_invoice_pdf\" switch=\"bool\">\n            <label for=\"switch_pdf\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n          </div>\n        </div>\n        <div class=\"col-md-2 text-center\">\n          Facture EXCEL \n          <div>\n            <input type=\"checkbox\" ng-disabled=\"app.data.user.role_id == 4\" id=\"switch_excel\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.command.is_invoice_excel\" switch=\"bool\">\n            <label for=\"switch_excel\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <h3>Liste des produits</h3>\n      <table id=\"mouvement_entree\" class=\"table table-striped\">\n        <thead>\n          <tr>\n            <th width=\"120\">Référence </th>\n            <th>Désignation </th>\n            <th width=\"100\">Marque</th>\n            <th width=\"130\">Qte</th>\n            <th width=\"100\">Prix Unit HT</th>\n            <th width=\"80\">Prix total</th>\n            <th width=\"50\">Action</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.command.command_details track by $index\" ng-mousedown=\"vm.showPrice = 1\" ng-mouseup=\"vm.showPrice = 0\">\n            <td>{{value.reference}}</td>\n            <td>\n              <div>\n                {{value.description}}\n                <div class=\"tooltip\">\n                  Designation : {{value.description}}<br>\n                  ref  :  {{value.reference}}<br>\n                  vanam:  {{value.sale_vanam_price}}<br>\n                  tarif:  {{value.sale_price}}<br>\n                  <span ng-if=\"vm.showPrice\">\n                    {{value.purchase_vanam_price}}\n                  </span>\n                </div>\n              </div>\n            </td>\n            <td>{{value.brand}}</td>\n            <td><input type=\"number\" min=\"0\" ng-model=\"value.qte\" ng-blur=\"vm.lissage(value.product_id, value.qte, 0)\" ng-keydown=\"$event.keyCode === 13 && vm.lissage(value.product_id, value.qte)\" class=\"w-xxs  text-center\">/{{value.qtt}}</td>\n            <td><input type=\"text\" ng-disabled=\"app.data.user.role_id == 4\" ng-model=\"value.sale_price\" class=\"w-xxs text-center\" placeholder=\"Prix U/ht\"></td>\n            <td><input type=\"text\" disabled=\"\" value=\"{{ value.sale_price * vm.calculerStock(value.stock) | number:2 }}\" class=\"w-xxs  text-center\" placeholder=\"Prix total\"></td>\n            <td>\n              <div class=\"btn btn-xs btn-info\" ng-click=\"vm.openDetailsProduit(value.product_id)\" ><i class=\"fa fa-info\"></i></div>\n              <div ng-if=\"app.data.user.role_id != 4\" class=\"btn btn-xs btn-danger\" ng-click=\"vm.removeProduct( $index,1, value.product_id )\" ><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n        <tfoot>\n          <tr>\n            <td colspan=\"4\">\n              <div class=\"row\">\n                <div class=\"col-md-5\">              \n                  <textarea class=\"form-control\" ng-model=\"vm.command.comment\" placeholder=\"Commentaire\"></textarea>\n                </div>\n                <div class=\"col-md-7\">\n                  <div class=\"btn btn-xs btn-default\" data-toggle=\"modal\" data-target=\"#exports\" ng-click=\"vm.search.render_type=1\">Imprimer</div>\n                  <a class=\"btn btn-xs btn-default\" ng-if=\"app.data.user.role_id != 4\" ng-click=\"vm.bonPreparation(vm.command.id)\">Bon de préparation</a>\n                  <div class=\"btn btn-xs btn-success\" ng-click=\"vm.dupliquerEnDevis(vm.command.id)\">Dupliquer en devis</div>\n                  <a ng-click=\"vm.fermer()\" class=\"btn btn-xs btn-danger\">Fermer</a>\n                  <div class=\"btn btn-xs btn-success\" ng-click=\"vm.updateCommand()\">Enregistrer</div>\n                </div>\n              </div>\n            </td>\n            <td colspan=\"3\">\n              <div class=\"row\">\n                <div class=\"col-md-4\">Personne</div>\n                <div class=\"col-md-8\">{{ vm.command.user_name }}</div>\n                <div class=\"col-md-4\">Monnaie</div>\n                <div class=\"col-md-8\">\n                  <select class=\"form-control\" ng-disabled=\"app.data.user.role_id == 4\" ng-model=\"vm.command.change_id\" required=\"\" ng-init=\"vm.getDevises(); vm.command.change_id = \'1\'\">\n                    <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.devises track by $index\">{{ value.name }} </option>\n                  </select>\n                </div>\n                <div class=\"col-md-4\"><label class=\"m-t\">Statut</label></div>\n                <div class=\"col-md-8\">\n                  <select class=\"form-control\" ng-disabled=\"app.data.user.role_id == 4\" ng-model=\"vm.command.status\">\n                    <option value=\"RESERVED\">Réservé</option>\n                    <option value=\"TO_PREPARE\">À préparer</option>\n                    <option value=\"PREPARED\">Prêt</option>\n                    <option value=\"READY_TO_SENT\">Prêt expédiable</option>\n                    <option value=\"READY_NOT_TO_SENT\">Prêt non expédiable</option>\n                    <option value=\"SENT\">Expédié</option>\n                  </select>\n                </div>  \n              </div>\n            </td>\n          </tr> \n        </tfoot>\n      </table>\n    </div>\n\n    <div class=\"card-box\">\n      <input type=\"file\" name=\"file\" class=\"hidden\" >\n      <div ng-if=\"app.data.user.role_id != 4\" class=\"pull-right btn btn-sm btn-info btn-add-file\"> <i class=\"fa fa-plus\"></i> Ajouter un nouveau document</div>\n      <h3 class=\"inline\">Liste des fichiers</h3>\n      <table class=\"table table-striped\">\n        <thead>\n          <tr>\n            <th>Fichier</th>\n            <th width=\"70\">Actions</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.command.files\">\n            <td>\n              {{value.name}}\n            </td>\n            <td>\n              <a class=\"btn btn-xs btn-success\" download=\"{{value.name}}\" href=\"{{vm.url+value.url+value.name}}\"><i class=\"fa fa-eye\"></i></a>\n              <div ng-if=\"app.data.user.role_id != 4\" class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteFile(value.id)\"><i class=\"fa fa-trash\"></i></div>\n            </td> \n          </tr>\n        </tbody>\n      </table>\n      <p ng-if=\"vm.command.files.length==0\" class=\"text-center\">Aucun fichier(s) trouvé(s)</p>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"exports\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Export</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div class=\"m-b m-l-lg m-r-lg\">\n            <div class=\"checkbox\" ng-if=\"vm.search.render_type == 1\" ng-init=\"vm.search.header=1\">\n              <input id=\"checkbox1\" ng-model=\"vm.search.header\" ng-true-value=\"1\" ng-false-value=\"0\" checked=\"\" type=\"checkbox\">\n              <label for=\"checkbox1\">Entete</label>\n            </div> \n            <div class=\"checkbox\" ng-init=\"vm.search.is_images=1\">\n              <input id=\"checkbox1\" ng-model=\"vm.search.is_images\" ng-true-value=\"1\" ng-false-value=\"0\" checked=\"\" type=\"checkbox\">\n              <label for=\"checkbox1\">Images</label>\n            </div> \n            <div class=\"checkbox\" ng-init=\"vm.search.vanam_price=1\">\n              <input id=\"checkbox5\" ng-model=\"vm.search.vanam_price\" type=\"checkbox\" ng-true-value=\"1\" ng-false-value=\"0\">\n              <label for=\"checkbox5\">Prix vente Vanam</label>\n            </div>\n            <label style=\"margin-left: -20px;\" ng-init=\"vm.search.format_stock=\'1\'\">\n              Type d’affichage des tailles\n            </label>\n            <div class=\"radio\">\n              <input id=\"radio1\" name=\"tailles\" type=\"radio\" ng-model=\"vm.search.format_stock\" value=\"1\">\n              <label for=\"radio1\" style=\"padding-left: 21px; font-weight: bold;\">Tailles dans X colonnes</label>\n            </div>\n            <div class=\"radio\">\n              <input id=\"radio2\" name=\"tailles\" type=\"radio\" ng-model=\"vm.search.format_stock\" value=\"2\">\n              <label for=\"radio2\" style=\"padding-left: 21px; font-weight: bold;\">Tailles dans une colonnes</label>\n            </div>  \n            <div class=\"text-center m-b-md\" ng-init=\"vm.search.render_type=1\">\n              <button type=\"button\" ng-disabled=\"vm.search.render_type==1\" ng-class=\"{\'btn-success\': vm.search.render_type==1}\" ng-click=\"vm.search.render_type=1\" class=\"btn btn-default waves-effect m-r\"><i class=\"fa fa-file-pdf-o\"></i> PDF</button>\n              <button ng-if=\"app.data.user.role_id != 4\" type=\"button\" ng-disabled=\"vm.search.render_type==2\" ng-class=\"{\'btn-success\': vm.search.render_type==2}\" ng-click=\"vm.search.render_type=2\" class=\"btn btn-default waves-effect\"><i class=\"fa fa-file-excel-o\"></i> EXCEL</button>\n            </div>\n            <div class=\"text-center\">\n              <div class=\"btn btn-sm btn-success\" ng-click=\"vm.imprimer(vm.search)\"> Générer </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"lissage\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Lissage</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/commandes/lissage.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"ajoutStock\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Stock</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/commandes/stock.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<script type=\"text/ng-template\" id=\"detailsProduit.html\">\n  <div class=\"detailsProduitModal\" data-ng-include=\" \'modules/produits/details.html\' \"></div>\n</script>\n");
            $templateCache.put("modules/commandes/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Liste des Commandes</h4>\n      <div class=\"pull-right\"  ng-if=\"app.data.user.role_id != 4\">\n        <a class=\"btn btn-primary btn-sm waves-effect waves-light\" ui-sref=\"app.commande.add\" ng-click=\"vm.command = {}; vm.total=0\">Ajouter commande</a>\n      </div>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"card-box no-padder\">\n  <form class=\"wrapper-sm\" ng-submit=\"vm.getCommands(vm.filter)\">\n      <div class=\"row\">\n        <div class=\"col-md-3\">\n          <div class=\"form-group\">\n            <input type=\"text\" class=\"form-control\" ng-model=\"vm.filter.num_command\" placeholder=\" \">\n            <label>N° Commande</label>\n          </div>\n        </div>\n        <div class=\"col-md-3\">\n          <div class=\"form-group\">\n            <input type=\"text\" class=\"form-control\"  ng-model=\"vm.filter.creator\" placeholder=\" \">\n            <label>Créateur de commande</label>\n          </div>\n        </div>\n        <div class=\"col-md-4\" ng-if=\"app.data.user.role_id != 4\">\n          <div class=\"form-group\">\n            <input type=\"text\" class=\"form-control\" ng-model=\"vm.filter.company\"  placeholder=\" \">\n            <label>Société</label>\n          </div>\n        </div>\n        <div class=\"col-md-2\">\n          <button class=\"btn btn-sm btn-success m-t-xs\">Trouver</button>\n        </div>\n\n      </div>\n  </form>\n</div>\n \n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <h6 class=\"text-center\">{{vm.commands.length}} commande trouvée(s)</h6>\n      <table id=\"liste_commands\" class=\"table table-striped\" ng-init=\"vm.getCommands()\">\n        <thead>\n          <tr>\n            <th width=\"70\">N° Commande </th>\n            <th>N° Client </th>\n            <th>Societe</th>\n            <th width=\"140\">Date</th>\n            <th>Utilisateur</th>\n            <th>Statut</th>\n            <th width=\"80\">Total</th>\n            <th width=\"200\" class=\"text-right\">Action</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.commands track by $index\" style=\"background: }}\">\n            <td align=\"center\">{{value.id}}</td>\n            <td>{{value.client_id}}</td>\n            <td>{{value.company_name}}</td>\n            <td>{{value.creation_date | moment:\'DD MMMM YYYY\' }}</td>\n            <td>{{value.user_name}}</td>\n            <td class=\"text-center\"> <div class=\"badge badge-{{value.status}}\"> {{ {\'RESERVED\': \'Réservé\',\'TO_PREPARE\': \'À préparer\',\'PREPARED\': \'Prêt\',\'READY_TO_SENT\': \'Prêt expédiable\',\'READY_NOT_TO_SENT\' : \'Prêt non expédiable\',\'SENT\': \'Expédié\'}[value.status]}}</div></td>\n            <td>{{value.total | currency }}</td>\n            <td class=\"text-right\">\n              <a ui-sref=\"app.commande.details({id: value.id})\" class=\"btn btn-xs btn-info\"><i class=\"fa fa-pencil\"></i></a>\n              <div data-toggle=\"modal\" data-target=\"#exports\" ng-click=\"vm.print_id = value.id; vm.search.render_type=1\" class=\"btn btn-xs btn-default\"><i class=\"fa fa-print\"></i></div>\n              <div data-toggle=\"modal\" data-target=\"#exports\" ng-click=\"vm.print_id = value.id; vm.search.render_type=2\" class=\"btn btn-xs btn-default\"><i class=\"fa fa-file-excel-o\"></i></div>\n              <div ng-if=\"app.data.user.role_id != 4\" class=\"btn btn-xs btn-primary\" title=\"Bon de préparation\" ng-click=\"vm.bonPreparation(value.id)\"><i class=\"fa fa-list\"></i></div>\n              <div ng-if=\"app.data.user.role_id != 4\" data-toggle=\"modal\" data-target=\"#proforma\" ng-click=\"vm.proforma.command_id = value.id;\" class=\"btn btn-xs btn-default\" title=\"Proforma\"><i class=\"fa fa-file-o\"></i></div>\n              <div ng-if=\"app.data.user.role_id != 4\" class=\"btn btn-xs btn-default\" title=\"Facturer\" ng-click=\"vm.facturer(value.id)\"><i class=\"fa fa-file\"></i></div>\n              <div ng-if=\"app.data.user.role_id != 4\" class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteCommand( value.id )\"><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"modal fade\" id=\"ajoutStock\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Ajout stock</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/mouvements/stock.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"exports\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Export</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div class=\"m-b m-l-lg m-r-lg\">\n            <div class=\"checkbox\" ng-if=\"vm.search.render_type == 1\" ng-init=\"vm.search.header=1\">\n              <input id=\"checkbox1\" ng-model=\"vm.search.header\" ng-true-value=\"1\" ng-false-value=\"0\" checked=\"\" type=\"checkbox\">\n              <label for=\"checkbox1\">Entete</label>\n            </div> \n            <div class=\"checkbox\" ng-init=\"vm.search.is_images=1\">\n              <input id=\"checkbox1\" ng-model=\"vm.search.is_images\" ng-true-value=\"1\" ng-false-value=\"0\" checked=\"\" type=\"checkbox\">\n              <label for=\"checkbox1\">Images</label>\n            </div> \n            <div class=\"checkbox\" ng-init=\"vm.search.vanam_price=1\">\n              <input id=\"checkbox5\" ng-model=\"vm.search.vanam_price\" type=\"checkbox\" ng-true-value=\"1\" ng-false-value=\"0\">\n              <label for=\"checkbox5\">Prix vente Vanam</label>\n            </div>\n            <label style=\"margin-left: -20px;\" ng-init=\"vm.search.format_stock=\'1\'\">\n              Type d’affichage des tailles\n            </label>\n            <div class=\"radio\">\n              <input id=\"radio1\" name=\"tailles\" type=\"radio\" ng-model=\"vm.search.format_stock\" value=\"1\">\n              <label for=\"radio1\" style=\"padding-left: 21px; font-weight: bold;\">Tailles dans X colonnes</label>\n            </div>\n            <div class=\"radio\">\n              <input id=\"radio2\" name=\"tailles\" type=\"radio\" ng-model=\"vm.search.format_stock\" value=\"2\">\n              <label for=\"radio2\" style=\"padding-left: 21px; font-weight: bold;\">Tailles dans une colonnes</label>\n            </div>  \n            <!-- <div class=\"text-center m-b-md\" ng-init=\"vm.search.render_type=1\">\n              <button type=\"button\" ng-disabled=\"vm.search.render_type==1\" ng-class=\"{\'btn-success\': vm.search.render_type==1}\" ng-click=\"vm.search.render_type=1\" class=\"btn btn-default waves-effect m-r\"><i class=\"fa fa-file-pdf-o\"></i> PDF</button>\n              <button type=\"button\" ng-disabled=\"vm.search.render_type==2\" ng-class=\"{\'btn-success\': vm.search.render_type==2}\" ng-click=\"vm.search.render_type=2\" class=\"btn btn-default waves-effect\"><i class=\"fa fa-file-excel-o\"></i> EXCEL</button>\n            </div> -->\n            <div class=\"text-center\">\n              <div class=\"btn btn-sm btn-success\" ng-click=\"vm.imprimer(vm.search)\"> Générer </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"proforma\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Proforma</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div class=\"m-b m-l-lg m-r-lg\">\n            <div class=\"m-b m-t\">\n              <label>Type de paiement</label>\n              <select class=\"form-control\" ng-model=\"vm.proforma.type_payment\">\n                <option class=\"hidden\">Type de paiement</option>\n                <option value=\"1\">Chèque</option>\n                <option value=\"2\">Virement</option>\n                <option value=\"3\">Carte Bleue</option>\n                <option value=\"4\">Espèce</option>\n                <option value=\"5\">Traite</option>\n              </select>\n            </div> \n            <div class=\"text-center m-b-md\" ng-init=\"vm.proforma.type_print=1\">\n              <button type=\"button\" ng-disabled=\"vm.proforma.type_print==1\" ng-class=\"{\'btn-success\': vm.proforma.type_print==1}\" ng-click=\"vm.proforma.type_print=1\" class=\"btn btn-default waves-effect m-r\"><i class=\"fa fa-file-pdf-o\"></i> PDF</button>\n              <button type=\"button\" ng-disabled=\"vm.proforma.type_print==2\" ng-class=\"{\'btn-success\': vm.proforma.type_print==2}\" ng-click=\"vm.proforma.type_print=2\" class=\"btn btn-default waves-effect\"><i class=\"fa fa-file-excel-o\"></i> EXCEL</button>\n            </div> \n            <div class=\"text-center\">\n              <div class=\"btn btn-sm btn-danger\" data-dismiss=\"modal\"> Annuler </div>\n              <div class=\"btn btn-sm btn-success\" data-dismiss=\"modal\" ng-click=\"vm.getProforma(vm.proforma.command_id)\" > Générer </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<script type=\"text/ng-template\" id=\"addProduct.html\">\n  <div class=\"addProductModal\" data-ng-include=\" \'modules/produits/add.html\' \"></div>\n</script>");
            $templateCache.put("modules/commandes/lissage.html", "<div ng-init=\"vm.somme_stock=0\">\n  <div class=\"stock-box\" ng-class=\"{\'bg-danger\':value.value>value.qtr}\" ng-init=\"vm.somme_stock=vm.somme_stock+value.qtr*1\"  ng-repeat=\"(key, value) in vm.selected.stock track by $index\">\n\n    <div class=\"pointure\">{{ value.name }}</div>\n    <div class=\"reel\">\n      <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ !vm.lissages?value.qtr:\'0\' }}</span>\n    </div>\n    <div class=\"aterme\">\n      <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ !vm.lissages?value.qtt:\'0\' }}</span>\n    </div>\n    <div class=\"nouveau\">\n      <input type=\"text\"  autofocus tabindex=\"{{$index+1}}\"  ng-keydown=\"$event.keyCode === 13 && vm.closeModalLissage()\" value=\"0\" min=\"0\" ng-model=\"value.value\" ng-change=\"value.value<=value.qtr?vm.calculTotal():null\">\n    </div>\n  </div>\n  <div class=\"text-right\">\n    <div class=\"stock-box somme\">\n      <div class=\"reel\" style=\"width: 100%\">\n        <b>Stock dispo</b> {{vm.somme_stock}}\n      </div>\n    </div>\n  </div>\n\n  <div class=\"text-right m-b-xs m-r-xs\">\n    <div class=\"btn btn-success btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Valider</div>\n    <div class=\"btn btn-danger btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Fermer</div>\n  </div>\n</div>");
            $templateCache.put("modules/commandes/stock.html", "<div class=\"stock-box\" ng-repeat=\"(key, value) in vm.selected.stock track by $index\">\n  <div class=\"pointure\">{{ value.range_detail_id }}</div>\n  <div class=\"reel\">\n    <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ !vm.lissages?value.qtr:\'0\' }}</span>\n  </div>\n  <div class=\"aterme\">\n    <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ !vm.lissages?value.qtt:\'0\' }}</span>\n  </div>\n  <div class=\"nouveau\">\n    <input type=\"text\" value=\"0\" min=\"0\" ng-model=\"value.value\" ng-change=\"vm.calculTotal()\">\n  </div>\n</div>\n<div class=\"text-right\">\n  <div class=\"stock-box somme\">\n    <div class=\"reel\" style=\"width: 100%\">\n      <b>Stock dispo</b> {{ vm.calculerStock(vm.selected.stock)+vm.produit.qtr }}\n    </div>\n  </div>\n</div>\n\n<div class=\"text-right m-b-xs m-r-xs\">\n  <div class=\"btn btn-success btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Valider</div>\n  <div class=\"btn btn-danger btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Fermer</div>\n</div>");
            $templateCache.put("modules/dashboard/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Accueil  </h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n");
            $templateCache.put("modules/devis/add.html", "<div class=\"row\" ng-init=\"vm.getMarques(); vm.quotation={}; vm.quotation.quotation_details = []\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Nouveau Devis</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"card-box no-padder\">\n  <form class=\"wrapper-sm\"  ng-init=\"vm.getClients(\'\'); app.data.user.role_id==4?vm.affectCompany(app.data.user):null\">\n    <div class=\"row\">\n      <div class=\"col-md-6\">\n        <div class=\"form-group m-n\">\n          <angucomplete-alt\n                ng-if=\"app.data.user.role_id!=4\" \n                placeholder=\"Choisir un client...\"\n                pause=\"100\"\n                selected-object=\"vm.quotation.client\"\n                local-data=\"vm.clients\"\n                search-fields=\"company_name\"\n                title-field=\"company_name\"\n                match-class=\"highlight\"\n                minlength=\"3\"\n                disable-input=\"app.data.user.role_id==4\"\n                text-no-results=\"Aucun client\"\n                template-url=\"client-template.html\"\n                input-class=\"form-control w-full\"/>\n        </div>\n\n        <div ng-if=\"app.data.user.role_id==4\">\n          <h4 ng-init=\"vm.quotation.client_id = app.data.user.client_infos.id \">{{ app.data.user.client_infos.company_name }} <br>{{ app.data.user.name }}   </h4>\n          <h5 ng-if=\"app.data.user.client_infos.contact_mobile_line\">Mobile : {{ app.data.user.client_infos.contact_mobile_line }} </h5>\n          <h5 ng-if=\"app.data.user.client_infos.contact_tel_line\">Tél : {{ app.data.user.client_infos.contact_tel_line }} </h5>\n          <h5 ng-if=\"app.data.user.client_infos.contact_email\">{{ app.data.user.client_infos.contact_email }} </h5>\n          <h5>{{ app.data.user.client_infos.address }} </h5>\n        </div>\n\n\n        <h4>{{ vm.quotation.client.originalObject.company_name }}  </h4>\n        <h5 ng-if=\"vm.quotation.originalObject.client.contact_tel_line\">Tél : {{ vm.quotation.originalObject.client.contact_tel_line }} </h5>\n        <h5 ng-if=\"vm.quotation.client.originalObject.contact_email\">{{ vm.quotation.client.originalObject.contact_email }} </h5>\n        <h5>{{ vm.quotation.client.originalObject.address }} </h5>\n        <h6>{{ vm.quotation.client.originalObject.city }} {{ vm.quotation.client.originalObject.postal_code }} </h6>\n      </div>\n      <div class=\"col-md-6\" ng-init=\"vm.getProduits()\">\n        <div class=\"form-group m-n\" >\n          <input type=\"text\" readonly=\"\" placeholder=\"Chargement des produits...\" class=\"form-control w-full\" ng-if=\"!vm.produits\">\n          <angucomplete-alt \n                ng-if=\"vm.produits\"\n                placeholder=\"Choisir un article...\"\n                pause=\"100\"\n                selected-object=\"vm.selectedProduct\"\n                local-data=\"vm.produits\"\n                search-fields=\"reference\"\n                title-field=\"reference\"\n                match-class=\"highlight\"\n                minlength=\"3\"\n                clear-selected=\"true\"\n                text-no-results=\"Aucun produit\"\n                template-url=\"produit-template.html\"\n                input-class=\"form-control w-full input-search-produit\"/>\n        </div>\n        <div class=\"form-group b b-light wrapper-xs m-t-xs\">\n          <h3 class=\"text-2x\">Total\n            <div class=\"pull-right\">{{ vm.total| currency }}</div>\n          </h3>\n        </div>\n      </div>\n    </div>\n  </form>\n</div>\n\n<script type=\"text/ng-template\" id=\"produit-template.html\">\n  <div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n    <input ng-model=\"searchStr\"\n      ng-disabled=\"disableInput\"\n      type=\"text\"\n      placeholder=\"{{placeholder}}\"\n      ng-focus=\"onFocusHandler()\"\n      class=\"{{inputClass}}\"\n      ng-focus=\"resetHideResults()\"\n      ng-blur=\"hideResults($event)\"\n      autocapitalize=\"off\"\n      autocorrect=\"off\"\n      autocomplete=\"off\"\n      ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n    <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n      <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n      <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n      <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n        <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n          <div class=\"row\">\n            <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n              <img class=\"img-responsive\" ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n            </div>\n            <div class=\"col-md-10\">\n              <h4 ng-bind-html=\"result.title\"></h4>\n              <p>{{result.originalObject.description}}</p>\n            </div>\n          </div>\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"!matchClass\">\n          {{ result.title }}\n        </div>\n        <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n        <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n      </div>\n    </div>\n  </div>\n</script>\n\n<script type=\"text/ng-template\" id=\"client-template.html\">\n  <div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n    <input ng-model=\"searchStr\"\n      ng-disabled=\"disableInput\"\n      type=\"text\"\n      placeholder=\"{{placeholder}}\"\n      ng-focus=\"onFocusHandler()\"\n      class=\"{{inputClass}}\"\n      ng-focus=\"resetHideResults()\"\n      ng-blur=\"hideResults($event)\"\n      autocapitalize=\"off\"\n      autocorrect=\"off\"\n      autocomplete=\"off\"\n      ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n    <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n      <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n      <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n      <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n        <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n          <div class=\"row\">\n            <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n              <img class=\"img-responsive\" ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n            </div>\n            <div class=\"col-md-10\">\n              <h4 ng-bind-html=\"result.title\"></h4>\n              <p>{{result.originalObject.description}}</p>\n            </div>\n          </div>\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"!matchClass\">{{ result.title }}</div>\n        <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n        <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n      </div>\n      \n    </div>\n  </div>\n</script>\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <h3>Liste des produits</h3>\n      <table id=\"mouvement_entree\" class=\"table table-striped\">\n        <thead>\n          <tr>\n            <th width=\"120\">Référence </th>\n            <th>Désignation </th>\n            <th width=\"100\">Categorie</th>\n            <th width=\"100\">Marque</th>\n            <th width=\"130\">Qte</th>\n            <th width=\"100\">Prix Unit HT</th>\n            <th width=\"80\">Prix total</th>\n            <th width=\"50\">Action</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.quotation.quotation_details track by $index\" title=\"rate price : {{value.sale_rate_public}}  vanam price : {{value.sale_vanam_price}}\">\n            <td>{{value.reference}}</td>\n            <td>{{value.description}}</td>\n            <td>{{value.category}}</td>\n            <td>{{value.brand}}</td>\n            <td><input type=\"number\" min=\"0\" max=\"{{value.qtt}}\" ng-model=\"value.qte\" ng-blur=\"vm.lissage(value.id, value.qte, 0)\" ng-keydown=\"$event.keyCode === 13 && vm.lissage(value.id, value.qte)\" class=\"w-xxs\">/{{value.qtt}}</td>\n            <td><input type=\"number\" ng-disabled=\"app.data.user.role_id==4\" ng-model=\"value.sale_price\" ng-keyup=\"vm.calculTotal()\" class=\"w-xxs\" placeholder=\"Prix U/ht\"></td>\n            <td><input type=\"text\" disabled=\"\" value=\"{{ (value.sale_price * vm.calculerStock(value.stock)) | number }}\" class=\"w-xxs\" placeholder=\"Prix total\"></td>\n            <td>\n              <div class=\"btn btn-xs btn-info\" ng-click=\"vm.openDetailsProduit(value.product_id)\" ><i class=\"fa fa-info\"></i></div>\n              <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.removeProduct( $index )\" ><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n        <tfoot>\n          <tr>\n            <td colspan=\"2\">\n              <textarea class=\"form-control\" ng-model=\"vm.quotation.comment\" ng-init=\"vm.quotation.comment=\'\'\" placeholder=\"Commentaire\"></textarea>\n            </td>\n            <td colspan=\"2\" align=\"right\">\n              <div ng-click=\"vm.fermer()\" class=\"btn btn-sm btn-danger\">Fermer</div>\n              <div class=\"btn btn-sm btn-success\" ng-click=\"vm.addQuotation()\">Enregistrer</div>\n            </td>\n            <td colspan=\"3\">\n              <div class=\"row\">\n                <div class=\"col-md-4\">Personne</div>\n                <div class=\"col-md-8\">{{app.data.user.firstname }} {{app.data.user.name }}</div>\n                <div class=\"col-md-4\">Monnaie {{ vm.id_euro }}</div>\n                <div class=\"col-md-8\">\n                  <select class=\"form-control\" ng-model=\"vm.quotation.change_id\" required=\"\" ng-init=\"vm.getDevises(); vm.quotation.change_id = vm.id_euro\">\n                    <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.devises track by $index\">{{ value.name }} </option>\n                  </select>\n                </div>  \n              </div>\n            </td>\n          </tr>\n        </tfoot>\n      </table>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"lissage\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Lissage</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/devis/lissage.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"modal fade\" id=\"ajoutStock\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Stock</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/devis/stock.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<script type=\"text/ng-template\" id=\"detailsProduit.html\">\n  <div class=\"detailsProduitModal\" data-ng-include=\" \'modules/produits/details.html\' \"></div>\n</script>\n");
            $templateCache.put("modules/devis/box.html", "<div class=\"content\">\n  <table class=\"table m-n table-striped\">\n    <thead>\n      <tr>\n        <th width=\"40\"></th>\n        <th width=\"40\">Qte</th>\n        <th>Produit</th>\n        <th width=\"70\">Total</th>\n      </tr>\n    </thead>\n    <tr class=\"item\" ng-repeat=\"(key, value) in app.devis track by $index\">\n      <td>\n        <div class=\"btn btn-danger btn-xs\" ng-click=\"app.deleteLigneDevis( $index )\"><i class=\"fa fa-trash\"></i></div>\n      </td>\n      <td>\n        <input type=\"text\" class=\"w-xxs text-center\" ng-model=\"value.qtt\">\n      </td>\n      <td>{{value.reference}}</td>\n      <td>{{(value.qtt * value.sale_vanam_price)| currency }} </td>\n    </tr>\n  </table>\n</div>\n<div class=\"foot text-right\">\n  <div class=\"btn btn-xs btn-success\" ng-click=\"app.transformerDevis()\"> <i class=\"fa fa-check\"></i> Transformation en devis</div>\n  <div class=\"btn btn-xs btn-danger\" ng-click=\"app.viderDevis()\"> <i class=\"fa fa-trash\"></i> Vider le devis</div>\n</div>\n");
            $templateCache.put("modules/devis/details.html", "<div class=\"row\" ng-init=\"vm.getMarques(); vm.getQuotation()\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Détails Devis</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"card-box no-padder\">\n  <form class=\"wrapper-sm\"  ng-init=\"vm.getClients(\'\'); vm.isChanged=0; \">\n    <div class=\"row\">\n      <div class=\"col-md-6\">\n        <div class=\"form-group m-n\" ng-if=\"app.data.user.role_id != 4\">\n          <angucomplete-alt \n                placeholder=\"Choisir un client...\"\n                pause=\"100\"\n                selected-object=\"vm.quotation.client\"\n                local-data=\"vm.clients\"\n                search-fields=\"company_name\"\n                title-field=\"company_name\"\n                match-class=\"highlight\"\n                minlength=\"3\"\n                text-no-results=\"Aucun client\"\n                template-url=\"custom-template.html\"\n                input-class=\"form-control w-full\"/>\n        </div>\n        <h4>{{ vm.quotation.client.company_name || vm.quotation.client.description.company_name }}  </h4>\n        <h5>Tél : {{ vm.quotation.client.contact_tel_line || vm.quotation.client.description.contact_tel_line }} </h5>\n        <h5>{{ vm.quotation.client.contact_email || vm.quotation.client.description.contact_email }} </h5>\n        <h5>{{ vm.quotation.client.address }} </h5>\n        <h6>{{ vm.quotation.client.city }} {{ vm.quotation.client.postal_code }} </h6>\n      </div>\n\n      <div class=\"col-md-6\">\n        <div class=\"form-group m-n\" ng-init=\"vm.getProduits()\">\n          <input type=\"text\" readonly=\"\" placeholder=\"Chargement des produits...\" class=\"form-control w-full\" ng-if=\"!vm.produits\">\n          <angucomplete-alt \n                placeholder=\"Choisir un article...\"\n                pause=\"100\"\n                selected-object=\"vm.selectedProduct\"\n                local-data=\"vm.produits\"\n                search-fields=\"reference\"\n                title-field=\"reference\"\n                match-class=\"highlight\"\n                minlength=\"3\"\n                text-no-results=\"Aucun produit\"\n                template-url=\"custom-template-produit.html\"\n                input-class=\"form-control w-full\"/>\n        </div>\n        <div class=\"form-group b b-light wrapper-xs m-t-xs\">\n          <h3 class=\"text-2x\">Total\n            <div class=\"pull-right\">{{ vm.total | currency }}</div>\n          </h3>\n        </div>\n        <a ng-if=\"vm.quotation.command\" ui-sref=\"app.commande.details({id: vm.quotation.command.id })\" class=\"badge badge-success\"> <i class=\"fa fa-link\"></i> Commande liée </a>\n        <div class=\"badge badge-warning\" ng-if=\"!vm.quotation.command\">Aucune commande liée </div>\n      </div>\n    </div>\n  </form>\n</div>\n\n<script type=\"text/ng-template\" id=\"custom-template-produit.html\">\n  <div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n    <input ng-model=\"searchStr\"\n      ng-disabled=\"disableInput\"\n      type=\"text\"\n      placeholder=\"{{placeholder}}\"\n      ng-focus=\"onFocusHandler()\"\n      class=\"{{inputClass}}\"\n      ng-focus=\"resetHideResults()\"\n      ng-blur=\"hideResults($event)\"\n      autocapitalize=\"off\"\n      autocorrect=\"off\"\n      autocomplete=\"off\"\n      ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n    <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n      <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n      <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n      <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n        <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n          <div class=\"row\">\n            <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n              <img ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" class=\"img-responsive\" height=\"70\" >\n            </div>\n            <div class=\"col-md-10\">\n              <h4 ng-bind-html=\"result.title\"></h4>\n              <p>{{result.originalObject.description}}</p>\n            </div>\n             \n          </div>\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"!matchClass\">\n          {{ result.title }}\n        </div>\n        <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n        <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n      </div>\n      \n    </div>\n  </div>\n</script>\n\n<script type=\"text/ng-template\" id=\"custom-template.html\">\n  <div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n    <input ng-model=\"searchStr\"\n      ng-disabled=\"disableInput\"\n      type=\"text\"\n      placeholder=\"{{placeholder}}\"\n      ng-focus=\"onFocusHandler()\"\n      class=\"{{inputClass}}\"\n      ng-focus=\"resetHideResults()\"\n      ng-blur=\"hideResults($event)\"\n      autocapitalize=\"off\"\n      autocorrect=\"off\"\n      autocomplete=\"off\"\n      ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n    <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n      <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n      <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n      <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n        <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n          <div class=\"row\">\n            <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n              <img ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n            </div>\n            <div class=\"col-md-10\">\n              <h4 ng-bind-html=\"result.title\"></h4>\n              <p>{{result.originalObject.description}}</p>\n            </div>\n          </div>\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"!matchClass\">{{ result.title }}</div>\n        <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n        <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n      </div>\n      \n    </div>\n  </div>\n</script>\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <h3>Liste des produits</h3>\n      <table id=\"mouvement_entree\" class=\"table table-striped\">\n        <thead>\n          <tr>\n            <th width=\"120\">Référence </th>\n            <th>Désignation </th>\n            <th width=\"100\">Marque</th>\n            <th width=\"130\">Qte</th>\n            <th width=\"100\">Prix Unit HT</th>\n            <th width=\"120\">Prix total</th>\n            <th width=\"50\">Action</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.quotation.quotation_details track by $index\" ng-mousedown=\"vm.showPrice = 1\" ng-mouseup=\"vm.showPrice = 0\">\n            <td>{{value.reference}}</td>\n            <td>\n              <div>\n                {{value.description}}\n                <div class=\"tooltip\">\n                  Designation : {{value.description}}<br>\n                  ref  :  {{value.reference}}<br>\n                  vanam:  {{value.sale_vanam_price}}<br>\n                  tarif:  {{value.sale_price}}<br>\n                  <span ng-if=\"vm.showPrice && app.data.user.role_id!=4\">\n                    {{value.purchase_vanam_price | number:2}}\n                  </span>\n                </div>\n              </div>\n            </td>\n            <td>{{value.brand}}</td>\n            <td><input type=\"text\" ng-model=\"value.qte\" ng-blur=\"vm.lissage(value.product_id, value.qte, 0)\" ng-keydown=\"$event.keyCode === 13 && vm.lissage(value.product_id, value.qte)\" class=\"w-xxs text-center\">/{{value.qtt}}</td>\n            <td><input type=\"text\" ng-disabled=\"app.data.user.role_id==4\" ng-model=\"value.sale_price\" ng-keyup=\"vm.calculTotal()\" class=\"w-xxs text-center\" placeholder=\"Prix U/ht\"></td>\n            <td><input type=\"text\" disabled=\"\" value=\"{{ (value.sale_price * vm.calculerStock(value.stock)) | currency }}\" class=\"w-xs  text-center\" placeholder=\"Prix total\"></td>\n            <td>\n              <div class=\"btn btn-xs btn-info\" ng-click=\"vm.openDetailsProduit(value.product_id)\" ><i class=\"fa fa-info\"></i></div>\n              <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.removeProduct( $index , 1, value.product_id)\" ><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n        <tfoot>\n          <tr>\n            <td colspan=\"4\">\n              <div class=\"row\">\n                <div class=\"col-md-5\">              \n                  <textarea class=\"form-control\" ng-model=\"vm.quotation.comment\" placeholder=\"Commentaire\"></textarea>\n                </div>\n                <div class=\"col-md-7\">\n                  <div class=\"btn btn-xs btn-default\" data-toggle=\"modal\" data-target=\"#exports\" ng-click=\"vm.search.render_type=1\">Imprimer</div>\n                  <a   class=\"btn btn-xs btn-default\" ng-click=\"vm.dupliquer(vm.quotation.id)\">Dupliquer</a>\n                  <a   class=\"btn btn-xs btn-danger\"  ng-click=\"vm.fermer()\">Fermer</a>\n                  <div class=\"btn btn-xs btn-success\" ng-disabled=\"vm.quotation.command\" ng-click=\"!vm.quotation.command && vm.transformer(vm.quotation.id)\">Transformer</div>\n                  <div class=\"btn btn-xs btn-success\" ng-click=\"vm.updateQuotation()\">Enregistrer</div>\n                </div>\n              </div>\n            </td>\n            <td colspan=\"3\">\n              <div class=\"row\">\n                <div class=\"col-md-4\">Personne</div>\n                <div class=\"col-md-8\">{{ vm.quotation.user_name }}</div>\n                <div class=\"col-md-4\">Monnaie</div>\n                <div class=\"col-md-8\">\n                  <select class=\"form-control\" ng-model=\"vm.quotation.change_id\" required=\"\" ng-init=\"vm.getDevises(); vm.quotation.change_id = \'1\'\">\n                    <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.devises track by $index\">{{ value.name }} </option>\n                  </select>\n                </div>\n              </div>\n            </td>\n          </tr>\n          \n           \n        </tfoot>\n      </table>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"exports\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Export</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div class=\"m-b m-l-lg m-r-lg\">\n            <div class=\"checkbox\" ng-if=\"vm.search.render_type == 1\" ng-init=\"vm.search.header=1\">\n              <input id=\"checkbox1\" ng-model=\"vm.search.header\" ng-true-value=\"1\" ng-false-value=\"0\" checked=\"\" type=\"checkbox\">\n              <label for=\"checkbox1\">Entete</label>\n            </div> \n            <div class=\"checkbox\" ng-init=\"vm.search.is_images=1\">\n              <input id=\"checkbox1\" ng-model=\"vm.search.is_images\" ng-true-value=\"1\" ng-false-value=\"0\" checked=\"\" type=\"checkbox\">\n              <label for=\"checkbox1\">Images</label>\n            </div> \n            <div class=\"checkbox\" ng-init=\"vm.search.vanam_price=1\">\n              <input id=\"checkbox5\" ng-model=\"vm.search.vanam_price\" type=\"checkbox\" ng-true-value=\"1\" ng-false-value=\"0\">\n              <label for=\"checkbox5\">Prix vente Vanam</label>\n            </div>\n            <label style=\"margin-left: -20px;\" ng-init=\"vm.search.format_stock=\'1\'\">\n              Type d’affichage des tailles\n            </label>\n            <div class=\"radio\">\n              <input id=\"radio1\" name=\"tailles\" type=\"radio\" ng-model=\"vm.search.format_stock\" value=\"1\">\n              <label for=\"radio1\" style=\"padding-left: 21px; font-weight: bold;\">Tailles dans X colonnes</label>\n            </div>\n            <div class=\"radio\">\n              <input id=\"radio2\" name=\"tailles\" type=\"radio\" ng-model=\"vm.search.format_stock\" value=\"2\">\n              <label for=\"radio2\" style=\"padding-left: 21px; font-weight: bold;\">Tailles dans une colonnes</label>\n            </div>  \n            <div class=\"text-center m-b-md\" ng-init=\"vm.search.render_type=1\">\n              <button type=\"button\" ng-disabled=\"vm.search.render_type==1\" ng-class=\"{\'btn-success\': vm.search.render_type==1}\" ng-click=\"vm.search.render_type=1\" class=\"btn btn-default waves-effect m-r\"><i class=\"fa fa-file-pdf-o\"></i> PDF</button>\n              <button type=\"button\" ng-disabled=\"vm.search.render_type==2\" ng-class=\"{\'btn-success\': vm.search.render_type==2}\" ng-click=\"vm.search.render_type=2\" class=\"btn btn-default waves-effect\"><i class=\"fa fa-file-excel-o\"></i> EXCEL</button>\n            </div>\n            <div class=\"text-center\">\n              <div class=\"btn btn-sm btn-success\" ng-click=\"vm.imprimer(vm.search)\"> Générer </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"lissage\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Lissage</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/devis/lissage.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"ajoutStock\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Stock</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/devis/stock.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<script type=\"text/ng-template\" id=\"detailsProduit.html\">\n  <div class=\"detailsProduitModal\" data-ng-include=\" \'modules/produits/details.html\' \"></div>\n</script>\n");
            $templateCache.put("modules/devis/index.html", "<div class=\"row\" ng-init=\"vm.getMarques();\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Liste des Devis</h4>\n      <div class=\"pull-right\">\n        <a class=\"btn btn-primary btn-sm waves-effect waves-light\" ui-sref=\"app.devis.add\" ng-click=\"vm.quotation = {}; vm.total=0\">Ajouter devis</a>\n      </div>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"card-box no-padder\">\n  <form class=\"wrapper-sm\" ng-submit=\"vm.getQuotations(vm.filter)\">\n      <div class=\"row\">\n        <div class=\"col-md-3\">\n          <div class=\"form-group\">\n            <input type=\"text\" class=\"form-control\" ng-model=\"vm.filter.num_quotation\" placeholder=\" \">\n            <label>N° Devis</label>\n          </div>\n        </div>\n        <div class=\"col-md-3\">\n          <div class=\"form-group\">\n            <input type=\"text\" class=\"form-control\"  ng-model=\"vm.filter.creator\" placeholder=\" \">\n            <label>Créateur de devis</label>\n          </div>\n        </div>\n        <div class=\"col-md-4\" ng-if=\"app.data.user.role_id != 4\">\n          <div class=\"form-group\">\n            <input type=\"text\" class=\"form-control\" ng-disabled=\"app.data.user.role_id == 4\" ng-model=\"vm.filter.company\"  placeholder=\" \">\n            <label>Société</label>\n          </div>\n        </div>\n        <div class=\"col-md-2\">\n          <button class=\"btn btn-sm btn-success m-t-xs\">Trouver</button>\n        </div>\n      </div>\n  </form>\n</div>\n \n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <h6 class=\"text-center\">{{vm.quotations.length}} devis trouvés</h6>\n      <table id=\"liste_devis\" class=\"table table-striped\" ng-init=\"vm.getQuotations()\">\n        <thead>\n          <tr>\n            <th width=\"70\">N° Devis </th>\n            <th>N° Client </th>\n            <th>Societe</th>\n            <th width=\"140\">Date</th>\n            <th>Utilisateur</th>\n            <th width=\"80\">Total</th>\n            <th width=\"180\">Action</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.quotations track by $index\">\n            <th align=\"center\">{{value.id}} </th>\n            <th>{{value.client_id}} </th>\n            <th>{{value.company_name}}</th>\n            <th>{{value.creation_date | moment:\'DD MMMM YYYY\' }}</th>\n            <th>{{value.user_name}}</th>\n            <th>{{value.total | currency }}</th>\n            <th class=\"text-right\">\n              <a ui-sref=\"app.devis.details({id: value.id})\" class=\"btn btn-xs btn-info\"><i class=\"fa fa-pencil\"></i></a>\n              <div ng-if=\"app.data.user.role_id != 4\" class=\"btn btn-xs btn-success\" ng-if=\"app.data.user.role_id != 4 && value.command_id==null\" ng-click=\"vm.transformer(value.id)\" title=\"Transformer\"><i class=\"fa fa-check\"></i></div>\n              <div data-toggle=\"modal\" data-target=\"#exports\" ng-click=\"vm.print_id = value.id; vm.search.render_type=2\" class=\"btn btn-xs btn-default\"><i class=\"fa fa-file-excel-o\"></i></div>\n              <div data-toggle=\"modal\" data-target=\"#exports\" ng-click=\"vm.print_id = value.id; vm.search.render_type=1\" class=\"btn btn-xs btn-default\"><i class=\"fa fa-print\"></i></div>\n              <div ng-if=\"app.data.user.role_id != 4\" class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteDevis( value.id )\"><i class=\"fa fa-trash\"></i></div>\n            </th>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"modal fade\" id=\"ajoutStock\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Ajout stock</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/mouvements/stock.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"modal fade\" id=\"exports\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Export</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div class=\"m-b m-l-lg m-r-lg\">\n            <div class=\"checkbox\" ng-if=\"vm.search.render_type == 1\" ng-init=\"vm.search.header=1\">\n              <input id=\"checkbox1\" ng-model=\"vm.search.header\" ng-true-value=\"1\" ng-false-value=\"0\" checked=\"\" type=\"checkbox\">\n              <label for=\"checkbox1\">Entete</label>\n            </div> \n            <div class=\"checkbox\" ng-init=\"vm.search.is_images=1\">\n              <input id=\"checkbox1\" ng-model=\"vm.search.is_images\" ng-true-value=\"1\" ng-false-value=\"0\" checked=\"\" type=\"checkbox\">\n              <label for=\"checkbox1\">Images</label>\n            </div> \n            <div class=\"checkbox\" ng-init=\"vm.search.vanam_price=1\">\n              <input id=\"checkbox5\" ng-model=\"vm.search.vanam_price\" type=\"checkbox\" ng-true-value=\"1\" ng-false-value=\"0\">\n              <label for=\"checkbox5\">Prix vente Vanam</label>\n            </div>\n            <label style=\"margin-left: -20px;\" ng-init=\"vm.search.format_stock=\'1\'\">\n              Type d’affichage des tailles\n            </label>\n            <div class=\"radio\">\n              <input id=\"radio1\" name=\"tailles\" type=\"radio\" ng-model=\"vm.search.format_stock\" value=\"1\">\n              <label for=\"radio1\" style=\"padding-left: 21px; font-weight: bold;\">Tailles dans X colonnes</label>\n            </div>\n            <div class=\"radio\">\n              <input id=\"radio2\" name=\"tailles\" type=\"radio\" ng-model=\"vm.search.format_stock\" value=\"2\">\n              <label for=\"radio2\" style=\"padding-left: 21px; font-weight: bold;\">Tailles dans une colonnes</label>\n            </div>  \n            <!-- <div class=\"text-center m-b-md\" ng-init=\"vm.search.render_type=1\">\n              <button type=\"button\" ng-disabled=\"vm.search.render_type==1\" ng-class=\"{\'btn-success\': vm.search.render_type==1}\" ng-click=\"vm.search.render_type=1\" class=\"btn btn-default waves-effect m-r\"><i class=\"fa fa-file-pdf-o\"></i> PDF</button>\n              <button type=\"button\" ng-disabled=\"vm.search.render_type==2\" ng-class=\"{\'btn-success\': vm.search.render_type==2}\" ng-click=\"vm.search.render_type=2\" class=\"btn btn-default waves-effect\"><i class=\"fa fa-file-excel-o\"></i> EXCEL</button>\n            </div> -->\n            <div class=\"text-center\">\n              <div class=\"btn btn-sm btn-success\" ng-click=\"vm.imprimer(vm.search)\"> Générer </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n\n\n\n\n<script type=\"text/ng-template\" id=\"addProduct.html\">\n  <div class=\"addProductModal\" data-ng-include=\" \'modules/produits/add.html\' \"></div>\n</script>");
            $templateCache.put("modules/devis/lissage.html", "<div>\n  <div class=\"stock-box\" \n       ng-class=\"{\'bg-danger\':value.value>value.qtr}\" \n       ng-repeat=\"(key, value) in vm.selected.stock track by $index\">\n    <div class=\"pointure\">{{ value.name }}</div>\n    <div class=\"reel\">\n      <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ !vm.lissages?value.qtr:\'0\' }}</span>\n    </div>\n    <div class=\"aterme\">\n      <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ !vm.lissages?value.qtt:\'0\' }}</span>\n    </div>\n    <div class=\"nouveau\">\n      <input type=\"text\" ng-keydown=\"$event.keyCode === 13 && vm.closeModalLissage()\" value=\"0\" min=\"0\" ng-model=\"value.value\" ng-change=\"value.value<=value.qtr?vm.calculTotal():null\">\n      \n    </div>\n  </div>\n  <div class=\"text-right\">\n    <div class=\"stock-box somme\">\n      <div class=\"reel\" style=\"width: 100%\">\n        <b>Stock dispo</b> {{vm.somme_stock}}\n      </div>\n    </div>\n  </div>\n\n  <div class=\"text-right m-b-xs m-r-xs\">\n    <button autofocus=\"\" class=\"btn btn-success btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Valider</button>\n    <div class=\"btn btn-danger btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Fermer</div>\n  </div>\n</div>");
            $templateCache.put("modules/devis/stock.html", "<div class=\"stock-box\" ng-repeat=\"(key, value) in vm.selected.stock track by $index\">\n  <div class=\"pointure\">{{ value.range_detail_id }}</div>\n  <div class=\"reel\">\n    <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ !vm.lissages?value.qtr:\'0\' }}</span>\n  </div>\n  <div class=\"aterme\">\n    <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ !vm.lissages?value.qtt:\'0\' }}</span>\n  </div>\n  <div class=\"nouveau\">\n    <input type=\"text\" value=\"0\" min=\"0\" ng-model=\"value.value\" ng-keyup=\"vm.calculTotal()\">\n  </div>\n</div>\n<div class=\"text-right\">\n  <div class=\"stock-box somme\">\n    <div class=\"reel\" style=\"width: 100%\">\n      <b>Stock dispo</b> {{ vm.calculerStock(vm.selected.stock)+vm.produit.qtr }}\n    </div>\n  </div>\n</div>\n\n<div class=\"text-right m-b-xs m-r-xs\">\n  <div class=\"btn btn-success btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Valider</div>\n  <div class=\"btn btn-danger btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Fermer</div>\n</div>");
            $templateCache.put("modules/devises/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Devise</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"card-box w-xxl no-padder\">\n  <form class=\"row wrapper-sm\" ng-submit=\"vm.addDevise();\">\n    <div class=\"col-md-9\">\n      <div class=\"form-group m-n\">\n        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.devise.name\" required=\"\">\n        <label>Devise</label>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <button type=\"submit\" class=\"btn btn-success\">Ajouter</button>\n    </div>\n  </form>\n</div>\n<div class=\"card-box table-responsive\">\n  <table id=\"genres\" class=\"table table-striped\" ng-init=\"vm.getDevises()\">\n    <thead>\n      <tr>\n        <th>Nom</th>\n        <th width=\"90\">Actions</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr ng-repeat=\"(key, value) in vm.devises track by $index\">\n        <td>\n          <span ng-hide=\"edit\">{{ value.name }}</span>\n          <input ng-show=\"edit\" type=\"text\" ng-model=\"value.name\" ng-keydown=\"$event.keyCode === 13 && vm.updateDevise(value)\" class=\"form-control\">\n        </td>\n        <td>\n          <div class=\"btn btn-xs btn-info\" ng-hide=\"edit\" ng-click=\"edit=true\"><i class=\"fa fa-pencil\"></i></div>\n          <div class=\"btn btn-xs btn-success\" ng-click=\"vm.updateDevise(value); edit=false;\" ng-show=\"edit\" ng-click=\"edit=false\"><i class=\"fa fa-check\"></i></div>\n          <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteDevise(value.id)\"><i class=\"fa fa-trash\"></i></div>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n</div>");
            $templateCache.put("modules/factures/add.html", "<div class=\"row\" ng-init=\"vm.command={}; vm.command.command_details = []\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Nouvelle Commande</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"card-box no-padder\">\n  <form class=\"wrapper-sm\"  ng-init=\"vm.getClients(\'\')\">\n    <div class=\"row\">\n      <div class=\"col-md-6\">\n        <div class=\"form-group m-n\">\n          <angucomplete-alt \n                placeholder=\"Choisir un client...\"\n                pause=\"100\"\n                selected-object=\"vm.command.client\"\n                local-data=\"vm.clients\"\n                search-fields=\"company_name\"\n                title-field=\"company_name\"\n                match-class=\"highlight\"\n                minlength=\"3\"\n                text-no-results=\"Aucun client\"\n                template-url=\"custom-template.html\"\n                input-class=\"form-control w-full\"/>\n        </div>\n        <h4>{{ vm.command.client.originalObject.company_name }}  </h4>\n        <h5 ng-if=\"vm.command.originalObject.client.contact_tel_line\">Tél : {{ vm.command.originalObject.client.contact_tel_line }} </h5>\n        <h5 ng-if=\"vm.command.client.originalObject.contact_email\">{{ vm.command.client.originalObject.contact_email }} </h5>\n        <h5>{{ vm.command.client.originalObject.address }} </h5>\n        <h6>{{ vm.command.client.originalObject.city }} {{ vm.command.client.originalObject.postal_code }} </h6>\n      </div>\n      <div class=\"col-md-6\">\n        <div class=\"form-group m-n\" ng-init=\"vm.getProduits()\">\n          <input type=\"text\" readonly=\"\" placeholder=\"Chargement des produits...\" class=\"form-control w-full\" ng-if=\"!vm.produits\">\n          <angucomplete-alt \n                placeholder=\"Choisir un article...\"\n                pause=\"100\"\n                selected-object=\"vm.selectedProduct\"\n                local-data=\"vm.produits\"\n                search-fields=\"reference\"\n                title-field=\"reference\"\n                match-class=\"highlight\"\n                minlength=\"3\"\n                clear-selected=\"true\"\n                text-no-results=\"Aucun produit\"\n                template-url=\"custom-template-produit.html\"\n                input-class=\"form-control w-full\"/>\n        </div>\n        <div class=\"form-group b b-light wrapper-xs m-t-xs\">\n          <h3 class=\"text-2x\">Total\n            <div class=\"pull-right\">{{ vm.total| currency }}</div>\n          </h3>\n        </div>\n      </div>\n    </div>\n  </form>\n</div>\n\n<script type=\"text/ng-template\" id=\"custom-template-produit.html\">\n  <div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n    <input ng-model=\"searchStr\"\n      ng-disabled=\"disableInput\"\n      type=\"text\"\n      placeholder=\"{{placeholder}}\"\n      ng-focus=\"onFocusHandler()\"\n      class=\"{{inputClass}}\"\n      ng-focus=\"resetHideResults()\"\n      ng-blur=\"hideResults($event)\"\n      autocapitalize=\"off\"\n      autocorrect=\"off\"\n      autocomplete=\"off\"\n      ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n    <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n      <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n      <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n      <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n        <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n          <div class=\"row\">\n            <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n              <img ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n            </div>\n            <div class=\"col-md-10\">\n              <h4 ng-bind-html=\"result.title\"></h4>\n              <p>{{result.originalObject.description}}</p>\n            </div>\n             \n          </div>\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"!matchClass\">\n          {{ result.title }}\n        </div>\n        <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n        <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n      </div>\n      \n    </div>\n  </div>\n</script>\n\n<script type=\"text/ng-template\" id=\"custom-template.html\">\n  <div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n    <input ng-model=\"searchStr\"\n      ng-disabled=\"disableInput\"\n      type=\"text\"\n      placeholder=\"{{placeholder}}\"\n      ng-focus=\"onFocusHandler()\"\n      class=\"{{inputClass}}\"\n      ng-focus=\"resetHideResults()\"\n      ng-blur=\"hideResults($event)\"\n      autocapitalize=\"off\"\n      autocorrect=\"off\"\n      autocomplete=\"off\"\n      ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n    <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n      <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n      <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n      <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n        <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n          <div class=\"row\">\n            <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n              <img ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n            </div>\n            <div class=\"col-md-10\">\n              <h4 ng-bind-html=\"result.title\"></h4>\n              <p>{{result.originalObject.description}}</p>\n            </div>\n          </div>\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"!matchClass\">{{ result.title }}</div>\n        <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n        <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n      </div>\n      \n    </div>\n  </div>\n</script>\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box\">\n      <div class=\"row\">\n        <!-- <div class=\"col-md-4\">\n          <div class=\"form-group\">\n            <input type=\"text\" style=\"width: 100%\" ng-model=\"vm.command.transport_address\" placeholder=\" \">\n            <label>Addresse transport</label>\n          </div>\n        </div> -->\n        <div class=\"col-md-2\">\n          <div class=\"form-group\">\n            <input type=\"text\" style=\"width: 100%\" ng-model=\"vm.command.transport_amount\" placeholder=\" \">\n            <label>Frais transport</label>\n          </div>\n        </div>\n        <div class=\"col-md-2 text-center\">\n          Exonération TVA \n          <div>\n            <input type=\"checkbox\" id=\"switch_tva\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.command.tva_exoneration\" switch=\"bool\">\n            <label for=\"switch_tva\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n          </div>\n        </div>\n        <div class=\"col-md-2 text-center\">\n          Facture PDF  \n          <div>\n            <input type=\"checkbox\" id=\"switch_pdf\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.command.is_invoice_pdf\" switch=\"bool\">\n            <label for=\"switch_pdf\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n          </div>\n        </div>\n        <div class=\"col-md-2 text-center\">\n          Facture EXCEL \n          <div>\n            <input type=\"checkbox\" id=\"switch_excel\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.command.is_invoice_excel\" switch=\"bool\">\n            <label for=\"switch_excel\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <h3>Liste des produits</h3>\n      <table id=\"mouvement_entree\" class=\"table table-striped\">\n        <thead>\n          <tr>\n            <th width=\"120\">Référence </th>\n            <th>Désignation </th>\n            <th width=\"100\">Categorie</th>\n            <th width=\"100\">Marque</th>\n            <th width=\"130\">Qte</th>\n            <th width=\"100\">Prix Unit HT</th>\n            <th width=\"80\">Prix total</th>\n            <th width=\"50\">Action</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.command.command_details track by $index\" title=\"rate price : {{value.sale_rate_public}}  vanam price : {{value.sale_vanam_price}}\">\n            <td>{{value.reference}}</td>\n            <td>{{value.description}}</td>\n            <td>{{value.category}}</td>\n            <td>{{value.brand}}</td>\n            <td><input type=\"number\" min=\"0\" max=\"{{ value.qtt }}\" ng-model=\"value.qte\" ng-blur=\"vm.lissage(value.id, value.qte,0)\" ng-keydown=\"$event.keyCode === 13 && vm.lissage(value.id, value.qte)\" class=\"w-xxs\" >/{{value.qtt}}</td>\n            <td><input type=\"number\" min=\"0\" ng-model=\"value.sale_price\" ng-keyup=\"vm.calculTotal()\" class=\"w-xxs\" placeholder=\"Prix U/ht\"></td>\n            <td><input type=\"text\" disabled=\"\" value=\"{{ value.sale_price * vm.calculerStock(value.stock) }}\" class=\"w-xxs\" placeholder=\"Prix total\"></td>\n            <td>\n              <div class=\"btn btn-xs btn-info\" data-toggle=\"modal\" data-target=\"#ajoutStock\" ng-click=\"vm.selected=value\" ><i class=\"fa fa-info\"></i></div>\n              <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.removeProduct( $index )\" ><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n        <tfoot>\n          <tr>\n            <td colspan=\"2\">\n              <div class=\"row\">\n                <div class=\"col-md-8\">\n                  <textarea class=\"form-control\" ng-model=\"vm.command.comment\" placeholder=\"Commentaire\"></textarea>    \n                </div>\n                <div class=\"col-md-4\">\n                  <a ng-click=\"vm.fermer()\" class=\"btn btn-sm btn-danger\">Fermer</a>\n                  <div class=\"btn btn-sm btn-success\" ng-click=\"vm.addCommand()\">Enregistrer</div> \n                </div>\n              </div>\n              \n            </td>\n            <td colspan=\"3\">\n              <div class=\"row\">\n                <div class=\"col-md-4\">Personne</div>\n                <div class=\"col-md-8\">{{app.data.user.firstname }} {{app.data.user.name }}</div>\n                <div class=\"col-md-4\"><label class=\"m-t\">Monnaie</label></div>\n                <div class=\"col-md-8\">\n                  <select class=\"form-control\" ng-model=\"vm.command.change_id\" required=\"\" ng-init=\"vm.getDevises(); vm.command.change_id = \'1\'\">\n                    <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.devises track by $index\">{{ value.name }} </option>\n                  </select>\n                </div>  \n              </div>  \n              <div class=\"row\">\n                <div class=\"col-md-4\"><label class=\"m-t\">Statut</label></div>\n                <div class=\"col-md-8\">\n                  <select class=\"form-control\" ng-model=\"vm.command.status\">\n                    <option value=\"RESERVED\">Réservé</option>\n                    <option value=\"TO_PREPARE\">À préparer</option>\n                    <option value=\"PREPARED\">Prêt</option>\n                    <option value=\"READY_TO_SENT\">Prêt expédiable</option>\n                    <option value=\"READY_NOT_TO_SENT\">Prêt non expédiable</option>\n                    <option value=\"SENT\">Expédié</option>\n                  </select>\n                </div>  \n              </div>\n            </td>\n          </tr>\n        </tfoot>\n      </table>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"lissage\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Lissage</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/commandes/lissage.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"modal fade\" id=\"ajoutStock\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Stock</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/commandes/stock.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>");
            $templateCache.put("modules/factures/details.html", "<div class=\"row\" ng-init=\"vm.getMarques(); vm.getInvoice()\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Détails facture</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"card-box no-padder\">\n  <form class=\"wrapper-sm\"  ng-init=\"vm.getClients(\'\')\">\n    <div class=\"row\">\n      <div class=\"col-md-6\">\n        <div class=\"form-group m-n\">\n          <angucomplete-alt \n                placeholder=\"Choisir un client...\"\n                pause=\"100\"\n                selected-object=\"vm.invoice.client\"\n                local-data=\"vm.clients\"\n                search-fields=\"company_name\"\n                title-field=\"company_name\"\n                match-class=\"highlight\"\n                minlength=\"3\"\n                text-no-results=\"Aucun client\"\n                template-url=\"custom-template.html\"\n                input-class=\"form-control w-full\"/>\n        </div>\n        <h4>{{ vm.invoice.client.company_name || vm.invoice.client.description.company_name }}  </h4>\n        <h5>Tél : {{ vm.invoice.client.contact_tel_line || vm.invoice.client.description.contact_tel_line }} </h5>\n        <h5>{{ vm.invoice.client.contact_email || vm.invoice.client.description.contact_email }} </h5>\n        <h5>{{ vm.invoice.client.address }} </h5>\n        <h6>{{ vm.invoice.client.city }} {{ vm.invoice.client.postal_code }} </h6>\n      </div>\n\n      <div class=\"col-md-6\">\n        <div class=\"form-group m-n\" ng-init=\"vm.getProduits()\">\n          <input type=\"text\" readonly=\"\" placeholder=\"Chargement des produits...\" class=\"form-control w-full\" ng-if=\"!vm.produits\">\n          <angucomplete-alt \n                placeholder=\"Choisir un article...\"\n                pause=\"100\"\n                selected-object=\"vm.selectedProduct\"\n                local-data=\"vm.produits\"\n                search-fields=\"reference\"\n                title-field=\"reference\"\n                match-class=\"highlight\"\n                minlength=\"3\"\n                text-no-results=\"Aucun produit\"\n                template-url=\"custom-template-produit.html\"\n                input-class=\"form-control w-full\"/>\n        </div>\n        <div class=\"form-group b b-light wrapper-xs m-t-xs\">\n          <h3 class=\"text-2x\">Total\n            <div class=\"pull-right\">{{ vm.total | currency }}</div>\n          </h3>\n        </div>\n      </div>\n    </div>\n  </form>\n</div>\n\n<script type=\"text/ng-template\" id=\"custom-template-produit.html\">\n  <div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n    <input ng-model=\"searchStr\"\n      ng-disabled=\"disableInput\"\n      type=\"text\"\n      placeholder=\"{{placeholder}}\"\n      ng-focus=\"onFocusHandler()\"\n      class=\"{{inputClass}}\"\n      ng-focus=\"resetHideResults()\"\n      ng-blur=\"hideResults($event)\"\n      autocapitalize=\"off\"\n      autocorrect=\"off\"\n      autocomplete=\"off\"\n      ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n    <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n      <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n      <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n      <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n        <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n          <div class=\"row\">\n            <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n              <img ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n            </div>\n            <div class=\"col-md-10\">\n              <h4 ng-bind-html=\"result.title\"></h4>\n              <p>{{result.originalObject.description}}</p>\n            </div>\n             \n          </div>\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"!matchClass\">\n          {{ result.title }}\n        </div>\n        <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n        <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n      </div>\n      \n    </div>\n  </div>\n</script>\n\n<script type=\"text/ng-template\" id=\"custom-template.html\">\n  <div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n    <input ng-model=\"searchStr\"\n      ng-disabled=\"disableInput\"\n      type=\"text\"\n      placeholder=\"{{placeholder}}\"\n      ng-focus=\"onFocusHandler()\"\n      class=\"{{inputClass}}\"\n      ng-focus=\"resetHideResults()\"\n      ng-blur=\"hideResults($event)\"\n      autocapitalize=\"off\"\n      autocorrect=\"off\"\n      autocomplete=\"off\"\n      ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n    <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n      <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n      <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n      <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n        <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n          <div class=\"row\">\n            <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n              <img ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n            </div>\n            <div class=\"col-md-10\">\n              <h4 ng-bind-html=\"result.title\"></h4>\n              <p>{{result.originalObject.description}}</p>\n            </div>\n          </div>\n        </div>\n        <div class=\"angucomplete-title\" ng-if=\"!matchClass\">{{ result.title }}</div>\n        <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n        <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n      </div>\n      \n    </div>\n  </div>\n</script>\n\n\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box\">\n      <div class=\"row\">\n        \n        <div class=\"col-md-2 text-center\">\n          Exonération TVA \n          <div>\n            <input type=\"checkbox\" id=\"switch_tva\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.invoice.tva_exoneration\" switch=\"bool\">\n            <label for=\"switch_tva\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n          </div>\n        </div>\n        <div class=\"col-md-2 text-center\">\n          Facture PDF  \n          <div>\n            <input type=\"checkbox\" id=\"switch_pdf\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.invoice.is_invoice_pdf\" switch=\"bool\">\n            <label for=\"switch_pdf\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n          </div>\n        </div>\n        <div class=\"col-md-2 text-center\">\n          Facture EXCEL \n          <div>\n            <input type=\"checkbox\" id=\"switch_excel\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.invoice.is_invoice_excel\" switch=\"bool\">\n            <label for=\"switch_excel\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <h3>Liste des produits</h3>\n      <table id=\"mouvement_entree\" class=\"table table-striped\">\n        <thead>\n          <tr>\n            <th width=\"120\">Référence </th>\n            <th>Désignation </th>\n            <th width=\"100\">Marque</th>\n            <th width=\"130\">Qte</th>\n            <th width=\"100\">Prix Unit HT</th>\n            <th width=\"80\">Prix total</th>\n            <th width=\"50\">Action</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.invoice.invoice_details track by $index\">\n            <td>{{value.reference}}</td>\n            <td>{{value.description}}</td>\n            <td>{{value.brand}}</td>\n            <td><input type=\"number\" min=\"0\" max=\"{{ value.qtt }}\" ng-model=\"value.qte\" ng-blur=\"vm.lissage(value.product_id, value.qte, 0)\" ng-keydown=\"$event.keyCode === 13 && vm.lissage(value.product_id, value.qte)\" class=\"w-xxs  text-center\">/{{value.qtt}}</td>\n            <td><input type=\"text\" ng-model=\"value.sale_price\" class=\"w-xxs text-center\" placeholder=\"Prix U/ht\"></td>\n            <td><input type=\"text\" disabled=\"\" value=\"{{ value.sale_price * vm.calculerStock(value.stock) }}\" class=\"w-xxs  text-center\" placeholder=\"Prix total\"></td>\n            <td>\n              <div class=\"btn btn-xs btn-info\" ng-click=\"vm.openDetailsProduit(value.product_id)\" ><i class=\"fa fa-info\"></i></div>\n              <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.removeProduct( $index )\" ><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n        <tfoot>\n          <tr>\n            <td colspan=\"4\">\n              <div class=\"row\">\n                <div class=\"col-md-5\">              \n                  <textarea class=\"form-control\" ng-model=\"vm.invoice.comment\" placeholder=\"Commentaire\"></textarea>\n                </div>\n                <div class=\"col-md-7\">\n                  <div class=\"btn btn-xs btn-default\" data-toggle=\"modal\" data-target=\"#exports\" ng-click=\"vm.search.render_type=1\">Imprimer</div>\n                  <a ng-click=\"vm.fermer()\" class=\"btn btn-xs btn-danger\">Fermer</a>\n                  <div class=\"btn btn-xs btn-success\" ng-click=\"vm.updateInvoice()\">Enregistrer</div>\n                </div>\n              </div>\n            </td>\n            <td colspan=\"3\">\n              <div class=\"row\">\n                <div class=\"col-md-4\">Personne</div>\n                <div class=\"col-md-8\">{{ vm.invoice.user_name }}</div>\n                <div class=\"col-md-4\">Monnaie</div>\n                <div class=\"col-md-8\">\n                  <select class=\"form-control\" ng-model=\"vm.invoice.change_id\" required=\"\" ng-init=\"vm.getDevises(); vm.invoice.change_id = \'1\'\">\n                    <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.devises track by $index\">{{ value.name }} </option>\n                  </select>\n                </div>\n                <div class=\"col-md-4\"><label class=\"m-t\">Statut</label></div>\n                <div class=\"col-md-8\">\n                  <select class=\"form-control\" ng-model=\"vm.invoice.status\">\n                    <option value=\"RESERVED\">Réservé</option>\n                    <option value=\"TO_PREPARE\">À préparer</option>\n                    <option value=\"PREPARED\">Prêt</option>\n                    <option value=\"READY_TO_SENT\">Prêt expédiable</option>\n                    <option value=\"READY_NOT_TO_SENT\">Prêt non expédiable</option>\n                    <option value=\"SENT\">Expédié</option>\n                  </select>\n                </div>  \n              </div>\n            </td>\n          </tr> \n        </tfoot>\n      </table>\n    </div>\n\n    <div class=\"card-box\">\n      <input type=\"file\" name=\"file\" class=\"hidden\" >\n      <div class=\"pull-right btn btn-sm btn-info btn-add-file\"> <i class=\"fa fa-plus\"></i> Ajouter un nouveau document</div>\n      <h3 class=\"inline\">Liste des fichiers</h3>\n      <table class=\"table table-striped\">\n        <thead>\n          <tr>\n            <th>Fichier</th>\n            <th width=\"70\">Actions</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.invoice.files\">\n            <td>\n              {{value.name}}\n            </td>\n            <td>\n              <a class=\"btn btn-xs btn-success\" download=\"{{value.name}}\" href=\"{{vm.url+value.url+value.name}}\"><i class=\"fa fa-eye\"></i></a>\n              <div  ng-if=\"app.data.user.role_id != 4\" class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteFile(value.id)\"><i class=\"fa fa-trash\"></i></div>\n            </td> \n          </tr>\n        </tbody>\n      </table>\n      <p ng-if=\"vm.invoice.files.length==0\" class=\"text-center\">Aucun fichier(s) trouvé(s)</p>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"exports\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Export</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div class=\"m-b m-l-lg m-r-lg\">\n            <div class=\"checkbox\" ng-if=\"vm.search.render_type == 1\" ng-init=\"vm.search.header=1\">\n              <input id=\"checkbox1\" ng-model=\"vm.search.header\" ng-true-value=\"1\" ng-false-value=\"0\" checked=\"\" type=\"checkbox\">\n              <label for=\"checkbox1\">Entete</label>\n            </div> \n            <div class=\"checkbox\" ng-init=\"vm.search.is_images=1\">\n              <input id=\"checkbox1\" ng-model=\"vm.search.is_images\" ng-true-value=\"1\" ng-false-value=\"0\" checked=\"\" type=\"checkbox\">\n              <label for=\"checkbox1\">Images</label>\n            </div> \n            <div class=\"checkbox\" ng-init=\"vm.search.vanam_price=1\">\n              <input id=\"checkbox5\" ng-model=\"vm.search.vanam_price\" type=\"checkbox\" ng-true-value=\"1\" ng-false-value=\"0\">\n              <label for=\"checkbox5\">Prix vente Vanam</label>\n            </div>\n            <label style=\"margin-left: -20px;\" ng-init=\"vm.search.format_stock=\'1\'\">\n              Type d’affichage des tailles\n            </label>\n            <div class=\"radio\">\n              <input id=\"radio1\" name=\"tailles\" type=\"radio\" ng-model=\"vm.search.format_stock\" value=\"1\">\n              <label for=\"radio1\" style=\"padding-left: 21px; font-weight: bold;\">Tailles dans X colonnes</label>\n            </div>\n            <div class=\"radio\">\n              <input id=\"radio2\" name=\"tailles\" type=\"radio\" ng-model=\"vm.search.format_stock\" value=\"2\">\n              <label for=\"radio2\" style=\"padding-left: 21px; font-weight: bold;\">Tailles dans une colonnes</label>\n            </div>  \n            <div class=\"text-center m-b-md\" ng-init=\"vm.search.render_type=1\">\n              <button type=\"button\" ng-disabled=\"vm.search.render_type==1\" ng-class=\"{\'btn-success\': vm.search.render_type==1}\" ng-click=\"vm.search.render_type=1\" class=\"btn btn-default waves-effect m-r\"><i class=\"fa fa-file-pdf-o\"></i> PDF</button>\n              <button type=\"button\" ng-disabled=\"vm.search.render_type==2\" ng-class=\"{\'btn-success\': vm.search.render_type==2}\" ng-click=\"vm.search.render_type=2\" class=\"btn btn-default waves-effect\"><i class=\"fa fa-file-excel-o\"></i> EXCEL</button>\n            </div>\n            <div class=\"text-center\">\n              <div class=\"btn btn-sm btn-success\" ng-click=\"vm.imprimer(vm.search)\"> Générer </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"lissage\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Lissage</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/invoicees/lissage.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"ajoutStock\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Stock</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/invoicees/stock.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<script type=\"text/ng-template\" id=\"detailsProduit.html\">\n  <div class=\"detailsProduitModal\" data-ng-include=\" \'modules/produits/details.html\' \"></div>\n</script>\n");
            $templateCache.put("modules/factures/index.html", "<div class=\"row\" ng-init=\"vm.totalHt=0; vm.totalTva=0;\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Liste des factures</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"card-box no-padder\">\n  <form class=\"wrapper-sm\" ng-submit=\"vm.getInvoices(vm.filter)\">\n      <div class=\"row\">\n        <div class=\"col-md-3\">\n          <div class=\"form-group\">\n            <input type=\"text\" class=\"form-control\" ng-model=\"vm.filter.num_invoice\" placeholder=\" \">\n            <label>N° Facture</label>\n          </div>\n        </div>\n        <div class=\"col-md-3\" ng-if=\"app.data.user.role_id != 4\">\n          <div class=\"form-group\">\n            <input type=\"text\" class=\"form-control\"  ng-model=\"vm.filter.client\" placeholder=\" \">\n            <label>Client</label>\n          </div>\n        </div>\n        <div class=\"col-md-2\">\n          <div class=\"form-group\">\n            <input type=\"date\" class=\"form-control\" ng-model=\"vm.filter.start_date\"  placeholder=\" \">\n            <label>Date début</label>\n          </div>\n        </div>\n        <div class=\"col-md-2\">\n          <div class=\"form-group\">\n            <input type=\"date\" class=\"form-control\" ng-model=\"vm.filter.end_date\"  placeholder=\" \">\n            <label>Date fin</label>\n          </div>\n        </div>\n        <div class=\"col-md-2\">\n          <button class=\"btn btn-sm btn-success m-t-xs\">Trouver</button>\n        </div>\n\n      </div>\n  </form>\n</div>\n \n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <h6 class=\"text-center\">{{vm.invoices.length}} facture(s) trouvée(s)</h6>\n      <table id=\"liste_factures\" class=\"table table-striped\" ng-init=\"vm.getInvoices()\">\n        <thead>\n          <tr>\n            <th width=\"100\">N° Facture </th>\n            <th>Societe </th>\n            <th width=\"140\">Date</th>\n            <th width=\"120\">HT</th>\n            <th width=\"120\">TVA</th>\n            <th width=\"120\">TTC</th>\n            <th width=\"150\" class=\"text-right\">Action</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.invoices track by $index\" style=\"background: }}\">\n            <td align=\"center\">{{value.id}}</td>\n            <td>{{value.company_name}}</td>\n            <td>{{value.creation_date | moment:\'DD MMMM YYYY\' }}</td>\n            <td ng-init=\"vm.totalHt=vm.totalHt+value.total_ht*1\">{{value.total_ht |currency}}</td>\n            <td ng-init=\"vm.totalTva=vm.totalTva+value.total_tva*1\">{{value.total_tva|currency}}</td>\n            <td>{{(value.total_ht*1 + value.total_tva*1)|currency}}</td>\n            <td class=\"text-right\">\n              <div class=\"btn btn-xs btn-default\" ng-click=\"vm.print(value.command_id, 1)\" ng-if=\"value.is_invoice_pdf==\'1\'\"><i class=\"fa fa-print\"></i></div>\n              <div ng-if=\"app.data.user.role_id != 4\" class=\"btn btn-xs btn-success\" ng-click=\"vm.print(value.command_id, 2)\" ng-if=\"value.is_invoice_excel==\'1\'\"><i class=\"fa fa-file-excel-o\"></i></div>\n              <div ng-if=\"app.data.user.role_id != 4\" class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteInvoice( value.id )\"><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n        <tfoot>\n          <tr>\n            <td colspan=\"3\"></td>\n            <td>{{vm.totalHt | currency}}</td>\n            <td>{{vm.totalTva | currency}}</td>\n            <td>{{vm.totalHt + vm.totalTva | currency}}</td>\n            <td></td>\n          </tr>\n        </tfoot>\n      </table>\n    </div>\n  </div>\n</div>");
            $templateCache.put("modules/factures/lissage.html", "<div ng-init=\"vm.somme_stock=0\">\n  <div class=\"stock-box\" ng-class=\"{\'bg-danger\':value.value>value.qtr}\" ng-init=\"vm.somme_stock=vm.somme_stock+value.qtr*1\"  ng-repeat=\"(key, value) in vm.selected.stock track by $index\">\n\n    <div class=\"pointure\">{{ value.name }}</div>\n    <div class=\"reel\">\n      <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ !vm.lissages?value.qtr:\'0\' }}</span>\n    </div>\n    <div class=\"aterme\">\n      <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ !vm.lissages?value.qtt:\'0\' }}</span>\n    </div>\n    <div class=\"nouveau\">\n      <input type=\"text\" tabindex=\"{{$index+1}}\"  ng-keydown=\"$event.keyCode === 13 && vm.closeModalLissage()\" value=\"0\" min=\"0\" ng-model=\"value.value\" ng-change=\"value.value<=value.qtr?vm.calculTotal():null\">\n    </div>\n  </div>\n  <div class=\"text-right\">\n    <div class=\"stock-box somme\">\n      <div class=\"reel\" style=\"width: 100%\">\n        <b>Stock dispo</b> {{vm.somme_stock}}\n      </div>\n    </div>\n  </div>\n\n  <div class=\"text-right m-b-xs m-r-xs\">\n    <div class=\"btn btn-success btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Valider</div>\n    <div class=\"btn btn-danger btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Fermer</div>\n  </div>\n</div>");
            $templateCache.put("modules/factures/stock.html", "<div class=\"stock-box\" ng-repeat=\"(key, value) in vm.selected.stock track by $index\">\n  <div class=\"pointure\">{{ value.range_detail_id }}</div>\n  <div class=\"reel\">\n    <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ !vm.lissages?value.qtr:\'0\' }}</span>\n  </div>\n  <div class=\"aterme\">\n    <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ !vm.lissages?value.qtt:\'0\' }}</span>\n  </div>\n  <div class=\"nouveau\">\n    <input type=\"text\" value=\"0\" min=\"0\" ng-model=\"value.value\" ng-change=\"vm.calculTotal()\">\n  </div>\n</div>\n<div class=\"text-right\">\n  <div class=\"stock-box somme\">\n    <div class=\"reel\" style=\"width: 100%\">\n      <b>Stock dispo</b> {{ vm.calculerStock(vm.selected.stock)+vm.produit.qtr }}\n    </div>\n  </div>\n</div>\n\n<div class=\"text-right m-b-xs m-r-xs\">\n  <div class=\"btn btn-success btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Valider</div>\n  <div class=\"btn btn-danger btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Fermer</div>\n</div>");
            $templateCache.put("modules/gammes/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Gamme</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n<div class=\"card-box w-xxl no-padder\">\n  <form class=\"row wrapper-sm\" ng-submit=\"vm.addGamme();\">\n    <div class=\"col-md-9\">\n      <div class=\"form-group m-n\">\n        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.gamme.name\" required=\"\">\n        <label>Gamme</label>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <button type=\"submit\" class=\"btn btn-success\">Ajouter</button>\n    </div>\n  </form>\n</div>\n<div class=\"card-box table-responsive\">\n  <table id=\"gammes\" class=\"table table-striped\" ng-init=\"vm.getGammes()\">\n    <thead>\n      <tr>\n        <th>Nom</th>\n        <th width=\"100\">Actions</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr ng-repeat=\"(key, value) in vm.gammes track by $index\">\n        <td>\n          <span ng-hide=\"edit\">{{ value.name }}</span>\n          <input ng-show=\"edit\" type=\"text\" ng-model=\"value.name\" ng-keydown=\"$event.keyCode === 13 && vm.updateGamme(value)\" class=\"form-control\">\n        </td>\n        <td>\n          <div class=\"btn btn-xs btn-info\" ng-hide=\"edit\" ng-click=\"edit=true\"><i class=\"fa fa-pencil\"></i></div>\n          <div class=\"btn btn-xs btn-success\" ng-click=\"vm.updateGamme(value); edit=false;\" ng-show=\"edit\" ng-click=\"edit=false\"><i class=\"fa fa-check\"></i></div>\n          <div class=\"btn btn-xs btn-success\" ng-click=\"vm.getDetails(value);\" data-toggle=\"modal\"   data-target=\"#detailGamme\"><i class=\"fa fa-eye\"></i></div>\n          <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteGamme(value.id)\"><i class=\"fa fa-trash\"></i></div>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n\n<div class=\"modal fade\" id=\"detailGamme\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-md\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Détails gamme</h3>\n        </div>\n        <div class=\"panel-body\">\n\n          <div class=\"card-box w-xxl no-padder\">\n            <form class=\"row wrapper-sm\" ng-submit=\"vm.addDetailsGamme();\">\n              <div class=\"col-md-9\">\n                <div class=\"form-group m-n\">\n                  <input type=\"text\" class=\"form-control\" placeholder=\"Gamme\" ng-model=\"vm.details_gamme_name\" required=\"\">\n                </div>\n              </div>\n              <div class=\"col-md-3\">\n                <button type=\"submit\" class=\"btn btn-success\">Ajouter</button>\n              </div>\n            </form>\n          </div>\n\n          <div class=\"card-box table-responsive\">\n            <table id=\"detailGammes\" class=\"table table-striped\">\n              <thead>\n                <tr>\n                  <th width=\"10\"></th>\n                  <th>Nom</th>\n                  <th width=\"100\">Actions</th>\n                </tr>\n              </thead>\n              <tbody ui-sortable=\"vm.sortableOptions\" ng-model=\"vm.range_details\">\n              <tr ng-repeat=\"(key, value) in vm.range_details | orderBy:\'rang\' track by $index\">\n                <td>\n                  <i class=\"fa fa-navicon\"></i>\n                </td>\n                <td>\n                  <span ng-hide=\"edit\">{{ value.name }}</span>\n                  <input ng-show=\"edit\" type=\"text\" ng-model=\"value.name\" ng-keydown=\"$event.keyCode === 13 && vm.updateDetailsGamme(value)\" class=\"form-control\">\n                </td>\n                <td width=\"100\">\n                  <div class=\"btn btn-xs btn-info\" ng-hide=\"edit\" ng-click=\"edit=true\"><i class=\"fa fa-pencil\"></i></div>\n                  <div class=\"btn btn-xs btn-success\" ng-click=\"vm.updateDetailsGamme(value); edit=false;\" ng-show=\"edit\" ng-click=\"edit=false\"><i class=\"fa fa-check\"></i></div>\n                  <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteDetailsGamme(value.id)\"><i class=\"fa fa-trash\"></i></div>\n                </td>\n              </tr>\n              </tbody>\n            </table>\n          </div>\n\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
            $templateCache.put("modules/genres/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Genre</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"card-box w-xxl no-padder\">\n  <form class=\"row wrapper-sm\" ng-submit=\"vm.addGender();\">\n    <div class=\"col-md-9\">\n      <div class=\"form-group m-n\">\n        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.gender.name\" required=\"\">\n        <label>Genre</label>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <button type=\"submit\" class=\"btn btn-success\">Ajouter</button>\n    </div>\n  </form>\n</div>\n<div class=\"card-box table-responsive\">\n  <table id=\"genres\" class=\"table table-striped\" ng-init=\"vm.getGenders()\">\n    <thead>\n      <tr>\n        <th>Nom</th>\n        <th width=\"60\">Actions</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr ng-repeat=\"(key, value) in vm.genders track by $index\">\n        <td>\n          <span ng-hide=\"edit\">{{ value.name }}</span>\n          <input ng-show=\"edit\" type=\"text\" ng-model=\"value.name\" ng-keydown=\"$event.keyCode === 13 && vm.updateGender(value)\" class=\"form-control\">\n        </td>\n        <td>\n          <div class=\"btn btn-xs btn-info\" ng-hide=\"edit\" ng-click=\"edit=true\"><i class=\"fa fa-pencil\"></i></div>\n          <div class=\"btn btn-xs btn-success\" ng-click=\"vm.updateGender(value); edit=false;\" ng-show=\"edit\" ng-click=\"edit=false\"><i class=\"fa fa-check\"></i></div>\n          <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteGender(value.id)\"><i class=\"fa fa-trash\"></i></div>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n</div>");
            $templateCache.put("modules/marques/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Marques</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"card-box w-xxl no-padder\">\n  <form class=\"row wrapper-sm\" ng-submit=\"vm.addBrand();\">\n    <div class=\"col-md-6\">\n      <div class=\"form-group m-n\" ng-init=\"vm.brand.marge = 1.4\">\n        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.brand.name\" required=\"\">\n        <label>Marque</label>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <div class=\"form-group m-n\" ng-init=\"vm.brand.marge = 1.4\">\n        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.brand.marge\" required=\"\">\n        <label>Marge</label>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <button type=\"submit\" class=\"btn btn-success\">Ajouter</button>\n    </div>\n  </form>\n</div>\n<div class=\"card-box table-responsive\">\n  <table id=\"marques\" class=\"table table-striped\" ng-init=\"vm.getBrands()\">\n    <thead>\n      <tr>\n        <th width=\"80\"></th>\n        <th>Nom</th>\n        <th>Marge</th>\n        <th width=\"60\">Actions</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr ng-repeat=\"(key, value) in vm.brands track by $index\">\n        <td>\n          <div class=\"btn btn-xs btn-rounded hidden pull-left btn-danger\" ng-click=\"vm.deleteLogo( value.id )\" ng-show=\"value.picture\" style=\"position: absolute;\"><i class=\"fa fa-times\"></i></div>\n          <img height=\"50\" width=\"50\" class=\"img b-a img{{ value.id }}\" ng-click=\"vm.img_edit = value.id\" src=\"images/default.png\" ng-if=\"!value.picture\" alt=\"\">\n          <img height=\"50\" width=\"50\" class=\"img b-a img{{ value.id }}\" ng-click=\"vm.img_edit = value.id\" ng-src=\"http://api.utiledev.vanam.fr{{ value.picture}}\" ng-if=\"value.picture\" alt=\"\">\n        </td>\n        <td>\n          <span ng-hide=\"edit\">{{ value.name }}</span>\n          <input ng-show=\"edit\" type=\"text\" ng-model=\"value.name\" ng-keydown=\"$event.keyCode === 13 && vm.updateBrand(value)\" class=\"form-control\">\n        </td>\n        <td>\n          <span ng-hide=\"edit\">{{ value.marge }}</span>\n          <input ng-show=\"edit\" type=\"text\" ng-model=\"value.marge\" ng-keydown=\"$event.keyCode === 13 && vm.updateBrand(value)\" class=\"form-control\">\n        </td>\n        <td>\n          <div class=\"btn btn-xs btn-info\" ng-hide=\"edit\" ng-click=\"edit=true\"><i class=\"fa fa-pencil\"></i></div>\n          <div class=\"btn btn-xs btn-success\" ng-click=\"vm.updateBrand(value); edit=false;\" ng-show=\"edit\" ng-click=\"edit=false\"><i class=\"fa fa-check\"></i></div>\n          <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteBrand(value.id)\"><i class=\"fa fa-trash\"></i></div>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n\n    <input type=\"file\" name=\"picture\" class=\"form-control hidden \">\n\n</div>");
            $templateCache.put("modules/mouvements/add.html", "<div class=\"row\" ng-init=\"vm.getMarques();\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Mouvement d\'entrée / Nouveau</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"card-box no-padder\">\n  <form class=\"wrapper-sm\"  ng-init=\"vm.getProduits()\">\n      <div class=\"form-group m-n\">\n        <angucomplete-alt \n              placeholder=\"Choisir un article...\"\n              pause=\"100\"\n              selected-object=\"vm.selectedProduct\"\n              local-data=\"vm.produits\"\n              search-fields=\"reference\"\n              title-field=\"reference\"\n              ng-keydown=\"$event.keyCode === 13 && vm.openModalAddProduct()\"\n              match-class=\"highlight\"\n              minlength=\"4\"\n              text-no-results=\"Ajouter un produit\"\n              template-url=\"custom-template.html\"\n              input-class=\"form-control w-full\"/>\n      </div>\n  </form>\n</div>\n\n<script type=\"text/ng-template\" id=\"custom-template.html\">\n<div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n  <input ng-model=\"searchStr\"\n    ng-disabled=\"disableInput\"\n    type=\"text\"\n    placeholder=\"{{placeholder}}\"\n    ng-focus=\"onFocusHandler()\"\n    class=\"{{inputClass}}\"\n    ng-focus=\"resetHideResults()\"\n    ng-blur=\"hideResults($event)\"\n    autocapitalize=\"off\"\n    autocorrect=\"off\"\n    autocomplete=\"off\"\n    ng-change=\"vm.inputChangeHandler(searchStr)\"/>\n\n  <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n    <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n    <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n    <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n      <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n      </div>\n      <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n        <div class=\"row\">\n          <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n            <img ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n          </div>\n          <div class=\"col-md-10\">\n            <h4 ng-bind-html=\"result.title\"></h4>\n            <p>{{result.originalObject.description}}</p>\n          </div>\n        </div>\n      </div>\n      <div class=\"angucomplete-title\" ng-if=\"!matchClass\">{{ result.title }}</div>\n      <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n      <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n    </div>\n    \n  </div>\n</div>\n</script>\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <h3>Liste des produits du mouvement</h3>\n      <table id=\"mouvement_entree\" class=\"table table-striped\">\n        <thead>\n          <tr>\n            <th width=\"120\">Référence </th>\n            <th>Désignation </th>\n            <th>Marque</th>\n            <th>Type</th>\n            <th width=\"100\">Qte</th>\n            <th width=\"80\">Prix achat</th>\n            <th width=\"110\">Zone</th>\n            <th width=\"80\">Prix tarif</th>\n            <th width=\"50\">Action</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.mouvement.entry_event_details\">\n            <td>{{value.reference}} </td>\n            <td>{{value.description}}</td>\n            <td>{{value.brand}}</td>\n            <td>Type</td>\n            <td><span data-toggle=\"modal\" data-target=\"#ajoutStock\" ng-click=\"vm.selected=value\" class=\"somme_stock\">{{ vm.calculerStock(value.stock) }}</span><span class=\"lh26\">/{{value.qtr}}</span></td>\n            <td><input type=\"number\" min=\"0\" ng-model=\"value.purchase_price\" class=\"w-50\">{{ vm.getDeviseName(vm.mouvement.change_id) }}</td>\n            <td>\n              <div class=\"row\">\n                <!-- <div class=\"col-xs-4\">\n                  <div class=\"form-group\">\n                    <select class=\"form-control\" ng-model=\"vm.produit.zonage_city_id\">\n                      <option class=\"hidden\" value=\"\">MRS</option>\n                      <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.zonages track by $index\">{{ value.trigram }}</option>\n                    </select>\n                  </div>\n                </div> -->\n                <div class=\"col-xs-6 no-padder\">\n                    <input type=\"text\" class=\"w-full text-xs\" placeholder=\"Ex : A12\" ng-model=\"value.aisle\">\n                </div>\n                <div class=\"col-xs-6 no-padder\">\n                    <input type=\"text\" class=\"w-full text-xs\" placeholder=\"Ex : PAL9\" ng-model=\"value.palette\">\n                </div>\n              </div>\n            </td>\n            <td><input type=\"number\" min=\"0\" ng-model=\"value.sale_rate_price\" class=\"w-50\"> {{ vm.getDeviseName(vm.mouvement.change_id) }}</td>\n            <td>\n              <div class=\"btn btn-xs btn-info\" data-toggle=\"modal\" data-target=\"#ajoutStock\" ng-click=\"vm.selected=value\" ><i class=\"fa fa-info\"></i></div>\n              <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.removeProduct( $index )\" ><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n        <tfoot>\n          <tr>\n            <td>\n              Information\n            </td>\n            <td colspan=\"3\">\n              <textarea class=\"form-control padder b\" ng-model=\"vm.mouvement.information\" rows=\"4\"></textarea>\n            </td>\n            <td></td>\n            <td colspan=\"4\">\n              <a ui-sref=\"app.traitements.mouvements.index\" class=\"btn btn-sm btn-danger\">Fermer</a>\n              <div class=\"btn btn-sm btn-success\" ng-click=\"vm.saveMouvement()\">Enregistrer</div>\n            </td>\n          </tr>\n          <tr>\n            <td>\n              Nombre des colis\n            </td>\n            <td colspan=\"3\">\n              <input type=\"number\" min=\"0\" ng-model=\"vm.mouvement.parcel_nb\" class=\"form-control padder b\">\n            </td>\n            <td></td>\n          </tr>\n          <tr>\n            <td>\n              Devise\n            </td>\n            <td colspan=\"3\">\n              <select class=\"form-control w-sm b\" required=\"\" ng-model=\"vm.mouvement.change_id\" ng-init=\"vm.getDevises();\">\n                <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.devises track by $index\">{{ value.name }} </option>\n              </select>\n            </td>\n            <td></td>\n          </tr>\n        </tfoot>\n      </table>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"modal fade\" id=\"ajoutStock\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Ajout stock</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/mouvements/stock.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n\n\n<script type=\"text/ng-template\" id=\"addProduct.html\">\n  <div class=\"addProductModal\" data-ng-include=\" \'modules/produits/add.html\' \"></div>\n</script>");
            $templateCache.put("modules/mouvements/details.html", "<div class=\"row\" ng-init=\"vm.getDevises(); vm.getMouvementByID();\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Mouvement d\'entrée</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n<div class=\"card-box no-padder\">\n  <form class=\"wrapper-sm\"  ng-init=\"vm.getProduits()\">\n      <div class=\"form-group m-n\">\n        <angucomplete-alt \n              placeholder=\"Choisir un article...\"\n              pause=\"100\"\n              selected-object=\"vm.selectedProduct\"\n              local-data=\"vm.produits\"\n              search-fields=\"reference\"\n              ng-keydown=\"$event.keyCode === 13 && vm.openModalAddProduct()\"\n              title-field=\"reference\"\n              match-class=\"highlight\"\n              minlength=\"4\"\n              text-no-results=\"Ajouter un produit\"\n              template-url=\"/custom-template.html\"\n              input-class=\"form-control w-full\"/>\n      </div>\n  </form>\n</div>\n\n\n<script type=\"text/ng-template\" id=\"/custom-template.html\">\n<div class=\"angucomplete-holder\" ng-class=\"{\'angucomplete-dropdown-visible\': showDropdown}\">\n  <input ng-model=\"searchStr\"\n    ng-disabled=\"disableInput\"\n    type=\"text\"\n    placeholder=\"{{placeholder}}\"\n    ng-focus=\"onFocusHandler()\"\n    class=\"{{inputClass}}\"\n    ng-focus=\"resetHideResults()\"\n    ng-blur=\"hideResults($event)\"\n    autocapitalize=\"off\"\n    autocorrect=\"off\"\n    autocomplete=\"off\"\n    ng-change=\"inputChangeHandler(searchStr)\"/>\n\n  <div class=\"angucomplete-dropdown\" ng-show=\"showDropdown\">\n    <div class=\"angucomplete-searching\" ng-show=\"searching\" ng-bind=\"textSearching\"></div>\n    <div class=\"angucomplete-searching\" ng-show=\"!searching && (!results || results.length == 0)\" ng-bind=\"textNoResults\"></div>\n    <div class=\"angucomplete-row\" ng-repeat=\"result in results\" ng-click=\"selectResult(result)\" ng-mouseenter=\"hoverRow($index)\" ng-class=\"{\'angucomplete-selected-row\': $index == currentIndex}\">\n      <div ng-if=\"imageField\" class=\"angucomplete-image-holder\">\n      </div>\n      <div class=\"angucomplete-title\" ng-if=\"matchClass\">\n        <div class=\"row\">\n          <div class=\"col-md-2\" ng-if=\"result.originalObject.url_picture\">\n            <img ng-src=\"http://api.utiledev.vanam.fr/{{result.originalObject.url_picture}}\" height=\"70\" >\n          </div>\n          <div class=\"col-md-10\">\n            <h4 ng-bind-html=\"result.title\"></h4>\n            <p>{{result.originalObject.description}}</p>\n          </div>\n        </div>\n      </div>\n      <div class=\"angucomplete-title\" ng-if=\"!matchClass\">{{ result.title }}</div>\n      <div ng-if=\"matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\" ng-bind-html=\"result.description\"></div>\n      <div ng-if=\"!matchClass && result.description && result.description != \'\'\" class=\"angucomplete-description\">{{result.description}}</div>\n    </div>\n    \n  </div>\n</div>\n</script>\n\n\n\n\n\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <form class=\"card-box table-responsive\" ng-submit=\"vm.updateMouvement()\">\n      <h3>Détails du mouvement d’entrée n° {{vm.mouvement.id}} du {{vm.mouvement.insert_date}}</h3>\n      <table id=\"mouvement_entree\" class=\"table table-striped\">\n        <thead ng-dblclick=\"toogle=!toogle\">\n          <tr>\n            <th width=\"120\">Référence </th>\n            <th>Désignation </th>\n            <th>Marque</th>\n            <th>Type</th>\n            <th width=\"130\">Qte</th>\n            <th width=\"80\">Prix achat</th>\n            <th width=\"110\">Zone</th>\n            <th width=\"80\" ng-show=\"toogle\">Prix tarif</th>\n            <th width=\"80\" ng-show=\"toogle\">Prix public</th>\n            <th width=\"100\" ng-show=\"toogle\">Prix vanam</th>\n            <th width=\"50\">Action</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.mouvement.entry_event_details\">\n            <td>{{value.reference}} </td>\n            <td>{{value.description}} </td>\n            <td>{{value.brand}}</td>\n            <td>{{value.category}}</td>\n            <td><span data-toggle=\"modal\" data-target=\"#detailsStock\" ng-click=\"vm.getStock(value);\" class=\"somme_stock\">{{ value.quantity || vm.calculerStock(value.stock) }}</span>&nbsp; <span class=\"lh26\">/{{value.qtr}}</span></td>\n            <td><input type=\"text\" ng-model=\"value.purchase_price\" class=\"w-50 text-center\">&nbsp;{{ vm.getDeviseName(vm.mouvement.change_id) }}</td>\n            <td>\n              <div class=\"row\">\n                <!-- <div class=\"col-xs-4\">\n                  <div class=\"form-group\">\n                    <select class=\"form-control\" ng-model=\"vm.produit.zonage_city_id\">\n                      <option class=\"hidden\" value=\"\">MRS</option>\n                      <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.zonages track by $index\">{{ value.trigram }}</option>\n                    </select>\n                  </div>\n                </div> -->\n                <div class=\"col-xs-6 no-padder\">\n                    <input type=\"text\" class=\"w-full text-xs text-center\" placeholder=\"Ex : A12\" ng-model=\"value.aisle\">\n                </div>\n                <div class=\"col-xs-6 no-padder\">\n                    <input type=\"text\" class=\"w-full text-xs text-center\" placeholder=\"Ex : PAL9\" ng-model=\"value.palette\">\n                </div>\n              </div>\n            </td>\n            <td ng-show=\"toogle\"><input type=\"text\" ng-model=\"value.sale_rate_price\" class=\"w-50 text-center\">&nbsp;{{ vm.getDeviseName(vm.mouvement.change_id) }}</td>\n            \n            <td ng-show=\"toogle\"><input type=\"text\" ng-model=\"value.sale_public_price\" class=\"w-50 text-center\">&nbsp;{{ vm.getDeviseName(vm.mouvement.change_id) }}</td>\n            <td ng-show=\"toogle\"><input type=\"text\" ng-model=\"value.sale_vanam_price\" class=\"w-50 text-center\">&nbsp;{{ vm.getDeviseName(vm.mouvement.change_id) }}</td>\n            \n            <td>\n              <div class=\"btn btn-xs btn-info\" ng-click=\"vm.openDetailsProduit(value.product_id)\" ><i class=\"fa fa-info\"></i></div>\n              <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteProduct( value.id )\" ><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n        <tfoot>\n          <!-- <tr>\n            <td colspan=\"{{toogle?11:8}}\" class=\"text-center bg-light\">\n              <select class=\"form-control bg-white\" ng-init=\"vm.nb_elements=\'50\'\" ng-model=\"vm.nb_elements\" style=\"display: inline-block; width: auto;\">\n                <option value=\"10\">10</option>\n                <option value=\"20\">20</option>\n                <option value=\"50\">50</option>\n                <option value=\"100\">100</option>\n                <option value=\"1000\">1000</option>\n              </select>\n              <div class=\"btn btn-sm btn-default\" ng-click=\"vm.current_page=vm.current_page+1; vm.getMouvementByID()\">Encore plus ..</div>\n            </td>\n          </tr> -->\n          <tr>\n            <td>\n              Information\n            </td>\n            <td colspan=\"{{toogle?6:3}}\">\n              <textarea class=\"form-control padder b\" ng-model=\"vm.mouvement.information\" rows=\"4\"></textarea>\n            </td>\n            <td colspan=\"5\" align=\"right\">\n              <div data-toggle=\"modal\" data-target=\"#print\" class=\"btn tbn-sm btn-info\">Imprimer</div>\n              <a ui-sref=\"app.traitements.mouvements.index\" class=\"btn tbn-sm btn-danger\">Fermer</a>\n              <button type=\"submit\" class=\"btn tbn-sm btn-success\">Enregistrer</button>\n            </td>\n          </tr>\n          <tr>\n            <td>\n              Nb de colis\n            </td>\n            <td colspan=\"3\">\n              <input type=\"text\" ng-model=\"vm.mouvement.parcel_nb\" class=\"form-control padder b\">\n            </td>\n            <td></td>\n          </tr>\n          <tr>\n            <td>\n              Devise  \n              \n            </td>\n            <td colspan=\"3\">\n              <select class=\"form-control w-sm b\" required=\"\" ng-model=\"vm.mouvement.change_id\">\n                <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.devises track by $index\">{{ value.name }}</option>\n              </select>\n            </td>\n            <td></td>\n          </tr>\n        </tfoot>\n      </table> \n    </form>\n  </div>\n</div>\n\n\n<div class=\"modal fade\" id=\"detailsStock\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Détails stock</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div class=\"stock-box\" ng-repeat=\"(key, value) in vm.selected.stock track by $index\">\n              <div class=\"pointure\">{{ value.name }}</div>\n              <div class=\"reel\">\n                <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ value.qtr || 0 }}</span>\n              </div>\n              <div class=\"aterme\">\n                <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ value.qtt || 0 }}</span>\n              </div>\n              <div class=\"nouveau\">\n                <input type=\"text\" ng-keydown=\"($event.keyCode === 13 || $event.keyCode === 9 ) && vm.updateStock(value.range_detail_id,value.product_id, vm.entry_event_detail_id, value.value, $event.keyCode )\" ng-blur=\"vm.updateStock(value.range_detail_id,value.product_id, vm.entry_event_detail_id, value.value )\" ng-model=\"value.value\" value=\"0\">\n              </div>\n            </div>\n\n            <div class=\"text-right\">\n              <div class=\"stock-box somme\">\n                <div class=\"reel\" style=\"width: 100%\">\n                  <b>Stock dispo</b>  {{ vm.calculerStock(vm.selected.stock)+vm.produit.qtr }}\n                </div>\n              </div>\n            </div>\n            <div class=\"text-right m-b-xs m-r-xs\">\n              <!-- ng-click=\"vm.updateMouvement();\" -->\n              <div class=\"btn btn-success btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Valider</div>\n              <div class=\"btn btn-danger btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Fermer</div>\n            </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"ajoutStock\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Ajout stock</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div data-ng-include=\" \'modules/mouvements/stock.html\' \"></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"modal fade\" id=\"print\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Choix des prix</h3>\n        </div>\n        <form class=\"panel-body\">\n\n\n            <div class=\"row\">\n              <div class=\"col-md-6\">\n                <label>Prix tarif</label>\n              </div>\n              <div class=\"col-md-6\">\n                <input type=\"checkbox\" id=\"switch1\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.print.rate_price\" switch=\"bool\" />\n                <label for=\"switch1\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n              </div>\n            </div>\n\n            <div class=\"row\">\n              <div class=\"col-md-6\">\n                <label>Prix d\'achat</label>\n              </div>\n              <div class=\"col-md-6\">\n                <input type=\"checkbox\" id=\"switch2\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.print.purchase_price\" switch=\"bool\" />\n                <label for=\"switch2\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n              </div>\n\n          </div>\n\n          <div class=\"text-right\">\n            <div class=\"btn btn-success\" ng-click=\"vm.imprimer()\">Générer</div>\n          </div>\n\n\n\n        </form>\n      </div>\n    </div>\n  </div>\n</div>\n\n<script type=\"text/ng-template\" id=\"addProduct.html\">\n  <div class=\"addProductModal\" data-ng-include=\" \'modules/produits/add.html\' \"></div>\n</script>\n\n<script type=\"text/ng-template\" id=\"detailsProduit.html\">\n  <div class=\"detailsProduitModal\" data-ng-include=\" \'modules/produits/details.html\' \"></div>\n</script>\n\n\n\n ");
            $templateCache.put("modules/mouvements/importer.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Importer fichier</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"card-box\">\n  <div class=\"progress\" ng-init=\"vm.step=1\" style=\"margin: -20px -20px 0px -20px\">\n    <div class=\"progress-bar progress-bar-orange progress-bar-striped\" role=\"progressbar\" style=\"width: {{ vm.step*33.33 }}%;\">\n      <span class=\"sr-only\">{{ vm.step/3 }} complet</span>\n    </div>\n  </div>\n  <ul class=\"nav nav-tabs tabs-bordered nav-steps\" style=\"margin: 0px -20px 0 -20px\">\n    <li class=\"active\" ng-click=\"vm.step=1\">\n      <a href=\"#etape1\" ng-click=\"vm.initMouvement()\" data-toggle=\"tab\" aria-expanded=\"true\">\n        <span class=\"visible-xs\"><i class=\"fa fa-home\"></i></span>\n        <span class=\"hidden-xs\">Etape 1</span>\n    </a>\n    </li>\n    <li ng-class=\"{\'disabled\':vm.step==2}\">\n      <!-- <a href=\"#etape2\" ng-init=\"vm.getDemo()\" data-toggle=\"tab\" aria-expanded=\"false\"> -->\n      <a href=\"{{ vm.step==2?\'#etape2\':\'#\' }}\" data-toggle=\"tab\" aria-expanded=\"false\">\n        <span class=\"visible-xs\"><i class=\"fa fa-camera\"></i></span>\n        <span class=\"hidden-xs\">Etape 2</span>\n      </a>\n    </li>\n    <li ng-class=\"{\'disabled\':vm.step==3}\">\n      <a href=\"{{ vm.step==3?\'#etape3\':\'#\' }}\" data-toggle=\"tab\" aria-expanded=\"false\">\n        <span class=\"visible-xs\"><i class=\"fa fa-trello\"></i></span>\n        <span class=\"hidden-xs\">Etape 3</span>\n      </a>\n    </li>\n  </ul>\n  <div class=\"tab-content\">\n    <div class=\"tab-pane active\" id=\"etape1\">\n      <form ng-submit=\"vm.uploadFile()\">\n        <div class=\"row\">\n          <div class=\"col-md-4\">\n            <div class=\"custom-upload-file\">\n              <i class=\"fa fa-upload\"></i> {{ vm.file_name || \'Importer\' }}\n              <input type=\"file\" name=\"file\" required=\"\" class=\"form-control\">\n            </div>\n          </div>\n          <div class=\"col-md-3\">\n            <button class=\"btn btn-info m-t-xs\" ng-show=\"vm.file_name\">Envoyer</button>\n          </div>\n        </div>\n        <div class=\"row\" ng-show=\"vm.file_name\">\n          <div class=\"col-md-4\">\n            <select multiple=\"\" class=\"list-items\" id=\"list1\">\n              <option ng-repeat=\"value in vm.headers | orderBy:\'i\'  track by value.i\" data-i=\"{{ value.i }}\" data-key=\"{{ value.key }}\" class=\"item\">{{ value.value }}</option>\n            </select>\n          </div>\n          <div class=\"col-md-4\">\n            <div class=\"text-center\">\n              <div class=\"btn btn-success\" ng-click=\"vm.lier()\">Lier</div>\n            </div>\n            <div class=\"list-items\" id=\"list3\">\n              <div class=\"result\" ng-click=\"vm.dissocier($index, value[0],value[1])\" ng-repeat=\"(key, value) in vm.liersItems track by $index\">\n                <div><span ng-repeat=\"(k, v) in value[0] track by $index\">{{ v.value }}</span></div>\n                <div class=\"icon\">\n                  <i class=\"icon1 fa fa-link\"></i>\n                  <i class=\"icon2 fa fa-unlink\"></i>\n                </div>\n                <div><span ng-repeat=\"(k, v) in value[1] track by $index\">{{ v.value }}</span></div>\n              </div>\n            </div>\n          </div>\n          <div class=\"col-md-4\">\n            <select multiple=\"\" class=\"list-items\" id=\"list2\" ng-init=\"vm.getGammes()\">\n              <option class=\"item\" ng-repeat=\"(key, value) in vm.listItems  | orderBy:\'i\' track by value.i\" data-obligatoire=\"{{value.obligatoire}}\" data-value=\"{{value.value}}\" data-i=\"{{value.i}}\" data-is_range=\"0\">{{value.value}}{{ value.obligatoire==1?\'*\':\'\' }}</option>\n              <option class=\"text-center block\" disabled=\"\">Gammes</option>\n              <option class=\"item gamme\" ng-repeat=\"value in vm.gammeItems | orderBy:\'id\' track by value.name\" data-type=\"gamme\" data-id=\"{{value.id}}\" data-value=\"{{value.name}}\"  data-is_range=\"1\">{{ value.name }}</option>\n            </select>\n          </div>\n        </div>\n        <div class=\"text-right\">\n          <div class=\"btn btn-success\" ng-show=\"vm.file_name\" ng-click=\"vm.envoyerLiaisons()\">Suivant</div>\n        </div>\n      </form>\n    </div>\n    <div class=\"tab-pane\" id=\"etape2\" ng-init=\"vm.getCategories(); vm.getBrands(); vm.getGenders(); vm.getSports()\">\n        <div class=\"switch_230\">\n          <input type=\"checkbox\" ng-change=\"vm.toggleProductStatus()\" id=\"switch_status\" ng-true-value=\"1\" ng-false-value=\"0\" ng-model=\"vm.product_status\" switch=\"bool\">\n          <label for=\"switch_status\" data-on-label=\"Afficher tous les produits\" data-off-label=\"Afficher les produits incomplets\"></label>\n        </div>\n\n\n      <table class=\"table table-bordred\" id=\"table_produits\">\n        <tr ng-class=\"{\'completed\': toggle}\" ng-init=\"toggle = vm.verifStatusRanges(product, $index)\" ng-repeat=\"(key, product) in vm.products track by $index\" ng-hide=\"product.ranges.length == 0\">\n          <td width=\"100\" class=\"toHide\">\n            <img src=\"http://myaco.lemans.org/GED/content/4805C9CE-ECF4-4232-AEF4-3580948695DC.jpg\" class=\"img-responsive\" alt=\"\">\n          </td>\n          <td width=\"200\" class=\"toHide\">\n            {{product[\'Référence\']}}\n            <br> {{product[\'Description\']}}\n            <br> {{product[\'prix achat\']}}\n            <p>\n              <span ng-if=\"product[\'Marque\']\" class=\"badge badge-danger\" data-toggle=\"modal\" data-target=\"#marques\" ng-click=\"vm._marque = product[\'Marque\']\" data-marque=\"{{product[\'Marque\']}}\">{{product[\'Marque\']}}</span>\n              <span ng-if=\"product[\'Genre\']\" class=\"badge badge-danger\" data-toggle=\"modal\" data-target=\"#genres\" ng-click=\"vm._genre = product[\'Genre\']\" data-genre=\"{{product[\'Genre\']}}\">{{product[\'Genre\']}}</span>\n              <span ng-if=\"product[\'Sport\']\" class=\"badge badge-danger\" data-toggle=\"modal\" data-target=\"#sports\" ng-click=\"vm._sport = product[\'Sport\']\" data-sport=\"{{product[\'Sport\']}}\">{{product[\'Sport\']}}</span>\n              <span ng-if=\"product[\'Categorie\']\" class=\"badge badge-danger\" data-toggle=\"modal\" data-target=\"#categories\" ng-click=\"vm._categorie = product[\'Categorie\']\" data-categorie=\"{{product[\'Categorie\']}}\">{{product[\'Categorie\']}}</span>\n            </p>\n          </td>\n          <td  class=\"toHide\">\n            <div class=\"stock-box style2\" ng-class=\"{\'rouge\': value.status == \'false\' }\" ng-repeat=\"(key, value) in product.ranges track by $index\">\n              <div class=\"pointure\" ng-click=\"vm.modalNewGamme(product, value, key)\">{{ value.name || key }}</div>\n              <div class=\"reel\">\n                <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{value.value}}</span>\n              </div>\n            </div>\n          </td>\n        </tr>\n      </table>\n      <div class=\"text-right\">\n        <div class=\"btn btn-success\" ng-click=\"vm.envoyerProduits()\">Suivant</div>\n      </div>\n    </div>\n    <div class=\"tab-pane\" id=\"etape3\">\n      <div class=\"alert alert-success\" role=\"alert\" ng-if=\"vm.step3.msg\">\n        {{ vm.step3.msg }}\n      </div>\n\n      <div class=\"alert alert-success\" role=\"alert\" ng-if=\"vm.step3.products_ok\">\n        {{ vm.step3.products_ok.msg }}\n      </div>\n\n      <div class=\"alert alert-warning\" role=\"alert\" ng-if=\"vm.step3.products_without_ranges.msg\">\n        {{ vm.step3.products_without_ranges.msg }}\n      </div>\n\n      <div class=\"alert alert-warning\" ng-repeat=\"(key, value) in vm.step3.products_without_ranges.products track by $index\" role=\"alert\">\n          <strong>Reférence produit : </strong> {{ value }}\n      </div>\n\n      <div class=\"alert alert-danger\" role=\"alert\" ng-if=\"vm.step3.products_nok.msg\">\n        {{ vm.step3.products_nok.msg }}\n      </div>\n\n      <div class=\"alert alert-danger\" ng-repeat=\"(key, value) in vm.step3.products_nok.products track by $index\" role=\"alert\">\n          <strong>Reférence : </strong> {{ value }}\n      </div>\n    </div>\n     \n  </div>\n</div>\n<div class=\"modal fade\" id=\"gamme\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Gamme</h3>\n        </div>\n        <div class=\"gamme_list wrapper-xs\" ng-hide=\"vm.new\">\n          <div class=\"btn btn-info w-full m-b-xs\" ng-click=\"vm.new=1\">Nouvel attribut de gamme</div>\n          <div class=\"btn btn-white w-full m-b-xs\" ng-click=\"vm.parent_gamme_id=0\">Nouvelle gamme</div>\n          <div class=\"text-center\">ou</div>\n          <div class=\"panel-group panel-group-joined\" id=\"accordion\">\n            <div class=\"panel panel-info\" ng-hide=\"vm.parent_gamme_id && vm.parent_gamme_id != value.id\" ng-repeat=\"(key, value) in vm.gammes track by $index\">\n              <div ng-click=\"vm.range_details=[];\" class=\"panel-heading collapsed wrapper-xs text-white\" data-toggle=\"collapse\" data-parent=\"#accordion\" href=\"#collapse{{$index}}\">\n                {{ value.name }}\n              </div>\n              <div id=\"collapse{{$index}}\" class=\"panel-collapse collapse\">\n                <div class=\"panel-body\">\n                  <div class=\"btn btn-default btn-sm w-full\" ng-click=\"vm.addGamme(v)\" ng-repeat=\"(k, v) in value.ranges track by $index\">{{ v.name }}</div>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n        <form class=\"panel-body\" ng-submit=\"vm.addGamme()\" ng-show=\"vm.new\">\n          <input type=\"text\" class=\"form-control\" placeholder=\"Gamme\" ng-model=\"vm.gamme.name\">\n          <div class=\"btn btn-danger w-full m-t-xs\" ng-click=\"vm.new=0\">Annuler</div>\n\n        </form>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"modal fade\" id=\"marques\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Marques</h3>\n        </div>\n        <div class=\"wrapper\">\n          <div class=\"row\">\n            <div class=\"col-md-3\" ng-repeat=\"(k, v) in vm.brands track by $index\">\n              <div ng-click=\"vm.lierMarque( vm._marque, v )\" class=\"btn btn-default btn-sm w-full m-b-xs\">{{ v.name }}</div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"modal fade\" id=\"genres\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Genres</h3>\n        </div>\n        <div class=\"wrapper\">\n          <div class=\"row\">\n            <div class=\"col-md-12\" ng-repeat=\"(k, v) in vm.genders track by $index\">\n              <div ng-click=\"vm.lierGenre( vm._genre, v )\" class=\"btn btn-default btn-sm w-full m-b-xs\">{{ v.name }}</div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"modal fade\" id=\"sports\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Sports</h3>\n        </div>\n        <div class=\"wrapper\">\n          <div class=\"row\">\n            <div class=\"col-md-12\" ng-repeat=\"(k, v) in vm.sports track by $index\">\n              <div ng-click=\"vm.lierSport( vm._sport, v )\" class=\"btn btn-default btn-sm w-full m-b-xs\">{{ v.name }}</div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"modal fade\" id=\"categories\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Categories</h3>\n        </div>\n        <div class=\"wrapper\">\n          <div class=\"row\">\n            <div class=\"col-md-3\" ng-repeat=\"(k, v) in vm.categories track by $index\">\n              <div ng-click=\"vm.lierCategorie( vm._categorie, v )\" class=\"btn btn-default btn-sm w-full m-b-xs\">{{ v.name }}</div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
            $templateCache.put("modules/mouvements/importer_images.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Importer fichier</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"card-box\">\n  <form ng-submit=\"vm.uploadImages()\" class=\"row\">\n    <div class=\"col-md-4\">\n      <div class=\"custom-upload-file\">\n        <i class=\"fa fa-upload\"></i> {{ vm.file_name || \'Importer\' }}\n        <input type=\"file\" name=\"file\" required=\"\" class=\"form-control\">\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <button class=\"btn btn-info m-t-xs\" ng-show=\"vm.file_name\">Envoyer</button>\n    </div>\n  </form>\n</div>\n<div class=\"card-box\" ng-if=\"vm.report.msg\">\n  <div class=\"alert alert-success\" role=\"alert\">\n    {{ vm.report.msg }}\n  </div>\n\n  <div class=\"alert alert-success\" role=\"alert\">\n    Nombre total des photos traitées : {{ vm.report.report[0].pictures_number }}\n  </div>\n\n  <!-- <div class=\"alert alert-success\" role=\"alert\">\n    Nombre total des produits dans le fichier : {{ vm.report.report[0].products_number }}\n  </div> -->\n\n  <div class=\"alert alert-success\" role=\"alert\">\n    Nombre total des produits traités avec succès : {{ vm.report.report[0].products_ok }}\n  </div>\n   \n</div>");
            $templateCache.put("modules/mouvements/index.html", "<div class=\"row\" ng-init=\"vm.getMouvements(vm.search)\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Mouvements</h4>\n      <div class=\"pull-right\">\n        <a class=\"btn btn-primary btn-sm waves-effect waves-light\" ui-sref=\"app.traitements.mouvements.importer\">Importer un fichier</a>\n        <a class=\"btn btn-primary btn-sm waves-effect waves-light\" ui-sref=\"app.traitements.mouvements.importer_images\">Importer images</a>\n        <a class=\"btn btn-primary btn-sm waves-effect waves-light\" ui-sref=\"app.traitements.mouvements.add\" ng-click=\"vm.initMouvement()\">Ajouter mouvements</a>\n      </div>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n\n<div class=\"card-box no-padder\">\n  <form class=\"row wrapper-sm\" ng-submit=\"vm.getMouvements( vm.search )\">\n    <div class=\"col-md-6\">\n      <div class=\"form-group m-n\">\n        <input type=\"text\" class=\"form-control w-full\" placeholder=\" \" ng-model=\"vm.search.num_inf_value\">\n        <label>N° mouvement / information</label>\n      </div>\n    </div>\n    <div class=\"col-md-2\">\n      <div class=\"form-group m-n\">\n        <input type=\"date\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.search.start_date\">\n        <label>Début</label>\n      </div>\n    </div>\n    <div class=\"col-md-2\">\n      <div class=\"form-group m-n\">\n        <input type=\"date\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.search.end_date\">\n        <label>Fin</label>\n      </div>\n    </div>\n    <div class=\"col-md-2 text-center\">\n      <button type=\"submit\" class=\"btn btn-success\">Chercher</button>\n    </div>\n  </form>\n</div>\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <table id=\"mouvements\" class=\"table table-striped\">\n        <thead>\n          <tr>\n            <th>N° mouvement </th>\n            <th>Date entrée </th>\n            <th>Name </th>\n            <th>Informations</th>\n            <th>Quantité</th>\n            <th>Action</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.mouvements track by $index\" ng-dblclick=\"vm.openMouvement(value.id)\">\n            <td>{{ value.id }} </td>\n            <td>{{ value.insert_date }} </td>\n            <td>{{ value.name }} </td>\n            <td>{{ value.information }}</td>\n            <td>{{ value.quantity }}</td>\n             \n            <td style=\"width: 100px; text-align: center;\">\n              <a ui-sref=\"app.traitements.mouvements.details({id: value.id})\" class=\"btn btn-xs btn-info\"><i class=\"fa fa-pencil\"></i></a>\n              <div data-toggle=\"modal\" data-target=\"#print\" ng-click=\"vm.print_id = value.id\" class=\"btn btn-xs btn-default\"><i class=\"fa fa-print\"></i></div>\n              <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.delete(value.id)\"><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n  </div>\n</div>\n\n\n<div class=\"modal fade\" id=\"print\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Choix des prix</h3>\n        </div>\n        <form class=\"panel-body\">\n\n            <div class=\"row\">\n              <div class=\"col-md-6\">\n                <label>Prix tarif</label>\n              </div>\n              <div class=\"col-md-6\">\n                <input type=\"checkbox\" id=\"switch1\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.print.rate_price\" switch=\"bool\" />\n                <label for=\"switch1\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n              </div>\n            </div>\n\n            <div class=\"row\">\n              <div class=\"col-md-6\">\n                <label>Prix d\'achat</label>\n              </div>\n              <div class=\"col-md-6\">\n                <input type=\"checkbox\" id=\"switch2\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.print.purchase_price\" switch=\"bool\" />\n                <label for=\"switch2\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n              </div>\n            </div>\n\n            <div class=\"text-right\">\n              <div class=\"btn btn-success\" ng-click=\"vm.imprimer()\">Générer</div>\n            </div>\n\n        </form>\n      </div>\n    </div>\n  </div>\n</div>");
            $templateCache.put("modules/mouvements/stock.html", "<div class=\"stock-box\" ng-repeat=\"(key, value) in vm.selected.ranges track by $index\">\n  <div class=\"pointure\">{{ value.name }}</div>\n  <div class=\"reel\">\n    <span class=\"text-center w-full\" style=\"height: 37px; display: block;\"><!--{{ value.qtr }}-->0</span>\n  </div>\n  <div class=\"aterme\">\n    <span class=\"text-center w-full\" style=\"height: 37px; display: block;\"><!--{{ value.qtt }}-->0</span>\n  </div>\n  <div class=\"nouveau\">\n    <input type=\"text\" ng-keydown=\"$event.keyCode === 13  && vm.updateMouvement();\" ng-model=\"value.value\" value=\"0\">\n  </div>\n</div>\n<div class=\"text-right\">\n  <div class=\"stock-box somme\">\n    <div class=\"reel\" style=\"width: 100%\">\n      <b>Stock dispo</b> <!--{{ vm.calculerStock(vm.selected.stock)+vm.produit.qtr }}-->\n    </div>\n  </div>\n</div>\n\n<div class=\"text-right m-b-xs m-r-xs\">\n  \n  <div class=\"btn btn-success btn-xs\" ng-click=\"vm.updateMouvement();\" data-dismiss=\"modal\" aria-hidden=\"true\">Valider</div>\n  <div class=\"btn btn-danger btn-xs\" data-dismiss=\"modal\" aria-hidden=\"true\">Fermer</div>\n</div>");
            $templateCache.put("modules/pays/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Pays</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"card-box w-xxl no-padder\">\n  <form class=\"row wrapper-sm\" ng-submit=\"vm.addCountry();\">\n    <div class=\"col-md-9\">\n      <div class=\"form-group m-n\">\n        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.country.name\" required=\"\">\n        <label>Pays</label>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <button type=\"submit\" class=\"btn btn-success\">Ajouter</button>\n    </div>\n  </form>\n</div>\n<div class=\"card-box table-responsive\">\n  <table id=\"pays\" class=\"table table-striped\" ng-init=\"vm.getCountries()\">\n    <thead>\n      <tr>\n        <th>Nom</th>\n        <th width=\"60\">Actions</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr ng-repeat=\"(key, value) in vm.countries | orderBy:\'id\'\">\n        \n        <td>\n          <span ng-hide=\"edit\">{{ value.name }}</span>\n          <input ng-show=\"edit\" type=\"text\" ng-keydown=\"$event.keyCode === 13 && vm.updateCountry(value)\" ng-model=\"value.name\" class=\"form-control\">\n        </td>\n        <td>\n          <div class=\"btn btn-xs btn-info\" ng-hide=\"edit\" ng-click=\"edit=true\"><i class=\"fa fa-pencil\"></i></div>\n          <div class=\"btn btn-xs btn-success\" ng-click=\"vm.updateCountry(value); edit=false;\" ng-show=\"edit\" ng-click=\"edit=false\"><i class=\"fa fa-check\"></i></div>\n          <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteCountry(value.id)\"><i class=\"fa fa-trash\"></i></div>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n\n    <input type=\"file\" name=\"picture\" class=\"form-control hidden \">\n\n</div>");
            $templateCache.put("modules/produits/add.html", "<div class=\"row\" ng-init=\"vm.getCategories();vm.getMarques();vm.getGenders();vm.getSports();vm.getGammes();vm.getSports();vm.getZonages(); vm.resetProduit()\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Ajouter nouveau produit</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"card-box\">\n  <ul class=\"nav nav-tabs tabs-bordered\">\n    <li class=\"active\">\n      <a href=\"#tab-informations\" data-toggle=\"tab\" aria-expanded=\"true\">\n        <span class=\"visible-xs\"><i class=\"fa fa-home\"></i></span>\n        <span class=\"hidden-xs\">Informations</span>\n    </a>\n    </li>\n    <li class=\"disabled\">\n      <a href=\"#\" data-toggle=\"tab\" aria-expanded=\"false\">\n        <span class=\"visible-xs\"><i class=\"fa fa-camera\"></i></span>\n        <span class=\"hidden-xs\">Images</span>\n      </a>\n    </li>\n    <li class=\"disabled\">\n      <a href=\"#\" data-toggle=\"tab\" aria-expanded=\"false\">\n        <span class=\"visible-xs\"><i class=\"fa fa-trello\"></i></span>\n        <span class=\"hidden-xs\">Stock</span>\n      </a>\n    </li>\n    <li class=\"disabled\">\n      <a href=\"#\" data-toggle=\"tab\" aria-expanded=\"false\">\n      <span class=\"visible-xs\"><i class=\"fa fa-first-order\"></i></span>\n      <span class=\"hidden-xs\">EAN</span>\n    </a>\n      <li class=\"disabled\">\n        <a href=\"#\" data-toggle=\"tab\" aria-expanded=\"false\">\n      <span class=\"visible-xs\"><i class=\"mdi mdi-view-dashboard\"></i></span>\n      <span class=\"hidden-xs\">Stats</span>\n    </a>\n      </li>\n      <li class=\"disabled\">\n        <a href=\"#\" data-toggle=\"tab\" aria-expanded=\"false\">\n        <span class=\"visible-xs\"><i class=\"fa fa-globe\"></i></span>\n        <span class=\"hidden-xs\">Web</span>\n      </a>\n      </li>\n  </ul>\n  <div class=\"tab-content\">\n    <div class=\"tab-pane active\" id=\"tab-informations\">\n      <form name=\"form\" id=\"form\" ng-submit=\"vm.addProduit()\">\n        <div class=\"row\">\n          <div class=\"col-md-4\">\n            <div class=\"form-group\">\n              <input type=\"text\" name=\"reference\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.produit.reference\" required>\n              <label>Référence*</label>\n            </div>\n          </div>\n          <div class=\"col-md-8\">\n            <div class=\"form-group\">\n              <input type=\"text\" name=\"description\" class=\"form-control w-full\" placeholder=\" \" ng-model=\"vm.produit.description\" required=>\n              <label>Description*</label>\n            </div>\n          </div>\n        </div>\n        <div class=\"row\">\n          <div class=\"col-md-4\">\n            <div class=\"form-group\">\n              <select class=\"form-control\" name=\"category_id\" required=\"\" ng-model=\"vm.produit.category_id\">\n                <option value=\"\" class=\"hidden\">Catégorie*</option>\n                <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.categories track by $index\">{{ value.name }}</option>\n              </select>\n            </div>\n          </div>\n          <div class=\"col-md-4\">\n            <div class=\"form-group\">\n              <select class=\"form-control\" required=\"\" name=\"range_id\" ng-model=\"vm.produit.range_id\">\n                <option value=\"\" class=\"hidden\">Gamme*</option>\n                <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.gammes track by $index\">{{ value.name }}</option>\n              </select>\n            </div>\n          </div>\n        </div>\n        <div class=\"row\">\n          <div class=\"col-md-4\">\n            <div class=\"form-group\">\n              <select class=\"form-control\" required=\"\" name=\"brand_id\" ng-model=\"vm.produit.brand_id\">\n                <option value=\"\" class=\"hidden\">Marque*</option>\n                <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.marques track by $index\">{{ value.name }}</option>\n              </select>\n            </div>\n          </div>\n          <div class=\"col-md-4\">\n            <div class=\"form-group\">\n              <select class=\"form-control\" name=\"gender_id\" ng-model=\"vm.produit.gender_id\">\n                <option value=\"\" class=\"hidden\">Genre</option>\n                <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.genders track by $index\">{{ value.name }}</option>\n              </select>\n            </div>\n          </div>\n          <div class=\"col-md-4\">\n            <div class=\"form-group\">\n              <select class=\"form-control\" ng-model=\"vm.produit.sport_id\">\n                <option value=\"\" class=\"hidden\">Sport</option>\n                <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.sports track by $index\">{{ value.name }}</option>\n              </select>\n            </div>\n          </div>\n          <div class=\"col-md-4\">\n            <div class=\"form-group\">\n              <input type=\"text\" name=\"couleur\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.produit.color\">\n              <label>Couleur</label>\n            </div>\n          </div>\n        </div>\n        <hr>\n        <div class=\"row\">\n          <div class=\"col-md-8\" ng-dblclick=\"vm.showprice()\">\n            <h4 class=\"text-info w-70\" ng-click=\"show_price=!show_price\">Prix</h4>\n            <div class=\"form-group inline w-sm\">\n              <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.produit.sale_public_price\">\n              <label>Prix vente public</label>\n            </div>\n            <div class=\"form-group inline w-sm\">\n              <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.produit.sale_rate_public\">\n              <label>Prix vente tarif</label>\n            </div>\n            <div class=\"form-group inline w-sm\">\n              <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.produit.sale_vanam_price\">\n              <label>Prix vente VANAM*</label>\n            </div>\n            <div class=\"\" ng-show=\"show_price\">\n              <div>\n                <span>Prix achat min : 0 €</span>\n              </div>\n              <div>\n                <span>Prix achat max : 0 €</span>\n              </div>\n            </div>\n            <div class=\"popup-prix\" ng-show=\"vm.showPrice\">\n              <div>\n                <span>0</span>\n              </div>\n              <div>\n                <span>0</span>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class=\"row\">\n          <div class=\"col-md-4\">\n            <h4 class=\"text-info\">Emplacement</h4>\n            <div class=\"row\">\n              <!-- <div class=\"col-xs-4\">\n                <div class=\"form-group\">\n                  <select class=\"form-control\" ng-model=\"vm.produit.zonage_city_id\">\n                    <option class=\"hidden\" value=\"\">MRS</option>\n                    <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.zonages track by $index\">{{ value.trigram }}</option>\n                  </select>\n                </div>\n              </div> -->\n              <div class=\"col-xs-6\">\n                <div class=\"form-group\">\n                  <input type=\"text\" class=\"form-control  m-r\" placeholder=\" \" ng-model=\"vm.produit.aisle\">\n                  <label>Ex : A12</label>\n                </div>\n              </div>\n              <div class=\"col-xs-6\">\n                <div class=\"form-group\">\n                  <input type=\"text\" class=\"form-control m-r\" placeholder=\" \" ng-model=\"vm.produit.palette\">\n                  <label>Ex : PAL9</label>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class=\"text-right\">\n          <button type=\"reset\" class=\"btn btn-danger closeModal\" ng-click=\"vm.goToProductList()\">Annuler</button>\n          <button type=\"submit\" class=\"btn btn-info refreshProduits\">Enregistrer</button>\n        </div>\n      </form>\n    </div>\n  </div>\n</div>\n");
            $templateCache.put("modules/produits/details.html", "<div class=\"row\" ng-init=\"vm.getProduitById(); vm.getCategories();vm.getMarques();vm.getGenders();vm.getSports();vm.getGammes();vm.getSports();vm.getZonages()\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Détails produit</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"card-box\">\n  <ul class=\"nav nav-tabs tabs-bordered\">\n    <li class=\"active\">\n      <a href=\"#informations\" data-toggle=\"tab\" aria-expanded=\"true\">\n        <span class=\"visible-xs\"><i class=\"fa fa-home\"></i></span>\n        <span class=\"hidden-xs\">Informations</span>\n      </a>\n    </li>\n    <li>\n      <a href=\"#images\" data-toggle=\"tab\" aria-expanded=\"false\">\n        <span class=\"visible-xs\"><i class=\"fa fa-camera\"></i></span>\n        <span class=\"hidden-xs\">Images</span>\n      </a>\n    </li>\n    <li>\n      <a href=\"#stock\" data-toggle=\"tab\" aria-expanded=\"false\">\n        <span class=\"visible-xs\"><i class=\"fa fa-trello\"></i></span>\n        <span class=\"hidden-xs\">Stock</span>\n      </a>\n    </li>\n    <li class=\"disabled\" ng-if=\"vm.data.user.role_id < 4\">\n      <a href=\"#\" data-toggle=\"tab\" aria-expanded=\"false\">\n        <span class=\"visible-xs\"><i class=\"fa fa-first-order\"></i></span>\n        <span class=\"hidden-xs\">EAN</span>\n      </a>\n      <li>\n        <a href=\"#stats\" ng-if=\"vm.data.user.role_id < 4\" data-toggle=\"tab\" aria-expanded=\"false\">\n          <span class=\"visible-xs\"><i class=\"mdi mdi-view-dashboard\"></i></span>\n          <span class=\"hidden-xs\">Stats</span>\n        </a>\n      </li>\n      <li class=\"disabled\" ng-if=\"vm.data.user.role_id < 4\">\n        <a href=\"#\" data-toggle=\"tab\" aria-expanded=\"false\">\n          <span class=\"visible-xs\"><i class=\"fa fa-globe\"></i></span>\n          <span class=\"hidden-xs\">Web</span>\n        </a>\n      </li>\n    </ul>\n    <div class=\"tab-content\">\n      <div class=\"tab-pane active\" id=\"informations\">\n        <form name=\"form\" id=\"form\" ng-submit=\"vm.updateProduit()\">\n          <div class=\"row\">\n            <div class=\"col-md-4\">\n              <div class=\"form-group\">\n                <input type=\"text\" name=\"reference\" ng-disabled=\"vm.data.user.role_id == 4\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.produit.reference\" required>\n                <label>Référence*</label>\n              </div>\n            </div>\n            <div class=\"col-md-8\">\n              <div class=\"form-group\">\n                <input type=\"text\" name=\"description\" ng-disabled=\"vm.data.user.role_id == 4\" class=\"form-control w-full\" placeholder=\" \" ng-model=\"vm.produit.description\" required=>\n                <label>Description*</label>\n              </div>\n            </div>\n          </div>\n          <div class=\"row\">\n            <div class=\"col-md-4\">\n              <div class=\"form-group\">\n                <label for=\"\" class=\"actif\">Catégorie</label>\n                <select class=\"form-control\" ng-disabled=\"vm.data.user.role_id == 4\" name=\"category_id\" required=\"\" ng-model=\"vm.produit.category_id\">\n                  <option value=\"\" class=\"hidden\">Catégorie*</option>\n                  <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.categories track by $index\">{{ value.name }}</option>\n                </select>\n              </div>\n            </div>\n            <div class=\"col-md-4\">\n              <div class=\"form-group\">\n                <label for=\"\" class=\"actif\">Gamme</label>\n                <select class=\"form-control\" ng-disabled=\"vm.data.user.role_id == 4\" required=\"\" name=\"range_id\" ng-model=\"vm.produit.range_id\">\n                  <option value=\"\" class=\"hidden\">Gamme*</option>\n                  <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.gammes track by $index\">{{ value.name }}</option>\n                </select>\n              </div>\n            </div>\n          </div>\n          <div class=\"row\">\n            <div class=\"col-md-4\">\n              <div class=\"form-group\">\n                <label for=\"\" class=\"actif\">Marque</label>\n                <select class=\"form-control\" ng-disabled=\"vm.data.user.role_id == 4\" required=\"\" name=\"brand_id\" ng-model=\"vm.produit.brand_id\" ng-disabled=\"vm.produit.is_ok_change_range== false\">\n                  <option value=\"\" class=\"hidden\">Marque*</option>\n                  <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.marques track by $index\">{{ value.name }}</option>\n                </select>\n              </div>\n            </div>\n            <div class=\"col-md-4\">\n              <div class=\"form-group\">\n                <label for=\"\" class=\"actif\">Genre</label>\n                <select class=\"form-control\" ng-disabled=\"vm.data.user.role_id == 4\" required=\"\" name=\"gender_id\" ng-model=\"vm.produit.gender_id\">\n                  <option value=\"\" class=\"hidden\">Genre*</option>\n                  <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.genders track by $index\">{{ value.name }}</option>\n                </select>\n              </div>\n            </div>\n            <div class=\"col-md-4\">\n              <div class=\"form-group\">\n                <label for=\"\" class=\"actif\">Sport</label>\n                <select class=\"form-control\" ng-disabled=\"vm.data.user.role_id == 4\" ng-model=\"vm.produit.sport_id\">\n                  <option value=\"\" class=\"hidden\">Sport</option>\n                  <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.sports track by $index\">{{ value.name }}</option>\n                </select>\n              </div>\n            </div>\n            <div class=\"col-md-4\">\n              <div class=\"form-group\">\n                <input type=\"text\" name=\"couleur\" ng-disabled=\"vm.data.user.role_id == 4\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.produit.color\">\n                <label>Couleur</label>\n              </div>\n            </div>\n          </div>\n          <hr>\n          <div class=\"row\">\n            <div class=\"col-md-8\" ng-if=\"vm.data.user.role_id < 3\">\n              <h4 class=\"text-info w-70\" ng-click=\"show_price=!show_price\">Prix</h4>\n              <div class=\"form-group inline w-sm\">\n                <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.produit.sale_public_price\">\n                <label>Prix vente public</label>\n              </div>\n              <div class=\"form-group inline w-sm\">\n                <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.produit.sale_rate_public\">\n                <label>Prix vente tarif</label>\n              </div>\n              <div class=\"form-group inline w-sm\">\n                <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.produit.sale_vanam_price\">\n                <label>Prix vente VANAM</label>\n              </div>\n              <div class=\"\" ng-show=\"show_price\">\n                <div>\n                  <span>Prix achat min : {{vm.produit.min_buying_price}} €</span>\n                </div>\n                <div>\n                  <span>Prix achat max : {{vm.produit.max_buying_price}} €</span>\n                </div>\n              </div>\n              <div class=\"popup-prix\" ng-show=\"vm.showPrice\">\n                <div>\n                  <span>{{vm.produit.min_buying_price}}</span>\n                </div>\n                <div>\n                  <span>{{vm.produit.max_buying_price}}</span>\n                </div>\n              </div>\n            </div>\n          </div>\n          <div class=\"row\" ng-if=\"vm.data.user.role_id != 4\">\n            <div class=\"col-md-4\">\n              <h4 class=\"text-info\" ng-click=\"vm.showprice()\">Emplacement</h4>\n              <div class=\"row\">\n                <!-- <div class=\"col-xs-4\">\n                  <div class=\"form-group\">\n                    <select class=\"form-control\" ng-model=\"vm.produit.zonage_city_id\">\n                      <option class=\"hidden\" value=\"\">MRS</option>\n                      <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.zonages track by $index\">{{ value.trigram }}</option>\n                    </select>\n                  </div>\n                </div> -->\n                <div class=\"col-xs-6\">\n                  <div class=\"form-group\">\n                    <input type=\"text\" class=\"form-control  m-r\" ng-disabled=\"vm.data.user.role_id == 4\" placeholder=\" \" ng-model=\"vm.produit.aisle\">\n                    <label>{{ vm.produit.location[0].aisle || \'Ex : A12\' }} </label>\n                  </div>\n                </div>\n                <div class=\"col-xs-6\">\n                  <div class=\"form-group\">\n                    <input type=\"text\" class=\"form-control m-r\" ng-disabled=\"vm.data.user.role_id == 4\" placeholder=\" \" ng-model=\"vm.produit.palette\">\n                    <label>{{ vm.produit.location[0].palette || \'Ex : PAL9\' }}</label>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n          <div class=\"row\" ng-if=\"vm.data.user.role_id != 4\">\n            <div class=\"col-md-4\">\n              <div class=\"panel-group panel-group-joined\" id=\"accordion-zonage\" ng-if=\"vm.produit.location.length>0\">\n                <div class=\"panel panel-primary\">\n                  <div class=\"panel-heading pointer\" data-toggle=\"collapse\" data-parent=\"#accordion-zonage\" href=\"#collapseOne\">\n                    <h4 class=\"panel-title\">\n                    <span class=\"collapsed\">\n                      Historique zonage\n                    </span>\n                    </h4>\n                  </div>\n                  <div id=\"collapseOne\" class=\"panel-collapse collapse\">\n                    <div class=\"panel-body no-padder\">\n                      <table class=\"table m-n table-striped\">\n                        <thead>\n                          <tr>\n                            <th>Ancien zonage</th>\n                            <th>Nom profile</th>\n                            <th>Date</th>\n                          </tr>\n                        </thead>\n                        <tbody>\n                          <tr ng-repeat=\"(key, value) in vm.produit.location track by $index\">\n                            <td>{{ value.zonage }}</td>\n                            <td>{{ value.name }}</td>\n                            <td>{{ value.date }}</td>\n                          </tr>\n                        </tbody>\n                      </table>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            </div>\n            <div class=\"col-md-4\">\n            </div>\n          </div>\n          <div class=\"text-right\">\n            <button type=\"reset\" class=\"btn btn-danger closeModal\" ng-click=\"vm.goToProductList()\">Annuler</button>\n            <button type=\"submit\" class=\"btn btn-info\" ng-if=\"vm.data.user.role_id != 4 && vm.data.user.role_id != 5\">Enregistrer</button>\n          </div>\n        </form>\n      </div>\n      <div class=\"tab-pane\" id=\"images\">\n        <div class=\"row\">\n          <div class=\"col-md-2\" ng-if=\"vm.data.user.role_id != 4 && vm.data.user.role_id != 5\">\n            <input type=\"file\" name=\"picture\" multiple=\"\" class=\"hidden\">\n            <div class=\"add-photo-box\">\n              <img src=\"http://myaco.lemans.org/GED/content/4805C9CE-ECF4-4232-AEF4-3580948695DC.jpg\" class=\"img\" width=\"115\" alt=\"\">\n              <label for=\"\">Ajouter une photo</label>\n            </div>\n          </div>\n          \n          <div class=\"col-md-2 text-center\" ng-repeat=\"(key, value) in vm.produit.pictures\">\n            <div class=\"backdrop-img\" ng-show=\"zoom\" ng-click=\"zoom=0\">\n              <div class=\"close\"><i class=\"fa fa-times\"></i></div>\n            </div>\n            <img ng-src=\"http://api.utiledev.vanam.fr/{{zoom?value.original_url_picture:value.url_picture}}\" class=\"img\" alt=\"\" ng-class=\"{\'zoom\':zoom}\" ng-click=\"zoom=!zoom\">\n            <div class=\"m-t-xs\" ng-if=\"vm.data.user.role_id != 4 && vm.data.user.role_id != 5\">\n              <div class=\"btn btn-danger btn-xs\" ng-click=\"vm.deletePhoto(value.id)\"><i class=\"fa fa-trash\"></i></div>\n              <div class=\"btn btn-success disabled m-l-xs btn-xs\" ng-if=\"value.is_default==\'1\'\"><i class=\"fa fa-check\"></i></div>\n              <button class=\"btn btn-inverse m-l-xs btn-xs\" ng-click=\"!value.disable && vm.setDefault(value.id); value.disable=1\" ng-if=\"value.is_default==\'0\'\"><i class=\"fa fa-check\"></i></button>\n            </div>\n          </div>\n        </div>\n        <div class=\"text-right\">\n          <a class=\"btn btn-danger closeModal\" ng-click=\"vm.goToProductList()\">Fermer</a>\n        </div>\n      </div>\n      <div class=\"tab-pane \" id=\"stock\">\n        <div class=\"stock-box\" ng-repeat=\"(key, value) in vm.produit.stock track by $index\">\n          <div class=\"pointure\">{{ value.name }}</div>\n          <div class=\"reel\">\n            <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ value.qtr }}</span>\n          </div>\n          <div class=\"aterme\">\n            <span class=\"text-center w-full\" style=\"height: 37px; display: block;\">{{ value.qtt }}</span>\n          </div>\n        </div>\n        <div class=\"text-right\">\n          <div class=\"stock-box somme\">\n            <div class=\"reel\">\n              <b>Stock réel</b> {{ vm.produit.qtr || \'0\' }}\n            </div>\n            <div class=\"aterme\">\n              <b>Stock à terme</b> {{ vm.produit.qtt || \'0\' }}\n            </div>\n          </div>\n        </div>\n        <div class=\"text-right\">\n          <a class=\"btn btn-danger closeModal\" ng-click=\"vm.goToProductList()\">Fermer</a>\n        </div>\n      </div>\n      <div class=\"tab-pane\" id=\"stats\">\n        <div class=\"row text-center\">\n          <div class=\"col-md-4\">\n            <div class=\"card-box widget-box-one\">\n              <div class=\"wigdet-one-content\">\n                <p class=\"m-0 text-uppercase font-600 font-secondary text-overflow\">Prix moyen de vente</p>\n                <h2 class=\"text-danger\"><span>{{ vm.moy_commands | currency }} </span></h2>\n                <p class=\"text-muted m-0\">Commande en cours</p>\n              </div>\n            </div>\n          </div>\n          <div class=\"col-md-4\">\n            <div class=\"card-box widget-box-one\">\n              <div class=\"wigdet-one-content\">\n                <p class=\"m-0 text-uppercase font-600 font-secondary text-overflow\">Prix moyen de vente</p>\n                <h2 class=\"text-dark\"><span>{{ vm.moy_invoices | currency }}</span> </h2>\n                <p class=\"text-muted m-0\">Factures</p>\n              </div>\n            </div>\n          </div>\n          <div class=\"col-md-4\">\n            <div class=\"card-box widget-box-one\">\n              <div class=\"wigdet-one-content\">\n                <p class=\"m-0 text-uppercase font-600 font-secondary text-overflow\">Prix moyen de vente</p>\n                <h2 class=\"text-primary\"><span>{{ vm.moy_quotations | currency }}</span> </h2>\n                <p class=\"text-muted m-0\">Devis</p>\n              </div>\n            </div>\n          </div>\n          \n          <!-- <div class=\"col-md-3\">\n            <div class=\"card-box widget-box-one\">\n              <div class=\"wigdet-one-content\">\n                <p class=\"m-0 text-uppercase font-600 font-secondary text-overflow\">Prix moyen de vente</p>\n                <h2 class=\"text-warning\"><span>{{ (vm.moy_commands + vm.moy_invoices) | currency }}</span> </h2>\n                <p class=\"text-muted m-0\">Total</p>\n              </div>\n            </div>\n          </div> -->\n        </div>\n        <div class=\"panel-group panel-group-joined\" id=\"accordion-listing\">\n          <div class=\"panel panel-primary\">\n            <div class=\"panel-heading\">\n              <h4 class=\"panel-title\">\n              <a data-toggle=\"collapse\" data-parent=\"#accordion-listing\" href=\"#devis\">\n                Devis\n              </a>\n              </h4>\n            </div>\n            <div id=\"devis\" class=\"panel-collapse collapse  in\">\n              <div class=\"panel-body\">\n                <table class=\"table table-striped\">\n                  <thead>\n                    <tr>\n                      <th>N°</th>\n                      <th>Date</th>\n                      <th>Société</th>\n                      <th>Qte</th>\n                      <th>Prix UHT</th>\n                      <th>Total</th>\n                      <th width=\"80\">Actions</th>\n                    </tr>\n                  </thead>\n                  <tbody>\n                    <tr ng-repeat=\"(key, value) in vm.stats.quotations track by $index\">\n                      <td>{{value.id}}</td>\n                      <td>{{value.creation_date}}</td>\n                      <td>{{value.company_name}}</td>\n                      <td>{{value.qte_total  }}</td>\n                      <td>{{value.sale_price }}</td>\n                      <td>{{value.total  | currency}}</td>\n                      <td class=\"text-center\">\n                        <a data-dismiss=\"modal\" ui-sref=\"app.devis.details({id : value.id})\" class=\"btn btn-xs btn-info closeModal\"><i class=\"fa fa-eye\"></i></a>\n                      </td>\n                    </tr>\n                  </tbody>\n                </table>\n              </div>\n            </div>\n          </div>\n          <div class=\"panel panel-primary\">\n            <div class=\"panel-heading\">\n              <h4 class=\"panel-title\">\n              <a data-toggle=\"collapse\" data-parent=\"#accordion-listing\" href=\"#commandes\"  class=\"collapsed\">\n                Commandes\n              </a>\n              </h4>\n            </div>\n            <div id=\"commandes\" class=\"panel-collapse collapse\">\n              <div class=\"panel-body\">\n                <table class=\"table table-striped\">\n                  <thead>\n                    <tr>\n                      <th>N°</th>\n                      <th>Date</th>\n                      <th>Société</th>\n                      <th>Qte</th>\n                      <th>Prix UHT</th>\n                      <th>Total</th>\n                      <th width=\"80\">Actions</th>\n                    </tr>\n                  </thead>\n                  <tbody>\n                    <tr ng-repeat=\"(key, value) in vm.stats.commands track by $index\">\n                      <td>{{value.id}}</td>\n                      <td>{{value.creation_date}}</td>\n                      <td>{{value.company_name}}</td>\n                      <td>{{value.qte_total  }}</td>\n                      <td>{{value.sale_price }}</td>\n                      <td>{{value.total  | currency}}</td>\n                      <td class=\"text-center\">\n                        <a data-dismiss=\"modal\" ui-sref=\"app.commande.details({id : value.id})\" class=\"btn btn-xs btn-info closeModal\"><i class=\"fa fa-eye\"></i></a>\n                      </td>\n                    </tr>\n                  </tbody>\n                </table>\n              </div>\n            </div>\n          </div>\n          <div class=\"panel panel-primary\">\n            <div class=\"panel-heading\">\n              <h4 class=\"panel-title\">\n              <a data-toggle=\"collapse\" data-parent=\"#accordion-listing\" href=\"#factures\"  class=\"collapsed\">\n                Factures\n              </a>\n              </h4>\n            </div>\n            <div id=\"factures\" class=\"panel-collapse collapse\">\n              <div class=\"panel-body\">\n                <table class=\"table table-striped\">\n                  <thead>\n                    <tr>\n                      <th>N°</th>\n                      <th>Date</th>\n                      <th>Société</th>\n                      <th>Qte</th>\n                      <th>Prix UHT</th>\n                      <th>Total</th>\n                      <th width=\"80\">Actions</th>\n                    </tr>\n                  </thead>\n                  <tbody>\n                    <tr ng-repeat=\"(key, value) in vm.stats.invoices track by $index\">\n                      <td>{{value.id}}</td>\n                      <td>{{value.creation_date}}</td>\n                      <td>{{value.company_name}}</td>\n                      <td>{{value.qte_total  }}</td>\n                      <td>{{value.sale_price }}</td>\n                      <td>{{value.total  | currency}}</td>\n                      <td class=\"text-center\">\n                        <a data-dismiss=\"modal\" ui-sref=\"app.facture.details({id : value.id})\" class=\"btn btn-xs btn-info closeModal\"><i class=\"fa fa-eye\"></i></a>\n                      </td>\n                    </tr>\n                  </tbody>\n                </table>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class=\"text-right\">\n          <a class=\"btn btn-danger closeModal\" ng-click=\"vm.goToProductList()\">Fermer</a>\n        </div>\n      </div>\n      <div class=\"tab-pane\" id=\"web\">\n        <div class=\"text-right\">\n          <a class=\"btn btn-danger closeModal\" ng-click=\"vm.goToProductList()\">Fermer</a>\n        </div>\n      </div>\n    </div>\n  </div>");
            $templateCache.put("modules/produits/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Produits</h4>\n      <div class=\"devis\" data-drop=\"true\" ng-model=\"vm.devis\" jqyoui-droppable=\"{beforeDrop: \'vm.beforeDrop\'}\">\n        <div class=\"drop\"></div>\n      </div>\n      <div class=\"pull-right\" ng-if=\"app.data.user.role_id != 4 && app.data.user.role_id != 5\">\n        <a class=\"btn btn-primary btn-sm waves-effect waves-light\" ui-sref=\"app.produits.add\">Ajouter produit</a>\n      </div>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<form class=\"card-box\" ng-submit=\"vm.getProduits()\">\n  <div class=\"dropdown pull-right\" style=\" top: -10px \">\n    <a href=\"#\" class=\"dropdown-toggle card-drop\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n      <h3 class=\"m-0 text-muted\"><i class=\"mdi mdi-dots-horizontal\"></i></h3>\n    </a>\n    <div class=\"dropdown-menu\" role=\"menu\" style=\"    margin-top: -34px;margin-right: 30px;min-width: 50px;box-shadow: none;\">\n      <div title=\"Envoyer par mail\" ng-if=\"app.data.user.role_id != 4 && app.data.user.role_id != 5\" class=\"btn btn-xs btn-default\" data-toggle=\"modal\" data-target=\"#mail\"><i class=\"fa fa-envelope\"></i></div>\n      <div title=\"Exporter PDF / EXCEL\" class=\"btn btn-xs btn-default\" data-toggle=\"modal\" data-target=\"#exports\"><i class=\"fa fa-file\"></i></div>\n    </div>\n  </div>\n  <div class=\"clearfix\"></div>\n  <div class=\"row\">\n    <div class=\"col-md-3\">\n      <div class=\"form-group\" ng-init=\"vm.getGenders()\">\n        <div ng-dropdown-multiselect=\"\" events=\"vm.eventsGenders\" selected-model=\"vm.search.genders\" options=\"vm.genders\" translation-texts=\"{ searchPlaceholder:\'Recherche\', buttonDefaultText:\'Genre\', dynamicButtonTextSuffix:\'sélectionnés\', checkAll:\'Selectionner tout genre(s)\' }\" extra-settings=\"vm.multiSelectSettings\"></div>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <div class=\"form-group\" ng-init=\"vm.getCategories()\">\n        <div ng-dropdown-multiselect=\"\" events=\"vm.eventsCategories\" selected-model=\"vm.search.categories\" options=\"vm.categories\" translation-texts=\"{ searchPlaceholder:\'Recherche\', buttonDefaultText:\'Catégorie\', dynamicButtonTextSuffix:\'sélectionnés\', checkAll:\'Selectionner toute catégorie(s)\' }\" extra-settings=\"vm.multiSelectSettings\"></div>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <div class=\"form-group\" ng-init=\"vm.getMarques()\">\n        <div ng-dropdown-multiselect=\"\" events=\"vm.eventsBrands\" selected-model=\"vm.search.brands\" options=\"vm.marques\" translation-texts=\"{ searchPlaceholder:\'Recherche\', buttonDefaultText:\'Marque\', dynamicButtonTextSuffix:\'sélectionnés\', checkAll:\'Selectionner toute marque(s)\' }\" extra-settings=\"vm.multiSelectSettings\"></div>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <div class=\"form-group\" ng-init=\"vm.getSports()\">\n        <div ng-dropdown-multiselect=\"\" events=\"vm.eventsSports\" selected-model=\"vm.search.sports\" options=\"vm.sports\" translation-texts=\"{ searchPlaceholder:\'Recherche\', buttonDefaultText:\'Sports\', dynamicButtonTextSuffix:\'sélectionnés\', checkAll:\'Selectionner tout sport(s)\' }\" extra-settings=\"vm.multiSelectSettings\"></div>\n      </div>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-3\">\n      <div class=\"form-group\">\n        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.search.ref_desc\" name=\"reference\">\n        <label for=\"\">Référence ou description</label>\n      </div>\n    </div>\n    <div class=\"col-md-6\">\n      <div class=\"form-group\">\n        <label for=\"\" class=\"actif\">Quantité</label>\n        <rzslider rz-slider-model=\"vm.search.quantite\" rz-slider-high=\"vm.optionsSlider.max\" rz-slider-options=\"vm.optionsSlider\"></rzslider>\n      </div>\n    </div>\n  </div>\n  <div ng-hide=\"app.data.user.role_id == 4\" ng-click=\"avancee=!avancee\" class=\"btn btn-default btn-xs\">Recherche avancée</div>\n  <div class=\"row m-t m-b-lg\" ng-if=\"avancee\">\n    <div class=\"col-md-4\">\n      <h5 class=\"bg-primary wrapper-sm\">Mouvement entrée</h5>\n      <div class=\"form-group\">\n        <input type=\"text\" class=\"form-control\" ng-model=\"vm.search.entry_event_information\" placeholder=\" \">\n        <label for=\"\">Numéro ou nom du mouvement d\'entrée</label>\n      </div>\n      <div class=\"row\">\n        <div class=\"col-md-8 form-group\">\n          <label for=\"\" class=\"actif m-l\">Date</label>\n          <input type=\"date\" class=\"form-control\" ng-model=\"vm.search.entry_event_date\" placeholder=\" \">\n        </div>\n        <div class=\"col-md-4\">\n          <input type=\"checkbox\" id=\"switch_calendar\" ng-true-value=\"\'<\'\" ng-false-value=\"\'>\'\" ng-model=\"vm.search.entry_event_after_before\" switch=\"bool\" />\n          <label class=\"m-t-md\" for=\"switch_calendar\" data-on-label=\"Avant\" data-off-label=\"Aprés\"></label>\n        </div>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <h5 class=\"bg-primary wrapper-sm\">Emplacement</h5>\n      <div class=\"row m-b-md\">\n        <!-- <div class=\"col-xs-4\">\n          <div class=\"form-group\">\n            <select class=\"form-control\" ng-model=\"vm.search.zonage_city_id\">\n              <option class=\"hidden\" value=\"\">MRS</option>\n              <option value=\"{{ value.id }}\" ng-repeat=\"(key, value) in vm.zonages track by $index\">{{ value.trigram }}</option>\n            </select>\n          </div>\n        </div> -->\n        <div class=\"col-xs-6\">\n          <div class=\"form-group\">\n            <input type=\"text\" class=\"form-control  m-r\" placeholder=\" \" ng-model=\"vm.search.aisle\">\n            <label>Ex : A12</label>\n          </div>\n        </div>\n        <div class=\"col-xs-6\">\n          <div class=\"form-group\">\n            <input type=\"text\" class=\"form-control m-r\" placeholder=\" \" ng-model=\"vm.search.palette\">\n            <label>Ex : PAL9</label>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class=\"col-md-5\">\n      <h5 class=\"bg-primary wrapper-sm\">Divers</h5>\n      \n      <div class=\"form-group m-b-lg col-xs-6\">\n        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.search.color\">\n        <label for=\"\">COULEUR</label>\n      </div>\n      <div class=\"form-group col-xs-6\" ng-init=\"vm.getGammes()\">\n        <div ng-dropdown-multiselect=\"\" events=\"vm.eventsGammes\" selected-model=\"vm.search.gammes\" options=\"vm.gammes\" translation-texts=\"{ searchPlaceholder:\'Recherche\', buttonDefaultText:\'Gamme\', dynamicButtonTextSuffix:\'sélectionnés\', checkAll:\'Selectionner tout gamme(s)\' }\" extra-settings=\"vm.multiSelectSettings\"></div>\n      </div>\n      <div class=\"row m-n col-md-7 no-padder\">\n        <div class=\"col-md-7 no-padder\">\n          Quantités épuisées\n        </div>\n        <div class=\"col-md-4 no-padder\">\n          <input type=\"checkbox\" id=\"switch1\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.search.qtr_exhausted\" switch=\"bool\" />\n          <label for=\"switch1\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n        </div>\n      </div>\n      <div class=\"row m-n col-md-5 no-padder\">\n        <div class=\"col-md-7 no-padder\">\n          Pas d\'image\n        </div>\n        <div class=\"col-md-5 no-padder\">\n          <input type=\"checkbox\" id=\"switch2\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.search.is_no_pictures\" switch=\"bool\" />\n          <label for=\"switch2\" data-on-label=\"Oui\" data-off-label=\"Non\"></label>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class=\"text-right\">\n\n    <div class=\"inline w m-r\"> <b>{{ vm.produits.length }}</b> produits trouvés </div>\n    <button type=\"reset\" ng-click=\"vm.resetSearch()\" class=\"btn btn-sm btn-danger\">ANNULER</button>\n    <button type=\"submit\" class=\"btn btn-sm btn-success\">CHERCHER</button>\n    <div class=\"btn btn-sm btn-info\" ng-click=\"vm.addToDevis(vm.produits| filter:{ selected: true })\">AJOUTER SELECTION AU DEVIS EN COURS</div>\n  </div>\n</form>\n<div class=\"text-right\" ng-init=\"type = \'list\'; toogle = 0 \">\n  <div class=\"btn-group\">\n    <div class=\"btn btn-default waves-effect\" ng-click=\"type=\'list\'\" ng-class=\"{ \'btn-info\' :  type==\'list\' }\"><i class=\"fa fa-th-list\"></i></div>\n    <div class=\"btn btn-default waves-effect\" ng-click=\"type=\'grid\'\" ng-class=\"{ \'btn-info\' :  type==\'grid\' }\"><i class=\"fa fa-th-large\"></i></div>\n  </div>\n</div>\n<div class=\"card-box table-responsive\" ng-show=\"type==\'list\'\" ng-dblclick=\"toogle=!toogle\">\n  <table id=\"liste-produits\" class=\"table table-striped\" style=\"width: 100%\" ng-init=\"vm.getUsers()\">\n    <thead>\n      <tr>\n        <th>\n          <div class=\"checkbox-style \">\n            <input type=\"checkbox\" id=\"check-all\" />\n            <label for=\"check-all\"></label>\n          </div>\n        </th>\n        <th>Reférence</th>\n        <th ng-show=\"toogle\">EMPL</th>\n        <th>Description</th>\n        <th>Catégorie</th>\n        <th>Marque</th>\n        <th>Genre</th>\n        <th ng-show=\"toogle\">Sport</th>\n        <th ng-show=\"toogle\">Couleur</th>\n        <th ng-show=\"toogle\">QTR</th>\n        <th>Qtt</th>\n        <th width=\"160\" class=\"text-right\">Actions</th>\n      </tr>\n    </thead>\n    <tbody> \n      <tr ng-repeat=\"(key, value) in vm.produits track by $index\" data-drag=\"true\" data-jqyoui-options=\"{revert: \'invalid\', helper:\'clone\',appendTo: \'body\', containment: \'window\', cursor: \'move\'}\" jqyoui-draggable=\"{animate:true, placeholder:\'keep\', onStart:\'vm.registerDraggedItem(value)\'}\" ng-model=\"value\">\n        <td>\n          <div class=\"checkbox-style \">\n            <input type=\"checkbox\" ng-model=\"value.selected\" id=\"check-{{$index}}\" />\n            <label for=\"check-{{$index}}\"></label>\n          </div>\n        </td>\n        <td>\n          <div>{{ value.reference }}</div>\n        </td>\n        <td width=\"120\" ng-show=\"toogle\">\n          <span ng-hide=\"editLocation\" ng-click=\"editLocation=1\">{{value.trigram}}{{value.aisle}}{{value.palette || \'--\' }}</span>\n          <div ng-show=\"editLocation\">\n            <div class=\"form-group inline w-112\">\n              <input type=\"text\" class=\"form-control  m-r\" placeholder=\" \" ng-model=\"value.aisle\" ng-keydown=\"$event.keyCode === 13 && vm.updateZonage(value)\">\n              <label>Ex : A12</label>\n            </div>\n            <div class=\"form-group inline w-112 \">\n              <input type=\"text\" class=\"form-control m-r\" placeholder=\" \" ng-model=\"value.palette\" ng-keydown=\"$event.keyCode === 13 && vm.updateZonage(value)\">\n              <label>Ex : PAL9</label>\n            </div>\n          </div>\n        </td>\n        <td style=\"width: 400px;\">{{value.description}}</td>\n        <td>{{value.categorie}}</td>\n        <td>{{value.brand}}</td>\n        <td>{{value.gender}}</td>\n        <td ng-show=\"toogle\">{{value.sport}}</td>\n        <td ng-show=\"toogle\">{{value.color}}</td>\n        <td ng-show=\"toogle\">{{value.qtr|| \'0\'}}</td>\n        <td>{{value.qtt|| \'0\' }}</td>\n        <td align=\"right\" style=\"width: 240px;\">\n          <a class=\"btn btn-xs btn-info\" ui-sref=\"app.produits.details({ id: value.id })\"><i class=\"fa fa-eye\"></i></a>\n          <div class=\"btn btn-xs btn-primary\" ui-sref=\"app.produits.details({ id: value.id, tab:\'images\' })\"><i class=\"fa fa-camera\"></i></div>\n          <div ng-if=\"app.data.user.role_id != 4 && app.data.user.role_id != 5\" class=\"btn btn-xs btn-danger\"  ng-click=\"vm.deleteProduct( value.id )\"><i class=\"fa fa-trash\"></i></div>\n          <div ng-if=\"app.data.user.role_id != 4 && app.data.user.role_id != 5\" class=\"btn btn-xs btn-default\" ui-sref=\"app.produits.details({ id: value.id, tab:\'stats\' })\"><i class=\"fa fa-line-chart\"></i></div>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n\n\n\n<div class=\"row\" ng-show=\"type==\'grid\'\" ng-init=\"currentPage=0; vm.length_grid=\'3\'\">\n  <div class=\"col-md-4\" ng-repeat=\"(key, value) in vm.produits | startFrom:currentPage*vm.length_grid | limitTo:vm.length_grid track by $index\" data-drag=\"true\" data-jqyoui-options=\"{revert: \'invalid\', helper:\'clone\',appendTo: \'body\', containment: \'window\', cursor: \'move\'}\" jqyoui-draggable=\"{animate:true, placeholder:\'keep\'}\" ng-model=\"value\">\n    <div class=\"text-center card-box\" style=\"min-height: 350px\">\n      <div class=\"checkbox-style pull-left\">\n        <input type=\"checkbox\" ng-model=\"value.selected\" id=\"check-grid-{{$index}}\" />\n        <label for=\"check-grid-{{$index}}\"></label>\n      </div>\n      <div class=\"dropdown pull-right\">\n        <a href=\"#\" class=\"dropdown-toggle card-drop\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n          <h3 class=\"m-0 text-muted\"><i class=\"mdi mdi-dots-horizontal\"></i></h3>\n        </a>\n        <div class=\"dropdown-menu\" style=\"text-align:center\" role=\"menu\">\n          <a class=\"btn btn-xs btn-info\" ui-sref=\"app.produits.details({ id: value.id })\"><i class=\"fa fa-eye\"></i></a>\n          <a class=\"btn btn-xs btn-primary\" ui-sref=\"app.produits.details({ id: value.id, tab:\'images\' })\"><i class=\"fa fa-camera\"></i></a>\n          <div ng-if=\"app.data.user.role_id != 4 && app.data.user.role_id != 5\" ng-click=\"vm.deleteProduct( value.id )\" class=\"btn btn-xs btn-danger\"><i class=\"fa fa-trash\"></i></div>\n          <a ng-if=\"app.data.user.role_id != 4 && app.data.user.role_id != 5\" ui-sref=\"app.produits.details({ id: value.id, tab:\'stats\' })\" ui-sref=\"app.produits.details({ id: value.id, tab:\'stats\' })\" class=\"btn btn-xs btn-default\"><i class=\"fa fa-line-chart\"></i></a>\n        </div>\n      </div>\n      <div class=\"clearfix\"></div>\n      <div class=\"member-card\">\n        <div class=\"thumb-xl member-thumb m-b-10 center-block\">\n          <img ng-if=\"value.url_picture\" ng-src=\"http://api.utiledev.vanam.fr/{{ value.url_picture  }}\" class=\"img img-responsive\">\n          <img ng-if=\"!value.url_picture\" src=\"http://myaco.lemans.org/GED/content/4805C9CE-ECF4-4232-AEF4-3580948695DC.jpg\" class=\"img img-responsive\">\n        </div>\n        <div class=\"\">\n          <p class=\"text-muted\"> <span class=\"toCopy\">{{ value.reference }}</span> <span> | </span> <span class=\"text-pink toCopy\">{{value.categorie}}</span></p>\n        </div>\n        <form name=\"form\">\n          <div class=\"form-group inline w-70\">\n            <input type=\"text\" class=\"form-control m-r\" name=\"aisle\" placeholder=\" \" ng-model=\"value.aisle\" required=\"\" ng-keydown=\"$event.keyCode === 13 && vm.updateZonage(value)\">\n            <label>Aisle</label>\n          </div>\n          <div class=\"form-group inline w-70 \">\n            <input type=\"text\" class=\"form-control m-r\" name=\"palette\" placeholder=\" \" ng-model=\"value.palette\" required=\"\" ng-keydown=\"$event.keyCode === 13 && vm.updateZonage(value)\">\n            <label>Palette</label>\n          </div>\n        </form>\n        <p>\n          <span class=\"badge badge-info\">{{value.brand}}</span>\n          <span class=\"badge badge-primary\">{{value.gender}}</span>\n          <span class=\"badge badge-warning\">{{value.sport}}</span>\n          <span class=\"badge badge-default\">{{value.color}}</span>\n        </p>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"text-right padder clearfix\" ng-show=\"vm.produits.length>=6 &&  type==\'grid\'\">\n  \n  <label>Afficher \n    <select ng-model=\"vm.length_grid\" ng-change=\"currentPage=0\">\n      <option value=\"3\">3</option>\n      <option value=\"6\">6</option>\n      <option value=\"9\">9</option>\n      <option value=\"12\">12</option>\n      <option value=\"30\">30</option>\n      <option value=\"300\">300</option>\n      <option value=\"900\">900</option>\n    </select> éléments\n  </label>\n\n  <button class=\"btn btn-default btn-sm\" ng-disabled=\"currentPage == 0\" ng-click=\"currentPage=currentPage-1\">\n    Précédent\n  </button>\n\n  {{currentPage+1}}/{{ (vm.produits.length/vm.length_grid)<1?1:(vm.produits.length/vm.length_grid) | number:0 }}\n  <button class=\"btn btn-default btn-sm\" ng-disabled=\"currentPage >= vm.produits.length/vm.length_grid - 1\" ng-click=\"currentPage=currentPage+1\">\n    Suivant\n  </button>\n</div>\n\n<div class=\"modal fade\" id=\"exports\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-sm\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Export</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div class=\"m-b m-l-lg m-r-lg\">\n            <div class=\"checkbox\" ng-init=\"vm.search.is_images=1\">\n              <input id=\"checkbox1\" ng-model=\"vm.search.is_images\" ng-true-value=\"1\" ng-false-value=\"0\" checked=\"\" type=\"checkbox\">\n              <label for=\"checkbox1\">Images</label>\n            </div>\n            <div class=\"checkbox\" ng-init=\"vm.search.purchase_price=0\">\n              <input id=\"checkbox2\" ng-model=\"vm.search.purchase_price\" ng-true-value=\"1\" ng-false-value=\"0\" type=\"checkbox\">\n              <label for=\"checkbox2\">Prix achat</label>\n            </div>\n            <div class=\"checkbox\" ng-init=\"vm.search.rate_price=0\">\n              <input id=\"checkbox3\" ng-model=\"vm.search.rate_price\" type=\"checkbox\" ng-true-value=\"1\" ng-false-value=\"0\">\n              <label for=\"checkbox3\">Prix vente public</label>\n            </div>\n            <div class=\"checkbox\" ng-init=\"vm.search.public_price=0\">\n              <input id=\"checkbox4\" ng-model=\"vm.search.public_price\" type=\"checkbox\" ng-true-value=\"1\" ng-false-value=\"0\">\n              <label for=\"checkbox4\">Prix tarif</label>\n            </div>\n            <div class=\"checkbox\" ng-init=\"vm.search.vanam_price=1\">\n              <input id=\"checkbox5\" ng-model=\"vm.search.vanam_price\" type=\"checkbox\" ng-true-value=\"1\" ng-false-value=\"0\">\n              <label for=\"checkbox5\">Prix vente Vanam</label>\n            </div>\n            <label style=\"margin-left: -20px;\">\n              Type d’affichage des tailles\n            </label>\n            <div class=\"radio\">\n              <input id=\"radio1\" name=\"tailles\" type=\"radio\" ng-model=\"vm.search.format_stock\" value=\"1\">\n              <label for=\"radio1\" style=\"padding-left: 21px; font-weight: bold;\">Tailles dans X colonnes</label>\n            </div>\n            <div class=\"radio\">\n              <input id=\"radio2\" name=\"tailles\" type=\"radio\" ng-model=\"vm.search.format_stock\" value=\"2\">\n              <label for=\"radio2\" style=\"padding-left: 21px; font-weight: bold;\">Tailles dans une colonne</label>\n            </div>\n            <div class=\"checkbox\">\n              <input id=\"checkbox7\" type=\"checkbox\" ng-true-value=\"1\" ng-false-value=\"0\">\n              <label for=\"checkbox7\">Emplacement</label>\n            </div>\n            <div class=\"checkbox\" ng-if=\"vm.search.format\" ng-init=\"vm.search.is_by_zone=0\">\n              <input id=\"checkbox8\" ng-model=\"vm.search.is_by_zone\" type=\"checkbox\" ng-true-value=\"1\" ng-false-value=\"0\">\n              <label for=\"checkbox8\">Ranger par zone</label>\n            </div>\n            <div class=\"text-center m-b-md\" ng-init=\"vm.search.format=1\">\n              <button type=\"button\" ng-disabled=\"vm.search.format==1\" ng-class=\"{\'btn-success\': vm.search.format==1}\" ng-click=\"vm.search.format=1\" class=\"btn btn-default waves-effect m-r\"><i class=\"fa fa-file-pdf-o\"></i> PDF</button>\n              <button type=\"button\" ng-disabled=\"vm.search.format==2\" ng-class=\"{\'btn-success\': vm.search.format==2}\" ng-click=\"vm.search.format=2\" class=\"btn btn-default waves-effect\"><i class=\"fa fa-file-excel-o\"></i> EXCEL</button>\n            </div>\n            <div class=\"text-center\">\n              <div class=\"btn btn-sm btn-success\" ng-click=\"vm.getProduits(vm.search.format)\"> Générer </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"modal fade\" id=\"mail\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-lg\">\n    <div class=\"modal-content p-0 b-0\">\n      <div class=\"panel panel-color panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n          <h3 class=\"panel-title\">Envoyer email</h3>\n        </div>\n        <div class=\"panel-body no-padder\">\n          <div class=\"card-box m-n\">\n\n              <form role=\"form\">\n                <div class=\"form-group\">\n                  <input type=\"email\" name=\"a\" class=\"form-control w-full\" placeholder=\" \" ng-model=\"vm.mail.to_email\">\n                  <label for=\"\">À</label>\n                </div>\n                <div class=\"form-group\">\n                  <div class=\"row\">\n                    <div class=\"col-md-6 form-group\">\n                      <input type=\"email\" name=\"css\" class=\"form-control w-full\" placeholder=\" \" ng-model=\"vm.mail.cc\">\n                      <label for=\"\">Cc</label>\n                    </div>\n                    <div class=\"col-md-6 form-group\">\n                      <input type=\"email\" name=\"bcc\" class=\"form-control w-full\" placeholder=\" \" ng-model=\"vm.mail.bcc\">\n                      <label for=\"\">Bcc</label>\n                    </div>\n                  </div>\n                </div>\n                <div class=\"form-group\">\n                  <input type=\"text\" class=\"form-control w-full\" placeholder=\" \" ng-model=\"vm.mail.sujet\">\n                  <label for=\"\">Sujet</label>\n                </div>\n                <div class=\"form-group\">\n                  <textarea class=\"summernote form-control\" id=\"mail_contenu\"></textarea>\n                </div>\n                <div class=\"btn-toolbar form-group m-b-0\">\n                  <div class=\"row\" style=\"display: inline-block; width:80%\">\n                    <div class=\"col-md-3\">\n                      <label class=\"m-t-xs\">Pièce(s) jointe(s) : </label>\n                    </div>\n                    <div class=\"col-md-9\">\n                      <div class=\"attachment\">\n                         <i class=\"fa fa fa-file-pdf-o m-r-10\"></i> <span>produits.pdf</span>\n                      </div>     \n                    </div>\n                  </div>\n\n                  <div class=\"pull-right\">\n                    <button type=\"button\" class=\"btn btn-danger waves-effect waves-light m-r-5\"><i class=\"fa fa-trash-o\"></i></button>\n                    <button class=\"btn btn-success waves-effect waves-light\" ng-click=\"vm.sendMail()\"> <span>Envoyer</span> <i class=\"fa fa-send m-l-10\"></i> </button>\n                  </div>\n                </div>\n              </form>\n\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
            $templateCache.put("modules/profile/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Mon profile</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"card-box\">\n  <form class=\"form\" ng-submit=\"vm.editUser()\">\n    <div class=\"text-center\">\n      <!-- photo existante -->\n      <div ng-if=\"vm.user.url_picture\">\n        <img ng-src=\"http://api.utiledev.vanam.fr/{{ vm.user.url_picture }}\" class=\"text-center max-w-lg img\"  alt=\"\">\n      </div>\n      <!-- photo inexistante -->\n      <div ng-if=\"!vm.user.url_picture\">\n        <img ng-src=\"images/user.png\" class=\"text-center max-w-lg img\"  alt=\"\">\n      </div>\n      <input type=\"file\" name=\"picture\" class=\"form-control hidden\">\n      <div class=\"btn btn-xs btn-danger w-sm m-t-10\" ng-if=\"vm.user.url_picture\" ng-click=\"vm.deletePhoto(vm.user.id)\"><i class=\"fa fa-trash\"></i></div>\n      <div class=\"btn btn-xs btn-success m-t-10\" ng-click=\"vm.uploadPhoto(vm.user.id)\" ng-if=\"vm.canUpload\"><i class=\"fa fa-upload\"></i> upload</div>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-md-6\">\n        <div class=\"form-group\">\n          <input type=\"email\" class=\"form-control\" required=\"\" name=\"mail\" ng-model=\"vm.user.mail\" placeholder=\"Adresse mail\">\n        </div>\n      </div>\n      <div class=\"col-md-6\">\n        <div class=\"input-group\">\n        	<span class=\"input-group-btn\">\n              	<input type=\"{{ vm.passVisible ? \'text\':\'password\' }}\" required=\"\" id=\"password\" class=\"form-control\" placeholder=\"Mot de passe\" ng-model=\"vm.user.passwd\">\n              	<button type=\"button\" class=\"btn waves-effect waves-light btn-primary\" style=\"margin-left: -40px;\" ng-click=\"vm.passVisible = !vm.passVisible\"><i class=\"fa fa-eye\"></i></button>\n           	</span>\n        </div>\n      </div>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-md-6\">\n        <div class=\"form-group\">\n          <input type=\"text\" class=\"form-control\" required=\"\" name=\"name\" ng-model=\"vm.user.name\" placeholder=\"name\">\n        </div>\n      </div>\n      <div class=\"col-md-6\">\n        <div class=\"form-group\">\n          <input type=\"text\" class=\"form-control\" required=\"\" name=\"firstname\" ng-model=\"vm.user.firstname\" placeholder=\"Prénom\">\n        </div>\n      </div>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-md-6\">\n        <div class=\"form-group\">\n          <input type=\"text\" class=\"form-control\" required=\"\" name=\"mobile_line\" ng-model=\"vm.user.mobile_line\" placeholder=\"Mobile line\">\n        </div>\n      </div>\n      <div class=\"col-md-6\">\n        <div class=\"form-group\">\n          <input type=\"text\" class=\"form-control\" name=\"direct_line\" ng-model=\"vm.user.direct_line\" placeholder=\"Direct line\">\n        </div>\n      </div>\n    </div>\n    <div class=\"text-center\">\n      <button class=\"btn btn-success\">Enregistrer</button>\n    </div>\n  </form>\n</div>\n");
            $templateCache.put("modules/sport/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Sport</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"card-box w-xxl no-padder\">\n  <form class=\"row wrapper-sm\" ng-submit=\"vm.addSport();\">\n    <div class=\"col-md-9\">\n      <div class=\"form-group m-n\">\n        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.sport.name\" required=\"\">\n        <label>Sport</label>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <button type=\"submit\" class=\"btn btn-success\">Ajouter</button>\n    </div>\n  </form>\n</div>\n<div class=\"card-box table-responsive\">\n  <table id=\"sports\" class=\"table table-striped\" ng-init=\"vm.getSports()\">\n    <thead>\n      <tr>\n        <th>Nom</th>\n        <th width=\"60\">Actions</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr ng-repeat=\"(key, value) in vm.sports track by $index\">\n         \n        <td>\n          <span ng-hide=\"edit\">{{ value.name }}</span>\n          <input ng-show=\"edit\" type=\"text\" ng-model=\"value.name\" ng-keydown=\"$event.keyCode === 13 && vm.updateSport(value)\" class=\"form-control\">\n        </td>\n        <td>\n          <div class=\"btn btn-xs btn-info\" ng-hide=\"edit\" ng-click=\"edit=true\"><i class=\"fa fa-pencil\"></i></div>\n          <div class=\"btn btn-xs btn-success\" ng-click=\"vm.updateSport(value); edit=false;\" ng-show=\"edit\" ng-click=\"edit=false\"><i class=\"fa fa-check\"></i></div>\n          <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteSport(value.id)\"><i class=\"fa fa-trash\"></i></div>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n</div>");
            $templateCache.put("modules/utilisateurs/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Utilisateurs</h4>\n      <div class=\"pull-right\">\n        <button class=\"btn btn-primary btn-sm waves-effect waves-light\" data-toggle=\"modal\" ng-click=\"vm.editing=0; vm.user = {}\" data-target=\"#addUser\">Ajouter utilisateur</button>\n      </div>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"modal fade\" id=\"addUser\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\" style=\"display: none;\">\n  <div class=\"modal-dialog modal-md\">\n    <div class=\"modal-content\">\n      <div class=\"modal-header\">\n        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n        <h4 class=\"modal-title\">\n                {{ vm.editing ? \'Modifier\':\'Ajouter\' }} utilisateur</h4>\n      </div>\n      <div class=\"modal-body\">\n        <form class=\"form\" ng-submit=\"vm.editing?vm.editUser():vm.addUser()\">\n          <div ng-if=\"vm.editing\" class=\"text-center\">\n            <!-- photo existante -->\n            <div ng-if=\"vm.user.url_picture\">\n              <img ng-src=\"http://api.utiledev.vanam.fr/{{ vm.user.url_picture }}\" class=\"text-center max-w-lg img\"  alt=\"\">\n            </div>\n            <!-- photo inexistante -->\n            <div ng-if=\"!vm.user.url_picture\">\n              <img ng-src=\"images/user.png\" class=\"text-center max-w-lg img\" type=\"image/png\" alt=\"\" >\n            </div>\n            <input type=\"file\" name=\"picture\" class=\"form-control hidden\">\n            <div class=\"btn btn-xs btn-danger w-sm m-t-10\" ng-if=\"vm.user.url_picture\" ng-click=\"vm.deletePhoto(vm.user.id)\"><i class=\"fa fa-trash\"></i></div>\n            <div class=\"btn btn-xs btn-success m-t-10\" ng-click=\"vm.uploadPhoto(vm.user.id)\" ng-if=\"vm.canUpload\" ng-click=\"vm.uploadPhoto( vm.user.id )\"><i class=\"fa fa-upload\"></i> upload</div>\n          </div>\n          <div class=\"row\">\n            <div class=\"col-md-6\">\n              <div class=\"form-group\">\n                <input type=\"email\" class=\"form-control\" required=\"\" name=\"mail\" ng-model=\"vm.user.mail\" placeholder=\" \">\n                <label>Adresse mail</label>\n              </div>\n            </div>\n            <div class=\"col-md-6\">\n              <div class=\"input-group\">\n                <div>\n                  <span class=\"input-group-btn\">\n                    <input type=\"{{ vm.passVisible ? \'text\':\'password\' }}\" required=\"\" id=\"password\" class=\"form-control\" placeholder=\"Mot de passe\" ng-model=\"vm.user.passwd\">\n                    <button type=\"button\" class=\"btn waves-effect waves-light btn-primary\" ng-click=\"vm.passVisible = !vm.passVisible\"><i class=\"fa fa-eye\"></i></button>\n                  </span>\n                </div>\n              </div>\n            </div>\n          </div>\n          <div class=\"row\">\n            <div class=\"col-md-6\">\n              <div class=\"form-group\">\n                <input type=\"text\" class=\"form-control\" required=\"\" name=\"name\" ng-model=\"vm.user.name\" placeholder=\" \">\n                <label>Nom</label>\n              </div>\n            </div>\n            <div class=\"col-md-6\">\n              <div class=\"form-group\">\n                <input type=\"text\" class=\"form-control\" required=\"\" name=\"firstname\" ng-model=\"vm.user.firstname\" placeholder=\" \">\n                <label>Prénom</label>\n              </div>\n            </div>\n          </div>\n          <div class=\"row\">\n            <div class=\"col-md-6\">\n              <div class=\"form-group\">\n                <input type=\"text\" class=\"form-control\" required=\"\" name=\"mobile_line\" ng-model=\"vm.user.mobile_line\" placeholder=\" \">\n                <label>Mobile line</label>\n              </div>\n            </div>\n            <div class=\"col-md-6\">\n              <div class=\"form-group\">\n                <input type=\"text\" class=\"form-control\" name=\"direct_line\" ng-model=\"vm.user.direct_line\" placeholder=\" \">\n                <label>Direct line</label>\n              </div>\n            </div>\n          </div>\n          <div class=\"form-group\">\n            <label for=\"\" ng-if=\"vm.user.role_id == 4\">Client</label>\n            <select name=\"\" class=\"form-control\" required=\"\" ng-model=\"vm.user.role_id\" ng-if=\"vm.user.role_id!=4\">\n              <option value=\"\" class=\"hidden\">-- Choisir un role --</option>\n              <option ng-if=\"app.data.user.role.id == 1 \" ng-selected=\"vm.user.role == 2\" value=\'2\'>ADMIN</option>\n              <option ng-selected=\"vm.user.role == 3\" value=\'3\'>LOGISTIQUE</option>\n              <option ng-selected=\"vm.user.role == 5\" value=\'5\'>AGENT</option>\n            </select>\n          </div>\n          <div class=\"form-group\" ng-if=\"vm.editing\">\n            <input type=\"checkbox\" id=\"switch1\" ng-true-value=\"\'1\'\" ng-false-value=\"\'0\'\" ng-model=\"vm.user.activate\" ng-checked=\"vm.user.activate\" switch=\"bool\" />\n            <label for=\"switch1\" data-on-label=\"Actif\" data-off-label=\"Inactif\"></label>\n          </div>\n          <div class=\"text-center\">\n            <button class=\"btn btn-success\">Enregistrer</button>\n          </div>\n        </form>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <div class=\"card-box table-responsive\">\n      <table id=\"users\" class=\"table table-striped\" ng-init=\"vm.getUsers()\">\n        <thead>\n          <tr>\n            <th width=\"50\"></th>\n            <th>Mail</th>\n            <th>Nom Prénom</th>\n            <th width=\"100\">Role</th>\n            <th width=\"60\">Etat</th>\n            <th width=\"80\">Actions</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat=\"(key, value) in vm.users track by $index\">\n            <td>\n              <img ng-src=\"http://api.utiledev.vanam.fr/{{ value.url_picture }}\" class=\"thumb-sm img-circle\" ng-if=\"value.url_picture\" alt=\"\">\n              <span class=\"avatar-sm-box bg-warning\" ng-if=\"!value.url_picture\">{{ value.name[0] | uppercase }}</span>\n            </td>\n            <td>{{ value.mail }}</td>\n            <td>{{ value.name }} {{ value.firstname }}</td>\n            <td>{{ value.role.role }}</td>\n            <td>\n              <i ng-if=\"value.activate == \'0\'\" class=\"fa fa-circle text-danger\"></i>\n              <i ng-if=\"value.activate == \'1\'\" class=\"fa fa-circle text-success\"></i>\n            </td>\n            <td>\n              <div class=\"btn btn-xs btn-info\" ng-hide=\"value.role_id==1 && app.data.user.role.id == 2\" data-toggle=\"modal\" data-target=\"#addUser\" ng-click=\"vm.edit( value )\"><i class=\"fa fa-pencil\"></i></div>\n              <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.delete(value.id)\"><i class=\"fa fa-trash\"></i></div>\n            </td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n  </div>\n</div>\n");
            $templateCache.put("modules/zonages/index.html", "<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div class=\"page-title-box\">\n      <h4 class=\"page-title\">Zonage</h4>\n      <div class=\"clearfix\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"card-box no-padder\" style=\"width: 380px\">\n  <form class=\"row wrapper-sm\" ng-submit=\"vm.addZonage();\">\n    <div class=\"col-md-6\">\n      <div class=\"form-group m-n\">\n        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.zonage.city\" required=\"\">\n        <label>Ville</label>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <div class=\"form-group m-n\">\n        <input type=\"text\" class=\"form-control\" placeholder=\" \" ng-model=\"vm.zonage.trigram\" required=\"\">\n        <label>Trigramme</label>\n      </div>\n    </div>\n    <div class=\"col-md-3\">\n      <button type=\"submit\" class=\"btn btn-success\">Ajouter</button>\n    </div>\n  </form>\n</div>\n<div class=\"card-box table-responsive\">\n  <table id=\"zonages\" class=\"table table-striped\" ng-init=\"vm.getZonages()\">\n    <thead>\n      <tr>\n        <th>Ville</th>\n        <th>Trigramme</th>\n        <th width=\"60\">Actions</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr ng-repeat=\"(key, value) in vm.zonages track by $index\">\n         \n        <td>\n          <span ng-hide=\"edit\">{{ value.city }}</span>\n          <input ng-show=\"edit\" type=\"text\" ng-model=\"value.city\" ng-keydown=\"$event.keyCode === 13 && vm.updateZonage(value)\" class=\"form-control\">\n        </td>\n        <td>\n          <span ng-hide=\"edit\">{{ value.trigram }}</span>\n          <input ng-show=\"edit\" type=\"text\" ng-model=\"value.trigram\" ng-keydown=\"$event.keyCode === 13 && vm.updateZonage(value)\" class=\"form-control\">\n        </td>\n        <td>\n          <div class=\"btn btn-xs btn-info\" ng-hide=\"edit\" ng-click=\"edit=true\"><i class=\"fa fa-pencil\"></i></div>\n          <div class=\"btn btn-xs btn-success\" ng-click=\"vm.updateZonage(value); edit=false;\" ng-show=\"edit\" ng-click=\"edit=false\"><i class=\"fa fa-check\"></i></div>\n          <div class=\"btn btn-xs btn-danger\" ng-click=\"vm.deleteZonage(value.id)\"><i class=\"fa fa-trash\"></i></div>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n\n</div>");
        }]);
    }, {}],
    "../node_modules/angucomplete-alt/angucomplete-alt.js": [function (require, module, exports) {
        /*
         * angucomplete-alt
         * Autocomplete directive for AngularJS
         * This is a fork of Daryl Rowland's angucomplete with some extra features.
         * By Hidenari Nozaki
         */

        /*! Copyright (c) 2014 Hidenari Nozaki and contributors | Licensed under the MIT license */

        (function (root, factory) {
            'use strict';
            if (typeof module !== 'undefined' && module.exports) {
                // CommonJS
                module.exports = factory(require('angular'));
            } else if (typeof define === 'function' && define.amd) {
                // AMD
                define(['angular'], factory);
            } else {
                // Global Variables
                factory(root.angular);
            }
        }(window, function (angular) {
            'use strict';

            angular.module('angucomplete-alt', []).directive('angucompleteAlt', ['$q', '$parse', '$http', '$sce', '$timeout', '$templateCache', '$interpolate', function ($q, $parse, $http, $sce, $timeout, $templateCache, $interpolate) {
                // keyboard events
                var KEY_DW = 40;
                var KEY_RT = 39;
                var KEY_UP = 38;
                var KEY_LF = 37;
                var KEY_ES = 27;
                var KEY_EN = 13;
                var KEY_TAB = 9;

                var MIN_LENGTH = 3;
                var MAX_LENGTH = 524288;  // the default max length per the html maxlength attribute
                var PAUSE = 500;
                var BLUR_TIMEOUT = 200;

                // string constants
                var REQUIRED_CLASS = 'autocomplete-required';
                var TEXT_SEARCHING = 'Searching...';
                var TEXT_NORESULTS = 'No results found';
                var TEMPLATE_URL = '/angucomplete-alt/index.html';

                // Set the default template for this directive
                $templateCache.put(TEMPLATE_URL,
                    '<div class="angucomplete-holder" ng-class="{\'angucomplete-dropdown-visible\': showDropdown}">' +
                    '  <input id="{{id}}_value" name="{{inputName}}" tabindex="{{fieldTabindex}}" ng-class="{\'angucomplete-input-not-empty\': notEmpty}" ng-model="searchStr" ng-disabled="disableInput" type="{{inputType}}" placeholder="{{placeholder}}" maxlength="{{maxlength}}" ng-focus="onFocusHandler()" class="{{inputClass}}" ng-focus="resetHideResults()" ng-blur="hideResults($event)" autocapitalize="off" autocorrect="off" autocomplete="off" ng-change="inputChangeHandler(searchStr)"/>' +
                    '  <div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-show="showDropdown">' +
                    '    <div class="angucomplete-searching" ng-show="searching" ng-bind="textSearching"></div>' +
                    '    <div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)" ng-bind="textNoResults"></div>' +
                    '    <div class="angucomplete-row" ng-repeat="result in results" ng-click="selectResult(result)" ng-mouseenter="hoverRow($index)" ng-class="{\'angucomplete-selected-row\': $index == currentIndex}">' +
                    '      <div ng-if="imageField" class="angucomplete-image-holder">' +
                    '        <img ng-if="result.image && result.image != \'\'" ng-src="{{result.image}}" class="angucomplete-image"/>' +
                    '        <div ng-if="!result.image && result.image != \'\'" class="angucomplete-image-default"></div>' +
                    '      </div>' +
                    '      <div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div>' +
                    '      <div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div>' +
                    '      <div ng-if="matchClass && result.description && result.description != \'\'" class="angucomplete-description" ng-bind-html="result.description"></div>' +
                    '      <div ng-if="!matchClass && result.description && result.description != \'\'" class="angucomplete-description">{{result.description}}</div>' +
                    '    </div>' +
                    '  </div>' +
                    '</div>'
                );

                function link(scope, elem, attrs, ctrl) {
                    var inputField = elem.find('input');
                    var minlength = MIN_LENGTH;
                    var searchTimer = null;
                    var hideTimer;
                    var requiredClassName = REQUIRED_CLASS;
                    var responseFormatter;
                    var validState = null;
                    var httpCanceller = null;
                    var httpCallInProgress = false;
                    var dd = elem[0].querySelector('.angucomplete-dropdown');
                    var isScrollOn = false;
                    var mousedownOn = null;
                    var unbindInitialValue;
                    var displaySearching;
                    var displayNoResults;

                    elem.on('mousedown', function (event) {
                        if (event.target.id) {
                            mousedownOn = event.target.id;
                            if (mousedownOn === scope.id + '_dropdown') {
                                document.body.addEventListener('click', clickoutHandlerForDropdown);
                            }
                        }
                        else {
                            mousedownOn = event.target.className;
                        }
                    });

                    scope.currentIndex = scope.focusFirst ? 0 : null;
                    scope.searching = false;
                    unbindInitialValue = scope.$watch('initialValue', function (newval) {
                        if (newval) {
                            // remove scope listener
                            unbindInitialValue();
                            // change input
                            handleInputChange(newval, true);
                        }
                    });

                    scope.$watch('fieldRequired', function (newval, oldval) {
                        if (newval !== oldval) {
                            if (!newval) {
                                ctrl[scope.inputName].$setValidity(requiredClassName, true);
                            }
                            else if (!validState || scope.currentIndex === -1) {
                                handleRequired(false);
                            }
                            else {
                                handleRequired(true);
                            }
                        }
                    });

                    scope.$on('angucomplete-alt:clearInput', function (event, elementId) {
                        if (!elementId || elementId === scope.id) {
                            scope.searchStr = null;
                            callOrAssign();
                            handleRequired(false);
                            clearResults();
                        }
                    });

                    scope.$on('angucomplete-alt:changeInput', function (event, elementId, newval) {
                        if (!!elementId && elementId === scope.id) {
                            handleInputChange(newval);
                        }
                    });

                    function handleInputChange(newval, initial) {
                        if (newval) {
                            if (typeof newval === 'object') {
                                scope.searchStr = extractTitle(newval);
                                callOrAssign({originalObject: newval});
                            } else if (typeof newval === 'string' && newval.length > 0) {
                                scope.searchStr = newval;
                            } else {
                                if (console && console.error) {
                                    console.error('Tried to set ' + (!!initial ? 'initial' : '') + ' value of angucomplete to', newval, 'which is an invalid value');
                                }
                            }

                            handleRequired(true);
                        }
                    }

                    // #194 dropdown list not consistent in collapsing (bug).
                    function clickoutHandlerForDropdown(event) {
                        mousedownOn = null;
                        scope.hideResults(event);
                        document.body.removeEventListener('click', clickoutHandlerForDropdown);
                    }

                    // for IE8 quirkiness about event.which
                    function ie8EventNormalizer(event) {
                        return event.which ? event.which : event.keyCode;
                    }

                    function callOrAssign(value) {
                        if (typeof scope.selectedObject === 'function') {
                            scope.selectedObject(value, scope.selectedObjectData);
                        }
                        else {
                            scope.selectedObject = value;
                        }

                        if (value) {
                            handleRequired(true);
                        }
                        else {
                            handleRequired(false);
                        }
                    }

                    function callFunctionOrIdentity(fn) {
                        return function (data) {
                            return scope[fn] ? scope[fn](data) : data;
                        };
                    }

                    function setInputString(str) {
                        callOrAssign({originalObject: str});

                        if (scope.clearSelected) {
                            scope.searchStr = null;
                        }
                        clearResults();
                    }

                    function extractTitle(data) {
                        // split title fields and run extractValue for each and join with ' '
                        return scope.titleField.split(',')
                            .map(function (field) {
                                return extractValue(data, field);
                            })
                            .join(' ');
                    }

                    function extractValue(obj, key) {
                        var keys, result;
                        if (key) {
                            keys = key.split('.');
                            result = obj;
                            for (var i = 0; i < keys.length; i++) {
                                result = result[keys[i]];
                            }
                        }
                        else {
                            result = obj;
                        }
                        return result;
                    }

                    function findMatchString(target, str) {
                        var result, matches, re;
                        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
                        // Escape user input to be treated as a literal string within a regular expression
                        re = new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                        if (!target) {
                            return;
                        }
                        if (!target.match || !target.replace) {
                            target = target.toString();
                        }
                        matches = target.match(re);
                        if (matches) {
                            result = target.replace(re,
                                '<span class="' + scope.matchClass + '">' + matches[0] + '</span>');
                        }
                        else {
                            result = target;
                        }
                        return $sce.trustAsHtml(result);
                    }

                    function handleRequired(valid) {
                        scope.notEmpty = valid;
                        validState = scope.searchStr;
                        if (scope.fieldRequired && ctrl && scope.inputName) {
                            ctrl[scope.inputName].$setValidity(requiredClassName, valid);
                        }
                    }

                    function keyupHandler(event) {
                        var which = ie8EventNormalizer(event);
                        if (which === KEY_LF || which === KEY_RT) {
                            // do nothing
                            return;
                        }

                        if (which === KEY_UP || which === KEY_EN) {
                            event.preventDefault();
                        }
                        else if (which === KEY_DW) {
                            event.preventDefault();
                            if (!scope.showDropdown && scope.searchStr && scope.searchStr.length >= minlength) {
                                initResults();
                                scope.searching = true;
                                searchTimerComplete(scope.searchStr);
                            }
                        }
                        else if (which === KEY_ES) {
                            clearResults();
                            scope.$apply(function () {
                                inputField.val(scope.searchStr);
                            });
                        }
                        else {
                            if (minlength === 0 && !scope.searchStr) {
                                return;
                            }

                            if (!scope.searchStr || scope.searchStr === '') {
                                scope.showDropdown = false;
                            } else if (scope.searchStr.length >= minlength) {
                                initResults();

                                if (searchTimer) {
                                    $timeout.cancel(searchTimer);
                                }

                                scope.searching = true;

                                searchTimer = $timeout(function () {
                                    searchTimerComplete(scope.searchStr);
                                }, scope.pause);
                            }

                            if (validState && validState !== scope.searchStr && !scope.clearSelected) {
                                scope.$apply(function () {
                                    callOrAssign();
                                });
                            }
                        }
                    }

                    function handleOverrideSuggestions(event) {
                        if (scope.overrideSuggestions &&
                            !(scope.selectedObject && scope.selectedObject.originalObject === scope.searchStr)) {
                            if (event) {
                                event.preventDefault();
                            }

                            // cancel search timer
                            $timeout.cancel(searchTimer);
                            // cancel http request
                            cancelHttpRequest();

                            setInputString(scope.searchStr);
                        }
                    }

                    function dropdownRowOffsetHeight(row) {
                        var css = getComputedStyle(row);
                        return row.offsetHeight +
                            parseInt(css.marginTop, 10) + parseInt(css.marginBottom, 10);
                    }

                    function dropdownHeight() {
                        return dd.getBoundingClientRect().top +
                            parseInt(getComputedStyle(dd).maxHeight, 10);
                    }

                    function dropdownRow() {
                        return elem[0].querySelectorAll('.angucomplete-row')[scope.currentIndex];
                    }

                    function dropdownRowTop() {
                        return dropdownRow().getBoundingClientRect().top -
                            (dd.getBoundingClientRect().top +
                                parseInt(getComputedStyle(dd).paddingTop, 10));
                    }

                    function dropdownScrollTopTo(offset) {
                        dd.scrollTop = dd.scrollTop + offset;
                    }

                    function updateInputField() {
                        var current = scope.results[scope.currentIndex];
                        if (scope.matchClass) {
                            inputField.val(extractTitle(current.originalObject));
                        }
                        else {
                            inputField.val(current.title);
                        }
                    }

                    function keydownHandler(event) {
                        var which = ie8EventNormalizer(event);
                        var row = null;
                        var rowTop = null;

                        if (which === KEY_EN && scope.results) {
                            if (scope.currentIndex >= 0 && scope.currentIndex < scope.results.length) {
                                event.preventDefault();
                                scope.selectResult(scope.results[scope.currentIndex]);
                            } else {
                                handleOverrideSuggestions(event);
                                clearResults();
                            }
                            scope.$apply();
                        } else if (which === KEY_DW && scope.results) {
                            event.preventDefault();
                            if ((scope.currentIndex + 1) < scope.results.length && scope.showDropdown) {
                                scope.$apply(function () {
                                    scope.currentIndex++;
                                    updateInputField();
                                });

                                if (isScrollOn) {
                                    row = dropdownRow();
                                    if (dropdownHeight() < row.getBoundingClientRect().bottom) {
                                        dropdownScrollTopTo(dropdownRowOffsetHeight(row));
                                    }
                                }
                            }
                        } else if (which === KEY_UP && scope.results) {
                            event.preventDefault();
                            if (scope.currentIndex >= 1) {
                                scope.$apply(function () {
                                    scope.currentIndex--;
                                    updateInputField();
                                });

                                if (isScrollOn) {
                                    rowTop = dropdownRowTop();
                                    if (rowTop < 0) {
                                        dropdownScrollTopTo(rowTop - 1);
                                    }
                                }
                            }
                            else if (scope.currentIndex === 0) {
                                scope.$apply(function () {
                                    scope.currentIndex = -1;
                                    inputField.val(scope.searchStr);
                                });
                            }
                        } else if (which === KEY_TAB) {
                            if (scope.results && scope.results.length > 0 && scope.showDropdown) {
                                if (scope.currentIndex === -1 && scope.overrideSuggestions) {
                                    // intentionally not sending event so that it does not
                                    // prevent default tab behavior
                                    handleOverrideSuggestions();
                                }
                                else {
                                    if (scope.currentIndex === -1) {
                                        scope.currentIndex = 0;
                                    }
                                    scope.selectResult(scope.results[scope.currentIndex]);
                                    scope.$digest();
                                }
                            }
                            else {
                                // no results
                                // intentionally not sending event so that it does not
                                // prevent default tab behavior
                                if (scope.searchStr && scope.searchStr.length > 0) {
                                    handleOverrideSuggestions();
                                }
                            }
                        } else if (which === KEY_ES) {
                            // This is very specific to IE10/11 #272
                            // without this, IE clears the input text
                            event.preventDefault();
                        }
                    }

                    function httpSuccessCallbackGen(str) {
                        return function (responseData, status, headers, config) {
                            // normalize return obejct from promise
                            if (!status && !headers && !config && responseData.data) {
                                responseData = responseData.data;
                            }
                            scope.searching = false;
                            processResults(
                                extractValue(responseFormatter(responseData), scope.remoteUrlDataField),
                                str);
                        };
                    }

                    function httpErrorCallback(errorRes, status, headers, config) {
                        scope.searching = httpCallInProgress;

                        // normalize return obejct from promise
                        if (!status && !headers && !config) {
                            status = errorRes.status;
                        }

                        // cancelled/aborted
                        if (status === 0 || status === -1) {
                            return;
                        }
                        if (scope.remoteUrlErrorCallback) {
                            scope.remoteUrlErrorCallback(errorRes, status, headers, config);
                        }
                        else {
                            if (console && console.error) {
                                console.error('http error');
                            }
                        }
                    }

                    function cancelHttpRequest() {
                        if (httpCanceller) {
                            httpCanceller.resolve();
                        }
                    }

                    function getRemoteResults(str) {
                        var params = {},
                            url = scope.remoteUrl + encodeURIComponent(str);
                        if (scope.remoteUrlRequestFormatter) {
                            params = {params: scope.remoteUrlRequestFormatter(str)};
                            url = scope.remoteUrl;
                        }
                        if (!!scope.remoteUrlRequestWithCredentials) {
                            params.withCredentials = true;
                        }
                        cancelHttpRequest();
                        httpCanceller = $q.defer();
                        params.timeout = httpCanceller.promise;
                        httpCallInProgress = true;
                        $http.get(url, params)
                            .then(httpSuccessCallbackGen(str))
                            .catch(httpErrorCallback)
                            .finally(function () {
                                httpCallInProgress = false;
                            });
                    }

                    function getRemoteResultsWithCustomHandler(str) {
                        cancelHttpRequest();

                        httpCanceller = $q.defer();

                        scope.remoteApiHandler(str, httpCanceller.promise)
                            .then(httpSuccessCallbackGen(str))
                            .catch(httpErrorCallback);

                        /* IE8 compatible
                        scope.remoteApiHandler(str, httpCanceller.promise)
                          ['then'](httpSuccessCallbackGen(str))
                          ['catch'](httpErrorCallback);
                        */
                    }

                    function clearResults() {
                        scope.showDropdown = false;
                        scope.results = [];
                        if (dd) {
                            dd.scrollTop = 0;
                        }
                    }

                    function initResults() {
                        scope.showDropdown = displaySearching;
                        scope.currentIndex = scope.focusFirst ? 0 : -1;
                        scope.results = [];
                    }

                    function getLocalResults(str) {
                        var i, match, s, value,
                            searchFields = scope.searchFields.split(','),
                            matches = [];
                        if (typeof scope.parseInput() !== 'undefined') {
                            str = scope.parseInput()(str);
                        }
                        for (i = 0; i < scope.localData.length; i++) {
                            match = false;

                            for (s = 0; s < searchFields.length; s++) {
                                value = extractValue(scope.localData[i], searchFields[s]) || '';
                                match = match || (value.toString().toLowerCase().indexOf(str.toString().toLowerCase()) >= 0);
                            }

                            if (match) {
                                matches[matches.length] = scope.localData[i];
                            }
                        }
                        return matches;
                    }

                    function checkExactMatch(result, obj, str) {
                        if (!str) {
                            return false;
                        }
                        for (var key in obj) {
                            if (obj[key].toLowerCase() === str.toLowerCase()) {
                                scope.selectResult(result);
                                return true;
                            }
                        }
                        return false;
                    }

                    function searchTimerComplete(str) {
                        // Begin the search
                        if (!str || str.length < minlength) {
                            return;
                        }
                        if (scope.localData) {
                            scope.$apply(function () {
                                var matches;
                                if (typeof scope.localSearch() !== 'undefined') {
                                    matches = scope.localSearch()(str, scope.localData);
                                } else {
                                    matches = getLocalResults(str);
                                }
                                scope.searching = false;
                                processResults(matches, str);
                            });
                        }
                        else if (scope.remoteApiHandler) {
                            getRemoteResultsWithCustomHandler(str);
                        } else {
                            getRemoteResults(str);
                        }
                    }

                    function processResults(responseData, str) {
                        var i, description, image, text, formattedText, formattedDesc;

                        if (responseData && responseData.length > 0) {
                            scope.results = [];

                            for (i = 0; i < responseData.length; i++) {
                                if (scope.titleField && scope.titleField !== '') {
                                    text = formattedText = extractTitle(responseData[i]);
                                }

                                description = '';
                                if (scope.descriptionField) {
                                    description = formattedDesc = extractValue(responseData[i], scope.descriptionField);
                                }

                                image = '';
                                if (scope.imageField) {
                                    image = extractValue(responseData[i], scope.imageField);
                                }

                                if (scope.matchClass) {
                                    formattedText = findMatchString(text, str);
                                    formattedDesc = findMatchString(description, str);
                                }

                                scope.results[scope.results.length] = {
                                    title: formattedText,
                                    description: formattedDesc,
                                    image: image,
                                    originalObject: responseData[i]
                                };
                            }

                        } else {
                            scope.results = [];
                        }

                        if (scope.autoMatch && scope.results.length === 1 &&
                            checkExactMatch(scope.results[0],
                                {title: text, desc: description || ''}, scope.searchStr)) {
                            scope.showDropdown = false;
                        } else if (scope.results.length === 0 && !displayNoResults) {
                            scope.showDropdown = false;
                        } else {
                            scope.showDropdown = true;
                        }
                    }

                    function showAll() {
                        if (scope.localData) {
                            scope.searching = false;
                            processResults(scope.localData, '');
                        }
                        else if (scope.remoteApiHandler) {
                            scope.searching = true;
                            getRemoteResultsWithCustomHandler('');
                        }
                        else {
                            scope.searching = true;
                            getRemoteResults('');
                        }
                    }

                    scope.onFocusHandler = function () {
                        if (scope.focusIn) {
                            scope.focusIn();
                        }
                        if (minlength === 0 && (!scope.searchStr || scope.searchStr.length === 0)) {
                            scope.currentIndex = scope.focusFirst ? 0 : scope.currentIndex;
                            scope.showDropdown = true;
                            showAll();
                        }
                    };

                    scope.hideResults = function () {
                        if (mousedownOn &&
                            (mousedownOn === scope.id + '_dropdown' ||
                                mousedownOn.indexOf('angucomplete') >= 0)) {
                            mousedownOn = null;
                        }
                        else {
                            hideTimer = $timeout(function () {
                                clearResults();
                                scope.$apply(function () {
                                    if (scope.searchStr && scope.searchStr.length > 0) {
                                        inputField.val(scope.searchStr);
                                    }
                                });
                            }, BLUR_TIMEOUT);
                            cancelHttpRequest();

                            if (scope.focusOut) {
                                scope.focusOut();
                            }

                            if (scope.overrideSuggestions) {
                                if (scope.searchStr && scope.searchStr.length > 0 && scope.currentIndex === -1) {
                                    handleOverrideSuggestions();
                                }
                            }
                        }
                    };

                    scope.resetHideResults = function () {
                        if (hideTimer) {
                            $timeout.cancel(hideTimer);
                        }
                    };

                    scope.hoverRow = function (index) {
                        scope.currentIndex = index;
                    };

                    scope.selectResult = function (result) {
                        // Restore original values
                        if (scope.matchClass) {
                            result.title = extractTitle(result.originalObject);
                            result.description = extractValue(result.originalObject, scope.descriptionField);
                        }

                        if (scope.clearSelected) {
                            scope.searchStr = null;
                        }
                        else {
                            scope.searchStr = result.title;
                        }
                        callOrAssign(result);
                        clearResults();
                    };

                    scope.inputChangeHandler = function (str) {
                        if (str.length < minlength) {
                            cancelHttpRequest();
                            clearResults();
                        }
                        else if (str.length === 0 && minlength === 0) {
                            showAll();
                        }

                        if (scope.inputChanged) {
                            str = scope.inputChanged(str);
                        }
                        return str;
                    };

                    // check required
                    if (scope.fieldRequiredClass && scope.fieldRequiredClass !== '') {
                        requiredClassName = scope.fieldRequiredClass;
                    }

                    // check min length
                    if (scope.minlength && scope.minlength !== '') {
                        minlength = parseInt(scope.minlength, 10);
                    }

                    // check pause time
                    if (!scope.pause) {
                        scope.pause = PAUSE;
                    }

                    // check clearSelected
                    if (!scope.clearSelected) {
                        scope.clearSelected = false;
                    }

                    // check override suggestions
                    if (!scope.overrideSuggestions) {
                        scope.overrideSuggestions = false;
                    }

                    // check required field
                    if (scope.fieldRequired && ctrl) {
                        // check initial value, if given, set validitity to true
                        if (scope.initialValue) {
                            handleRequired(true);
                        }
                        else {
                            handleRequired(false);
                        }
                    }

                    scope.inputType = attrs.type ? attrs.type : 'text';

                    // set strings for "Searching..." and "No results"
                    scope.textSearching = attrs.textSearching ? attrs.textSearching : TEXT_SEARCHING;
                    scope.textNoResults = attrs.textNoResults ? attrs.textNoResults : TEXT_NORESULTS;
                    displaySearching = scope.textSearching === 'false' ? false : true;
                    displayNoResults = scope.textNoResults === 'false' ? false : true;

                    // set max length (default to maxlength deault from html
                    scope.maxlength = attrs.maxlength ? attrs.maxlength : MAX_LENGTH;

                    // register events
                    inputField.on('keydown', keydownHandler);
                    inputField.on('keyup compositionend', keyupHandler);

                    // set response formatter
                    responseFormatter = callFunctionOrIdentity('remoteUrlResponseFormatter');

                    // set isScrollOn
                    $timeout(function () {
                        var css = getComputedStyle(dd);
                        isScrollOn = css.maxHeight && css.overflowY === 'auto';
                    });
                }

                return {
                    restrict: 'EA',
                    require: '^?form',
                    scope: {
                        selectedObject: '=',
                        selectedObjectData: '=',
                        disableInput: '=',
                        initialValue: '=',
                        localData: '=',
                        localSearch: '&',
                        remoteUrlRequestFormatter: '=',
                        remoteUrlRequestWithCredentials: '@',
                        remoteUrlResponseFormatter: '=',
                        remoteUrlErrorCallback: '=',
                        remoteApiHandler: '=',
                        id: '@',
                        type: '@',
                        placeholder: '@',
                        textSearching: '@',
                        textNoResults: '@',
                        remoteUrl: '@',
                        remoteUrlDataField: '@',
                        titleField: '@',
                        descriptionField: '@',
                        imageField: '@',
                        inputClass: '@',
                        pause: '@',
                        searchFields: '@',
                        minlength: '@',
                        matchClass: '@',
                        clearSelected: '@',
                        overrideSuggestions: '@',
                        fieldRequired: '=',
                        fieldRequiredClass: '@',
                        inputChanged: '=',
                        autoMatch: '@',
                        focusOut: '&',
                        focusIn: '&',
                        fieldTabindex: '@',
                        inputName: '@',
                        focusFirst: '@',
                        parseInput: '&'
                    },
                    templateUrl: function (element, attrs) {
                        return attrs.templateUrl || TEMPLATE_URL;
                    },
                    compile: function (tElement) {
                        var startSym = $interpolate.startSymbol();
                        var endSym = $interpolate.endSymbol();
                        if (!(startSym === '{{' && endSym === '}}')) {
                            var interpolatedHtml = tElement.html()
                                .replace(/\{\{/g, startSym)
                                .replace(/\}\}/g, endSym);
                            tElement.html(interpolatedHtml);
                        }
                        return link;
                    }
                };
            }]);

        }));

    }, {"angular": "../node_modules/angular/index.js"}],
    "../node_modules/angular-cookies/angular-cookies.js": [function (require, module, exports) {
        /**
         * @license AngularJS v1.6.6
         * (c) 2010-2017 Google, Inc. http://angularjs.org
         * License: MIT
         */
        (function (window, angular) {
            'use strict';

            /**
             * @ngdoc module
             * @name ngCookies
             * @description
             *
             * # ngCookies
             *
             * The `ngCookies` module provides a convenient wrapper for reading and writing browser cookies.
             *
             *
             * <div doc-module-components="ngCookies"></div>
             *
             * See {@link ngCookies.$cookies `$cookies`} for usage.
             */


            angular.module('ngCookies', ['ng']).info({angularVersion: '1.6.6'}).
            /**
             * @ngdoc provider
             * @name $cookiesProvider
             * @description
             * Use `$cookiesProvider` to change the default behavior of the {@link ngCookies.$cookies $cookies} service.
             * */
            provider('$cookies', [/** @this */function $CookiesProvider() {
                /**
                 * @ngdoc property
                 * @name $cookiesProvider#defaults
                 * @description
                 *
                 * Object containing default options to pass when setting cookies.
                 *
                 * The object may have following properties:
                 *
                 * - **path** - `{string}` - The cookie will be available only for this path and its
                 *   sub-paths. By default, this is the URL that appears in your `<base>` tag.
                 * - **domain** - `{string}` - The cookie will be available only for this domain and
                 *   its sub-domains. For security reasons the user agent will not accept the cookie
                 *   if the current domain is not a sub-domain of this domain or equal to it.
                 * - **expires** - `{string|Date}` - String of the form "Wdy, DD Mon YYYY HH:MM:SS GMT"
                 *   or a Date object indicating the exact date/time this cookie will expire.
                 * - **secure** - `{boolean}` - If `true`, then the cookie will only be available through a
                 *   secured connection.
                 *
                 * Note: By default, the address that appears in your `<base>` tag will be used as the path.
                 * This is important so that cookies will be visible for all routes when html5mode is enabled.
                 *
                 * @example
                 *
                 * ```js
                 * angular.module('cookiesProviderExample', ['ngCookies'])
                 *   .config(['$cookiesProvider', function($cookiesProvider) {
     *     // Setting default options
     *     $cookiesProvider.defaults.domain = 'foo.com';
     *     $cookiesProvider.defaults.secure = true;
     *   }]);
                 * ```
                 **/
                var defaults = this.defaults = {};

                function calcOptions(options) {
                    return options ? angular.extend({}, defaults, options) : defaults;
                }

                /**
                 * @ngdoc service
                 * @name $cookies
                 *
                 * @description
                 * Provides read/write access to browser's cookies.
                 *
                 * <div class="alert alert-info">
                 * Up until Angular 1.3, `$cookies` exposed properties that represented the
                 * current browser cookie values. In version 1.4, this behavior has changed, and
                 * `$cookies` now provides a standard api of getters, setters etc.
                 * </div>
                 *
                 * Requires the {@link ngCookies `ngCookies`} module to be installed.
                 *
                 * @example
                 *
                 * ```js
                 * angular.module('cookiesExample', ['ngCookies'])
                 *   .controller('ExampleController', ['$cookies', function($cookies) {
     *     // Retrieving a cookie
     *     var favoriteCookie = $cookies.get('myFavorite');
     *     // Setting a cookie
     *     $cookies.put('myFavorite', 'oatmeal');
     *   }]);
                 * ```
                 */
                this.$get = ['$$cookieReader', '$$cookieWriter', function ($$cookieReader, $$cookieWriter) {
                    return {
                        /**
                         * @ngdoc method
                         * @name $cookies#get
                         *
                         * @description
                         * Returns the value of given cookie key
                         *
                         * @param {string} key Id to use for lookup.
                         * @returns {string} Raw cookie value.
                         */
                        get: function (key) {
                            return $$cookieReader()[key];
                        },

                        /**
                         * @ngdoc method
                         * @name $cookies#getObject
                         *
                         * @description
                         * Returns the deserialized value of given cookie key
                         *
                         * @param {string} key Id to use for lookup.
                         * @returns {Object} Deserialized cookie value.
                         */
                        getObject: function (key) {
                            var value = this.get(key);
                            return value ? angular.fromJson(value) : value;
                        },

                        /**
                         * @ngdoc method
                         * @name $cookies#getAll
                         *
                         * @description
                         * Returns a key value object with all the cookies
                         *
                         * @returns {Object} All cookies
                         */
                        getAll: function () {
                            return $$cookieReader();
                        },

                        /**
                         * @ngdoc method
                         * @name $cookies#put
                         *
                         * @description
                         * Sets a value for given cookie key
                         *
                         * @param {string} key Id for the `value`.
                         * @param {string} value Raw value to be stored.
                         * @param {Object=} options Options object.
                         *    See {@link ngCookies.$cookiesProvider#defaults $cookiesProvider.defaults}
                         */
                        put: function (key, value, options) {
                            $$cookieWriter(key, value, calcOptions(options));
                        },

                        /**
                         * @ngdoc method
                         * @name $cookies#putObject
                         *
                         * @description
                         * Serializes and sets a value for given cookie key
                         *
                         * @param {string} key Id for the `value`.
                         * @param {Object} value Value to be stored.
                         * @param {Object=} options Options object.
                         *    See {@link ngCookies.$cookiesProvider#defaults $cookiesProvider.defaults}
                         */
                        putObject: function (key, value, options) {
                            this.put(key, angular.toJson(value), options);
                        },

                        /**
                         * @ngdoc method
                         * @name $cookies#remove
                         *
                         * @description
                         * Remove given cookie
                         *
                         * @param {string} key Id of the key-value pair to delete.
                         * @param {Object=} options Options object.
                         *    See {@link ngCookies.$cookiesProvider#defaults $cookiesProvider.defaults}
                         */
                        remove: function (key, options) {
                            $$cookieWriter(key, undefined, calcOptions(options));
                        }
                    };
                }];
            }]);

            angular.module('ngCookies').
            /**
             * @ngdoc service
             * @name $cookieStore
             * @deprecated
             * sinceVersion="v1.4.0"
             * Please use the {@link ngCookies.$cookies `$cookies`} service instead.
             *
             * @requires $cookies
             *
             * @description
             * Provides a key-value (string-object) storage, that is backed by session cookies.
             * Objects put or retrieved from this storage are automatically serialized or
             * deserialized by angular's toJson/fromJson.
             *
             * Requires the {@link ngCookies `ngCookies`} module to be installed.
             *
             * @example
             *
             * ```js
             * angular.module('cookieStoreExample', ['ngCookies'])
             *   .controller('ExampleController', ['$cookieStore', function($cookieStore) {
 *     // Put cookie
 *     $cookieStore.put('myFavorite','oatmeal');
 *     // Get cookie
 *     var favoriteCookie = $cookieStore.get('myFavorite');
 *     // Removing a cookie
 *     $cookieStore.remove('myFavorite');
 *   }]);
             * ```
             */
            factory('$cookieStore', ['$cookies', function ($cookies) {

                return {
                    /**
                     * @ngdoc method
                     * @name $cookieStore#get
                     *
                     * @description
                     * Returns the value of given cookie key
                     *
                     * @param {string} key Id to use for lookup.
                     * @returns {Object} Deserialized cookie value, undefined if the cookie does not exist.
                     */
                    get: function (key) {
                        return $cookies.getObject(key);
                    },

                    /**
                     * @ngdoc method
                     * @name $cookieStore#put
                     *
                     * @description
                     * Sets a value for given cookie key
                     *
                     * @param {string} key Id for the `value`.
                     * @param {Object} value Value to be stored.
                     */
                    put: function (key, value) {
                        $cookies.putObject(key, value);
                    },

                    /**
                     * @ngdoc method
                     * @name $cookieStore#remove
                     *
                     * @description
                     * Remove given cookie
                     *
                     * @param {string} key Id of the key-value pair to delete.
                     */
                    remove: function (key) {
                        $cookies.remove(key);
                    }
                };

            }]);


            /**
             * @name $$cookieWriter
             * @requires $document
             *
             * @description
             * This is a private service for writing cookies
             *
             * @param {string} name Cookie name
             * @param {string=} value Cookie value (if undefined, cookie will be deleted)
             * @param {Object=} options Object with options that need to be stored for the cookie.
             */
            function $$CookieWriter($document, $log, $browser) {
                var cookiePath = $browser.baseHref();
                var rawDocument = $document[0];

                function buildCookieString(name, value, options) {
                    var path, expires;
                    options = options || {};
                    expires = options.expires;
                    path = angular.isDefined(options.path) ? options.path : cookiePath;
                    if (angular.isUndefined(value)) {
                        expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
                        value = '';
                    }
                    if (angular.isString(expires)) {
                        expires = new Date(expires);
                    }

                    var str = encodeURIComponent(name) + '=' + encodeURIComponent(value);
                    str += path ? ';path=' + path : '';
                    str += options.domain ? ';domain=' + options.domain : '';
                    str += expires ? ';expires=' + expires.toUTCString() : '';
                    str += options.secure ? ';secure' : '';

                    // per http://www.ietf.org/rfc/rfc2109.txt browser must allow at minimum:
                    // - 300 cookies
                    // - 20 cookies per unique domain
                    // - 4096 bytes per cookie
                    var cookieLength = str.length + 1;
                    if (cookieLength > 4096) {
                        $log.warn('Cookie \'' + name +
                            '\' possibly not set or overflowed because it was too large (' +
                            cookieLength + ' > 4096 bytes)!');
                    }

                    return str;
                }

                return function (name, value, options) {
                    rawDocument.cookie = buildCookieString(name, value, options);
                };
            }

            $$CookieWriter.$inject = ['$document', '$log', '$browser'];

            angular.module('ngCookies').provider('$$cookieWriter', /** @this */ function $$CookieWriterProvider() {
                this.$get = $$CookieWriter;
            });


        })(window, window.angular);

    }, {}],
    "../node_modules/angular-cookies/index.js": [function (require, module, exports) {
        require('./angular-cookies');
        module.exports = 'ngCookies';

    }, {"./angular-cookies": "../node_modules/angular-cookies/angular-cookies.js"}],
    "../node_modules/angular-dragdrop/src/angular-dragdrop.js": [function (require, module, exports) {
        /**
         * Permission is hereby granted, free of charge, to any person obtaining a copy
         * of this software and associated documentation files (the "Software"), to
         * deal in the Software without restriction, including without limitation the
         * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
         * sell copies of the Software, and to permit persons to whom the Software is
         * furnished to do so, subject to the following conditions:
         *
         * The above copyright notice and this permission notice shall be included in
         * all copies or substantial portions of the Software.
         *
         * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
         * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
         * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
         * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
         * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
         * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
         * IN THE SOFTWARE.
         */

        /**
         * Implementing Drag and Drop functionality in AngularJS is easier than ever.
         * Demo: http://codef0rmer.github.com/angular-dragdrop/
         *
         * @version 1.0.13
         *
         * (c) 2013 Amit Gharat a.k.a codef0rmer <amit.2006.it@gmail.com> - amitgharat.wordpress.com
         */

        (function (window, angular, $, undefined) {
            'use strict';

            var jqyoui = angular.module('ngDragDrop', []).service('ngDragDropService', ['$timeout', '$parse', '$q', function ($timeout, $parse, $q) {
                this.draggableScope = null;
                this.droppableScope = null;

                $('head').prepend('<style type="text/css">@charset "UTF-8";.angular-dragdrop-hide{display: none !important;}</style>');

                this.callEventCallback = function (scope, callbackName, event, ui) {
                    if (!callbackName) return;

                    var objExtract = extract(callbackName),
                        callback = objExtract.callback,
                        constructor = objExtract.constructor,
                        args = [event, ui].concat(objExtract.args);

                    // call either $scoped method i.e. $scope.dropCallback or constructor's method i.e. this.dropCallback.
                    // Removing scope.$apply call that was performance intensive (especially onDrag) and does not require it
                    // always. So call it within the callback if needed.
                    return (scope[callback] || scope[constructor][callback]).apply(scope[callback] ? scope : scope[constructor], args);

                    function extract(callbackName) {
                        var atStartBracket = callbackName.indexOf('(') !== -1 ? callbackName.indexOf('(') : callbackName.length,
                            atEndBracket = callbackName.lastIndexOf(')') !== -1 ? callbackName.lastIndexOf(')') : callbackName.length,
                            args = callbackName.substring(atStartBracket + 1, atEndBracket), // matching function arguments inside brackets
                            constructor = callbackName.indexOf('.') !== -1 ? callbackName.substr(0, callbackName.indexOf('.')) : null; // matching a string upto a dot to check ctrl as syntax
                        constructor = scope[constructor] && typeof scope[constructor].constructor === 'function' ? constructor : null;

                        return {
                            callback: callbackName.substring(constructor && constructor.length + 1 || 0, atStartBracket),
                            args: $.map(args && args.split(',') || [], function (item) {
                                return [$parse(item)(scope)];
                            }),
                            constructor: constructor
                        }
                    }
                };

                this.invokeDrop = function ($draggable, $droppable, event, ui) {
                    var dragModel = '',
                        dropModel = '',
                        dragSettings = {},
                        dropSettings = {},
                        jqyoui_pos = null,
                        dragItem = {},
                        dropItem = {},
                        dragModelValue,
                        dropModelValue,
                        $droppableDraggable = null,
                        droppableScope = this.droppableScope,
                        draggableScope = this.draggableScope,
                        $helper = null,
                        promises = [],
                        temp;

                    dragModel = $draggable.ngattr('ng-model');
                    dropModel = $droppable.ngattr('ng-model');
                    dragModelValue = draggableScope.$eval(dragModel);
                    dropModelValue = droppableScope.$eval(dropModel);

                    $droppableDraggable = $droppable.find('[jqyoui-draggable]:last,[data-jqyoui-draggable]:last');
                    dropSettings = droppableScope.$eval($droppable.attr('jqyoui-droppable') || $droppable.attr('data-jqyoui-droppable')) || [];
                    dragSettings = draggableScope.$eval($draggable.attr('jqyoui-draggable') || $draggable.attr('data-jqyoui-draggable')) || [];

                    // Helps pick up the right item
                    dragSettings.index = this.fixIndex(draggableScope, dragSettings, dragModelValue);
                    dropSettings.index = this.fixIndex(droppableScope, dropSettings, dropModelValue);

                    jqyoui_pos = angular.isArray(dragModelValue) ? dragSettings.index : null;
                    dragItem = angular.isArray(dragModelValue) ? dragModelValue[jqyoui_pos] : dragModelValue;

                    if (dragSettings.deepCopy) {
                        dragItem = angular.copy(dragItem);
                    }

                    if (angular.isArray(dropModelValue) && dropSettings && dropSettings.index !== undefined) {
                        dropItem = dropModelValue[dropSettings.index];
                    } else if (!angular.isArray(dropModelValue)) {
                        dropItem = dropModelValue;
                    } else {
                        dropItem = {};
                    }

                    if (dropSettings.deepCopy) {
                        dropItem = angular.copy(dropItem);
                    }

                    if (dragSettings.beforeDrop) {
                        promises.push(this.callEventCallback(draggableScope, dragSettings.beforeDrop, event, ui));
                    }

                    $q.all(promises).then(angular.bind(this, function () {
                        if (dragSettings.insertInline && dragModel === dropModel) {
                            if (dragSettings.index > dropSettings.index) {
                                temp = dragModelValue[dragSettings.index];
                                for (var i = dragSettings.index; i > dropSettings.index; i--) {
                                    dropModelValue[i] = angular.copy(dropModelValue[i - 1]);
                                    dropModelValue[i - 1] = {};
                                    dropModelValue[i][dragSettings.direction] = 'left';
                                }
                                dropModelValue[dropSettings.index] = temp;
                            } else {
                                temp = dragModelValue[dragSettings.index];
                                for (var i = dragSettings.index; i < dropSettings.index; i++) {
                                    dropModelValue[i] = angular.copy(dropModelValue[i + 1]);
                                    dropModelValue[i + 1] = {};
                                    dropModelValue[i][dragSettings.direction] = 'right';
                                }
                                dropModelValue[dropSettings.index] = temp;
                            }
                            this.callEventCallback(droppableScope, dropSettings.onDrop, event, ui);
                        } else if (dragSettings.animate === true) {
                            // be nice with absolutely positioned brethren :-)
                            $helper = $draggable.clone();
                            $helper.css({'position': 'absolute'}).css($draggable.offset());
                            $('body').append($helper);
                            $draggable.addClass('angular-dragdrop-hide');

                            this.move($helper, $droppableDraggable.length > 0 ? $droppableDraggable : $droppable, null, 'fast', dropSettings, function () {
                                $helper.remove();
                            });
                            this.move($droppableDraggable.length > 0 && !dropSettings.multiple ? $droppableDraggable : [], $draggable.parent('[jqyoui-droppable],[data-jqyoui-droppable]'), jqyoui.startXY, 'fast', dropSettings, angular.bind(this, function () {
                                $timeout(angular.bind(this, function () {
                                    // Do not move this into move() to avoid flickering issue
                                    $draggable.css({
                                        'position': 'relative',
                                        'left': '',
                                        'top': ''
                                    }).removeClass('angular-dragdrop-hide');
                                    // Angular v1.2 uses ng-hide to hide an element not display property
                                    // so we've to manually remove display:none set in this.move()
                                    $droppableDraggable.css({
                                        'position': 'relative',
                                        'left': '',
                                        'top': '',
                                        'display': $droppableDraggable.css('display') === 'none' ? '' : $droppableDraggable.css('display')
                                    });

                                    this.mutateDraggable(draggableScope, dropSettings, dragSettings, dragModel, dropModel, dropItem, $draggable);
                                    this.mutateDroppable(droppableScope, dropSettings, dragSettings, dropModel, dragItem, jqyoui_pos);
                                    this.callEventCallback(droppableScope, dropSettings.onDrop, event, ui);
                                }));
                            }));
                        } else {
                            $timeout(angular.bind(this, function () {
                                this.mutateDraggable(draggableScope, dropSettings, dragSettings, dragModel, dropModel, dropItem, $draggable);
                                this.mutateDroppable(droppableScope, dropSettings, dragSettings, dropModel, dragItem, jqyoui_pos);
                                this.callEventCallback(droppableScope, dropSettings.onDrop, event, ui);
                            }));
                        }
                    })).finally(angular.bind(this, function () {
                        this.restore($draggable);
                    }));
                };

                this.move = function ($fromEl, $toEl, toPos, duration, dropSettings, callback) {
                    if ($fromEl.length === 0) {
                        if (callback) {
                            window.setTimeout(function () {
                                callback();
                            }, 300);
                        }
                        return false;
                    }

                    var zIndex = $fromEl.css('z-index'),
                        fromPos = $fromEl[dropSettings.containment || 'offset'](),
                        displayProperty = $toEl.css('display'), // sometimes `display` is other than `block`
                        hadNgHideCls = $toEl.hasClass('ng-hide'),
                        hadDNDHideCls = $toEl.hasClass('angular-dragdrop-hide');

                    if (toPos === null && $toEl.length > 0) {
                        if (($toEl.attr('jqyoui-draggable') || $toEl.attr('data-jqyoui-draggable')) !== undefined && $toEl.ngattr('ng-model') !== undefined && $toEl.is(':visible') && dropSettings && dropSettings.multiple) {
                            toPos = $toEl[dropSettings.containment || 'offset']();
                            if (dropSettings.stack === false) {
                                toPos.left += $toEl.outerWidth(true);
                            } else {
                                toPos.top += $toEl.outerHeight(true);
                            }
                        } else {
                            // Angular v1.2 uses ng-hide to hide an element
                            // so we've to remove it in order to grab its position
                            if (hadNgHideCls) $toEl.removeClass('ng-hide');
                            if (hadDNDHideCls) $toEl.removeClass('angular-dragdrop-hide');
                            toPos = $toEl.css({
                                'visibility': 'hidden',
                                'display': 'block'
                            })[dropSettings.containment || 'offset']();
                            $toEl.css({'visibility': '', 'display': displayProperty});
                        }
                    }

                    $fromEl.css({'position': 'absolute', 'z-index': 9999})
                        .css(fromPos)
                        .animate(toPos, duration, function () {
                            // Angular v1.2 uses ng-hide to hide an element
                            // and as we remove it above, we've to put it back to
                            // hide the element (while swapping) if it was hidden already
                            // because we remove the display:none in this.invokeDrop()
                            if (hadNgHideCls) $toEl.addClass('ng-hide');
                            if (hadDNDHideCls) $toEl.addClass('angular-dragdrop-hide');
                            $fromEl.css('z-index', zIndex);
                            if (callback) callback();
                        });
                };

                this.mutateDroppable = function (scope, dropSettings, dragSettings, dropModel, dragItem, jqyoui_pos) {
                    var dropModelValue = scope.$eval(dropModel);

                    scope.dndDragItem = dragItem;

                    if (angular.isArray(dropModelValue)) {
                        if (dropSettings && dropSettings.index >= 0) {
                            dropModelValue[dropSettings.index] = dragItem;
                        } else {
                            dropModelValue.push(dragItem);
                        }
                        if (dragSettings && dragSettings.placeholder === true) {
                            dropModelValue[dropModelValue.length - 1]['jqyoui_pos'] = jqyoui_pos;
                        }
                    } else {
                        $parse(dropModel + ' = dndDragItem')(scope);
                        if (dragSettings && dragSettings.placeholder === true) {
                            dropModelValue['jqyoui_pos'] = jqyoui_pos;
                        }
                    }
                };

                this.mutateDraggable = function (scope, dropSettings, dragSettings, dragModel, dropModel, dropItem, $draggable) {
                    var isEmpty = angular.equals(dropItem, {}) || !dropItem,
                        dragModelValue = scope.$eval(dragModel);

                    scope.dndDropItem = dropItem;

                    if (dragSettings && dragSettings.placeholder) {
                        if (dragSettings.placeholder != 'keep') {
                            if (angular.isArray(dragModelValue) && dragSettings.index !== undefined) {
                                dragModelValue[dragSettings.index] = dropItem;
                            } else {
                                $parse(dragModel + ' = dndDropItem')(scope);
                            }
                        }
                    } else {
                        if (angular.isArray(dragModelValue)) {
                            if (isEmpty) {
                                if (dragSettings && (dragSettings.placeholder !== true && dragSettings.placeholder !== 'keep')) {
                                    dragModelValue.splice(dragSettings.index, 1);
                                }
                            } else {
                                dragModelValue[dragSettings.index] = dropItem;
                            }
                        } else {
                            // Fix: LIST(object) to LIST(array) - model does not get updated using just scope[dragModel] = {...}
                            // P.S.: Could not figure out why it happened
                            $parse(dragModel + ' = dndDropItem')(scope);
                            if (scope.$parent) {
                                $parse(dragModel + ' = dndDropItem')(scope.$parent);
                            }
                        }
                    }

                    this.restore($draggable);
                };

                this.restore = function ($draggable) {
                    $draggable.css({'z-index': '', 'left': '', 'top': ''});
                };

                this.fixIndex = function (scope, settings, modelValue) {
                    if (settings.applyFilter && angular.isArray(modelValue) && modelValue.length > 0) {
                        var dragModelValueFiltered = scope[settings.applyFilter](),
                            lookup = dragModelValueFiltered[settings.index],
                            actualIndex = undefined;

                        modelValue.forEach(function (item, i) {
                            if (angular.equals(item, lookup)) {
                                actualIndex = i;
                            }
                        });

                        return actualIndex;
                    }

                    return settings.index;
                };
            }]).directive('jqyouiDraggable', ['ngDragDropService', function (ngDragDropService) {
                return {
                    require: '?jqyouiDroppable',
                    restrict: 'A',
                    link: function (scope, elem, attrs) {
                        var element = $(elem);
                        var dragSettings, jqyouiOptions, zIndex, killWatcher;
                        var updateDraggable = function (newValue, oldValue) {
                            if (newValue) {
                                dragSettings = scope.$eval(element.attr('jqyoui-draggable') || element.attr('data-jqyoui-draggable')) || {};
                                jqyouiOptions = scope.$eval(attrs.jqyouiOptions) || {};
                                element
                                    .draggable({disabled: false})
                                    .draggable(jqyouiOptions)
                                    .draggable({
                                        start: function (event, ui) {
                                            ngDragDropService.draggableScope = scope;
                                            zIndex = $(jqyouiOptions.helper ? ui.helper : this).css('z-index');
                                            $(jqyouiOptions.helper ? ui.helper : this).css('z-index', 9999);
                                            jqyoui.startXY = $(this)[dragSettings.containment || 'offset']();
                                            ngDragDropService.callEventCallback(scope, dragSettings.onStart, event, ui);
                                        },
                                        stop: function (event, ui) {
                                            $(jqyouiOptions.helper ? ui.helper : this).css('z-index', zIndex);
                                            ngDragDropService.callEventCallback(scope, dragSettings.onStop, event, ui);
                                        },
                                        drag: function (event, ui) {
                                            ngDragDropService.callEventCallback(scope, dragSettings.onDrag, event, ui);
                                        }
                                    });
                            } else {
                                element.draggable({disabled: true});
                            }

                            if (killWatcher && angular.isDefined(newValue) && (angular.equals(attrs.drag, 'true') || angular.equals(attrs.drag, 'false'))) {
                                killWatcher();
                                killWatcher = null;
                            }
                        };

                        killWatcher = scope.$watch(function () {
                            return scope.$eval(attrs.drag);
                        }, updateDraggable);
                        updateDraggable();

                        element.on('$destroy', function () {
                            element.draggable({disabled: true}).draggable('destroy');
                        });
                    }
                };
            }]).directive('jqyouiDroppable', ['ngDragDropService', '$q', function (ngDragDropService, $q) {
                return {
                    restrict: 'A',
                    priority: 1,
                    link: function (scope, elem, attrs) {
                        var element = $(elem);
                        var dropSettings, jqyouiOptions, killWatcher;
                        var updateDroppable = function (newValue, oldValue) {
                            if (newValue) {
                                dropSettings = scope.$eval($(element).attr('jqyoui-droppable') || $(element).attr('data-jqyoui-droppable')) || {};
                                jqyouiOptions = scope.$eval(attrs.jqyouiOptions) || {};
                                element
                                    .droppable({disabled: false})
                                    .droppable(jqyouiOptions)
                                    .droppable({
                                        over: function (event, ui) {
                                            ngDragDropService.callEventCallback(scope, dropSettings.onOver, event, ui);
                                        },
                                        out: function (event, ui) {
                                            ngDragDropService.callEventCallback(scope, dropSettings.onOut, event, ui);
                                        },
                                        drop: function (event, ui) {
                                            var beforeDropPromise = null;

                                            if (dropSettings.beforeDrop) {
                                                beforeDropPromise = ngDragDropService.callEventCallback(scope, dropSettings.beforeDrop, event, ui);
                                            } else {
                                                beforeDropPromise = (function () {
                                                    var deferred = $q.defer();
                                                    deferred.resolve();
                                                    return deferred.promise;
                                                })();
                                            }

                                            beforeDropPromise.then(angular.bind(this, function () {
                                                if ($(ui.draggable).ngattr('ng-model') && attrs.ngModel) {
                                                    ngDragDropService.droppableScope = scope;
                                                    ngDragDropService.invokeDrop($(ui.draggable), $(this), event, ui);
                                                } else {
                                                    ngDragDropService.callEventCallback(scope, dropSettings.onDrop, event, ui);
                                                }
                                            }), function () {
                                                ui.draggable.animate({
                                                    left: '',
                                                    top: ''
                                                }, jqyouiOptions.revertDuration || 0);
                                            });
                                        }
                                    });
                            } else {
                                element.droppable({disabled: true});
                            }

                            if (killWatcher && angular.isDefined(newValue) && (angular.equals(attrs.drop, 'true') || angular.equals(attrs.drop, 'false'))) {
                                killWatcher();
                                killWatcher = null;
                            }
                        };

                        killWatcher = scope.$watch(function () {
                            return scope.$eval(attrs.drop);
                        }, updateDroppable);
                        updateDroppable();

                        element.on('$destroy', function () {
                            element.droppable({disabled: true}).droppable('destroy');
                        });
                    }
                };
            }]);

            $.fn.ngattr = function (name, value) {
                var element = this[0];

                return element.getAttribute(name) || element.getAttribute('data-' + name);
            };
        })(window, window.angular, window.jQuery);

    }, {}],
    "../node_modules/angular-moment/angular-moment.js": [function (require, module, exports) {
        (function (global) {
            /* angular-moment.js / v1.0.1 / (c) 2013, 2014, 2015, 2016 Uri Shaked / MIT Licence */

            'format amd';
            /* global define */

            (function () {
                'use strict';

                function isUndefinedOrNull(val) {
                    return angular.isUndefined(val) || val === null;
                }

                function requireMoment() {
                    try {
                        return require('moment'); // Using nw.js or browserify?
                    } catch (e) {
                        throw new Error('Please install moment via npm. Please reference to: https://github.com/urish/angular-moment'); // Add wiki/troubleshooting section?
                    }
                }

                function angularMoment(angular, moment) {

                    if (typeof moment === 'undefined') {
                        if (typeof require === 'function') {
                            moment = requireMoment();
                        } else {
                            throw new Error('Moment cannot be found by angular-moment! Please reference to: https://github.com/urish/angular-moment'); // Add wiki/troubleshooting section?
                        }
                    }

                    /**
                     * @ngdoc overview
                     * @name angularMoment
                     *
                     * @description
                     * angularMoment module provides moment.js functionality for angular.js apps.
                     */
                    angular.module('angularMoment', [])

                    /**
                     * @ngdoc object
                     * @name angularMoment.config:angularMomentConfig
                     *
                     * @description
                     * Common configuration of the angularMoment module
                     */
                        .constant('angularMomentConfig', {
                            /**
                             * @ngdoc property
                             * @name angularMoment.config.angularMomentConfig#preprocess
                             * @propertyOf angularMoment.config:angularMomentConfig
                             * @returns {function} A preprocessor function that will be applied on all incoming dates
                             *
                             * @description
                             * Defines a preprocessor function to apply on all input dates (e.g. the input of `am-time-ago`,
                             * `amCalendar`, etc.). The function must return a `moment` object.
                             *
                             * @example
                             *   // Causes angular-moment to always treat the input values as unix timestamps
                             *   angularMomentConfig.preprocess = function(value) {
				 * 	   return moment.unix(value);
				 *   }
                             */
                            preprocess: null,

                            /**
                             * @ngdoc property
                             * @name angularMoment.config.angularMomentConfig#timezone
                             * @propertyOf angularMoment.config:angularMomentConfig
                             * @returns {string} The default timezone
                             *
                             * @description
                             * The default timezone (e.g. 'Europe/London'). Empty string by default (does not apply
                             * any timezone shift).
                             *
                             * NOTE: This option requires moment-timezone >= 0.3.0.
                             */
                            timezone: null,

                            /**
                             * @ngdoc property
                             * @name angularMoment.config.angularMomentConfig#format
                             * @propertyOf angularMoment.config:angularMomentConfig
                             * @returns {string} The pre-conversion format of the date
                             *
                             * @description
                             * Specify the format of the input date. Essentially it's a
                             * default and saves you from specifying a format in every
                             * element. Overridden by element attr. Null by default.
                             */
                            format: null,

                            /**
                             * @ngdoc property
                             * @name angularMoment.config.angularMomentConfig#statefulFilters
                             * @propertyOf angularMoment.config:angularMomentConfig
                             * @returns {boolean} Whether angular-moment filters should be stateless (or not)
                             *
                             * @description
                             * Specifies whether the filters included with angular-moment are stateful.
                             * Stateful filters will automatically re-evaluate whenever you change the timezone
                             * or locale settings, but may negatively impact performance. true by default.
                             */
                            statefulFilters: true
                        })

                        /**
                         * @ngdoc object
                         * @name angularMoment.object:moment
                         *
                         * @description
                         * moment global (as provided by the moment.js library)
                         */
                        .constant('moment', moment)

                        /**
                         * @ngdoc object
                         * @name angularMoment.config:amTimeAgoConfig
                         * @module angularMoment
                         *
                         * @description
                         * configuration specific to the amTimeAgo directive
                         */
                        .constant('amTimeAgoConfig', {
                            /**
                             * @ngdoc property
                             * @name angularMoment.config.amTimeAgoConfig#withoutSuffix
                             * @propertyOf angularMoment.config:amTimeAgoConfig
                             * @returns {boolean} Whether to include a suffix in am-time-ago directive
                             *
                             * @description
                             * Defaults to false.
                             */
                            withoutSuffix: false,

                            /**
                             * @ngdoc property
                             * @name angularMoment.config.amTimeAgoConfig#serverTime
                             * @propertyOf angularMoment.config:amTimeAgoConfig
                             * @returns {number} Server time in milliseconds since the epoch
                             *
                             * @description
                             * If set, time ago will be calculated relative to the given value.
                             * If null, local time will be used. Defaults to null.
                             */
                            serverTime: null,

                            /**
                             * @ngdoc property
                             * @name angularMoment.config.amTimeAgoConfig#titleFormat
                             * @propertyOf angularMoment.config:amTimeAgoConfig
                             * @returns {string} The format of the date to be displayed in the title of the element. If null,
                             *        the directive set the title of the element.
                             *
                             * @description
                             * The format of the date used for the title of the element. null by default.
                             */
                            titleFormat: null,

                            /**
                             * @ngdoc property
                             * @name angularMoment.config.amTimeAgoConfig#fullDateThreshold
                             * @propertyOf angularMoment.config:amTimeAgoConfig
                             * @returns {number} The minimum number of days for showing a full date instead of relative time
                             *
                             * @description
                             * The threshold for displaying a full date. The default is null, which means the date will always
                             * be relative, and full date will never be displayed.
                             */
                            fullDateThreshold: null,

                            /**
                             * @ngdoc property
                             * @name angularMoment.config.amTimeAgoConfig#fullDateFormat
                             * @propertyOf angularMoment.config:amTimeAgoConfig
                             * @returns {string} The format to use when displaying a full date.
                             *
                             * @description
                             * Specify the format of the date when displayed as full date. null by default.
                             */
                            fullDateFormat: null,

                            fullDateThresholdUnit: 'day'
                        })

                        /**
                         * @ngdoc directive
                         * @name angularMoment.directive:amTimeAgo
                         * @module angularMoment
                         *
                         * @restrict A
                         */
                        .directive('amTimeAgo', ['$window', 'moment', 'amMoment', 'amTimeAgoConfig', function ($window, moment, amMoment, amTimeAgoConfig) {

                            return function (scope, element, attr) {
                                var activeTimeout = null;
                                var currentValue;
                                var withoutSuffix = amTimeAgoConfig.withoutSuffix;
                                var titleFormat = amTimeAgoConfig.titleFormat;
                                var fullDateThreshold = amTimeAgoConfig.fullDateThreshold;
                                var fullDateFormat = amTimeAgoConfig.fullDateFormat;
                                var fullDateThresholdUnit = amTimeAgoConfig.fullDateThresholdUnit;

                                var localDate = new Date().getTime();
                                var modelName = attr.amTimeAgo;
                                var currentFrom;
                                var isTimeElement = ('TIME' === element[0].nodeName.toUpperCase());
                                var setTitleTime = !element.attr('title');

                                function getNow() {
                                    var now;
                                    if (currentFrom) {
                                        now = currentFrom;
                                    } else if (amTimeAgoConfig.serverTime) {
                                        var localNow = new Date().getTime();
                                        var nowMillis = localNow - localDate + amTimeAgoConfig.serverTime;
                                        now = moment(nowMillis);
                                    }
                                    else {
                                        now = moment();
                                    }
                                    return now;
                                }

                                function cancelTimer() {
                                    if (activeTimeout) {
                                        $window.clearTimeout(activeTimeout);
                                        activeTimeout = null;
                                    }
                                }

                                function updateTime(momentInstance) {
                                    var timeAgo = getNow().diff(momentInstance, fullDateThresholdUnit);
                                    var showFullDate = fullDateThreshold && timeAgo >= fullDateThreshold;

                                    if (showFullDate) {
                                        element.text(momentInstance.format(fullDateFormat));
                                    } else {
                                        element.text(momentInstance.from(getNow(), withoutSuffix));
                                    }

                                    if (titleFormat && setTitleTime) {
                                        element.attr('title', momentInstance.format(titleFormat));
                                    }

                                    if (!showFullDate) {
                                        var howOld = Math.abs(getNow().diff(momentInstance, 'minute'));
                                        var secondsUntilUpdate = 3600;
                                        if (howOld < 1) {
                                            secondsUntilUpdate = 1;
                                        } else if (howOld < 60) {
                                            secondsUntilUpdate = 30;
                                        } else if (howOld < 180) {
                                            secondsUntilUpdate = 300;
                                        }

                                        activeTimeout = $window.setTimeout(function () {
                                            updateTime(momentInstance);
                                        }, secondsUntilUpdate * 1000);
                                    }
                                }

                                function updateDateTimeAttr(value) {
                                    if (isTimeElement) {
                                        element.attr('datetime', value);
                                    }
                                }

                                function updateMoment() {
                                    cancelTimer();
                                    if (currentValue) {
                                        var momentValue = amMoment.preprocessDate(currentValue);
                                        updateTime(momentValue);
                                        updateDateTimeAttr(momentValue.toISOString());
                                    }
                                }

                                scope.$watch(modelName, function (value) {
                                    if (isUndefinedOrNull(value) || (value === '')) {
                                        cancelTimer();
                                        if (currentValue) {
                                            element.text('');
                                            updateDateTimeAttr('');
                                            currentValue = null;
                                        }
                                        return;
                                    }

                                    currentValue = value;
                                    updateMoment();
                                });

                                if (angular.isDefined(attr.amFrom)) {
                                    scope.$watch(attr.amFrom, function (value) {
                                        if (isUndefinedOrNull(value) || (value === '')) {
                                            currentFrom = null;
                                        } else {
                                            currentFrom = moment(value);
                                        }
                                        updateMoment();
                                    });
                                }

                                if (angular.isDefined(attr.amWithoutSuffix)) {
                                    scope.$watch(attr.amWithoutSuffix, function (value) {
                                        if (typeof value === 'boolean') {
                                            withoutSuffix = value;
                                            updateMoment();
                                        } else {
                                            withoutSuffix = amTimeAgoConfig.withoutSuffix;
                                        }
                                    });
                                }

                                attr.$observe('amFullDateThreshold', function (newValue) {
                                    fullDateThreshold = newValue;
                                    updateMoment();
                                });

                                attr.$observe('amFullDateFormat', function (newValue) {
                                    fullDateFormat = newValue;
                                    updateMoment();
                                });

                                attr.$observe('amFullDateThresholdUnit', function (newValue) {
                                    fullDateThresholdUnit = newValue;
                                    updateMoment();
                                });

                                scope.$on('$destroy', function () {
                                    cancelTimer();
                                });

                                scope.$on('amMoment:localeChanged', function () {
                                    updateMoment();
                                });
                            };
                        }])

                        /**
                         * @ngdoc service
                         * @name angularMoment.service.amMoment
                         * @module angularMoment
                         */
                        .service('amMoment', ['moment', '$rootScope', '$log', 'angularMomentConfig', function (moment, $rootScope, $log, angularMomentConfig) {
                            var defaultTimezone = null;

                            /**
                             * @ngdoc function
                             * @name angularMoment.service.amMoment#changeLocale
                             * @methodOf angularMoment.service.amMoment
                             *
                             * @description
                             * Changes the locale for moment.js and updates all the am-time-ago directive instances
                             * with the new locale. Also broadcasts an `amMoment:localeChanged` event on $rootScope.
                             *
                             * @param {string} locale Locale code (e.g. en, es, ru, pt-br, etc.)
                             * @param {object} customization object of locale strings to override
                             */
                            this.changeLocale = function (locale, customization) {
                                var result = moment.locale(locale, customization);
                                if (angular.isDefined(locale)) {
                                    $rootScope.$broadcast('amMoment:localeChanged');

                                }
                                return result;
                            };

                            /**
                             * @ngdoc function
                             * @name angularMoment.service.amMoment#changeTimezone
                             * @methodOf angularMoment.service.amMoment
                             *
                             * @description
                             * Changes the default timezone for amCalendar, amDateFormat and amTimeAgo. Also broadcasts an
                             * `amMoment:timezoneChanged` event on $rootScope.
                             *
                             * Note: this method works only if moment-timezone > 0.3.0 is loaded
                             *
                             * @param {string} timezone Timezone name (e.g. UTC)
                             */
                            this.changeTimezone = function (timezone) {
                                if (moment.tz && moment.tz.setDefault) {
                                    moment.tz.setDefault(timezone);
                                    $rootScope.$broadcast('amMoment:timezoneChanged');
                                } else {
                                    $log.warn('angular-moment: changeTimezone() works only with moment-timezone.js v0.3.0 or greater.');
                                }
                                angularMomentConfig.timezone = timezone;
                                defaultTimezone = timezone;
                            };

                            /**
                             * @ngdoc function
                             * @name angularMoment.service.amMoment#preprocessDate
                             * @methodOf angularMoment.service.amMoment
                             *
                             * @description
                             * Preprocess a given value and convert it into a Moment instance appropriate for use in the
                             * am-time-ago directive and the filters. The behavior of this function can be overriden by
                             * setting `angularMomentConfig.preprocess`.
                             *
                             * @param {*} value The value to be preprocessed
                             * @return {Moment} A `moment` object
                             */
                            this.preprocessDate = function (value) {
                                // Configure the default timezone if needed
                                if (defaultTimezone !== angularMomentConfig.timezone) {
                                    this.changeTimezone(angularMomentConfig.timezone);
                                }

                                if (angularMomentConfig.preprocess) {
                                    return angularMomentConfig.preprocess(value);
                                }

                                if (!isNaN(parseFloat(value)) && isFinite(value)) {
                                    // Milliseconds since the epoch
                                    return moment(parseInt(value, 10));
                                }

                                // else just returns the value as-is.
                                return moment(value);
                            };
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amParse
                         * @module angularMoment
                         */
                        .filter('amParse', ['moment', function (moment) {
                            return function (value, format) {
                                return moment(value, format);
                            };
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amFromUnix
                         * @module angularMoment
                         */
                        .filter('amFromUnix', ['moment', function (moment) {
                            return function (value) {
                                return moment.unix(value);
                            };
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amUtc
                         * @module angularMoment
                         */
                        .filter('amUtc', ['moment', function (moment) {
                            return function (value) {
                                return moment.utc(value);
                            };
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amUtcOffset
                         * @module angularMoment
                         *
                         * @description
                         * Adds a UTC offset to the given timezone object. The offset can be a number of minutes, or a string such as
                         * '+0300', '-0300' or 'Z'.
                         */
                        .filter('amUtcOffset', ['amMoment', function (amMoment) {
                            function amUtcOffset(value, offset) {
                                return amMoment.preprocessDate(value).utcOffset(offset);
                            }

                            return amUtcOffset;
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amLocal
                         * @module angularMoment
                         */
                        .filter('amLocal', ['moment', function (moment) {
                            return function (value) {
                                return moment.isMoment(value) ? value.local() : null;
                            };
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amTimezone
                         * @module angularMoment
                         *
                         * @description
                         * Apply a timezone onto a given moment object, e.g. 'America/Phoenix').
                         *
                         * You need to include moment-timezone.js for timezone support.
                         */
                        .filter('amTimezone', ['amMoment', 'angularMomentConfig', '$log', function (amMoment, angularMomentConfig, $log) {
                            function amTimezone(value, timezone) {
                                var aMoment = amMoment.preprocessDate(value);

                                if (!timezone) {
                                    return aMoment;
                                }

                                if (aMoment.tz) {
                                    return aMoment.tz(timezone);
                                } else {
                                    $log.warn('angular-moment: named timezone specified but moment.tz() is undefined. Did you forget to include moment-timezone.js ?');
                                    return aMoment;
                                }
                            }

                            return amTimezone;
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amCalendar
                         * @module angularMoment
                         */
                        .filter('amCalendar', ['moment', 'amMoment', 'angularMomentConfig', function (moment, amMoment, angularMomentConfig) {
                            function amCalendarFilter(value, referenceTime, formats) {
                                if (isUndefinedOrNull(value)) {
                                    return '';
                                }

                                var date = amMoment.preprocessDate(value);
                                return date.isValid() ? date.calendar(referenceTime, formats) : '';
                            }

                            // Since AngularJS 1.3, filters have to explicitly define being stateful
                            // (this is no longer the default).
                            amCalendarFilter.$stateful = angularMomentConfig.statefulFilters;

                            return amCalendarFilter;
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amDifference
                         * @module angularMoment
                         */
                        .filter('amDifference', ['moment', 'amMoment', 'angularMomentConfig', function (moment, amMoment, angularMomentConfig) {
                            function amDifferenceFilter(value, otherValue, unit, usePrecision) {
                                if (isUndefinedOrNull(value)) {
                                    return '';
                                }

                                var date = amMoment.preprocessDate(value);
                                var date2 = !isUndefinedOrNull(otherValue) ? amMoment.preprocessDate(otherValue) : moment();

                                if (!date.isValid() || !date2.isValid()) {
                                    return '';
                                }

                                return date.diff(date2, unit, usePrecision);
                            }

                            amDifferenceFilter.$stateful = angularMomentConfig.statefulFilters;

                            return amDifferenceFilter;
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amDateFormat
                         * @module angularMoment
                         * @function
                         */
                        .filter('amDateFormat', ['moment', 'amMoment', 'angularMomentConfig', function (moment, amMoment, angularMomentConfig) {
                            function amDateFormatFilter(value, format) {
                                if (isUndefinedOrNull(value)) {
                                    return '';
                                }

                                var date = amMoment.preprocessDate(value);
                                if (!date.isValid()) {
                                    return '';
                                }

                                return date.format(format);
                            }

                            amDateFormatFilter.$stateful = angularMomentConfig.statefulFilters;

                            return amDateFormatFilter;
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amDurationFormat
                         * @module angularMoment
                         * @function
                         */
                        .filter('amDurationFormat', ['moment', 'angularMomentConfig', function (moment, angularMomentConfig) {
                            function amDurationFormatFilter(value, format, suffix) {
                                if (isUndefinedOrNull(value)) {
                                    return '';
                                }

                                return moment.duration(value, format).humanize(suffix);
                            }

                            amDurationFormatFilter.$stateful = angularMomentConfig.statefulFilters;

                            return amDurationFormatFilter;
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amTimeAgo
                         * @module angularMoment
                         * @function
                         */
                        .filter('amTimeAgo', ['moment', 'amMoment', 'angularMomentConfig', function (moment, amMoment, angularMomentConfig) {
                            function amTimeAgoFilter(value, suffix, from) {
                                var date, dateFrom;

                                if (isUndefinedOrNull(value)) {
                                    return '';
                                }

                                value = amMoment.preprocessDate(value);
                                date = moment(value);
                                if (!date.isValid()) {
                                    return '';
                                }

                                dateFrom = moment(from);
                                if (!isUndefinedOrNull(from) && dateFrom.isValid()) {
                                    return date.from(dateFrom, suffix);
                                }

                                return date.fromNow(suffix);
                            }

                            amTimeAgoFilter.$stateful = angularMomentConfig.statefulFilters;

                            return amTimeAgoFilter;
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amSubtract
                         * @module angularMoment
                         * @function
                         */
                        .filter('amSubtract', ['moment', 'angularMomentConfig', function (moment, angularMomentConfig) {
                            function amSubtractFilter(value, amount, type) {

                                if (isUndefinedOrNull(value)) {
                                    return '';
                                }

                                return moment(value).subtract(parseInt(amount, 10), type);
                            }

                            amSubtractFilter.$stateful = angularMomentConfig.statefulFilters;

                            return amSubtractFilter;
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amAdd
                         * @module angularMoment
                         * @function
                         */
                        .filter('amAdd', ['moment', 'angularMomentConfig', function (moment, angularMomentConfig) {
                            function amAddFilter(value, amount, type) {

                                if (isUndefinedOrNull(value)) {
                                    return '';
                                }

                                return moment(value).add(parseInt(amount, 10), type);
                            }

                            amAddFilter.$stateful = angularMomentConfig.statefulFilters;

                            return amAddFilter;
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amStartOf
                         * @module angularMoment
                         * @function
                         */
                        .filter('amStartOf', ['moment', 'angularMomentConfig', function (moment, angularMomentConfig) {
                            function amStartOfFilter(value, type) {

                                if (isUndefinedOrNull(value)) {
                                    return '';
                                }

                                return moment(value).startOf(type);
                            }

                            amStartOfFilter.$stateful = angularMomentConfig.statefulFilters;

                            return amStartOfFilter;
                        }])

                        /**
                         * @ngdoc filter
                         * @name angularMoment.filter:amEndOf
                         * @module angularMoment
                         * @function
                         */
                        .filter('amEndOf', ['moment', 'angularMomentConfig', function (moment, angularMomentConfig) {
                            function amEndOfFilter(value, type) {

                                if (isUndefinedOrNull(value)) {
                                    return '';
                                }

                                return moment(value).endOf(type);
                            }

                            amEndOfFilter.$stateful = angularMomentConfig.statefulFilters;

                            return amEndOfFilter;
                        }]);

                    return 'angularMoment';
                }

                var isElectron = window && window.process && window.process.type;
                if (typeof define === 'function' && define.amd) {
                    define(['angular', 'moment'], angularMoment);
                } else if (typeof module !== 'undefined' && module && module.exports && (typeof require === 'function') && !isElectron) {
                    module.exports = angularMoment(require('angular'), require('moment'));
                } else {
                    angularMoment(angular, (typeof global !== 'undefined' ? global : window).moment);
                }
            })();

        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

    }, {"angular": "../node_modules/angular/index.js", "moment": "../node_modules/moment/moment.js"}]
    ,
    "../node_modules/angular-sanitize/angular-sanitize.js": [function (require, module, exports) {
        /**
         * @license AngularJS v1.6.6
         * (c) 2010-2017 Google, Inc. http://angularjs.org
         * License: MIT
         */
        (function (window, angular) {
            'use strict';

            /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
             *     Any commits to this file should be reviewed with security in mind.  *
             *   Changes to this file can potentially create security vulnerabilities. *
             *          An approval from 2 Core members with history of modifying      *
             *                         this file is required.                          *
             *                                                                         *
             *  Does the change somehow allow for arbitrary javascript to be executed? *
             *    Or allows for someone to change the prototype of built-in objects?   *
             *     Or gives undesired access to variables likes document or window?    *
             * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

            var $sanitizeMinErr = angular.$$minErr('$sanitize');
            var bind;
            var extend;
            var forEach;
            var isDefined;
            var lowercase;
            var noop;
            var nodeContains;
            var htmlParser;
            var htmlSanitizeWriter;

            /**
             * @ngdoc module
             * @name ngSanitize
             * @description
             *
             * # ngSanitize
             *
             * The `ngSanitize` module provides functionality to sanitize HTML.
             *
             *
             * <div doc-module-components="ngSanitize"></div>
             *
             * See {@link ngSanitize.$sanitize `$sanitize`} for usage.
             */

            /**
             * @ngdoc service
             * @name $sanitize
             * @kind function
             *
             * @description
             *   Sanitizes an html string by stripping all potentially dangerous tokens.
             *
             *   The input is sanitized by parsing the HTML into tokens. All safe tokens (from a whitelist) are
             *   then serialized back to properly escaped html string. This means that no unsafe input can make
             *   it into the returned string.
             *
             *   The whitelist for URL sanitization of attribute values is configured using the functions
             *   `aHrefSanitizationWhitelist` and `imgSrcSanitizationWhitelist` of {@link ng.$compileProvider
 *   `$compileProvider`}.
             *
             *   The input may also contain SVG markup if this is enabled via {@link $sanitizeProvider}.
             *
             * @param {string} html HTML input.
             * @returns {string} Sanitized HTML.
             *
             * @example
             <example module="sanitizeExample" deps="angular-sanitize.js" name="sanitize-service">
             <file name="index.html">
             <script>
             angular.module('sanitizeExample', ['ngSanitize'])
             .controller('ExampleController', ['$scope', '$sce', function($scope, $sce) {
             $scope.snippet =
               '<p style="color:blue">an html\n' +
               '<em onmouseover="this.textContent=\'PWN3D!\'">click here</em>\n' +
               'snippet</p>';
             $scope.deliberatelyTrustDangerousSnippet = function() {
               return $sce.trustAsHtml($scope.snippet);
             };
           }]);
             </script>
             <div ng-controller="ExampleController">
             Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
             <table>
             <tr>
             <td>Directive</td>
             <td>How</td>
             <td>Source</td>
             <td>Rendered</td>
             </tr>
             <tr id="bind-html-with-sanitize">
             <td>ng-bind-html</td>
             <td>Automatically uses $sanitize</td>
             <td><pre>&lt;div ng-bind-html="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
             <td><div ng-bind-html="snippet"></div></td>
             </tr>
             <tr id="bind-html-with-trust">
             <td>ng-bind-html</td>
             <td>Bypass $sanitize by explicitly trusting the dangerous value</td>
             <td>
             <pre>&lt;div ng-bind-html="deliberatelyTrustDangerousSnippet()"&gt;
             &lt;/div&gt;</pre>
             </td>
             <td><div ng-bind-html="deliberatelyTrustDangerousSnippet()"></div></td>
             </tr>
             <tr id="bind-default">
             <td>ng-bind</td>
             <td>Automatically escapes</td>
             <td><pre>&lt;div ng-bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
             <td><div ng-bind="snippet"></div></td>
             </tr>
             </table>
             </div>
             </file>
             <file name="protractor.js" type="protractor">
             it('should sanitize the html snippet by default', function() {
       expect(element(by.css('#bind-html-with-sanitize div')).getAttribute('innerHTML')).toBe('<p>an html\n<em>click here</em>\nsnippet</p>');
     });

             it('should inline raw snippet if bound to a trusted value', function() {
       expect(element(by.css('#bind-html-with-trust div')).getAttribute('innerHTML')).
         toBe("<p style=\"color:blue\">an html\n" +
              "<em onmouseover=\"this.textContent='PWN3D!'\">click here</em>\n" +
              "snippet</p>");
     });

             it('should escape snippet without any filter', function() {
       expect(element(by.css('#bind-default div')).getAttribute('innerHTML')).
         toBe("&lt;p style=\"color:blue\"&gt;an html\n" +
              "&lt;em onmouseover=\"this.textContent='PWN3D!'\"&gt;click here&lt;/em&gt;\n" +
              "snippet&lt;/p&gt;");
     });

             it('should update', function() {
       element(by.model('snippet')).clear();
       element(by.model('snippet')).sendKeys('new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-html-with-sanitize div')).getAttribute('innerHTML')).
         toBe('new <b>text</b>');
       expect(element(by.css('#bind-html-with-trust div')).getAttribute('innerHTML')).toBe(
         'new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-default div')).getAttribute('innerHTML')).toBe(
         "new &lt;b onclick=\"alert(1)\"&gt;text&lt;/b&gt;");
     });
             </file>
             </example>
             */


            /**
             * @ngdoc provider
             * @name $sanitizeProvider
             * @this
             *
             * @description
             * Creates and configures {@link $sanitize} instance.
             */
            function $SanitizeProvider() {
                var svgEnabled = false;

                this.$get = ['$$sanitizeUri', function ($$sanitizeUri) {
                    if (svgEnabled) {
                        extend(validElements, svgElements);
                    }
                    return function (html) {
                        var buf = [];
                        htmlParser(html, htmlSanitizeWriter(buf, function (uri, isImage) {
                            return !/^unsafe:/.test($$sanitizeUri(uri, isImage));
                        }));
                        return buf.join('');
                    };
                }];


                /**
                 * @ngdoc method
                 * @name $sanitizeProvider#enableSvg
                 * @kind function
                 *
                 * @description
                 * Enables a subset of svg to be supported by the sanitizer.
                 *
                 * <div class="alert alert-warning">
                 *   <p>By enabling this setting without taking other precautions, you might expose your
                 *   application to click-hijacking attacks. In these attacks, sanitized svg elements could be positioned
                 *   outside of the containing element and be rendered over other elements on the page (e.g. a login
                 *   link). Such behavior can then result in phishing incidents.</p>
                 *
                 *   <p>To protect against these, explicitly setup `overflow: hidden` css rule for all potential svg
                 *   tags within the sanitized content:</p>
                 *
                 *   <br>
                 *
                 *   <pre><code>
                 *   .rootOfTheIncludedContent svg {
   *     overflow: hidden !important;
   *   }
                 *   </code></pre>
                 * </div>
                 *
                 * @param {boolean=} flag Enable or disable SVG support in the sanitizer.
                 * @returns {boolean|ng.$sanitizeProvider} Returns the currently configured value if called
                 *    without an argument or self for chaining otherwise.
                 */
                this.enableSvg = function (enableSvg) {
                    if (isDefined(enableSvg)) {
                        svgEnabled = enableSvg;
                        return this;
                    } else {
                        return svgEnabled;
                    }
                };

                //////////////////////////////////////////////////////////////////////////////////////////////////
                // Private stuff
                //////////////////////////////////////////////////////////////////////////////////////////////////

                bind = angular.bind;
                extend = angular.extend;
                forEach = angular.forEach;
                isDefined = angular.isDefined;
                lowercase = angular.lowercase;
                noop = angular.noop;

                htmlParser = htmlParserImpl;
                htmlSanitizeWriter = htmlSanitizeWriterImpl;

                nodeContains = window.Node.prototype.contains || /** @this */ function (arg) {
                    // eslint-disable-next-line no-bitwise
                    return !!(this.compareDocumentPosition(arg) & 16);
                };

                // Regular Expressions for parsing tags and attributes
                var SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
                    // Match everything outside of normal chars and " (quote character)
                    NON_ALPHANUMERIC_REGEXP = /([^#-~ |!])/g;


                // Good source of info about elements and attributes
                // http://dev.w3.org/html5/spec/Overview.html#semantics
                // http://simon.html5.org/html-elements

                // Safe Void Elements - HTML5
                // http://dev.w3.org/html5/spec/Overview.html#void-elements
                var voidElements = toMap('area,br,col,hr,img,wbr');

                // Elements that you can, intentionally, leave open (and which close themselves)
                // http://dev.w3.org/html5/spec/Overview.html#optional-tags
                var optionalEndTagBlockElements = toMap('colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr'),
                    optionalEndTagInlineElements = toMap('rp,rt'),
                    optionalEndTagElements = extend({},
                        optionalEndTagInlineElements,
                        optionalEndTagBlockElements);

                // Safe Block Elements - HTML5
                var blockElements = extend({}, optionalEndTagBlockElements, toMap('address,article,' +
                    'aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,' +
                    'h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,section,table,ul'));

                // Inline Elements - HTML5
                var inlineElements = extend({}, optionalEndTagInlineElements, toMap('a,abbr,acronym,b,' +
                    'bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,' +
                    'samp,small,span,strike,strong,sub,sup,time,tt,u,var'));

                // SVG Elements
                // https://wiki.whatwg.org/wiki/Sanitization_rules#svg_Elements
                // Note: the elements animate,animateColor,animateMotion,animateTransform,set are intentionally omitted.
                // They can potentially allow for arbitrary javascript to be executed. See #11290
                var svgElements = toMap('circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph,' +
                    'hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline,' +
                    'radialGradient,rect,stop,svg,switch,text,title,tspan');

                // Blocked Elements (will be stripped)
                var blockedElements = toMap('script,style');

                var validElements = extend({},
                    voidElements,
                    blockElements,
                    inlineElements,
                    optionalEndTagElements);

                //Attributes that have href and hence need to be sanitized
                var uriAttrs = toMap('background,cite,href,longdesc,src,xlink:href');

                var htmlAttrs = toMap('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' +
                    'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' +
                    'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' +
                    'scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,' +
                    'valign,value,vspace,width');

                // SVG attributes (without "id" and "name" attributes)
                // https://wiki.whatwg.org/wiki/Sanitization_rules#svg_Attributes
                var svgAttrs = toMap('accent-height,accumulate,additive,alphabetic,arabic-form,ascent,' +
                    'baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,' +
                    'cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,' +
                    'font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,' +
                    'height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,' +
                    'marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,' +
                    'max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,' +
                    'path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,' +
                    'requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,' +
                    'stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,' +
                    'stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,' +
                    'stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,' +
                    'underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,' +
                    'width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,' +
                    'xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan', true);

                var validAttrs = extend({},
                    uriAttrs,
                    svgAttrs,
                    htmlAttrs);

                function toMap(str, lowercaseKeys) {
                    var obj = {}, items = str.split(','), i;
                    for (i = 0; i < items.length; i++) {
                        obj[lowercaseKeys ? lowercase(items[i]) : items[i]] = true;
                    }
                    return obj;
                }

                /**
                 * Create an inert document that contains the dirty HTML that needs sanitizing
                 * Depending upon browser support we use one of three strategies for doing this.
                 * Support: Safari 10.x -> XHR strategy
                 * Support: Firefox -> DomParser strategy
                 */
                var getInertBodyElement /* function(html: string): HTMLBodyElement */ = (function (window, document) {
                    var inertDocument;
                    if (document && document.implementation) {
                        inertDocument = document.implementation.createHTMLDocument('inert');
                    } else {
                        throw $sanitizeMinErr('noinert', 'Can\'t create an inert html document');
                    }
                    var inertBodyElement = (inertDocument.documentElement || inertDocument.getDocumentElement()).querySelector('body');

                    // Check for the Safari 10.1 bug - which allows JS to run inside the SVG G element
                    inertBodyElement.innerHTML = '<svg><g onload="this.parentNode.remove()"></g></svg>';
                    if (!inertBodyElement.querySelector('svg')) {
                        return getInertBodyElement_XHR;
                    } else {
                        // Check for the Firefox bug - which prevents the inner img JS from being sanitized
                        inertBodyElement.innerHTML = '<svg><p><style><img src="</style><img src=x onerror=alert(1)//">';
                        if (inertBodyElement.querySelector('svg img')) {
                            return getInertBodyElement_DOMParser;
                        } else {
                            return getInertBodyElement_InertDocument;
                        }
                    }

                    function getInertBodyElement_XHR(html) {
                        // We add this dummy element to ensure that the rest of the content is parsed as expected
                        // e.g. leading whitespace is maintained and tags like `<meta>` do not get hoisted to the `<head>` tag.
                        html = '<remove></remove>' + html;
                        try {
                            html = encodeURI(html);
                        } catch (e) {
                            return undefined;
                        }
                        var xhr = new window.XMLHttpRequest();
                        xhr.responseType = 'document';
                        xhr.open('GET', 'data:text/html;charset=utf-8,' + html, false);
                        xhr.send(null);
                        var body = xhr.response.body;
                        body.firstChild.remove();
                        return body;
                    }

                    function getInertBodyElement_DOMParser(html) {
                        // We add this dummy element to ensure that the rest of the content is parsed as expected
                        // e.g. leading whitespace is maintained and tags like `<meta>` do not get hoisted to the `<head>` tag.
                        html = '<remove></remove>' + html;
                        try {
                            var body = new window.DOMParser().parseFromString(html, 'text/html').body;
                            body.firstChild.remove();
                            return body;
                        } catch (e) {
                            return undefined;
                        }
                    }

                    function getInertBodyElement_InertDocument(html) {
                        inertBodyElement.innerHTML = html;

                        // Support: IE 9-11 only
                        // strip custom-namespaced attributes on IE<=11
                        if (document.documentMode) {
                            stripCustomNsAttrs(inertBodyElement);
                        }

                        return inertBodyElement;
                    }
                })(window, window.document);

                /**
                 * @example
                 * htmlParser(htmlString, {
   *     start: function(tag, attrs) {},
   *     end: function(tag) {},
   *     chars: function(text) {},
   *     comment: function(text) {}
   * });
                 *
                 * @param {string} html string
                 * @param {object} handler
                 */
                function htmlParserImpl(html, handler) {
                    if (html === null || html === undefined) {
                        html = '';
                    } else if (typeof html !== 'string') {
                        html = '' + html;
                    }

                    var inertBodyElement = getInertBodyElement(html);
                    if (!inertBodyElement) return '';

                    //mXSS protection
                    var mXSSAttempts = 5;
                    do {
                        if (mXSSAttempts === 0) {
                            throw $sanitizeMinErr('uinput', 'Failed to sanitize html because the input is unstable');
                        }
                        mXSSAttempts--;

                        // trigger mXSS if it is going to happen by reading and writing the innerHTML
                        html = inertBodyElement.innerHTML;
                        inertBodyElement = getInertBodyElement(html);
                    } while (html !== inertBodyElement.innerHTML);

                    var node = inertBodyElement.firstChild;
                    while (node) {
                        switch (node.nodeType) {
                            case 1: // ELEMENT_NODE
                                handler.start(node.nodeName.toLowerCase(), attrToMap(node.attributes));
                                break;
                            case 3: // TEXT NODE
                                handler.chars(node.textContent);
                                break;
                        }

                        var nextNode;
                        if (!(nextNode = node.firstChild)) {
                            if (node.nodeType === 1) {
                                handler.end(node.nodeName.toLowerCase());
                            }
                            nextNode = getNonDescendant('nextSibling', node);
                            if (!nextNode) {
                                while (nextNode == null) {
                                    node = getNonDescendant('parentNode', node);
                                    if (node === inertBodyElement) break;
                                    nextNode = getNonDescendant('nextSibling', node);
                                    if (node.nodeType === 1) {
                                        handler.end(node.nodeName.toLowerCase());
                                    }
                                }
                            }
                        }
                        node = nextNode;
                    }

                    while ((node = inertBodyElement.firstChild)) {
                        inertBodyElement.removeChild(node);
                    }
                }

                function attrToMap(attrs) {
                    var map = {};
                    for (var i = 0, ii = attrs.length; i < ii; i++) {
                        var attr = attrs[i];
                        map[attr.name] = attr.value;
                    }
                    return map;
                }


                /**
                 * Escapes all potentially dangerous characters, so that the
                 * resulting string can be safely inserted into attribute or
                 * element text.
                 * @param value
                 * @returns {string} escaped text
                 */
                function encodeEntities(value) {
                    return value.replace(/&/g, '&amp;').replace(SURROGATE_PAIR_REGEXP, function (value) {
                        var hi = value.charCodeAt(0);
                        var low = value.charCodeAt(1);
                        return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
                    }).replace(NON_ALPHANUMERIC_REGEXP, function (value) {
                        return '&#' + value.charCodeAt(0) + ';';
                    }).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }

                /**
                 * create an HTML/XML writer which writes to buffer
                 * @param {Array} buf use buf.join('') to get out sanitized html string
                 * @returns {object} in the form of {
   *     start: function(tag, attrs) {},
   *     end: function(tag) {},
   *     chars: function(text) {},
   *     comment: function(text) {}
   * }
                 */
                function htmlSanitizeWriterImpl(buf, uriValidator) {
                    var ignoreCurrentElement = false;
                    var out = bind(buf, buf.push);
                    return {
                        start: function (tag, attrs) {
                            tag = lowercase(tag);
                            if (!ignoreCurrentElement && blockedElements[tag]) {
                                ignoreCurrentElement = tag;
                            }
                            if (!ignoreCurrentElement && validElements[tag] === true) {
                                out('<');
                                out(tag);
                                forEach(attrs, function (value, key) {
                                    var lkey = lowercase(key);
                                    var isImage = (tag === 'img' && lkey === 'src') || (lkey === 'background');
                                    if (validAttrs[lkey] === true &&
                                        (uriAttrs[lkey] !== true || uriValidator(value, isImage))) {
                                        out(' ');
                                        out(key);
                                        out('="');
                                        out(encodeEntities(value));
                                        out('"');
                                    }
                                });
                                out('>');
                            }
                        },
                        end: function (tag) {
                            tag = lowercase(tag);
                            if (!ignoreCurrentElement && validElements[tag] === true && voidElements[tag] !== true) {
                                out('</');
                                out(tag);
                                out('>');
                            }
                            // eslint-disable-next-line eqeqeq
                            if (tag == ignoreCurrentElement) {
                                ignoreCurrentElement = false;
                            }
                        },
                        chars: function (chars) {
                            if (!ignoreCurrentElement) {
                                out(encodeEntities(chars));
                            }
                        }
                    };
                }


                /**
                 * When IE9-11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1' attribute to declare
                 * ns1 namespace and prefixes the attribute with 'ns1' (e.g. 'ns1:xlink:foo'). This is undesirable since we don't want
                 * to allow any of these custom attributes. This method strips them all.
                 *
                 * @param node Root element to process
                 */
                function stripCustomNsAttrs(node) {
                    while (node) {
                        if (node.nodeType === window.Node.ELEMENT_NODE) {
                            var attrs = node.attributes;
                            for (var i = 0, l = attrs.length; i < l; i++) {
                                var attrNode = attrs[i];
                                var attrName = attrNode.name.toLowerCase();
                                if (attrName === 'xmlns:ns1' || attrName.lastIndexOf('ns1:', 0) === 0) {
                                    node.removeAttributeNode(attrNode);
                                    i--;
                                    l--;
                                }
                            }
                        }

                        var nextNode = node.firstChild;
                        if (nextNode) {
                            stripCustomNsAttrs(nextNode);
                        }

                        node = getNonDescendant('nextSibling', node);
                    }
                }

                function getNonDescendant(propName, node) {
                    // An element is clobbered if its `propName` property points to one of its descendants
                    var nextNode = node[propName];
                    if (nextNode && nodeContains.call(node, nextNode)) {
                        throw $sanitizeMinErr('elclob', 'Failed to sanitize html because the element is clobbered: {0}', node.outerHTML || node.outerText);
                    }
                    return nextNode;
                }
            }

            function sanitizeText(chars) {
                var buf = [];
                var writer = htmlSanitizeWriter(buf, noop);
                writer.chars(chars);
                return buf.join('');
            }


// define ngSanitize module and register $sanitize service
            angular.module('ngSanitize', [])
                .provider('$sanitize', $SanitizeProvider)
                .info({angularVersion: '1.6.6'});

            /**
             * @ngdoc filter
             * @name linky
             * @kind function
             *
             * @description
             * Finds links in text input and turns them into html links. Supports `http/https/ftp/mailto` and
             * plain email address links.
             *
             * Requires the {@link ngSanitize `ngSanitize`} module to be installed.
             *
             * @param {string} text Input text.
             * @param {string} target Window (`_blank|_self|_parent|_top`) or named frame to open links in.
             * @param {object|function(url)} [attributes] Add custom attributes to the link element.
             *
             *    Can be one of:
             *
             *    - `object`: A map of attributes
             *    - `function`: Takes the url as a parameter and returns a map of attributes
             *
             *    If the map of attributes contains a value for `target`, it overrides the value of
             *    the target parameter.
             *
             *
             * @returns {string} Html-linkified and {@link $sanitize sanitized} text.
             *
             * @usage
             <span ng-bind-html="linky_expression | linky"></span>
             *
             * @example
             <example module="linkyExample" deps="angular-sanitize.js" name="linky-filter">
             <file name="index.html">
             <div ng-controller="ExampleController">
             Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
             <table>
             <tr>
             <th>Filter</th>
             <th>Source</th>
             <th>Rendered</th>
             </tr>
             <tr id="linky-filter">
             <td>linky filter</td>
             <td>
             <pre>&lt;div ng-bind-html="snippet | linky"&gt;<br>&lt;/div&gt;</pre>
             </td>
             <td>
             <div ng-bind-html="snippet | linky"></div>
             </td>
             </tr>
             <tr id="linky-target">
             <td>linky target</td>
             <td>
             <pre>&lt;div ng-bind-html="snippetWithSingleURL | linky:'_blank'"&gt;<br>&lt;/div&gt;</pre>
             </td>
             <td>
             <div ng-bind-html="snippetWithSingleURL | linky:'_blank'"></div>
             </td>
             </tr>
             <tr id="linky-custom-attributes">
             <td>linky custom attributes</td>
             <td>
             <pre>&lt;div ng-bind-html="snippetWithSingleURL | linky:'_self':{rel: 'nofollow'}"&gt;<br>&lt;/div&gt;</pre>
             </td>
             <td>
             <div ng-bind-html="snippetWithSingleURL | linky:'_self':{rel: 'nofollow'}"></div>
             </td>
             </tr>
             <tr id="escaped-html">
             <td>no filter</td>
             <td><pre>&lt;div ng-bind="snippet"&gt;<br>&lt;/div&gt;</pre></td>
             <td><div ng-bind="snippet"></div></td>
             </tr>
             </table>
             </file>
             <file name="script.js">
             angular.module('linkyExample', ['ngSanitize'])
             .controller('ExampleController', ['$scope', function($scope) {
           $scope.snippet =
             'Pretty text with some links:\n' +
             'http://angularjs.org/,\n' +
             'mailto:us@somewhere.org,\n' +
             'another@somewhere.org,\n' +
             'and one more: ftp://127.0.0.1/.';
           $scope.snippetWithSingleURL = 'http://angularjs.org/';
         }]);
             </file>
             <file name="protractor.js" type="protractor">
             it('should linkify the snippet with urls', function() {
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(4);
       });

             it('should not linkify snippet without the linky filter', function() {
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, mailto:us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#escaped-html a')).count()).toEqual(0);
       });

             it('should update', function() {
         element(by.model('snippet')).clear();
         element(by.model('snippet')).sendKeys('new http://link.');
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('new http://link.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(1);
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText())
             .toBe('new http://link.');
       });

             it('should work with the target property', function() {
        expect(element(by.id('linky-target')).
            element(by.binding("snippetWithSingleURL | linky:'_blank'")).getText()).
            toBe('http://angularjs.org/');
        expect(element(by.css('#linky-target a')).getAttribute('target')).toEqual('_blank');
       });

             it('should optionally add custom attributes', function() {
        expect(element(by.id('linky-custom-attributes')).
            element(by.binding("snippetWithSingleURL | linky:'_self':{rel: 'nofollow'}")).getText()).
            toBe('http://angularjs.org/');
        expect(element(by.css('#linky-custom-attributes a')).getAttribute('rel')).toEqual('nofollow');
       });
             </file>
             </example>
             */
            angular.module('ngSanitize').filter('linky', ['$sanitize', function ($sanitize) {
                var LINKY_URL_REGEXP =
                        /((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,
                    MAILTO_REGEXP = /^mailto:/i;

                var linkyMinErr = angular.$$minErr('linky');
                var isDefined = angular.isDefined;
                var isFunction = angular.isFunction;
                var isObject = angular.isObject;
                var isString = angular.isString;

                return function (text, target, attributes) {
                    if (text == null || text === '') return text;
                    if (!isString(text)) throw linkyMinErr('notstring', 'Expected string but received: {0}', text);

                    var attributesFn =
                        isFunction(attributes) ? attributes :
                            isObject(attributes) ? function getAttributesObject() {
                                    return attributes;
                                } :
                                function getEmptyAttributesObject() {
                                    return {};
                                };

                    var match;
                    var raw = text;
                    var html = [];
                    var url;
                    var i;
                    while ((match = raw.match(LINKY_URL_REGEXP))) {
                        // We can not end in these as they are sometimes found at the end of the sentence
                        url = match[0];
                        // if we did not match ftp/http/www/mailto then assume mailto
                        if (!match[2] && !match[4]) {
                            url = (match[3] ? 'http://' : 'mailto:') + url;
                        }
                        i = match.index;
                        addText(raw.substr(0, i));
                        addLink(url, match[0].replace(MAILTO_REGEXP, ''));
                        raw = raw.substring(i + match[0].length);
                    }
                    addText(raw);
                    return $sanitize(html.join(''));

                    function addText(text) {
                        if (!text) {
                            return;
                        }
                        html.push(sanitizeText(text));
                    }

                    function addLink(url, text) {
                        var key, linkAttributes = attributesFn(url);
                        html.push('<a ');

                        for (key in linkAttributes) {
                            html.push(key + '="' + linkAttributes[key] + '" ');
                        }

                        if (isDefined(target) && !('target' in linkAttributes)) {
                            html.push('target="',
                                target,
                                '" ');
                        }
                        html.push('href="',
                            url.replace(/"/g, '&quot;'),
                            '">');
                        addText(text);
                        html.push('</a>');
                    }
                };
            }]);


        })(window, window.angular);

    }, {}],
    "../node_modules/angular-sanitize/index.js": [function (require, module, exports) {

    }, {}],
    "../node_modules/vendors/plugins/select2/js/select2.min.js": [function (require, module, exports) {
        /*! Select2 4.0.3 | https://github.com/select2/select2/blob/master/LICENSE.md */
        !function (a) {
            "function" == typeof define && define.amd ? define(["jquery"], a) : a("object" == typeof exports ? require("jquery") : jQuery)
        }(function (a) {
            var b = function () {
                if (a && a.fn && a.fn.select2 && a.fn.select2.amd) var b = a.fn.select2.amd;
                var b;
                return function () {
                    if (!b || !b.requirejs) {
                        b ? c = b : b = {};
                        var a, c, d;
                        !function (b) {
                            function e(a, b) {
                                return u.call(a, b)
                            }

                            function f(a, b) {
                                var c, d, e, f, g, h, i, j, k, l, m, n = b && b.split("/"), o = s.map,
                                    p = o && o["*"] || {};
                                if (a && "." === a.charAt(0)) if (b) {
                                    for (a = a.split("/"), g = a.length - 1, s.nodeIdCompat && w.test(a[g]) && (a[g] = a[g].replace(w, "")), a = n.slice(0, n.length - 1).concat(a), k = 0; k < a.length; k += 1) if (m = a[k], "." === m) a.splice(k, 1), k -= 1; else if (".." === m) {
                                        if (1 === k && (".." === a[2] || ".." === a[0])) break;
                                        k > 0 && (a.splice(k - 1, 2), k -= 2)
                                    }
                                    a = a.join("/")
                                } else 0 === a.indexOf("./") && (a = a.substring(2));
                                if ((n || p) && o) {
                                    for (c = a.split("/"), k = c.length; k > 0; k -= 1) {
                                        if (d = c.slice(0, k).join("/"), n) for (l = n.length; l > 0; l -= 1) if (e = o[n.slice(0, l).join("/")], e && (e = e[d])) {
                                            f = e, h = k;
                                            break
                                        }
                                        if (f) break;
                                        !i && p && p[d] && (i = p[d], j = k)
                                    }
                                    !f && i && (f = i, h = j), f && (c.splice(0, h, f), a = c.join("/"))
                                }
                                return a
                            }

                            function g(a, c) {
                                return function () {
                                    var d = v.call(arguments, 0);
                                    return "string" != typeof d[0] && 1 === d.length && d.push(null), n.apply(b, d.concat([a, c]))
                                }
                            }

                            function h(a) {
                                return function (b) {
                                    return f(b, a)
                                }
                            }

                            function i(a) {
                                return function (b) {
                                    q[a] = b
                                }
                            }

                            function j(a) {
                                if (e(r, a)) {
                                    var c = r[a];
                                    delete r[a], t[a] = !0, m.apply(b, c)
                                }
                                if (!e(q, a) && !e(t, a)) throw new Error("No " + a);
                                return q[a]
                            }

                            function k(a) {
                                var b, c = a ? a.indexOf("!") : -1;
                                return c > -1 && (b = a.substring(0, c), a = a.substring(c + 1, a.length)), [b, a]
                            }

                            function l(a) {
                                return function () {
                                    return s && s.config && s.config[a] || {}
                                }
                            }

                            var m, n, o, p, q = {}, r = {}, s = {}, t = {}, u = Object.prototype.hasOwnProperty,
                                v = [].slice, w = /\.js$/;
                            o = function (a, b) {
                                var c, d = k(a), e = d[0];
                                return a = d[1], e && (e = f(e, b), c = j(e)), e ? a = c && c.normalize ? c.normalize(a, h(b)) : f(a, b) : (a = f(a, b), d = k(a), e = d[0], a = d[1], e && (c = j(e))), {
                                    f: e ? e + "!" + a : a,
                                    n: a,
                                    pr: e,
                                    p: c
                                }
                            }, p = {
                                require: function (a) {
                                    return g(a)
                                }, exports: function (a) {
                                    var b = q[a];
                                    return "undefined" != typeof b ? b : q[a] = {}
                                }, module: function (a) {
                                    return {id: a, uri: "", exports: q[a], config: l(a)}
                                }
                            }, m = function (a, c, d, f) {
                                var h, k, l, m, n, s, u = [], v = typeof d;
                                if (f = f || a, "undefined" === v || "function" === v) {
                                    for (c = !c.length && d.length ? ["require", "exports", "module"] : c, n = 0; n < c.length; n += 1) if (m = o(c[n], f), k = m.f, "require" === k) u[n] = p.require(a); else if ("exports" === k) u[n] = p.exports(a), s = !0; else if ("module" === k) h = u[n] = p.module(a); else if (e(q, k) || e(r, k) || e(t, k)) u[n] = j(k); else {
                                        if (!m.p) throw new Error(a + " missing " + k);
                                        m.p.load(m.n, g(f, !0), i(k), {}), u[n] = q[k]
                                    }
                                    l = d ? d.apply(q[a], u) : void 0, a && (h && h.exports !== b && h.exports !== q[a] ? q[a] = h.exports : l === b && s || (q[a] = l))
                                } else a && (q[a] = d)
                            }, a = c = n = function (a, c, d, e, f) {
                                if ("string" == typeof a) return p[a] ? p[a](c) : j(o(a, c).f);
                                if (!a.splice) {
                                    if (s = a, s.deps && n(s.deps, s.callback), !c) return;
                                    c.splice ? (a = c, c = d, d = null) : a = b
                                }
                                return c = c || function () {
                                }, "function" == typeof d && (d = e, e = f), e ? m(b, a, c, d) : setTimeout(function () {
                                    m(b, a, c, d)
                                }, 4), n
                            }, n.config = function (a) {
                                return n(a)
                            }, a._defined = q, d = function (a, b, c) {
                                if ("string" != typeof a) throw new Error("See almond README: incorrect module build, no module name");
                                b.splice || (c = b, b = []), e(q, a) || e(r, a) || (r[a] = [a, b, c])
                            }, d.amd = {jQuery: !0}
                        }(), b.requirejs = a, b.require = c, b.define = d
                    }
                }(), b.define("almond", function () {
                }), b.define("jquery", [], function () {
                    var b = a || $;
                    return null == b && console && console.error && console.error("Select2: An instance of jQuery or a jQuery-compatible library was not found. Make sure that you are including jQuery before Select2 on your web page."), b
                }), b.define("select2/utils", ["jquery"], function (a) {
                    function b(a) {
                        var b = a.prototype, c = [];
                        for (var d in b) {
                            var e = b[d];
                            "function" == typeof e && "constructor" !== d && c.push(d)
                        }
                        return c
                    }

                    var c = {};
                    c.Extend = function (a, b) {
                        function c() {
                            this.constructor = a
                        }

                        var d = {}.hasOwnProperty;
                        for (var e in b) d.call(b, e) && (a[e] = b[e]);
                        return c.prototype = b.prototype, a.prototype = new c, a.__super__ = b.prototype, a
                    }, c.Decorate = function (a, c) {
                        function d() {
                            var b = Array.prototype.unshift, d = c.prototype.constructor.length,
                                e = a.prototype.constructor;
                            d > 0 && (b.call(arguments, a.prototype.constructor), e = c.prototype.constructor), e.apply(this, arguments)
                        }

                        function e() {
                            this.constructor = d
                        }

                        var f = b(c), g = b(a);
                        c.displayName = a.displayName, d.prototype = new e;
                        for (var h = 0; h < g.length; h++) {
                            var i = g[h];
                            d.prototype[i] = a.prototype[i]
                        }
                        for (var j = (function (a) {
                            var b = function () {
                            };
                            a in d.prototype && (b = d.prototype[a]);
                            var e = c.prototype[a];
                            return function () {
                                var a = Array.prototype.unshift;
                                return a.call(arguments, b), e.apply(this, arguments)
                            }
                        }), k = 0; k < f.length; k++) {
                            var l = f[k];
                            d.prototype[l] = j(l)
                        }
                        return d
                    };
                    var d = function () {
                        this.listeners = {}
                    };
                    return d.prototype.on = function (a, b) {
                        this.listeners = this.listeners || {}, a in this.listeners ? this.listeners[a].push(b) : this.listeners[a] = [b]
                    }, d.prototype.trigger = function (a) {
                        var b = Array.prototype.slice, c = b.call(arguments, 1);
                        this.listeners = this.listeners || {}, null == c && (c = []), 0 === c.length && c.push({}), c[0]._type = a, a in this.listeners && this.invoke(this.listeners[a], b.call(arguments, 1)), "*" in this.listeners && this.invoke(this.listeners["*"], arguments)
                    }, d.prototype.invoke = function (a, b) {
                        for (var c = 0, d = a.length; d > c; c++) a[c].apply(this, b)
                    }, c.Observable = d, c.generateChars = function (a) {
                        for (var b = "", c = 0; a > c; c++) {
                            var d = Math.floor(36 * Math.random());
                            b += d.toString(36)
                        }
                        return b
                    }, c.bind = function (a, b) {
                        return function () {
                            a.apply(b, arguments)
                        }
                    }, c._convertData = function (a) {
                        for (var b in a) {
                            var c = b.split("-"), d = a;
                            if (1 !== c.length) {
                                for (var e = 0; e < c.length; e++) {
                                    var f = c[e];
                                    f = f.substring(0, 1).toLowerCase() + f.substring(1), f in d || (d[f] = {}), e == c.length - 1 && (d[f] = a[b]), d = d[f]
                                }
                                delete a[b]
                            }
                        }
                        return a
                    }, c.hasScroll = function (b, c) {
                        var d = a(c), e = c.style.overflowX, f = c.style.overflowY;
                        return e !== f || "hidden" !== f && "visible" !== f ? "scroll" === e || "scroll" === f ? !0 : d.innerHeight() < c.scrollHeight || d.innerWidth() < c.scrollWidth : !1
                    }, c.escapeMarkup = function (a) {
                        var b = {
                            "\\": "&#92;",
                            "&": "&amp;",
                            "<": "&lt;",
                            ">": "&gt;",
                            '"': "&quot;",
                            "'": "&#39;",
                            "/": "&#47;"
                        };
                        return "string" != typeof a ? a : String(a).replace(/[&<>"'\/\\]/g, function (a) {
                            return b[a]
                        })
                    }, c.appendMany = function (b, c) {
                        if ("1.7" === a.fn.jquery.substr(0, 3)) {
                            var d = a();
                            a.map(c, function (a) {
                                d = d.add(a)
                            }), c = d
                        }
                        b.append(c)
                    }, c
                }), b.define("select2/results", ["jquery", "./utils"], function (a, b) {
                    function c(a, b, d) {
                        this.$element = a, this.data = d, this.options = b, c.__super__.constructor.call(this)
                    }

                    return b.Extend(c, b.Observable), c.prototype.render = function () {
                        var b = a('<ul class="select2-results__options" role="tree"></ul>');
                        return this.options.get("multiple") && b.attr("aria-multiselectable", "true"), this.$results = b, b
                    }, c.prototype.clear = function () {
                        this.$results.empty()
                    }, c.prototype.displayMessage = function (b) {
                        var c = this.options.get("escapeMarkup");
                        this.clear(), this.hideLoading();
                        var d = a('<li role="treeitem" aria-live="assertive" class="select2-results__option"></li>'),
                            e = this.options.get("translations").get(b.message);
                        d.append(c(e(b.args))), d[0].className += " select2-results__message", this.$results.append(d)
                    }, c.prototype.hideMessages = function () {
                        this.$results.find(".select2-results__message").remove()
                    }, c.prototype.append = function (a) {
                        this.hideLoading();
                        var b = [];
                        if (null == a.results || 0 === a.results.length) return void(0 === this.$results.children().length && this.trigger("results:message", {message: "noResults"}));
                        a.results = this.sort(a.results);
                        for (var c = 0; c < a.results.length; c++) {
                            var d = a.results[c], e = this.option(d);
                            b.push(e)
                        }
                        this.$results.append(b)
                    }, c.prototype.position = function (a, b) {
                        var c = b.find(".select2-results");
                        c.append(a)
                    }, c.prototype.sort = function (a) {
                        var b = this.options.get("sorter");
                        return b(a)
                    }, c.prototype.highlightFirstItem = function () {
                        var a = this.$results.find(".select2-results__option[aria-selected]"),
                            b = a.filter("[aria-selected=true]");
                        b.length > 0 ? b.first().trigger("mouseenter") : a.first().trigger("mouseenter"), this.ensureHighlightVisible()
                    }, c.prototype.setClasses = function () {
                        var b = this;
                        this.data.current(function (c) {
                            var d = a.map(c, function (a) {
                                return a.id.toString()
                            }), e = b.$results.find(".select2-results__option[aria-selected]");
                            e.each(function () {
                                var b = a(this), c = a.data(this, "data"), e = "" + c.id;
                                null != c.element && c.element.selected || null == c.element && a.inArray(e, d) > -1 ? b.attr("aria-selected", "true") : b.attr("aria-selected", "false")
                            })
                        })
                    }, c.prototype.showLoading = function (a) {
                        this.hideLoading();
                        var b = this.options.get("translations").get("searching"),
                            c = {disabled: !0, loading: !0, text: b(a)}, d = this.option(c);
                        d.className += " loading-results", this.$results.prepend(d)
                    }, c.prototype.hideLoading = function () {
                        this.$results.find(".loading-results").remove()
                    }, c.prototype.option = function (b) {
                        var c = document.createElement("li");
                        c.className = "select2-results__option";
                        var d = {role: "treeitem", "aria-selected": "false"};
                        b.disabled && (delete d["aria-selected"], d["aria-disabled"] = "true"), null == b.id && delete d["aria-selected"], null != b._resultId && (c.id = b._resultId), b.title && (c.title = b.title), b.children && (d.role = "group", d["aria-label"] = b.text, delete d["aria-selected"]);
                        for (var e in d) {
                            var f = d[e];
                            c.setAttribute(e, f)
                        }
                        if (b.children) {
                            var g = a(c), h = document.createElement("strong");
                            h.className = "select2-results__group";
                            a(h);
                            this.template(b, h);
                            for (var i = [], j = 0; j < b.children.length; j++) {
                                var k = b.children[j], l = this.option(k);
                                i.push(l)
                            }
                            var m = a("<ul></ul>", {"class": "select2-results__options select2-results__options--nested"});
                            m.append(i), g.append(h), g.append(m)
                        } else this.template(b, c);
                        return a.data(c, "data", b), c
                    }, c.prototype.bind = function (b, c) {
                        var d = this, e = b.id + "-results";
                        this.$results.attr("id", e), b.on("results:all", function (a) {
                            d.clear(), d.append(a.data), b.isOpen() && (d.setClasses(), d.highlightFirstItem())
                        }), b.on("results:append", function (a) {
                            d.append(a.data), b.isOpen() && d.setClasses()
                        }), b.on("query", function (a) {
                            d.hideMessages(), d.showLoading(a)
                        }), b.on("select", function () {
                            b.isOpen() && (d.setClasses(), d.highlightFirstItem())
                        }), b.on("unselect", function () {
                            b.isOpen() && (d.setClasses(), d.highlightFirstItem())
                        }), b.on("open", function () {
                            d.$results.attr("aria-expanded", "true"), d.$results.attr("aria-hidden", "false"), d.setClasses(), d.ensureHighlightVisible()
                        }), b.on("close", function () {
                            d.$results.attr("aria-expanded", "false"), d.$results.attr("aria-hidden", "true"), d.$results.removeAttr("aria-activedescendant")
                        }), b.on("results:toggle", function () {
                            var a = d.getHighlightedResults();
                            0 !== a.length && a.trigger("mouseup")
                        }), b.on("results:select", function () {
                            var a = d.getHighlightedResults();
                            if (0 !== a.length) {
                                var b = a.data("data");
                                "true" == a.attr("aria-selected") ? d.trigger("close", {}) : d.trigger("select", {data: b})
                            }
                        }), b.on("results:previous", function () {
                            var a = d.getHighlightedResults(), b = d.$results.find("[aria-selected]"), c = b.index(a);
                            if (0 !== c) {
                                var e = c - 1;
                                0 === a.length && (e = 0);
                                var f = b.eq(e);
                                f.trigger("mouseenter");
                                var g = d.$results.offset().top, h = f.offset().top,
                                    i = d.$results.scrollTop() + (h - g);
                                0 === e ? d.$results.scrollTop(0) : 0 > h - g && d.$results.scrollTop(i)
                            }
                        }), b.on("results:next", function () {
                            var a = d.getHighlightedResults(), b = d.$results.find("[aria-selected]"), c = b.index(a),
                                e = c + 1;
                            if (!(e >= b.length)) {
                                var f = b.eq(e);
                                f.trigger("mouseenter");
                                var g = d.$results.offset().top + d.$results.outerHeight(!1),
                                    h = f.offset().top + f.outerHeight(!1), i = d.$results.scrollTop() + h - g;
                                0 === e ? d.$results.scrollTop(0) : h > g && d.$results.scrollTop(i)
                            }
                        }), b.on("results:focus", function (a) {
                            a.element.addClass("select2-results__option--highlighted")
                        }), b.on("results:message", function (a) {
                            d.displayMessage(a)
                        }), a.fn.mousewheel && this.$results.on("mousewheel", function (a) {
                            var b = d.$results.scrollTop(), c = d.$results.get(0).scrollHeight - b + a.deltaY,
                                e = a.deltaY > 0 && b - a.deltaY <= 0, f = a.deltaY < 0 && c <= d.$results.height();
                            e ? (d.$results.scrollTop(0), a.preventDefault(), a.stopPropagation()) : f && (d.$results.scrollTop(d.$results.get(0).scrollHeight - d.$results.height()), a.preventDefault(), a.stopPropagation())
                        }), this.$results.on("mouseup", ".select2-results__option[aria-selected]", function (b) {
                            var c = a(this), e = c.data("data");
                            return "true" === c.attr("aria-selected") ? void(d.options.get("multiple") ? d.trigger("unselect", {
                                originalEvent: b,
                                data: e
                            }) : d.trigger("close", {})) : void d.trigger("select", {originalEvent: b, data: e})
                        }), this.$results.on("mouseenter", ".select2-results__option[aria-selected]", function (b) {
                            var c = a(this).data("data");
                            d.getHighlightedResults().removeClass("select2-results__option--highlighted"), d.trigger("results:focus", {
                                data: c,
                                element: a(this)
                            })
                        })
                    }, c.prototype.getHighlightedResults = function () {
                        var a = this.$results.find(".select2-results__option--highlighted");
                        return a
                    }, c.prototype.destroy = function () {
                        this.$results.remove()
                    }, c.prototype.ensureHighlightVisible = function () {
                        var a = this.getHighlightedResults();
                        if (0 !== a.length) {
                            var b = this.$results.find("[aria-selected]"), c = b.index(a),
                                d = this.$results.offset().top, e = a.offset().top,
                                f = this.$results.scrollTop() + (e - d), g = e - d;
                            f -= 2 * a.outerHeight(!1), 2 >= c ? this.$results.scrollTop(0) : (g > this.$results.outerHeight() || 0 > g) && this.$results.scrollTop(f)
                        }
                    }, c.prototype.template = function (b, c) {
                        var d = this.options.get("templateResult"), e = this.options.get("escapeMarkup"), f = d(b, c);
                        null == f ? c.style.display = "none" : "string" == typeof f ? c.innerHTML = e(f) : a(c).append(f)
                    }, c
                }), b.define("select2/keys", [], function () {
                    var a = {
                        BACKSPACE: 8,
                        TAB: 9,
                        ENTER: 13,
                        SHIFT: 16,
                        CTRL: 17,
                        ALT: 18,
                        ESC: 27,
                        SPACE: 32,
                        PAGE_UP: 33,
                        PAGE_DOWN: 34,
                        END: 35,
                        HOME: 36,
                        LEFT: 37,
                        UP: 38,
                        RIGHT: 39,
                        DOWN: 40,
                        DELETE: 46
                    };
                    return a
                }), b.define("select2/selection/base", ["jquery", "../utils", "../keys"], function (a, b, c) {
                    function d(a, b) {
                        this.$element = a, this.options = b, d.__super__.constructor.call(this)
                    }

                    return b.Extend(d, b.Observable), d.prototype.render = function () {
                        var b = a('<span class="select2-selection" role="combobox"  aria-haspopup="true" aria-expanded="false"></span>');
                        return this._tabindex = 0, null != this.$element.data("old-tabindex") ? this._tabindex = this.$element.data("old-tabindex") : null != this.$element.attr("tabindex") && (this._tabindex = this.$element.attr("tabindex")), b.attr("title", this.$element.attr("title")), b.attr("tabindex", this._tabindex), this.$selection = b, b
                    }, d.prototype.bind = function (a, b) {
                        var d = this, e = (a.id + "-container", a.id + "-results");
                        this.container = a, this.$selection.on("focus", function (a) {
                            d.trigger("focus", a)
                        }), this.$selection.on("blur", function (a) {
                            d._handleBlur(a)
                        }), this.$selection.on("keydown", function (a) {
                            d.trigger("keypress", a), a.which === c.SPACE && a.preventDefault()
                        }), a.on("results:focus", function (a) {
                            d.$selection.attr("aria-activedescendant", a.data._resultId)
                        }), a.on("selection:update", function (a) {
                            d.update(a.data)
                        }), a.on("open", function () {
                            d.$selection.attr("aria-expanded", "true"), d.$selection.attr("aria-owns", e), d._attachCloseHandler(a)
                        }), a.on("close", function () {
                            d.$selection.attr("aria-expanded", "false"), d.$selection.removeAttr("aria-activedescendant"), d.$selection.removeAttr("aria-owns"), d.$selection.focus(), d._detachCloseHandler(a)
                        }), a.on("enable", function () {
                            d.$selection.attr("tabindex", d._tabindex)
                        }), a.on("disable", function () {
                            d.$selection.attr("tabindex", "-1")
                        })
                    }, d.prototype._handleBlur = function (b) {
                        var c = this;
                        window.setTimeout(function () {
                            document.activeElement == c.$selection[0] || a.contains(c.$selection[0], document.activeElement) || c.trigger("blur", b)
                        }, 1)
                    }, d.prototype._attachCloseHandler = function (b) {
                        a(document.body).on("mousedown.select2." + b.id, function (b) {
                            var c = a(b.target), d = c.closest(".select2"), e = a(".select2.select2-container--open");
                            e.each(function () {
                                var b = a(this);
                                if (this != d[0]) {
                                    var c = b.data("element");
                                    c.select2("close")
                                }
                            })
                        })
                    }, d.prototype._detachCloseHandler = function (b) {
                        a(document.body).off("mousedown.select2." + b.id)
                    }, d.prototype.position = function (a, b) {
                        var c = b.find(".selection");
                        c.append(a)
                    }, d.prototype.destroy = function () {
                        this._detachCloseHandler(this.container)
                    }, d.prototype.update = function (a) {
                        throw new Error("The `update` method must be defined in child classes.")
                    }, d
                }), b.define("select2/selection/single", ["jquery", "./base", "../utils", "../keys"], function (a, b, c, d) {
                    function e() {
                        e.__super__.constructor.apply(this, arguments)
                    }

                    return c.Extend(e, b), e.prototype.render = function () {
                        var a = e.__super__.render.call(this);
                        return a.addClass("select2-selection--single"), a.html('<span class="select2-selection__rendered"></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>'), a
                    }, e.prototype.bind = function (a, b) {
                        var c = this;
                        e.__super__.bind.apply(this, arguments);
                        var d = a.id + "-container";
                        this.$selection.find(".select2-selection__rendered").attr("id", d), this.$selection.attr("aria-labelledby", d), this.$selection.on("mousedown", function (a) {
                            1 === a.which && c.trigger("toggle", {originalEvent: a})
                        }), this.$selection.on("focus", function (a) {
                        }), this.$selection.on("blur", function (a) {
                        }), a.on("focus", function (b) {
                            a.isOpen() || c.$selection.focus()
                        }), a.on("selection:update", function (a) {
                            c.update(a.data)
                        })
                    }, e.prototype.clear = function () {
                        this.$selection.find(".select2-selection__rendered").empty()
                    }, e.prototype.display = function (a, b) {
                        var c = this.options.get("templateSelection"), d = this.options.get("escapeMarkup");
                        return d(c(a, b))
                    }, e.prototype.selectionContainer = function () {
                        return a("<span></span>")
                    }, e.prototype.update = function (a) {
                        if (0 === a.length) return void this.clear();
                        var b = a[0], c = this.$selection.find(".select2-selection__rendered"), d = this.display(b, c);
                        c.empty().append(d), c.prop("title", b.title || b.text)
                    }, e
                }), b.define("select2/selection/multiple", ["jquery", "./base", "../utils"], function (a, b, c) {
                    function d(a, b) {
                        d.__super__.constructor.apply(this, arguments)
                    }

                    return c.Extend(d, b), d.prototype.render = function () {
                        var a = d.__super__.render.call(this);
                        return a.addClass("select2-selection--multiple"), a.html('<ul class="select2-selection__rendered"></ul>'), a
                    }, d.prototype.bind = function (b, c) {
                        var e = this;
                        d.__super__.bind.apply(this, arguments), this.$selection.on("click", function (a) {
                            e.trigger("toggle", {originalEvent: a})
                        }), this.$selection.on("click", ".select2-selection__choice__remove", function (b) {
                            if (!e.options.get("disabled")) {
                                var c = a(this), d = c.parent(), f = d.data("data");
                                e.trigger("unselect", {originalEvent: b, data: f})
                            }
                        })
                    }, d.prototype.clear = function () {
                        this.$selection.find(".select2-selection__rendered").empty()
                    }, d.prototype.display = function (a, b) {
                        var c = this.options.get("templateSelection"), d = this.options.get("escapeMarkup");
                        return d(c(a, b))
                    }, d.prototype.selectionContainer = function () {
                        var b = a('<li class="select2-selection__choice"><span class="select2-selection__choice__remove" role="presentation">&times;</span></li>');
                        return b
                    }, d.prototype.update = function (a) {
                        if (this.clear(), 0 !== a.length) {
                            for (var b = [], d = 0; d < a.length; d++) {
                                var e = a[d], f = this.selectionContainer(), g = this.display(e, f);
                                f.append(g), f.prop("title", e.title || e.text), f.data("data", e), b.push(f)
                            }
                            var h = this.$selection.find(".select2-selection__rendered");
                            c.appendMany(h, b)
                        }
                    }, d
                }), b.define("select2/selection/placeholder", ["../utils"], function (a) {
                    function b(a, b, c) {
                        this.placeholder = this.normalizePlaceholder(c.get("placeholder")), a.call(this, b, c)
                    }

                    return b.prototype.normalizePlaceholder = function (a, b) {
                        return "string" == typeof b && (b = {id: "", text: b}), b
                    }, b.prototype.createPlaceholder = function (a, b) {
                        var c = this.selectionContainer();
                        return c.html(this.display(b)), c.addClass("select2-selection__placeholder").removeClass("select2-selection__choice"), c
                    }, b.prototype.update = function (a, b) {
                        var c = 1 == b.length && b[0].id != this.placeholder.id, d = b.length > 1;
                        if (d || c) return a.call(this, b);
                        this.clear();
                        var e = this.createPlaceholder(this.placeholder);
                        this.$selection.find(".select2-selection__rendered").append(e)
                    }, b
                }), b.define("select2/selection/allowClear", ["jquery", "../keys"], function (a, b) {
                    function c() {
                    }

                    return c.prototype.bind = function (a, b, c) {
                        var d = this;
                        a.call(this, b, c), null == this.placeholder && this.options.get("debug") && window.console && console.error && console.error("Select2: The `allowClear` option should be used in combination with the `placeholder` option."), this.$selection.on("mousedown", ".select2-selection__clear", function (a) {
                            d._handleClear(a)
                        }), b.on("keypress", function (a) {
                            d._handleKeyboardClear(a, b)
                        })
                    }, c.prototype._handleClear = function (a, b) {
                        if (!this.options.get("disabled")) {
                            var c = this.$selection.find(".select2-selection__clear");
                            if (0 !== c.length) {
                                b.stopPropagation();
                                for (var d = c.data("data"), e = 0; e < d.length; e++) {
                                    var f = {data: d[e]};
                                    if (this.trigger("unselect", f), f.prevented) return
                                }
                                this.$element.val(this.placeholder.id).trigger("change"), this.trigger("toggle", {})
                            }
                        }
                    }, c.prototype._handleKeyboardClear = function (a, c, d) {
                        d.isOpen() || (c.which == b.DELETE || c.which == b.BACKSPACE) && this._handleClear(c)
                    }, c.prototype.update = function (b, c) {
                        if (b.call(this, c), !(this.$selection.find(".select2-selection__placeholder").length > 0 || 0 === c.length)) {
                            var d = a('<span class="select2-selection__clear">&times;</span>');
                            d.data("data", c), this.$selection.find(".select2-selection__rendered").prepend(d)
                        }
                    }, c
                }), b.define("select2/selection/search", ["jquery", "../utils", "../keys"], function (a, b, c) {
                    function d(a, b, c) {
                        a.call(this, b, c)
                    }

                    return d.prototype.render = function (b) {
                        var c = a('<li class="select2-search select2-search--inline"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" aria-autocomplete="list" /></li>');
                        this.$searchContainer = c, this.$search = c.find("input");
                        var d = b.call(this);
                        return this._transferTabIndex(), d
                    }, d.prototype.bind = function (a, b, d) {
                        var e = this;
                        a.call(this, b, d), b.on("open", function () {
                            e.$search.trigger("focus")
                        }), b.on("close", function () {
                            e.$search.val(""), e.$search.removeAttr("aria-activedescendant"), e.$search.trigger("focus")
                        }), b.on("enable", function () {
                            e.$search.prop("disabled", !1), e._transferTabIndex()
                        }), b.on("disable", function () {
                            e.$search.prop("disabled", !0)
                        }), b.on("focus", function (a) {
                            e.$search.trigger("focus")
                        }), b.on("results:focus", function (a) {
                            e.$search.attr("aria-activedescendant", a.id)
                        }), this.$selection.on("focusin", ".select2-search--inline", function (a) {
                            e.trigger("focus", a)
                        }), this.$selection.on("focusout", ".select2-search--inline", function (a) {
                            e._handleBlur(a)
                        }), this.$selection.on("keydown", ".select2-search--inline", function (a) {
                            a.stopPropagation(), e.trigger("keypress", a), e._keyUpPrevented = a.isDefaultPrevented();
                            var b = a.which;
                            if (b === c.BACKSPACE && "" === e.$search.val()) {
                                var d = e.$searchContainer.prev(".select2-selection__choice");
                                if (d.length > 0) {
                                    var f = d.data("data");
                                    e.searchRemoveChoice(f), a.preventDefault()
                                }
                            }
                        });
                        var f = document.documentMode, g = f && 11 >= f;
                        this.$selection.on("input.searchcheck", ".select2-search--inline", function (a) {
                            return g ? void e.$selection.off("input.search input.searchcheck") : void e.$selection.off("keyup.search")
                        }), this.$selection.on("keyup.search input.search", ".select2-search--inline", function (a) {
                            if (g && "input" === a.type) return void e.$selection.off("input.search input.searchcheck");
                            var b = a.which;
                            b != c.SHIFT && b != c.CTRL && b != c.ALT && b != c.TAB && e.handleSearch(a)
                        })
                    }, d.prototype._transferTabIndex = function (a) {
                        this.$search.attr("tabindex", this.$selection.attr("tabindex")), this.$selection.attr("tabindex", "-1")
                    }, d.prototype.createPlaceholder = function (a, b) {
                        this.$search.attr("placeholder", b.text)
                    }, d.prototype.update = function (a, b) {
                        var c = this.$search[0] == document.activeElement;
                        this.$search.attr("placeholder", ""), a.call(this, b), this.$selection.find(".select2-selection__rendered").append(this.$searchContainer), this.resizeSearch(), c && this.$search.focus()
                    }, d.prototype.handleSearch = function () {
                        if (this.resizeSearch(), !this._keyUpPrevented) {
                            var a = this.$search.val();
                            this.trigger("query", {term: a})
                        }
                        this._keyUpPrevented = !1
                    }, d.prototype.searchRemoveChoice = function (a, b) {
                        this.trigger("unselect", {data: b}), this.$search.val(b.text), this.handleSearch()
                    }, d.prototype.resizeSearch = function () {
                        this.$search.css("width", "25px");
                        var a = "";
                        if ("" !== this.$search.attr("placeholder")) a = this.$selection.find(".select2-selection__rendered").innerWidth(); else {
                            var b = this.$search.val().length + 1;
                            a = .75 * b + "em"
                        }
                        this.$search.css("width", a)
                    }, d
                }), b.define("select2/selection/eventRelay", ["jquery"], function (a) {
                    function b() {
                    }

                    return b.prototype.bind = function (b, c, d) {
                        var e = this,
                            f = ["open", "opening", "close", "closing", "select", "selecting", "unselect", "unselecting"],
                            g = ["opening", "closing", "selecting", "unselecting"];
                        b.call(this, c, d), c.on("*", function (b, c) {
                            if (-1 !== a.inArray(b, f)) {
                                c = c || {};
                                var d = a.Event("select2:" + b, {params: c});
                                e.$element.trigger(d), -1 !== a.inArray(b, g) && (c.prevented = d.isDefaultPrevented())
                            }
                        })
                    }, b
                }), b.define("select2/translation", ["jquery", "require"], function (a, b) {
                    function c(a) {
                        this.dict = a || {}
                    }

                    return c.prototype.all = function () {
                        return this.dict
                    }, c.prototype.get = function (a) {
                        return this.dict[a]
                    }, c.prototype.extend = function (b) {
                        this.dict = a.extend({}, b.all(), this.dict)
                    }, c._cache = {}, c.loadPath = function (a) {
                        if (!(a in c._cache)) {
                            var d = b(a);
                            c._cache[a] = d
                        }
                        return new c(c._cache[a])
                    }, c
                }), b.define("select2/diacritics", [], function () {
                    var a = {
                        "Ⓐ": "A",
                        "Ａ": "A",
                        "À": "A",
                        "Á": "A",
                        "Â": "A",
                        "Ầ": "A",
                        "Ấ": "A",
                        "Ẫ": "A",
                        "Ẩ": "A",
                        "Ã": "A",
                        "Ā": "A",
                        "Ă": "A",
                        "Ằ": "A",
                        "Ắ": "A",
                        "Ẵ": "A",
                        "Ẳ": "A",
                        "Ȧ": "A",
                        "Ǡ": "A",
                        "Ä": "A",
                        "Ǟ": "A",
                        "Ả": "A",
                        "Å": "A",
                        "Ǻ": "A",
                        "Ǎ": "A",
                        "Ȁ": "A",
                        "Ȃ": "A",
                        "Ạ": "A",
                        "Ậ": "A",
                        "Ặ": "A",
                        "Ḁ": "A",
                        "Ą": "A",
                        "Ⱥ": "A",
                        "Ɐ": "A",
                        "Ꜳ": "AA",
                        "Æ": "AE",
                        "Ǽ": "AE",
                        "Ǣ": "AE",
                        "Ꜵ": "AO",
                        "Ꜷ": "AU",
                        "Ꜹ": "AV",
                        "Ꜻ": "AV",
                        "Ꜽ": "AY",
                        "Ⓑ": "B",
                        "Ｂ": "B",
                        "Ḃ": "B",
                        "Ḅ": "B",
                        "Ḇ": "B",
                        "Ƀ": "B",
                        "Ƃ": "B",
                        "Ɓ": "B",
                        "Ⓒ": "C",
                        "Ｃ": "C",
                        "Ć": "C",
                        "Ĉ": "C",
                        "Ċ": "C",
                        "Č": "C",
                        "Ç": "C",
                        "Ḉ": "C",
                        "Ƈ": "C",
                        "Ȼ": "C",
                        "Ꜿ": "C",
                        "Ⓓ": "D",
                        "Ｄ": "D",
                        "Ḋ": "D",
                        "Ď": "D",
                        "Ḍ": "D",
                        "Ḑ": "D",
                        "Ḓ": "D",
                        "Ḏ": "D",
                        "Đ": "D",
                        "Ƌ": "D",
                        "Ɗ": "D",
                        "Ɖ": "D",
                        "Ꝺ": "D",
                        "Ǳ": "DZ",
                        "Ǆ": "DZ",
                        "ǲ": "Dz",
                        "ǅ": "Dz",
                        "Ⓔ": "E",
                        "Ｅ": "E",
                        "È": "E",
                        "É": "E",
                        "Ê": "E",
                        "Ề": "E",
                        "Ế": "E",
                        "Ễ": "E",
                        "Ể": "E",
                        "Ẽ": "E",
                        "Ē": "E",
                        "Ḕ": "E",
                        "Ḗ": "E",
                        "Ĕ": "E",
                        "Ė": "E",
                        "Ë": "E",
                        "Ẻ": "E",
                        "Ě": "E",
                        "Ȅ": "E",
                        "Ȇ": "E",
                        "Ẹ": "E",
                        "Ệ": "E",
                        "Ȩ": "E",
                        "Ḝ": "E",
                        "Ę": "E",
                        "Ḙ": "E",
                        "Ḛ": "E",
                        "Ɛ": "E",
                        "Ǝ": "E",
                        "Ⓕ": "F",
                        "Ｆ": "F",
                        "Ḟ": "F",
                        "Ƒ": "F",
                        "Ꝼ": "F",
                        "Ⓖ": "G",
                        "Ｇ": "G",
                        "Ǵ": "G",
                        "Ĝ": "G",
                        "Ḡ": "G",
                        "Ğ": "G",
                        "Ġ": "G",
                        "Ǧ": "G",
                        "Ģ": "G",
                        "Ǥ": "G",
                        "Ɠ": "G",
                        "Ꞡ": "G",
                        "Ᵹ": "G",
                        "Ꝿ": "G",
                        "Ⓗ": "H",
                        "Ｈ": "H",
                        "Ĥ": "H",
                        "Ḣ": "H",
                        "Ḧ": "H",
                        "Ȟ": "H",
                        "Ḥ": "H",
                        "Ḩ": "H",
                        "Ḫ": "H",
                        "Ħ": "H",
                        "Ⱨ": "H",
                        "Ⱶ": "H",
                        "Ɥ": "H",
                        "Ⓘ": "I",
                        "Ｉ": "I",
                        "Ì": "I",
                        "Í": "I",
                        "Î": "I",
                        "Ĩ": "I",
                        "Ī": "I",
                        "Ĭ": "I",
                        "İ": "I",
                        "Ï": "I",
                        "Ḯ": "I",
                        "Ỉ": "I",
                        "Ǐ": "I",
                        "Ȉ": "I",
                        "Ȋ": "I",
                        "Ị": "I",
                        "Į": "I",
                        "Ḭ": "I",
                        "Ɨ": "I",
                        "Ⓙ": "J",
                        "Ｊ": "J",
                        "Ĵ": "J",
                        "Ɉ": "J",
                        "Ⓚ": "K",
                        "Ｋ": "K",
                        "Ḱ": "K",
                        "Ǩ": "K",
                        "Ḳ": "K",
                        "Ķ": "K",
                        "Ḵ": "K",
                        "Ƙ": "K",
                        "Ⱪ": "K",
                        "Ꝁ": "K",
                        "Ꝃ": "K",
                        "Ꝅ": "K",
                        "Ꞣ": "K",
                        "Ⓛ": "L",
                        "Ｌ": "L",
                        "Ŀ": "L",
                        "Ĺ": "L",
                        "Ľ": "L",
                        "Ḷ": "L",
                        "Ḹ": "L",
                        "Ļ": "L",
                        "Ḽ": "L",
                        "Ḻ": "L",
                        "Ł": "L",
                        "Ƚ": "L",
                        "Ɫ": "L",
                        "Ⱡ": "L",
                        "Ꝉ": "L",
                        "Ꝇ": "L",
                        "Ꞁ": "L",
                        "Ǉ": "LJ",
                        "ǈ": "Lj",
                        "Ⓜ": "M",
                        "Ｍ": "M",
                        "Ḿ": "M",
                        "Ṁ": "M",
                        "Ṃ": "M",
                        "Ɱ": "M",
                        "Ɯ": "M",
                        "Ⓝ": "N",
                        "Ｎ": "N",
                        "Ǹ": "N",
                        "Ń": "N",
                        "Ñ": "N",
                        "Ṅ": "N",
                        "Ň": "N",
                        "Ṇ": "N",
                        "Ņ": "N",
                        "Ṋ": "N",
                        "Ṉ": "N",
                        "Ƞ": "N",
                        "Ɲ": "N",
                        "Ꞑ": "N",
                        "Ꞥ": "N",
                        "Ǌ": "NJ",
                        "ǋ": "Nj",
                        "Ⓞ": "O",
                        "Ｏ": "O",
                        "Ò": "O",
                        "Ó": "O",
                        "Ô": "O",
                        "Ồ": "O",
                        "Ố": "O",
                        "Ỗ": "O",
                        "Ổ": "O",
                        "Õ": "O",
                        "Ṍ": "O",
                        "Ȭ": "O",
                        "Ṏ": "O",
                        "Ō": "O",
                        "Ṑ": "O",
                        "Ṓ": "O",
                        "Ŏ": "O",
                        "Ȯ": "O",
                        "Ȱ": "O",
                        "Ö": "O",
                        "Ȫ": "O",
                        "Ỏ": "O",
                        "Ő": "O",
                        "Ǒ": "O",
                        "Ȍ": "O",
                        "Ȏ": "O",
                        "Ơ": "O",
                        "Ờ": "O",
                        "Ớ": "O",
                        "Ỡ": "O",
                        "Ở": "O",
                        "Ợ": "O",
                        "Ọ": "O",
                        "Ộ": "O",
                        "Ǫ": "O",
                        "Ǭ": "O",
                        "Ø": "O",
                        "Ǿ": "O",
                        "Ɔ": "O",
                        "Ɵ": "O",
                        "Ꝋ": "O",
                        "Ꝍ": "O",
                        "Ƣ": "OI",
                        "Ꝏ": "OO",
                        "Ȣ": "OU",
                        "Ⓟ": "P",
                        "Ｐ": "P",
                        "Ṕ": "P",
                        "Ṗ": "P",
                        "Ƥ": "P",
                        "Ᵽ": "P",
                        "Ꝑ": "P",
                        "Ꝓ": "P",
                        "Ꝕ": "P",
                        "Ⓠ": "Q",
                        "Ｑ": "Q",
                        "Ꝗ": "Q",
                        "Ꝙ": "Q",
                        "Ɋ": "Q",
                        "Ⓡ": "R",
                        "Ｒ": "R",
                        "Ŕ": "R",
                        "Ṙ": "R",
                        "Ř": "R",
                        "Ȑ": "R",
                        "Ȓ": "R",
                        "Ṛ": "R",
                        "Ṝ": "R",
                        "Ŗ": "R",
                        "Ṟ": "R",
                        "Ɍ": "R",
                        "Ɽ": "R",
                        "Ꝛ": "R",
                        "Ꞧ": "R",
                        "Ꞃ": "R",
                        "Ⓢ": "S",
                        "Ｓ": "S",
                        "ẞ": "S",
                        "Ś": "S",
                        "Ṥ": "S",
                        "Ŝ": "S",
                        "Ṡ": "S",
                        "Š": "S",
                        "Ṧ": "S",
                        "Ṣ": "S",
                        "Ṩ": "S",
                        "Ș": "S",
                        "Ş": "S",
                        "Ȿ": "S",
                        "Ꞩ": "S",
                        "Ꞅ": "S",
                        "Ⓣ": "T",
                        "Ｔ": "T",
                        "Ṫ": "T",
                        "Ť": "T",
                        "Ṭ": "T",
                        "Ț": "T",
                        "Ţ": "T",
                        "Ṱ": "T",
                        "Ṯ": "T",
                        "Ŧ": "T",
                        "Ƭ": "T",
                        "Ʈ": "T",
                        "Ⱦ": "T",
                        "Ꞇ": "T",
                        "Ꜩ": "TZ",
                        "Ⓤ": "U",
                        "Ｕ": "U",
                        "Ù": "U",
                        "Ú": "U",
                        "Û": "U",
                        "Ũ": "U",
                        "Ṹ": "U",
                        "Ū": "U",
                        "Ṻ": "U",
                        "Ŭ": "U",
                        "Ü": "U",
                        "Ǜ": "U",
                        "Ǘ": "U",
                        "Ǖ": "U",
                        "Ǚ": "U",
                        "Ủ": "U",
                        "Ů": "U",
                        "Ű": "U",
                        "Ǔ": "U",
                        "Ȕ": "U",
                        "Ȗ": "U",
                        "Ư": "U",
                        "Ừ": "U",
                        "Ứ": "U",
                        "Ữ": "U",
                        "Ử": "U",
                        "Ự": "U",
                        "Ụ": "U",
                        "Ṳ": "U",
                        "Ų": "U",
                        "Ṷ": "U",
                        "Ṵ": "U",
                        "Ʉ": "U",
                        "Ⓥ": "V",
                        "Ｖ": "V",
                        "Ṽ": "V",
                        "Ṿ": "V",
                        "Ʋ": "V",
                        "Ꝟ": "V",
                        "Ʌ": "V",
                        "Ꝡ": "VY",
                        "Ⓦ": "W",
                        "Ｗ": "W",
                        "Ẁ": "W",
                        "Ẃ": "W",
                        "Ŵ": "W",
                        "Ẇ": "W",
                        "Ẅ": "W",
                        "Ẉ": "W",
                        "Ⱳ": "W",
                        "Ⓧ": "X",
                        "Ｘ": "X",
                        "Ẋ": "X",
                        "Ẍ": "X",
                        "Ⓨ": "Y",
                        "Ｙ": "Y",
                        "Ỳ": "Y",
                        "Ý": "Y",
                        "Ŷ": "Y",
                        "Ỹ": "Y",
                        "Ȳ": "Y",
                        "Ẏ": "Y",
                        "Ÿ": "Y",
                        "Ỷ": "Y",
                        "Ỵ": "Y",
                        "Ƴ": "Y",
                        "Ɏ": "Y",
                        "Ỿ": "Y",
                        "Ⓩ": "Z",
                        "Ｚ": "Z",
                        "Ź": "Z",
                        "Ẑ": "Z",
                        "Ż": "Z",
                        "Ž": "Z",
                        "Ẓ": "Z",
                        "Ẕ": "Z",
                        "Ƶ": "Z",
                        "Ȥ": "Z",
                        "Ɀ": "Z",
                        "Ⱬ": "Z",
                        "Ꝣ": "Z",
                        "ⓐ": "a",
                        "ａ": "a",
                        "ẚ": "a",
                        "à": "a",
                        "á": "a",
                        "â": "a",
                        "ầ": "a",
                        "ấ": "a",
                        "ẫ": "a",
                        "ẩ": "a",
                        "ã": "a",
                        "ā": "a",
                        "ă": "a",
                        "ằ": "a",
                        "ắ": "a",
                        "ẵ": "a",
                        "ẳ": "a",
                        "ȧ": "a",
                        "ǡ": "a",
                        "ä": "a",
                        "ǟ": "a",
                        "ả": "a",
                        "å": "a",
                        "ǻ": "a",
                        "ǎ": "a",
                        "ȁ": "a",
                        "ȃ": "a",
                        "ạ": "a",
                        "ậ": "a",
                        "ặ": "a",
                        "ḁ": "a",
                        "ą": "a",
                        "ⱥ": "a",
                        "ɐ": "a",
                        "ꜳ": "aa",
                        "æ": "ae",
                        "ǽ": "ae",
                        "ǣ": "ae",
                        "ꜵ": "ao",
                        "ꜷ": "au",
                        "ꜹ": "av",
                        "ꜻ": "av",
                        "ꜽ": "ay",
                        "ⓑ": "b",
                        "ｂ": "b",
                        "ḃ": "b",
                        "ḅ": "b",
                        "ḇ": "b",
                        "ƀ": "b",
                        "ƃ": "b",
                        "ɓ": "b",
                        "ⓒ": "c",
                        "ｃ": "c",
                        "ć": "c",
                        "ĉ": "c",
                        "ċ": "c",
                        "č": "c",
                        "ç": "c",
                        "ḉ": "c",
                        "ƈ": "c",
                        "ȼ": "c",
                        "ꜿ": "c",
                        "ↄ": "c",
                        "ⓓ": "d",
                        "ｄ": "d",
                        "ḋ": "d",
                        "ď": "d",
                        "ḍ": "d",
                        "ḑ": "d",
                        "ḓ": "d",
                        "ḏ": "d",
                        "đ": "d",
                        "ƌ": "d",
                        "ɖ": "d",
                        "ɗ": "d",
                        "ꝺ": "d",
                        "ǳ": "dz",
                        "ǆ": "dz",
                        "ⓔ": "e",
                        "ｅ": "e",
                        "è": "e",
                        "é": "e",
                        "ê": "e",
                        "ề": "e",
                        "ế": "e",
                        "ễ": "e",
                        "ể": "e",
                        "ẽ": "e",
                        "ē": "e",
                        "ḕ": "e",
                        "ḗ": "e",
                        "ĕ": "e",
                        "ė": "e",
                        "ë": "e",
                        "ẻ": "e",
                        "ě": "e",
                        "ȅ": "e",
                        "ȇ": "e",
                        "ẹ": "e",
                        "ệ": "e",
                        "ȩ": "e",
                        "ḝ": "e",
                        "ę": "e",
                        "ḙ": "e",
                        "ḛ": "e",
                        "ɇ": "e",
                        "ɛ": "e",
                        "ǝ": "e",
                        "ⓕ": "f",
                        "ｆ": "f",
                        "ḟ": "f",
                        "ƒ": "f",
                        "ꝼ": "f",
                        "ⓖ": "g",
                        "ｇ": "g",
                        "ǵ": "g",
                        "ĝ": "g",
                        "ḡ": "g",
                        "ğ": "g",
                        "ġ": "g",
                        "ǧ": "g",
                        "ģ": "g",
                        "ǥ": "g",
                        "ɠ": "g",
                        "ꞡ": "g",
                        "ᵹ": "g",
                        "ꝿ": "g",
                        "ⓗ": "h",
                        "ｈ": "h",
                        "ĥ": "h",
                        "ḣ": "h",
                        "ḧ": "h",
                        "ȟ": "h",
                        "ḥ": "h",
                        "ḩ": "h",
                        "ḫ": "h",
                        "ẖ": "h",
                        "ħ": "h",
                        "ⱨ": "h",
                        "ⱶ": "h",
                        "ɥ": "h",
                        "ƕ": "hv",
                        "ⓘ": "i",
                        "ｉ": "i",
                        "ì": "i",
                        "í": "i",
                        "î": "i",
                        "ĩ": "i",
                        "ī": "i",
                        "ĭ": "i",
                        "ï": "i",
                        "ḯ": "i",
                        "ỉ": "i",
                        "ǐ": "i",
                        "ȉ": "i",
                        "ȋ": "i",
                        "ị": "i",
                        "į": "i",
                        "ḭ": "i",
                        "ɨ": "i",
                        "ı": "i",
                        "ⓙ": "j",
                        "ｊ": "j",
                        "ĵ": "j",
                        "ǰ": "j",
                        "ɉ": "j",
                        "ⓚ": "k",
                        "ｋ": "k",
                        "ḱ": "k",
                        "ǩ": "k",
                        "ḳ": "k",
                        "ķ": "k",
                        "ḵ": "k",
                        "ƙ": "k",
                        "ⱪ": "k",
                        "ꝁ": "k",
                        "ꝃ": "k",
                        "ꝅ": "k",
                        "ꞣ": "k",
                        "ⓛ": "l",
                        "ｌ": "l",
                        "ŀ": "l",
                        "ĺ": "l",
                        "ľ": "l",
                        "ḷ": "l",
                        "ḹ": "l",
                        "ļ": "l",
                        "ḽ": "l",
                        "ḻ": "l",
                        "ſ": "l",
                        "ł": "l",
                        "ƚ": "l",
                        "ɫ": "l",
                        "ⱡ": "l",
                        "ꝉ": "l",
                        "ꞁ": "l",
                        "ꝇ": "l",
                        "ǉ": "lj",
                        "ⓜ": "m",
                        "ｍ": "m",
                        "ḿ": "m",
                        "ṁ": "m",
                        "ṃ": "m",
                        "ɱ": "m",
                        "ɯ": "m",
                        "ⓝ": "n",
                        "ｎ": "n",
                        "ǹ": "n",
                        "ń": "n",
                        "ñ": "n",
                        "ṅ": "n",
                        "ň": "n",
                        "ṇ": "n",
                        "ņ": "n",
                        "ṋ": "n",
                        "ṉ": "n",
                        "ƞ": "n",
                        "ɲ": "n",
                        "ŉ": "n",
                        "ꞑ": "n",
                        "ꞥ": "n",
                        "ǌ": "nj",
                        "ⓞ": "o",
                        "ｏ": "o",
                        "ò": "o",
                        "ó": "o",
                        "ô": "o",
                        "ồ": "o",
                        "ố": "o",
                        "ỗ": "o",
                        "ổ": "o",
                        "õ": "o",
                        "ṍ": "o",
                        "ȭ": "o",
                        "ṏ": "o",
                        "ō": "o",
                        "ṑ": "o",
                        "ṓ": "o",
                        "ŏ": "o",
                        "ȯ": "o",
                        "ȱ": "o",
                        "ö": "o",
                        "ȫ": "o",
                        "ỏ": "o",
                        "ő": "o",
                        "ǒ": "o",
                        "ȍ": "o",
                        "ȏ": "o",
                        "ơ": "o",
                        "ờ": "o",
                        "ớ": "o",
                        "ỡ": "o",
                        "ở": "o",
                        "ợ": "o",
                        "ọ": "o",
                        "ộ": "o",
                        "ǫ": "o",
                        "ǭ": "o",
                        "ø": "o",
                        "ǿ": "o",
                        "ɔ": "o",
                        "ꝋ": "o",
                        "ꝍ": "o",
                        "ɵ": "o",
                        "ƣ": "oi",
                        "ȣ": "ou",
                        "ꝏ": "oo",
                        "ⓟ": "p",
                        "ｐ": "p",
                        "ṕ": "p",
                        "ṗ": "p",
                        "ƥ": "p",
                        "ᵽ": "p",
                        "ꝑ": "p",
                        "ꝓ": "p",
                        "ꝕ": "p",
                        "ⓠ": "q",
                        "ｑ": "q",
                        "ɋ": "q",
                        "ꝗ": "q",
                        "ꝙ": "q",
                        "ⓡ": "r",
                        "ｒ": "r",
                        "ŕ": "r",
                        "ṙ": "r",
                        "ř": "r",
                        "ȑ": "r",
                        "ȓ": "r",
                        "ṛ": "r",
                        "ṝ": "r",
                        "ŗ": "r",
                        "ṟ": "r",
                        "ɍ": "r",
                        "ɽ": "r",
                        "ꝛ": "r",
                        "ꞧ": "r",
                        "ꞃ": "r",
                        "ⓢ": "s",
                        "ｓ": "s",
                        "ß": "s",
                        "ś": "s",
                        "ṥ": "s",
                        "ŝ": "s",
                        "ṡ": "s",
                        "š": "s",
                        "ṧ": "s",
                        "ṣ": "s",
                        "ṩ": "s",
                        "ș": "s",
                        "ş": "s",
                        "ȿ": "s",
                        "ꞩ": "s",
                        "ꞅ": "s",
                        "ẛ": "s",
                        "ⓣ": "t",
                        "ｔ": "t",
                        "ṫ": "t",
                        "ẗ": "t",
                        "ť": "t",
                        "ṭ": "t",
                        "ț": "t",
                        "ţ": "t",
                        "ṱ": "t",
                        "ṯ": "t",
                        "ŧ": "t",
                        "ƭ": "t",
                        "ʈ": "t",
                        "ⱦ": "t",
                        "ꞇ": "t",
                        "ꜩ": "tz",
                        "ⓤ": "u",
                        "ｕ": "u",
                        "ù": "u",
                        "ú": "u",
                        "û": "u",
                        "ũ": "u",
                        "ṹ": "u",
                        "ū": "u",
                        "ṻ": "u",
                        "ŭ": "u",
                        "ü": "u",
                        "ǜ": "u",
                        "ǘ": "u",
                        "ǖ": "u",
                        "ǚ": "u",
                        "ủ": "u",
                        "ů": "u",
                        "ű": "u",
                        "ǔ": "u",
                        "ȕ": "u",
                        "ȗ": "u",
                        "ư": "u",
                        "ừ": "u",
                        "ứ": "u",
                        "ữ": "u",
                        "ử": "u",
                        "ự": "u",
                        "ụ": "u",
                        "ṳ": "u",
                        "ų": "u",
                        "ṷ": "u",
                        "ṵ": "u",
                        "ʉ": "u",
                        "ⓥ": "v",
                        "ｖ": "v",
                        "ṽ": "v",
                        "ṿ": "v",
                        "ʋ": "v",
                        "ꝟ": "v",
                        "ʌ": "v",
                        "ꝡ": "vy",
                        "ⓦ": "w",
                        "ｗ": "w",
                        "ẁ": "w",
                        "ẃ": "w",
                        "ŵ": "w",
                        "ẇ": "w",
                        "ẅ": "w",
                        "ẘ": "w",
                        "ẉ": "w",
                        "ⱳ": "w",
                        "ⓧ": "x",
                        "ｘ": "x",
                        "ẋ": "x",
                        "ẍ": "x",
                        "ⓨ": "y",
                        "ｙ": "y",
                        "ỳ": "y",
                        "ý": "y",
                        "ŷ": "y",
                        "ỹ": "y",
                        "ȳ": "y",
                        "ẏ": "y",
                        "ÿ": "y",
                        "ỷ": "y",
                        "ẙ": "y",
                        "ỵ": "y",
                        "ƴ": "y",
                        "ɏ": "y",
                        "ỿ": "y",
                        "ⓩ": "z",
                        "ｚ": "z",
                        "ź": "z",
                        "ẑ": "z",
                        "ż": "z",
                        "ž": "z",
                        "ẓ": "z",
                        "ẕ": "z",
                        "ƶ": "z",
                        "ȥ": "z",
                        "ɀ": "z",
                        "ⱬ": "z",
                        "ꝣ": "z",
                        "Ά": "Α",
                        "Έ": "Ε",
                        "Ή": "Η",
                        "Ί": "Ι",
                        "Ϊ": "Ι",
                        "Ό": "Ο",
                        "Ύ": "Υ",
                        "Ϋ": "Υ",
                        "Ώ": "Ω",
                        "ά": "α",
                        "έ": "ε",
                        "ή": "η",
                        "ί": "ι",
                        "ϊ": "ι",
                        "ΐ": "ι",
                        "ό": "ο",
                        "ύ": "υ",
                        "ϋ": "υ",
                        "ΰ": "υ",
                        "ω": "ω",
                        "ς": "σ"
                    };
                    return a
                }), b.define("select2/data/base", ["../utils"], function (a) {
                    function b(a, c) {
                        b.__super__.constructor.call(this)
                    }

                    return a.Extend(b, a.Observable), b.prototype.current = function (a) {
                        throw new Error("The `current` method must be defined in child classes.")
                    }, b.prototype.query = function (a, b) {
                        throw new Error("The `query` method must be defined in child classes.")
                    }, b.prototype.bind = function (a, b) {
                    }, b.prototype.destroy = function () {
                    }, b.prototype.generateResultId = function (b, c) {
                        var d = b.id + "-result-";
                        return d += a.generateChars(4), d += null != c.id ? "-" + c.id.toString() : "-" + a.generateChars(4)
                    }, b
                }), b.define("select2/data/select", ["./base", "../utils", "jquery"], function (a, b, c) {
                    function d(a, b) {
                        this.$element = a, this.options = b, d.__super__.constructor.call(this)
                    }

                    return b.Extend(d, a), d.prototype.current = function (a) {
                        var b = [], d = this;
                        this.$element.find(":selected").each(function () {
                            var a = c(this), e = d.item(a);
                            b.push(e)
                        }), a(b)
                    }, d.prototype.select = function (a) {
                        var b = this;
                        if (a.selected = !0, c(a.element).is("option")) return a.element.selected = !0, void this.$element.trigger("change");
                        if (this.$element.prop("multiple")) this.current(function (d) {
                            var e = [];
                            a = [a], a.push.apply(a, d);
                            for (var f = 0; f < a.length; f++) {
                                var g = a[f].id;
                                -1 === c.inArray(g, e) && e.push(g)
                            }
                            b.$element.val(e), b.$element.trigger("change")
                        }); else {
                            var d = a.id;
                            this.$element.val(d), this.$element.trigger("change")
                        }
                    }, d.prototype.unselect = function (a) {
                        var b = this;
                        if (this.$element.prop("multiple")) return a.selected = !1, c(a.element).is("option") ? (a.element.selected = !1, void this.$element.trigger("change")) : void this.current(function (d) {
                            for (var e = [], f = 0; f < d.length; f++) {
                                var g = d[f].id;
                                g !== a.id && -1 === c.inArray(g, e) && e.push(g)
                            }
                            b.$element.val(e), b.$element.trigger("change")
                        })
                    }, d.prototype.bind = function (a, b) {
                        var c = this;
                        this.container = a, a.on("select", function (a) {
                            c.select(a.data)
                        }), a.on("unselect", function (a) {
                            c.unselect(a.data)
                        })
                    }, d.prototype.destroy = function () {
                        this.$element.find("*").each(function () {
                            c.removeData(this, "data")
                        })
                    }, d.prototype.query = function (a, b) {
                        var d = [], e = this, f = this.$element.children();
                        f.each(function () {
                            var b = c(this);
                            if (b.is("option") || b.is("optgroup")) {
                                var f = e.item(b), g = e.matches(a, f);
                                null !== g && d.push(g)
                            }
                        }), b({results: d})
                    }, d.prototype.addOptions = function (a) {
                        b.appendMany(this.$element, a)
                    }, d.prototype.option = function (a) {
                        var b;
                        a.children ? (b = document.createElement("optgroup"), b.label = a.text) : (b = document.createElement("option"), void 0 !== b.textContent ? b.textContent = a.text : b.innerText = a.text), a.id && (b.value = a.id), a.disabled && (b.disabled = !0), a.selected && (b.selected = !0), a.title && (b.title = a.title);
                        var d = c(b), e = this._normalizeItem(a);
                        return e.element = b, c.data(b, "data", e), d
                    }, d.prototype.item = function (a) {
                        var b = {};
                        if (b = c.data(a[0], "data"), null != b) return b;
                        if (a.is("option")) b = {
                            id: a.val(),
                            text: a.text(),
                            disabled: a.prop("disabled"),
                            selected: a.prop("selected"),
                            title: a.prop("title")
                        }; else if (a.is("optgroup")) {
                            b = {text: a.prop("label"), children: [], title: a.prop("title")};
                            for (var d = a.children("option"), e = [], f = 0; f < d.length; f++) {
                                var g = c(d[f]), h = this.item(g);
                                e.push(h)
                            }
                            b.children = e
                        }
                        return b = this._normalizeItem(b), b.element = a[0], c.data(a[0], "data", b), b
                    }, d.prototype._normalizeItem = function (a) {
                        c.isPlainObject(a) || (a = {id: a, text: a}), a = c.extend({}, {text: ""}, a);
                        var b = {selected: !1, disabled: !1};
                        return null != a.id && (a.id = a.id.toString()), null != a.text && (a.text = a.text.toString()), null == a._resultId && a.id && null != this.container && (a._resultId = this.generateResultId(this.container, a)), c.extend({}, b, a)
                    }, d.prototype.matches = function (a, b) {
                        var c = this.options.get("matcher");
                        return c(a, b)
                    }, d
                }), b.define("select2/data/array", ["./select", "../utils", "jquery"], function (a, b, c) {
                    function d(a, b) {
                        var c = b.get("data") || [];
                        d.__super__.constructor.call(this, a, b), this.addOptions(this.convertToOptions(c))
                    }

                    return b.Extend(d, a), d.prototype.select = function (a) {
                        var b = this.$element.find("option").filter(function (b, c) {
                            return c.value == a.id.toString()
                        });
                        0 === b.length && (b = this.option(a), this.addOptions(b)), d.__super__.select.call(this, a)
                    }, d.prototype.convertToOptions = function (a) {
                        function d(a) {
                            return function () {
                                return c(this).val() == a.id
                            }
                        }

                        for (var e = this, f = this.$element.find("option"), g = f.map(function () {
                            return e.item(c(this)).id
                        }).get(), h = [], i = 0; i < a.length; i++) {
                            var j = this._normalizeItem(a[i]);
                            if (c.inArray(j.id, g) >= 0) {
                                var k = f.filter(d(j)), l = this.item(k), m = c.extend(!0, {}, j, l),
                                    n = this.option(m);
                                k.replaceWith(n)
                            } else {
                                var o = this.option(j);
                                if (j.children) {
                                    var p = this.convertToOptions(j.children);
                                    b.appendMany(o, p)
                                }
                                h.push(o)
                            }
                        }
                        return h
                    }, d
                }), b.define("select2/data/ajax", ["./array", "../utils", "jquery"], function (a, b, c) {
                    function d(a, b) {
                        this.ajaxOptions = this._applyDefaults(b.get("ajax")), null != this.ajaxOptions.processResults && (this.processResults = this.ajaxOptions.processResults), d.__super__.constructor.call(this, a, b)
                    }

                    return b.Extend(d, a), d.prototype._applyDefaults = function (a) {
                        var b = {
                            data: function (a) {
                                return c.extend({}, a, {q: a.term})
                            }, transport: function (a, b, d) {
                                var e = c.ajax(a);
                                return e.then(b), e.fail(d), e
                            }
                        };
                        return c.extend({}, b, a, !0)
                    }, d.prototype.processResults = function (a) {
                        return a
                    }, d.prototype.query = function (a, b) {
                        function d() {
                            var d = f.transport(f, function (d) {
                                var f = e.processResults(d, a);
                                e.options.get("debug") && window.console && console.error && (f && f.results && c.isArray(f.results) || console.error("Select2: The AJAX results did not return an array in the `results` key of the response.")), b(f)
                            }, function () {
                                d.status && "0" === d.status || e.trigger("results:message", {message: "errorLoading"})
                            });
                            e._request = d
                        }

                        var e = this;
                        null != this._request && (c.isFunction(this._request.abort) && this._request.abort(), this._request = null);
                        var f = c.extend({type: "GET"}, this.ajaxOptions);
                        "function" == typeof f.url && (f.url = f.url.call(this.$element, a)), "function" == typeof f.data && (f.data = f.data.call(this.$element, a)), this.ajaxOptions.delay && null != a.term ? (this._queryTimeout && window.clearTimeout(this._queryTimeout), this._queryTimeout = window.setTimeout(d, this.ajaxOptions.delay)) : d()
                    }, d
                }), b.define("select2/data/tags", ["jquery"], function (a) {
                    function b(b, c, d) {
                        var e = d.get("tags"), f = d.get("createTag");
                        void 0 !== f && (this.createTag = f);
                        var g = d.get("insertTag");
                        if (void 0 !== g && (this.insertTag = g), b.call(this, c, d), a.isArray(e)) for (var h = 0; h < e.length; h++) {
                            var i = e[h], j = this._normalizeItem(i), k = this.option(j);
                            this.$element.append(k)
                        }
                    }

                    return b.prototype.query = function (a, b, c) {
                        function d(a, f) {
                            for (var g = a.results, h = 0; h < g.length; h++) {
                                var i = g[h], j = null != i.children && !d({results: i.children}, !0),
                                    k = i.text === b.term;
                                if (k || j) return f ? !1 : (a.data = g, void c(a))
                            }
                            if (f) return !0;
                            var l = e.createTag(b);
                            if (null != l) {
                                var m = e.option(l);
                                m.attr("data-select2-tag", !0), e.addOptions([m]), e.insertTag(g, l)
                            }
                            a.results = g, c(a)
                        }

                        var e = this;
                        return this._removeOldTags(), null == b.term || null != b.page ? void a.call(this, b, c) : void a.call(this, b, d)
                    }, b.prototype.createTag = function (b, c) {
                        var d = a.trim(c.term);
                        return "" === d ? null : {id: d, text: d}
                    }, b.prototype.insertTag = function (a, b, c) {
                        b.unshift(c)
                    }, b.prototype._removeOldTags = function (b) {
                        var c = (this._lastTag, this.$element.find("option[data-select2-tag]"));
                        c.each(function () {
                            this.selected || a(this).remove()
                        })
                    }, b
                }), b.define("select2/data/tokenizer", ["jquery"], function (a) {
                    function b(a, b, c) {
                        var d = c.get("tokenizer");
                        void 0 !== d && (this.tokenizer = d), a.call(this, b, c)
                    }

                    return b.prototype.bind = function (a, b, c) {
                        a.call(this, b, c), this.$search = b.dropdown.$search || b.selection.$search || c.find(".select2-search__field")
                    }, b.prototype.query = function (b, c, d) {
                        function e(b) {
                            var c = g._normalizeItem(b), d = g.$element.find("option").filter(function () {
                                return a(this).val() === c.id
                            });
                            if (!d.length) {
                                var e = g.option(c);
                                e.attr("data-select2-tag", !0), g._removeOldTags(), g.addOptions([e])
                            }
                            f(c)
                        }

                        function f(a) {
                            g.trigger("select", {data: a})
                        }

                        var g = this;
                        c.term = c.term || "";
                        var h = this.tokenizer(c, this.options, e);
                        h.term !== c.term && (this.$search.length && (this.$search.val(h.term), this.$search.focus()), c.term = h.term), b.call(this, c, d)
                    }, b.prototype.tokenizer = function (b, c, d, e) {
                        for (var f = d.get("tokenSeparators") || [], g = c.term, h = 0, i = this.createTag || function (a) {
                            return {id: a.term, text: a.term}
                        }; h < g.length;) {
                            var j = g[h];
                            if (-1 !== a.inArray(j, f)) {
                                var k = g.substr(0, h), l = a.extend({}, c, {term: k}), m = i(l);
                                null != m ? (e(m), g = g.substr(h + 1) || "", h = 0) : h++
                            } else h++
                        }
                        return {term: g}
                    }, b
                }), b.define("select2/data/minimumInputLength", [], function () {
                    function a(a, b, c) {
                        this.minimumInputLength = c.get("minimumInputLength"), a.call(this, b, c)
                    }

                    return a.prototype.query = function (a, b, c) {
                        return b.term = b.term || "", b.term.length < this.minimumInputLength ? void this.trigger("results:message", {
                            message: "inputTooShort",
                            args: {minimum: this.minimumInputLength, input: b.term, params: b}
                        }) : void a.call(this, b, c)
                    }, a
                }), b.define("select2/data/maximumInputLength", [], function () {
                    function a(a, b, c) {
                        this.maximumInputLength = c.get("maximumInputLength"), a.call(this, b, c)
                    }

                    return a.prototype.query = function (a, b, c) {
                        return b.term = b.term || "", this.maximumInputLength > 0 && b.term.length > this.maximumInputLength ? void this.trigger("results:message", {
                            message: "inputTooLong",
                            args: {maximum: this.maximumInputLength, input: b.term, params: b}
                        }) : void a.call(this, b, c)
                    }, a
                }), b.define("select2/data/maximumSelectionLength", [], function () {
                    function a(a, b, c) {
                        this.maximumSelectionLength = c.get("maximumSelectionLength"), a.call(this, b, c)
                    }

                    return a.prototype.query = function (a, b, c) {
                        var d = this;
                        this.current(function (e) {
                            var f = null != e ? e.length : 0;
                            return d.maximumSelectionLength > 0 && f >= d.maximumSelectionLength ? void d.trigger("results:message", {
                                message: "maximumSelected",
                                args: {maximum: d.maximumSelectionLength}
                            }) : void a.call(d, b, c)
                        })
                    }, a
                }), b.define("select2/dropdown", ["jquery", "./utils"], function (a, b) {
                    function c(a, b) {
                        this.$element = a, this.options = b, c.__super__.constructor.call(this)
                    }

                    return b.Extend(c, b.Observable), c.prototype.render = function () {
                        var b = a('<span class="select2-dropdown"><span class="select2-results"></span></span>');
                        return b.attr("dir", this.options.get("dir")), this.$dropdown = b, b
                    }, c.prototype.bind = function () {
                    }, c.prototype.position = function (a, b) {
                    }, c.prototype.destroy = function () {
                        this.$dropdown.remove()
                    }, c
                }), b.define("select2/dropdown/search", ["jquery", "../utils"], function (a, b) {
                    function c() {
                    }

                    return c.prototype.render = function (b) {
                        var c = b.call(this),
                            d = a('<span class="select2-search select2-search--dropdown"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" /></span>');
                        return this.$searchContainer = d, this.$search = d.find("input"), c.prepend(d), c
                    }, c.prototype.bind = function (b, c, d) {
                        var e = this;
                        b.call(this, c, d), this.$search.on("keydown", function (a) {
                            e.trigger("keypress", a), e._keyUpPrevented = a.isDefaultPrevented()
                        }), this.$search.on("input", function (b) {
                            a(this).off("keyup")
                        }), this.$search.on("keyup input", function (a) {
                            e.handleSearch(a)
                        }), c.on("open", function () {
                            e.$search.attr("tabindex", 0), e.$search.focus(), window.setTimeout(function () {
                                e.$search.focus()
                            }, 0)
                        }), c.on("close", function () {
                            e.$search.attr("tabindex", -1), e.$search.val("")
                        }), c.on("focus", function () {
                            c.isOpen() && e.$search.focus()
                        }), c.on("results:all", function (a) {
                            if (null == a.query.term || "" === a.query.term) {
                                var b = e.showSearch(a);
                                b ? e.$searchContainer.removeClass("select2-search--hide") : e.$searchContainer.addClass("select2-search--hide")
                            }
                        })
                    }, c.prototype.handleSearch = function (a) {
                        if (!this._keyUpPrevented) {
                            var b = this.$search.val();
                            this.trigger("query", {term: b})
                        }
                        this._keyUpPrevented = !1
                    }, c.prototype.showSearch = function (a, b) {
                        return !0
                    }, c
                }), b.define("select2/dropdown/hidePlaceholder", [], function () {
                    function a(a, b, c, d) {
                        this.placeholder = this.normalizePlaceholder(c.get("placeholder")), a.call(this, b, c, d)
                    }

                    return a.prototype.append = function (a, b) {
                        b.results = this.removePlaceholder(b.results), a.call(this, b)
                    }, a.prototype.normalizePlaceholder = function (a, b) {
                        return "string" == typeof b && (b = {id: "", text: b}), b
                    }, a.prototype.removePlaceholder = function (a, b) {
                        for (var c = b.slice(0), d = b.length - 1; d >= 0; d--) {
                            var e = b[d];
                            this.placeholder.id === e.id && c.splice(d, 1)
                        }
                        return c
                    }, a
                }), b.define("select2/dropdown/infiniteScroll", ["jquery"], function (a) {
                    function b(a, b, c, d) {
                        this.lastParams = {}, a.call(this, b, c, d), this.$loadingMore = this.createLoadingMore(), this.loading = !1
                    }

                    return b.prototype.append = function (a, b) {
                        this.$loadingMore.remove(), this.loading = !1, a.call(this, b), this.showLoadingMore(b) && this.$results.append(this.$loadingMore)
                    }, b.prototype.bind = function (b, c, d) {
                        var e = this;
                        b.call(this, c, d), c.on("query", function (a) {
                            e.lastParams = a, e.loading = !0
                        }), c.on("query:append", function (a) {
                            e.lastParams = a, e.loading = !0
                        }), this.$results.on("scroll", function () {
                            var b = a.contains(document.documentElement, e.$loadingMore[0]);
                            if (!e.loading && b) {
                                var c = e.$results.offset().top + e.$results.outerHeight(!1),
                                    d = e.$loadingMore.offset().top + e.$loadingMore.outerHeight(!1);
                                c + 50 >= d && e.loadMore()
                            }
                        })
                    }, b.prototype.loadMore = function () {
                        this.loading = !0;
                        var b = a.extend({}, {page: 1}, this.lastParams);
                        b.page++, this.trigger("query:append", b)
                    }, b.prototype.showLoadingMore = function (a, b) {
                        return b.pagination && b.pagination.more
                    }, b.prototype.createLoadingMore = function () {
                        var b = a('<li class="select2-results__option select2-results__option--load-more"role="treeitem" aria-disabled="true"></li>'),
                            c = this.options.get("translations").get("loadingMore");
                        return b.html(c(this.lastParams)), b
                    }, b
                }), b.define("select2/dropdown/attachBody", ["jquery", "../utils"], function (a, b) {
                    function c(b, c, d) {
                        this.$dropdownParent = d.get("dropdownParent") || a(document.body), b.call(this, c, d)
                    }

                    return c.prototype.bind = function (a, b, c) {
                        var d = this, e = !1;
                        a.call(this, b, c), b.on("open", function () {
                            d._showDropdown(), d._attachPositioningHandler(b), e || (e = !0, b.on("results:all", function () {
                                d._positionDropdown(), d._resizeDropdown()
                            }), b.on("results:append", function () {
                                d._positionDropdown(), d._resizeDropdown()
                            }))
                        }), b.on("close", function () {
                            d._hideDropdown(), d._detachPositioningHandler(b)
                        }), this.$dropdownContainer.on("mousedown", function (a) {
                            a.stopPropagation()
                        })
                    }, c.prototype.destroy = function (a) {
                        a.call(this), this.$dropdownContainer.remove()
                    }, c.prototype.position = function (a, b, c) {
                        b.attr("class", c.attr("class")), b.removeClass("select2"), b.addClass("select2-container--open"), b.css({
                            position: "absolute",
                            top: -999999
                        }), this.$container = c
                    }, c.prototype.render = function (b) {
                        var c = a("<span></span>"), d = b.call(this);
                        return c.append(d), this.$dropdownContainer = c, c
                    }, c.prototype._hideDropdown = function (a) {
                        this.$dropdownContainer.detach()
                    }, c.prototype._attachPositioningHandler = function (c, d) {
                        var e = this, f = "scroll.select2." + d.id, g = "resize.select2." + d.id,
                            h = "orientationchange.select2." + d.id, i = this.$container.parents().filter(b.hasScroll);
                        i.each(function () {
                            a(this).data("select2-scroll-position", {x: a(this).scrollLeft(), y: a(this).scrollTop()})
                        }), i.on(f, function (b) {
                            var c = a(this).data("select2-scroll-position");
                            a(this).scrollTop(c.y)
                        }), a(window).on(f + " " + g + " " + h, function (a) {
                            e._positionDropdown(), e._resizeDropdown()
                        })
                    }, c.prototype._detachPositioningHandler = function (c, d) {
                        var e = "scroll.select2." + d.id, f = "resize.select2." + d.id,
                            g = "orientationchange.select2." + d.id, h = this.$container.parents().filter(b.hasScroll);
                        h.off(e), a(window).off(e + " " + f + " " + g)
                    }, c.prototype._positionDropdown = function () {
                        var b = a(window), c = this.$dropdown.hasClass("select2-dropdown--above"),
                            d = this.$dropdown.hasClass("select2-dropdown--below"), e = null,
                            f = this.$container.offset();
                        f.bottom = f.top + this.$container.outerHeight(!1);
                        var g = {height: this.$container.outerHeight(!1)};
                        g.top = f.top, g.bottom = f.top + g.height;
                        var h = {height: this.$dropdown.outerHeight(!1)},
                            i = {top: b.scrollTop(), bottom: b.scrollTop() + b.height()}, j = i.top < f.top - h.height,
                            k = i.bottom > f.bottom + h.height, l = {left: f.left, top: g.bottom},
                            m = this.$dropdownParent;
                        "static" === m.css("position") && (m = m.offsetParent());
                        var n = m.offset();
                        l.top -= n.top, l.left -= n.left, c || d || (e = "below"), k || !j || c ? !j && k && c && (e = "below") : e = "above", ("above" == e || c && "below" !== e) && (l.top = g.top - n.top - h.height), null != e && (this.$dropdown.removeClass("select2-dropdown--below select2-dropdown--above").addClass("select2-dropdown--" + e), this.$container.removeClass("select2-container--below select2-container--above").addClass("select2-container--" + e)), this.$dropdownContainer.css(l)
                    }, c.prototype._resizeDropdown = function () {
                        var a = {width: this.$container.outerWidth(!1) + "px"};
                        this.options.get("dropdownAutoWidth") && (a.minWidth = a.width, a.position = "relative", a.width = "auto"), this.$dropdown.css(a)
                    }, c.prototype._showDropdown = function (a) {
                        this.$dropdownContainer.appendTo(this.$dropdownParent), this._positionDropdown(), this._resizeDropdown()
                    }, c
                }), b.define("select2/dropdown/minimumResultsForSearch", [], function () {
                    function a(b) {
                        for (var c = 0, d = 0; d < b.length; d++) {
                            var e = b[d];
                            e.children ? c += a(e.children) : c++
                        }
                        return c
                    }

                    function b(a, b, c, d) {
                        this.minimumResultsForSearch = c.get("minimumResultsForSearch"), this.minimumResultsForSearch < 0 && (this.minimumResultsForSearch = 1 / 0), a.call(this, b, c, d)
                    }

                    return b.prototype.showSearch = function (b, c) {
                        return a(c.data.results) < this.minimumResultsForSearch ? !1 : b.call(this, c)
                    }, b
                }), b.define("select2/dropdown/selectOnClose", [], function () {
                    function a() {
                    }

                    return a.prototype.bind = function (a, b, c) {
                        var d = this;
                        a.call(this, b, c), b.on("close", function (a) {
                            d._handleSelectOnClose(a)
                        })
                    }, a.prototype._handleSelectOnClose = function (a, b) {
                        if (b && null != b.originalSelect2Event) {
                            var c = b.originalSelect2Event;
                            if ("select" === c._type || "unselect" === c._type) return
                        }
                        var d = this.getHighlightedResults();
                        if (!(d.length < 1)) {
                            var e = d.data("data");
                            null != e.element && e.element.selected || null == e.element && e.selected || this.trigger("select", {data: e})
                        }
                    }, a
                }), b.define("select2/dropdown/closeOnSelect", [], function () {
                    function a() {
                    }

                    return a.prototype.bind = function (a, b, c) {
                        var d = this;
                        a.call(this, b, c), b.on("select", function (a) {
                            d._selectTriggered(a)
                        }), b.on("unselect", function (a) {
                            d._selectTriggered(a)
                        })
                    }, a.prototype._selectTriggered = function (a, b) {
                        var c = b.originalEvent;
                        c && c.ctrlKey || this.trigger("close", {originalEvent: c, originalSelect2Event: b})
                    }, a
                }), b.define("select2/i18n/en", [], function () {
                    return {
                        errorLoading: function () {
                            return "The results could not be loaded."
                        }, inputTooLong: function (a) {
                            var b = a.input.length - a.maximum, c = "Please delete " + b + " character";
                            return 1 != b && (c += "s"), c
                        }, inputTooShort: function (a) {
                            var b = a.minimum - a.input.length, c = "Please enter " + b + " or more characters";
                            return c
                        }, loadingMore: function () {
                            return "Loading more results…"
                        }, maximumSelected: function (a) {
                            var b = "You can only select " + a.maximum + " item";
                            return 1 != a.maximum && (b += "s"), b
                        }, noResults: function () {
                            return "No results found"
                        }, searching: function () {
                            return "Searching…"
                        }
                    }
                }), b.define("select2/defaults", ["jquery", "require", "./results", "./selection/single", "./selection/multiple", "./selection/placeholder", "./selection/allowClear", "./selection/search", "./selection/eventRelay", "./utils", "./translation", "./diacritics", "./data/select", "./data/array", "./data/ajax", "./data/tags", "./data/tokenizer", "./data/minimumInputLength", "./data/maximumInputLength", "./data/maximumSelectionLength", "./dropdown", "./dropdown/search", "./dropdown/hidePlaceholder", "./dropdown/infiniteScroll", "./dropdown/attachBody", "./dropdown/minimumResultsForSearch", "./dropdown/selectOnClose", "./dropdown/closeOnSelect", "./i18n/en"], function (a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C) {
                    function D() {
                        this.reset()
                    }

                    D.prototype.apply = function (l) {
                        if (l = a.extend(!0, {}, this.defaults, l), null == l.dataAdapter) {
                            if (null != l.ajax ? l.dataAdapter = o : null != l.data ? l.dataAdapter = n : l.dataAdapter = m, l.minimumInputLength > 0 && (l.dataAdapter = j.Decorate(l.dataAdapter, r)), l.maximumInputLength > 0 && (l.dataAdapter = j.Decorate(l.dataAdapter, s)), l.maximumSelectionLength > 0 && (l.dataAdapter = j.Decorate(l.dataAdapter, t)), l.tags && (l.dataAdapter = j.Decorate(l.dataAdapter, p)), (null != l.tokenSeparators || null != l.tokenizer) && (l.dataAdapter = j.Decorate(l.dataAdapter, q)), null != l.query) {
                                var C = b(l.amdBase + "compat/query");
                                l.dataAdapter = j.Decorate(l.dataAdapter, C)
                            }
                            if (null != l.initSelection) {
                                var D = b(l.amdBase + "compat/initSelection");
                                l.dataAdapter = j.Decorate(l.dataAdapter, D)
                            }
                        }
                        if (null == l.resultsAdapter && (l.resultsAdapter = c, null != l.ajax && (l.resultsAdapter = j.Decorate(l.resultsAdapter, x)), null != l.placeholder && (l.resultsAdapter = j.Decorate(l.resultsAdapter, w)), l.selectOnClose && (l.resultsAdapter = j.Decorate(l.resultsAdapter, A))), null == l.dropdownAdapter) {
                            if (l.multiple) l.dropdownAdapter = u; else {
                                var E = j.Decorate(u, v);
                                l.dropdownAdapter = E
                            }
                            if (0 !== l.minimumResultsForSearch && (l.dropdownAdapter = j.Decorate(l.dropdownAdapter, z)), l.closeOnSelect && (l.dropdownAdapter = j.Decorate(l.dropdownAdapter, B)), null != l.dropdownCssClass || null != l.dropdownCss || null != l.adaptDropdownCssClass) {
                                var F = b(l.amdBase + "compat/dropdownCss");
                                l.dropdownAdapter = j.Decorate(l.dropdownAdapter, F)
                            }
                            l.dropdownAdapter = j.Decorate(l.dropdownAdapter, y)
                        }
                        if (null == l.selectionAdapter) {
                            if (l.multiple ? l.selectionAdapter = e : l.selectionAdapter = d, null != l.placeholder && (l.selectionAdapter = j.Decorate(l.selectionAdapter, f)), l.allowClear && (l.selectionAdapter = j.Decorate(l.selectionAdapter, g)), l.multiple && (l.selectionAdapter = j.Decorate(l.selectionAdapter, h)), null != l.containerCssClass || null != l.containerCss || null != l.adaptContainerCssClass) {
                                var G = b(l.amdBase + "compat/containerCss");
                                l.selectionAdapter = j.Decorate(l.selectionAdapter, G)
                            }
                            l.selectionAdapter = j.Decorate(l.selectionAdapter, i)
                        }
                        if ("string" == typeof l.language) if (l.language.indexOf("-") > 0) {
                            var H = l.language.split("-"), I = H[0];
                            l.language = [l.language, I]
                        } else l.language = [l.language];
                        if (a.isArray(l.language)) {
                            var J = new k;
                            l.language.push("en");
                            for (var K = l.language, L = 0; L < K.length; L++) {
                                var M = K[L], N = {};
                                try {
                                    N = k.loadPath(M)
                                } catch (O) {
                                    try {
                                        M = this.defaults.amdLanguageBase + M, N = k.loadPath(M)
                                    } catch (P) {
                                        l.debug && window.console && console.warn && console.warn('Select2: The language file for "' + M + '" could not be automatically loaded. A fallback will be used instead.');
                                        continue
                                    }
                                }
                                J.extend(N)
                            }
                            l.translations = J
                        } else {
                            var Q = k.loadPath(this.defaults.amdLanguageBase + "en"), R = new k(l.language);
                            R.extend(Q), l.translations = R
                        }
                        return l
                    }, D.prototype.reset = function () {
                        function b(a) {
                            function b(a) {
                                return l[a] || a
                            }

                            return a.replace(/[^\u0000-\u007E]/g, b)
                        }

                        function c(d, e) {
                            if ("" === a.trim(d.term)) return e;
                            if (e.children && e.children.length > 0) {
                                for (var f = a.extend(!0, {}, e), g = e.children.length - 1; g >= 0; g--) {
                                    var h = e.children[g], i = c(d, h);
                                    null == i && f.children.splice(g, 1)
                                }
                                return f.children.length > 0 ? f : c(d, f)
                            }
                            var j = b(e.text).toUpperCase(), k = b(d.term).toUpperCase();
                            return j.indexOf(k) > -1 ? e : null
                        }

                        this.defaults = {
                            amdBase: "./",
                            amdLanguageBase: "./i18n/",
                            closeOnSelect: !0,
                            debug: !1,
                            dropdownAutoWidth: !1,
                            escapeMarkup: j.escapeMarkup,
                            language: C,
                            matcher: c,
                            minimumInputLength: 0,
                            maximumInputLength: 0,
                            maximumSelectionLength: 0,
                            minimumResultsForSearch: 0,
                            selectOnClose: !1,
                            sorter: function (a) {
                                return a
                            },
                            templateResult: function (a) {
                                return a.text
                            },
                            templateSelection: function (a) {
                                return a.text
                            },
                            theme: "default",
                            width: "resolve"
                        }
                    }, D.prototype.set = function (b, c) {
                        var d = a.camelCase(b), e = {};
                        e[d] = c;
                        var f = j._convertData(e);
                        a.extend(this.defaults, f)
                    };
                    var E = new D;
                    return E
                }), b.define("select2/options", ["require", "jquery", "./defaults", "./utils"], function (a, b, c, d) {
                    function e(b, e) {
                        if (this.options = b, null != e && this.fromElement(e), this.options = c.apply(this.options), e && e.is("input")) {
                            var f = a(this.get("amdBase") + "compat/inputData");
                            this.options.dataAdapter = d.Decorate(this.options.dataAdapter, f)
                        }
                    }

                    return e.prototype.fromElement = function (a) {
                        var c = ["select2"];
                        null == this.options.multiple && (this.options.multiple = a.prop("multiple")), null == this.options.disabled && (this.options.disabled = a.prop("disabled")), null == this.options.language && (a.prop("lang") ? this.options.language = a.prop("lang").toLowerCase() : a.closest("[lang]").prop("lang") && (this.options.language = a.closest("[lang]").prop("lang"))), null == this.options.dir && (a.prop("dir") ? this.options.dir = a.prop("dir") : a.closest("[dir]").prop("dir") ? this.options.dir = a.closest("[dir]").prop("dir") : this.options.dir = "ltr"), a.prop("disabled", this.options.disabled), a.prop("multiple", this.options.multiple), a.data("select2Tags") && (this.options.debug && window.console && console.warn && console.warn('Select2: The `data-select2-tags` attribute has been changed to use the `data-data` and `data-tags="true"` attributes and will be removed in future versions of Select2.'), a.data("data", a.data("select2Tags")), a.data("tags", !0)), a.data("ajaxUrl") && (this.options.debug && window.console && console.warn && console.warn("Select2: The `data-ajax-url` attribute has been changed to `data-ajax--url` and support for the old attribute will be removed in future versions of Select2."), a.attr("ajax--url", a.data("ajaxUrl")), a.data("ajax--url", a.data("ajaxUrl")));
                        var e = {};
                        e = b.fn.jquery && "1." == b.fn.jquery.substr(0, 2) && a[0].dataset ? b.extend(!0, {}, a[0].dataset, a.data()) : a.data();
                        var f = b.extend(!0, {}, e);
                        f = d._convertData(f);
                        for (var g in f) b.inArray(g, c) > -1 || (b.isPlainObject(this.options[g]) ? b.extend(this.options[g], f[g]) : this.options[g] = f[g]);
                        return this
                    }, e.prototype.get = function (a) {
                        return this.options[a]
                    }, e.prototype.set = function (a, b) {
                        this.options[a] = b
                    }, e
                }), b.define("select2/core", ["jquery", "./options", "./utils", "./keys"], function (a, b, c, d) {
                    var e = function (a, c) {
                        null != a.data("select2") && a.data("select2").destroy(), this.$element = a, this.id = this._generateId(a), c = c || {}, this.options = new b(c, a), e.__super__.constructor.call(this);
                        var d = a.attr("tabindex") || 0;
                        a.data("old-tabindex", d), a.attr("tabindex", "-1");
                        var f = this.options.get("dataAdapter");
                        this.dataAdapter = new f(a, this.options);
                        var g = this.render();
                        this._placeContainer(g);
                        var h = this.options.get("selectionAdapter");
                        this.selection = new h(a, this.options), this.$selection = this.selection.render(), this.selection.position(this.$selection, g);
                        var i = this.options.get("dropdownAdapter");
                        this.dropdown = new i(a, this.options), this.$dropdown = this.dropdown.render(), this.dropdown.position(this.$dropdown, g);
                        var j = this.options.get("resultsAdapter");
                        this.results = new j(a, this.options, this.dataAdapter), this.$results = this.results.render(), this.results.position(this.$results, this.$dropdown);
                        var k = this;
                        this._bindAdapters(), this._registerDomEvents(), this._registerDataEvents(), this._registerSelectionEvents(), this._registerDropdownEvents(), this._registerResultsEvents(), this._registerEvents(), this.dataAdapter.current(function (a) {
                            k.trigger("selection:update", {data: a})
                        }), a.addClass("select2-hidden-accessible"), a.attr("aria-hidden", "true"), this._syncAttributes(), a.data("select2", this)
                    };
                    return c.Extend(e, c.Observable), e.prototype._generateId = function (a) {
                        var b = "";
                        return b = null != a.attr("id") ? a.attr("id") : null != a.attr("name") ? a.attr("name") + "-" + c.generateChars(2) : c.generateChars(4), b = b.replace(/(:|\.|\[|\]|,)/g, ""), b = "select2-" + b
                    }, e.prototype._placeContainer = function (a) {
                        a.insertAfter(this.$element);
                        var b = this._resolveWidth(this.$element, this.options.get("width"));
                        null != b && a.css("width", b)
                    }, e.prototype._resolveWidth = function (a, b) {
                        var c = /^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;
                        if ("resolve" == b) {
                            var d = this._resolveWidth(a, "style");
                            return null != d ? d : this._resolveWidth(a, "element")
                        }
                        if ("element" == b) {
                            var e = a.outerWidth(!1);
                            return 0 >= e ? "auto" : e + "px"
                        }
                        if ("style" == b) {
                            var f = a.attr("style");
                            if ("string" != typeof f) return null;
                            for (var g = f.split(";"), h = 0, i = g.length; i > h; h += 1) {
                                var j = g[h].replace(/\s/g, ""), k = j.match(c);
                                if (null !== k && k.length >= 1) return k[1]
                            }
                            return null
                        }
                        return b
                    }, e.prototype._bindAdapters = function () {
                        this.dataAdapter.bind(this, this.$container), this.selection.bind(this, this.$container), this.dropdown.bind(this, this.$container), this.results.bind(this, this.$container)
                    }, e.prototype._registerDomEvents = function () {
                        var b = this;
                        this.$element.on("change.select2", function () {
                            b.dataAdapter.current(function (a) {
                                b.trigger("selection:update", {data: a})
                            })
                        }), this.$element.on("focus.select2", function (a) {
                            b.trigger("focus", a)
                        }), this._syncA = c.bind(this._syncAttributes, this), this._syncS = c.bind(this._syncSubtree, this), this.$element[0].attachEvent && this.$element[0].attachEvent("onpropertychange", this._syncA);
                        var d = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
                        null != d ? (this._observer = new d(function (c) {
                            a.each(c, b._syncA), a.each(c, b._syncS)
                        }), this._observer.observe(this.$element[0], {
                            attributes: !0,
                            childList: !0,
                            subtree: !1
                        })) : this.$element[0].addEventListener && (this.$element[0].addEventListener("DOMAttrModified", b._syncA, !1), this.$element[0].addEventListener("DOMNodeInserted", b._syncS, !1), this.$element[0].addEventListener("DOMNodeRemoved", b._syncS, !1))
                    }, e.prototype._registerDataEvents = function () {
                        var a = this;
                        this.dataAdapter.on("*", function (b, c) {
                            a.trigger(b, c)
                        })
                    }, e.prototype._registerSelectionEvents = function () {
                        var b = this, c = ["toggle", "focus"];
                        this.selection.on("toggle", function () {
                            b.toggleDropdown()
                        }), this.selection.on("focus", function (a) {
                            b.focus(a)
                        }), this.selection.on("*", function (d, e) {
                            -1 === a.inArray(d, c) && b.trigger(d, e)
                        })
                    }, e.prototype._registerDropdownEvents = function () {
                        var a = this;
                        this.dropdown.on("*", function (b, c) {
                            a.trigger(b, c)
                        })
                    }, e.prototype._registerResultsEvents = function () {
                        var a = this;
                        this.results.on("*", function (b, c) {
                            a.trigger(b, c)
                        })
                    }, e.prototype._registerEvents = function () {
                        var a = this;
                        this.on("open", function () {
                            a.$container.addClass("select2-container--open")
                        }), this.on("close", function () {
                            a.$container.removeClass("select2-container--open")
                        }), this.on("enable", function () {
                            a.$container.removeClass("select2-container--disabled")
                        }), this.on("disable", function () {
                            a.$container.addClass("select2-container--disabled")
                        }), this.on("blur", function () {
                            a.$container.removeClass("select2-container--focus")
                        }), this.on("query", function (b) {
                            a.isOpen() || a.trigger("open", {}), this.dataAdapter.query(b, function (c) {
                                a.trigger("results:all", {data: c, query: b})
                            })
                        }), this.on("query:append", function (b) {
                            this.dataAdapter.query(b, function (c) {
                                a.trigger("results:append", {data: c, query: b})
                            })
                        }), this.on("keypress", function (b) {
                            var c = b.which;
                            a.isOpen() ? c === d.ESC || c === d.TAB || c === d.UP && b.altKey ? (a.close(), b.preventDefault()) : c === d.ENTER ? (a.trigger("results:select", {}), b.preventDefault()) : c === d.SPACE && b.ctrlKey ? (a.trigger("results:toggle", {}), b.preventDefault()) : c === d.UP ? (a.trigger("results:previous", {}), b.preventDefault()) : c === d.DOWN && (a.trigger("results:next", {}), b.preventDefault()) : (c === d.ENTER || c === d.SPACE || c === d.DOWN && b.altKey) && (a.open(), b.preventDefault())
                        })
                    }, e.prototype._syncAttributes = function () {
                        this.options.set("disabled", this.$element.prop("disabled")), this.options.get("disabled") ? (this.isOpen() && this.close(), this.trigger("disable", {})) : this.trigger("enable", {})
                    }, e.prototype._syncSubtree = function (a, b) {
                        var c = !1, d = this;
                        if (!a || !a.target || "OPTION" === a.target.nodeName || "OPTGROUP" === a.target.nodeName) {
                            if (b) if (b.addedNodes && b.addedNodes.length > 0) for (var e = 0; e < b.addedNodes.length; e++) {
                                var f = b.addedNodes[e];
                                f.selected && (c = !0)
                            } else b.removedNodes && b.removedNodes.length > 0 && (c = !0); else c = !0;
                            c && this.dataAdapter.current(function (a) {
                                d.trigger("selection:update", {data: a})
                            })
                        }
                    }, e.prototype.trigger = function (a, b) {
                        var c = e.__super__.trigger,
                            d = {open: "opening", close: "closing", select: "selecting", unselect: "unselecting"};
                        if (void 0 === b && (b = {}), a in d) {
                            var f = d[a], g = {prevented: !1, name: a, args: b};
                            if (c.call(this, f, g), g.prevented) return void(b.prevented = !0)
                        }
                        c.call(this, a, b)
                    }, e.prototype.toggleDropdown = function () {
                        this.options.get("disabled") || (this.isOpen() ? this.close() : this.open())
                    }, e.prototype.open = function () {
                        this.isOpen() || this.trigger("query", {})
                    }, e.prototype.close = function () {
                        this.isOpen() && this.trigger("close", {})
                    }, e.prototype.isOpen = function () {
                        return this.$container.hasClass("select2-container--open")
                    }, e.prototype.hasFocus = function () {
                        return this.$container.hasClass("select2-container--focus")
                    }, e.prototype.focus = function (a) {
                        this.hasFocus() || (this.$container.addClass("select2-container--focus"), this.trigger("focus", {}))
                    }, e.prototype.enable = function (a) {
                        this.options.get("debug") && window.console && console.warn && console.warn('Select2: The `select2("enable")` method has been deprecated and will be removed in later Select2 versions. Use $element.prop("disabled") instead.'), (null == a || 0 === a.length) && (a = [!0]);
                        var b = !a[0];
                        this.$element.prop("disabled", b)
                    }, e.prototype.data = function () {
                        this.options.get("debug") && arguments.length > 0 && window.console && console.warn && console.warn('Select2: Data can no longer be set using `select2("data")`. You should consider setting the value instead using `$element.val()`.');
                        var a = [];
                        return this.dataAdapter.current(function (b) {
                            a = b
                        }), a
                    }, e.prototype.val = function (b) {
                        if (this.options.get("debug") && window.console && console.warn && console.warn('Select2: The `select2("val")` method has been deprecated and will be removed in later Select2 versions. Use $element.val() instead.'), null == b || 0 === b.length) return this.$element.val();
                        var c = b[0];
                        a.isArray(c) && (c = a.map(c, function (a) {
                            return a.toString()
                        })), this.$element.val(c).trigger("change")
                    }, e.prototype.destroy = function () {
                        this.$container.remove(), this.$element[0].detachEvent && this.$element[0].detachEvent("onpropertychange", this._syncA), null != this._observer ? (this._observer.disconnect(), this._observer = null) : this.$element[0].removeEventListener && (this.$element[0].removeEventListener("DOMAttrModified", this._syncA, !1), this.$element[0].removeEventListener("DOMNodeInserted", this._syncS, !1), this.$element[0].removeEventListener("DOMNodeRemoved", this._syncS, !1)), this._syncA = null, this._syncS = null, this.$element.off(".select2"), this.$element.attr("tabindex", this.$element.data("old-tabindex")), this.$element.removeClass("select2-hidden-accessible"), this.$element.attr("aria-hidden", "false"), this.$element.removeData("select2"), this.dataAdapter.destroy(), this.selection.destroy(), this.dropdown.destroy(), this.results.destroy(), this.dataAdapter = null, this.selection = null, this.dropdown = null, this.results = null;
                    }, e.prototype.render = function () {
                        var b = a('<span class="select2 select2-container"><span class="selection"></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>');
                        return b.attr("dir", this.options.get("dir")), this.$container = b, this.$container.addClass("select2-container--" + this.options.get("theme")), b.data("element", this.$element), b
                    }, e
                }), b.define("jquery-mousewheel", ["jquery"], function (a) {
                    return a
                }), b.define("jquery.select2", ["jquery", "jquery-mousewheel", "./select2/core", "./select2/defaults"], function (a, b, c, d) {
                    if (null == a.fn.select2) {
                        var e = ["open", "close", "destroy"];
                        a.fn.select2 = function (b) {
                            if (b = b || {}, "object" == typeof b) return this.each(function () {
                                var d = a.extend(!0, {}, b);
                                new c(a(this), d)
                            }), this;
                            if ("string" == typeof b) {
                                var d, f = Array.prototype.slice.call(arguments, 1);
                                return this.each(function () {
                                    var c = a(this).data("select2");
                                    null == c && window.console && console.error && console.error("The select2('" + b + "') method was called on an element that is not using Select2."), d = c[b].apply(c, f)
                                }), a.inArray(b, e) > -1 ? this : d
                            }
                            throw new Error("Invalid arguments for Select2: " + b)
                        }
                    }
                    return null == a.fn.select2.defaults && (a.fn.select2.defaults = d), c
                }), {define: b.define, require: b.require}
            }(), c = b.require("jquery.select2");
            return a.fn.select2.amd = b, c
        });
    }, {"jquery": "../node_modules/jquery/dist/jquery.js"}],
    "../node_modules/vendors/plugins/waypoints/jquery.waypoints.min.js": [function (require, module, exports) {
        /*!
        Waypoints - 3.1.1
        Copyright © 2011-2015 Caleb Troughton
        Licensed under the MIT license.
        https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
        */
        !function () {
            "use strict";

            function t(o) {
                if (!o) throw new Error("No options passed to Waypoint constructor");
                if (!o.element) throw new Error("No element option passed to Waypoint constructor");
                if (!o.handler) throw new Error("No handler option passed to Waypoint constructor");
                this.key = "waypoint-" + e, this.options = t.Adapter.extend({}, t.defaults, o), this.element = this.options.element, this.adapter = new t.Adapter(this.element), this.callback = o.handler, this.axis = this.options.horizontal ? "horizontal" : "vertical", this.enabled = this.options.enabled, this.triggerPoint = null, this.group = t.Group.findOrCreate({
                    name: this.options.group,
                    axis: this.axis
                }), this.context = t.Context.findOrCreateByElement(this.options.context), t.offsetAliases[this.options.offset] && (this.options.offset = t.offsetAliases[this.options.offset]), this.group.add(this), this.context.add(this), i[this.key] = this, e += 1
            }

            var e = 0, i = {};
            t.prototype.queueTrigger = function (t) {
                this.group.queueTrigger(this, t)
            }, t.prototype.trigger = function (t) {
                this.enabled && this.callback && this.callback.apply(this, t)
            }, t.prototype.destroy = function () {
                this.context.remove(this), this.group.remove(this), delete i[this.key]
            }, t.prototype.disable = function () {
                return this.enabled = !1, this
            }, t.prototype.enable = function () {
                return this.context.refresh(), this.enabled = !0, this
            }, t.prototype.next = function () {
                return this.group.next(this)
            }, t.prototype.previous = function () {
                return this.group.previous(this)
            }, t.invokeAll = function (t) {
                var e = [];
                for (var o in i) e.push(i[o]);
                for (var n = 0, r = e.length; r > n; n++) e[n][t]()
            }, t.destroyAll = function () {
                t.invokeAll("destroy")
            }, t.disableAll = function () {
                t.invokeAll("disable")
            }, t.enableAll = function () {
                t.invokeAll("enable")
            }, t.refreshAll = function () {
                t.Context.refreshAll()
            }, t.viewportHeight = function () {
                return window.innerHeight || document.documentElement.clientHeight
            }, t.viewportWidth = function () {
                return document.documentElement.clientWidth
            }, t.adapters = [], t.defaults = {
                context: window,
                continuous: !0,
                enabled: !0,
                group: "default",
                horizontal: !1,
                offset: 0
            }, t.offsetAliases = {
                "bottom-in-view": function () {
                    return this.context.innerHeight() - this.adapter.outerHeight()
                }, "right-in-view": function () {
                    return this.context.innerWidth() - this.adapter.outerWidth()
                }
            }, window.Waypoint = t
        }(), function () {
            "use strict";

            function t(t) {
                window.setTimeout(t, 1e3 / 60)
            }

            function e(t) {
                this.element = t, this.Adapter = n.Adapter, this.adapter = new this.Adapter(t), this.key = "waypoint-context-" + i, this.didScroll = !1, this.didResize = !1, this.oldScroll = {
                    x: this.adapter.scrollLeft(),
                    y: this.adapter.scrollTop()
                }, this.waypoints = {
                    vertical: {},
                    horizontal: {}
                }, t.waypointContextKey = this.key, o[t.waypointContextKey] = this, i += 1, this.createThrottledScrollHandler(), this.createThrottledResizeHandler()
            }

            var i = 0, o = {}, n = window.Waypoint, r = window.onload;
            e.prototype.add = function (t) {
                var e = t.options.horizontal ? "horizontal" : "vertical";
                this.waypoints[e][t.key] = t, this.refresh()
            }, e.prototype.checkEmpty = function () {
                var t = this.Adapter.isEmptyObject(this.waypoints.horizontal),
                    e = this.Adapter.isEmptyObject(this.waypoints.vertical);
                t && e && (this.adapter.off(".waypoints"), delete o[this.key])
            }, e.prototype.createThrottledResizeHandler = function () {
                function t() {
                    e.handleResize(), e.didResize = !1
                }

                var e = this;
                this.adapter.on("resize.waypoints", function () {
                    e.didResize || (e.didResize = !0, n.requestAnimationFrame(t))
                })
            }, e.prototype.createThrottledScrollHandler = function () {
                function t() {
                    e.handleScroll(), e.didScroll = !1
                }

                var e = this;
                this.adapter.on("scroll.waypoints", function () {
                    (!e.didScroll || n.isTouch) && (e.didScroll = !0, n.requestAnimationFrame(t))
                })
            }, e.prototype.handleResize = function () {
                n.Context.refreshAll()
            }, e.prototype.handleScroll = function () {
                var t = {}, e = {
                    horizontal: {
                        newScroll: this.adapter.scrollLeft(),
                        oldScroll: this.oldScroll.x,
                        forward: "right",
                        backward: "left"
                    },
                    vertical: {
                        newScroll: this.adapter.scrollTop(),
                        oldScroll: this.oldScroll.y,
                        forward: "down",
                        backward: "up"
                    }
                };
                for (var i in e) {
                    var o = e[i], n = o.newScroll > o.oldScroll, r = n ? o.forward : o.backward;
                    for (var s in this.waypoints[i]) {
                        var a = this.waypoints[i][s], l = o.oldScroll < a.triggerPoint,
                            h = o.newScroll >= a.triggerPoint, p = l && h, u = !l && !h;
                        (p || u) && (a.queueTrigger(r), t[a.group.id] = a.group)
                    }
                }
                for (var c in t) t[c].flushTriggers();
                this.oldScroll = {x: e.horizontal.newScroll, y: e.vertical.newScroll}
            }, e.prototype.innerHeight = function () {
                return this.element == this.element.window ? n.viewportHeight() : this.adapter.innerHeight()
            }, e.prototype.remove = function (t) {
                delete this.waypoints[t.axis][t.key], this.checkEmpty()
            }, e.prototype.innerWidth = function () {
                return this.element == this.element.window ? n.viewportWidth() : this.adapter.innerWidth()
            }, e.prototype.destroy = function () {
                var t = [];
                for (var e in this.waypoints) for (var i in this.waypoints[e]) t.push(this.waypoints[e][i]);
                for (var o = 0, n = t.length; n > o; o++) t[o].destroy()
            }, e.prototype.refresh = function () {
                var t, e = this.element == this.element.window, i = this.adapter.offset(), o = {};
                this.handleScroll(), t = {
                    horizontal: {
                        contextOffset: e ? 0 : i.left,
                        contextScroll: e ? 0 : this.oldScroll.x,
                        contextDimension: this.innerWidth(),
                        oldScroll: this.oldScroll.x,
                        forward: "right",
                        backward: "left",
                        offsetProp: "left"
                    },
                    vertical: {
                        contextOffset: e ? 0 : i.top,
                        contextScroll: e ? 0 : this.oldScroll.y,
                        contextDimension: this.innerHeight(),
                        oldScroll: this.oldScroll.y,
                        forward: "down",
                        backward: "up",
                        offsetProp: "top"
                    }
                };
                for (var n in t) {
                    var r = t[n];
                    for (var s in this.waypoints[n]) {
                        var a, l, h, p, u, c = this.waypoints[n][s], d = c.options.offset, f = c.triggerPoint, w = 0,
                            y = null == f;
                        c.element !== c.element.window && (w = c.adapter.offset()[r.offsetProp]), "function" == typeof d ? d = d.apply(c) : "string" == typeof d && (d = parseFloat(d), c.options.offset.indexOf("%") > -1 && (d = Math.ceil(r.contextDimension * d / 100))), a = r.contextScroll - r.contextOffset, c.triggerPoint = w + a - d, l = f < r.oldScroll, h = c.triggerPoint >= r.oldScroll, p = l && h, u = !l && !h, !y && p ? (c.queueTrigger(r.backward), o[c.group.id] = c.group) : !y && u ? (c.queueTrigger(r.forward), o[c.group.id] = c.group) : y && r.oldScroll >= c.triggerPoint && (c.queueTrigger(r.forward), o[c.group.id] = c.group)
                    }
                }
                for (var g in o) o[g].flushTriggers();
                return this
            }, e.findOrCreateByElement = function (t) {
                return e.findByElement(t) || new e(t)
            }, e.refreshAll = function () {
                for (var t in o) o[t].refresh()
            }, e.findByElement = function (t) {
                return o[t.waypointContextKey]
            }, window.onload = function () {
                r && r(), e.refreshAll()
            }, n.requestAnimationFrame = function (e) {
                var i = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || t;
                i.call(window, e)
            }, n.Context = e
        }(), function () {
            "use strict";

            function t(t, e) {
                return t.triggerPoint - e.triggerPoint
            }

            function e(t, e) {
                return e.triggerPoint - t.triggerPoint
            }

            function i(t) {
                this.name = t.name, this.axis = t.axis, this.id = this.name + "-" + this.axis, this.waypoints = [], this.clearTriggerQueues(), o[this.axis][this.name] = this
            }

            var o = {vertical: {}, horizontal: {}}, n = window.Waypoint;
            i.prototype.add = function (t) {
                this.waypoints.push(t)
            }, i.prototype.clearTriggerQueues = function () {
                this.triggerQueues = {up: [], down: [], left: [], right: []}
            }, i.prototype.flushTriggers = function () {
                for (var i in this.triggerQueues) {
                    var o = this.triggerQueues[i], n = "up" === i || "left" === i;
                    o.sort(n ? e : t);
                    for (var r = 0, s = o.length; s > r; r += 1) {
                        var a = o[r];
                        (a.options.continuous || r === o.length - 1) && a.trigger([i])
                    }
                }
                this.clearTriggerQueues()
            }, i.prototype.next = function (e) {
                this.waypoints.sort(t);
                var i = n.Adapter.inArray(e, this.waypoints), o = i === this.waypoints.length - 1;
                return o ? null : this.waypoints[i + 1]
            }, i.prototype.previous = function (e) {
                this.waypoints.sort(t);
                var i = n.Adapter.inArray(e, this.waypoints);
                return i ? this.waypoints[i - 1] : null
            }, i.prototype.queueTrigger = function (t, e) {
                this.triggerQueues[e].push(t)
            }, i.prototype.remove = function (t) {
                var e = n.Adapter.inArray(t, this.waypoints);
                e > -1 && this.waypoints.splice(e, 1)
            }, i.prototype.first = function () {
                return this.waypoints[0]
            }, i.prototype.last = function () {
                return this.waypoints[this.waypoints.length - 1]
            }, i.findOrCreate = function (t) {
                return o[t.axis][t.name] || new i(t)
            }, n.Group = i
        }(), function () {
            "use strict";

            function t(t) {
                this.$element = e(t)
            }

            var e = window.jQuery, i = window.Waypoint;
            e.each(["innerHeight", "innerWidth", "off", "offset", "on", "outerHeight", "outerWidth", "scrollLeft", "scrollTop"], function (e, i) {
                t.prototype[i] = function () {
                    var t = Array.prototype.slice.call(arguments);
                    return this.$element[i].apply(this.$element, t)
                }
            }), e.each(["extend", "inArray", "isEmptyObject"], function (i, o) {
                t[o] = e[o]
            }), i.adapters.push({name: "jquery", Adapter: t}), i.Adapter = t
        }(), function () {
            "use strict";

            function t(t) {
                return function () {
                    var i = [], o = arguments[0];
                    return t.isFunction(arguments[0]) && (o = t.extend({}, arguments[1]), o.handler = arguments[0]), this.each(function () {
                        var n = t.extend({}, o, {element: this});
                        "string" == typeof n.context && (n.context = t(this).closest(n.context)[0]), i.push(new e(n))
                    }), i
                }
            }

            var e = window.Waypoint;
            window.jQuery && (window.jQuery.fn.waypoint = t(window.jQuery)), window.Zepto && (window.Zepto.fn.waypoint = t(window.Zepto))
        }();
    }, {}]
}, {}, ["../app/js/main.js"])

})