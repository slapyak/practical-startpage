(function(angular) {
  'use strict';

  angular.module('ps.core.options')
    .controller('OptionsCtrl', OptionsCtrl)
    .directive('psOptions', optionsDirective);


  function OptionsCtrl($timeout, storageService) {
    var vm = this;
    vm.tab = 3;
    vm.setTab = setTab;
    vm.clearData = clearData;

    function setTab(tab) {
      vm.tab = tab;
      if (angular.isDefined(vm.modal)) {
        $timeout(function() {
          vm.modal.modal('refresh');
        }, 10);
      }
    }

    function clearData() {
      storageService.clearData()
        .then(function() {
          vm.dataCleared = 'Cleared!!!';
          $timeout(function() {
            vm.dataCleared = '';
          }, 3000);
        });
    }
  }

  function optionsDirective() {
    return {
      restrict: 'E',
      templateUrl: 'app/core/options/options.html',
      controller: 'OptionsCtrl',
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        modal: "=psModal",
      },
    };
  }

})(angular);
