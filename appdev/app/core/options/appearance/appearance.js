(function(angular) {
    'use strict';

    angular.module('ps.core.options')
        .controller('AppearanceCtrl', AppearanceCtrl)
        .directive('psAppearance', AppearanceDirective);

    function AppearanceCtrl(dataService, i18n) {
        var vm = this;
        vm.columns = [];
        vm.toggleTheme = toggleTheme();
        vm.getData = getData;
        vm.getDefaults = getDefaults;
        vm.locale = locale;
        vm.styles = {
            priMenu: [
                dataService.data.styles.primaryCol, {
                    inverted: dataService.data.styles.primaryInv,
                },
            ],
            secMenu: [
                dataService.data.styles.secondaryCol, {
                    inverted: dataService.data.styles.secondaryInv,
                },
            ],
            priButton: dataService.data.styles.primaryCol,
            secButton: dataService.data.styles.secondaryCol,
        };

        function handleUpdate(e) {
            document.documentElement.style.setProperty(`--${this.id}`, this.value);
            console.log(`--${this.id}`, this.value);
        }

        activate();

        function activate() {
            getData();
            dataService.setOnChangeData('appearance', getData);
            // get the inputs
            var inputs = [].slice.call(document.querySelectorAll('.themeControls input'));

            // listen for changes
            inputs.forEach(input => input.addEventListener('change', handleUpdate));
        }

        function clear(appearance) {
            var appearance = [];
            getData(appearance);
        }

        function getData() {
            vm.appearance = [];
            var appearance = [];
            if (angular.isDefined(dataService.data.appearance)) {
                appearance = angular.copy(dataService.data.appearance);
            }
        }

        function getDefaults() {
            var appearance = dataService.getDefaultData('appearance').appearance;
            consolidateData(appearance);
        }

        function locale(text) {
            return i18n.get(text);
        }

        function toggleTheme() {
            var elem = document.getElementById("appWrapper");
            if (elem.className == " ui padded main grid") {
                elem.className = " ui padded main grid inverted segment";
            } else {
                elem.className = " ui padded main grid";
            }
            //change the theme somehow...
        }
    }

    function AppearanceDirective() {
        return {
            restrict: 'E',
            templateUrl: 'app/core/options/appearance/appearance.html',
            controller: 'AppearanceCtrl',
            controllerAs: 'vm',
            bindToController: true,
            scope: {},
        };
    }
})(angular);