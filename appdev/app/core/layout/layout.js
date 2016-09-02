(function(angular) {
  'use strict';

  angular.module('ps.core')
    .controller('LayoutCtrl', LayoutCtrl)
    .directive('psLayout', layoutDirective);

  function LayoutCtrl($scope, $timeout, dataService, layoutService, versionService, i18n) {
    var vm = this;
    vm.onClickTab = onClickTab;
    vm.activateEditor = activateEditor;

    vm.columns = [];
    vm.popup = {};
    vm.showModal = false;
    vm.tempvar = 'app/core/layout/layout.html';

    activate();

    function activate() {
      dataService.getData()
        .then(function() {
          return checkVersion();
        })
        .then(function() {
          getStyles();
          getLayout();
          setTabClasses();
          setHelpPopup();
        });
      //set watch if layout changes
      dataService.setOnChangeData('layout', layoutDataCB);
    }

    function layoutDataCB() {
      dataService.clearData(['activeTabs'], 'local')
        .then(function() {
          getLayout();
          setTabClasses();
          setHelpPopup();
          $timeout(function() {
            $scope.$digest();
          });
        });
    }

    function activateEditor(colIndex) {
      var label = vm.activeTabs[colIndex];
      switch (vm.widgets[label].edit.type) {
        case 'url':
          vm.modalUrl = vm.widgets[label].edit.url;
          break;
        case 'directive':
          vm.modalUrl = 'app/widgets/widgets/editWidget.html';
          vm.modalDirective = vm.widgets[label].edit.directive;
          vm.modalTitle = i18n.get('w_' + vm.widgets[label].label + '_edit_title');
          break;
      }
      vm.modalData = {
        onHide: function() {
          layoutService.runOnTabClick('bookmarkTree');
        },
        closable: false,
      };
      vm.showModal = true;
    }
    //Tab functions
    function onClickTab(tab, colIndex) {
      var data = {};
      vm.activeTabs[colIndex] = tab.label;
      if (tab.delegate) {
        vm.activeTabs[colIndex + 1] = tab.label;
        vm.columns[colIndex].cover = true;
      } else {
        vm.columns[colIndex].cover = false;
      }

      data.activeTabs = vm.activeTabs;
      dataService.setData(data)
        .then(function() {
          setTabClasses();
          setHelpPopup();
          layoutService.runOnTabClick(tab.label);
        });
    }

    function setTabClasses() {
      var c = 0;
      var t = 0;
      for (c = 0; c < vm.columns.length; c++) {
        for (t = 0; t < vm.columns[c].tabs.length; t++) {
          vm.columns[c].tabs[t].classes = [vm.styles.primaryCol];
          if (vm.activeTabs[c] === vm.columns[c].tabs[t].label) {
            vm.columns[c].tabs[t].active = true;
            vm.columns[c].tabs[t].classes.push('active');
            if (angular.isDefined(vm.columns[c].tabs[t].edit)) {
              vm.columns[c].edit = true;
            } else {
              vm.columns[c].edit = false;
            }

            if (vm.columns[c].tabs[t].delegate) {
              vm.columns[c].cover = true;
            } else {
              vm.columns[c].cover = false;
            }

          } else {
            vm.columns[c].tabs[t].active = false;
          }
          if (angular.isDefined(vm.columns[c].tabs[t].delegate) && vm.columns[c].tabs[t].delegate) {
            vm.columns[c].tabs[t].classes.push('delegate');
          }
        }
        //Cover Tabs
        vm.columns[c].coverClasses = [vm.styles.primaryCol];
        if (vm.columns[c].cover) {
          vm.columns[c].coverClasses.push('active');
        }
      }
      dataService.data.activeTabs = vm.activeTabs;
    }

    function getStyles() {
      vm.styles = dataService.data.styles;
      vm.priMenuClasses = [vm.styles.primaryCol];
      if (vm.styles.primaryInv) {
        vm.priMenuClasses[1] = "inverted";
      }
      vm.secMenuClasses = [vm.styles.secondaryCol];
      if (vm.styles.secondaryInv) {
        vm.secMenuClasses[1] = "inverted";
      }
    }

    //Data functions
    function getLayout() {
      vm.layout = dataService.data.layout;
      vm.widgets = dataService.data.widgets;
      vm.theme = dataService.data.appearance;
      var c, t;
      if (angular.isDefined(dataService.data.activeTabs)) {
        vm.activeTabs = dataService.data.activeTabs;
      } else {
        vm.activeTabs = [];
        for (c = 0; c < vm.layout.length; c++) {
          vm.activeTabs[c] = vm.layout[c].tabs[0];
        }
      }
      for (c = 0; c < vm.layout.length; c++) {
        vm.columns[c] = {
          title: vm.layout[c].title,
          label: vm.layout[c].label,
          tabs: [],
        };
        for (t = 0; t < vm.layout[c].tabs.length; t++) {
          vm.columns[c].tabs[t] = vm.widgets[vm.layout[c].tabs[t]];
          vm.columns[c].tabs[t].label = vm.layout[c].tabs[t];
        }
        if (c === 1) {
          var tab;
          for (t = 0; t < vm.layout[c + 1].tabs.length; t++) {
            tab = angular.copy(vm.widgets[vm.layout[c + 1].tabs[t]]);
            tab.label = vm.layout[c + 1].tabs[t];
            tab.delegate = true;
            vm.columns[c].tabs.push(tab);
          }
        }
      }

       if (angular.isDefined(dataService.data.appearance)) {
        vm.theme = angular.copy(dataService.data.appearance);
        console.log("got it");
      }
      for (var key in vm.theme) {
        document.documentElement.style.setProperty(key, vm.theme[key]);
        // console.log(key, vm.theme[key])
      }
      
    }

    function setHelpPopup() {
      for (var i = 0; i < vm.columns.length; i++) {
        vm.columns[i].helpPopup = {
          'html': '<div class="header">' + vm.widgets[vm.activeTabs[i]].title + '</div><div class="description">' + vm.widgets[vm.activeTabs[i]].help + '</div>',
          'position': 'bottom right',
          'variation': 'basic tiny',
        };
      }
    }

    function checkVersion() {
      versionService.linkUninstallSurvey();
      var manifest = dataService.getManifest();
      if (dataService.data.version === manifest.version) {
        return true;
      } else {
        if (angular.isDefined(dataService.data.version)) {
          vm.modalTitle = i18n.get("WhatsNew");
          vm.modalUrl = 'app/core/bottomMenu/whatsNew.html';
          vm.modalData = {};
          vm.showModal = true;
          return versionService.checkVersion(manifest.version, dataService.data.version);
        } else {
          vm.modalTitle = i18n.get("Help");
          vm.modalUrl = 'app/core/bottomMenu/help.html';
          vm.modalData = {};
          vm.showModal = true;
          return dataService.setData({
            'version': manifest.version,
          });
        }
      }
    }
  }

  function layoutDirective() {
    return {
      restrict: 'E',
      controller: 'LayoutCtrl',
      controllerAs: 'Layout',
    };
  }
})(angular);
