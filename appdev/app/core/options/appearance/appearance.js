(function(angular) {
  'use strict';

  angular.module('ps.core.options')
    .controller('AppearanceCtrl', AppearanceCtrl)
    .directive('psAppearance', AppearanceDirective);

  function AppearanceCtrl(dataService, i18n) {
    var vm = this;
    vm.columns = [];
    vm.previewColors = []; //css variable names
    vm.liveColors = []; //css variable names
    vm.toggleTheme = toggleTheme;
    vm.choosePreset = choosePreset;
    vm.undoChanges = undoChanges;
    vm.setTheme = setTheme;
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

    activate();

    function activate() {
      getData(); //get the stored theme colors used, preset the input colors to that value
      dataService.setOnChangeData('appearance', getData);
      // get the inputs
      var bodyStyles = window.getComputedStyle(document.body);
      var inputs = [].slice.call(document.querySelectorAll('.themeControls input'));
      document.getElementById('applyBut').addEventListener('click', setTheme);
      document.getElementById('themePicker').addEventListener('change', choosePreset);
      inputs.forEach(function(input) {
        var str = bodyStyles.getPropertyValue(`--${input.id}`);
        //console.log(str);
        str = str.replace(/\s+/g, '');
        str = str.replace(/\\3/, '');
        // console.log(str);
        input.value = str;
        // listen for changes
        input.addEventListener('change', handleUpdate);
      }, this);
    }

    function handleUpdate(e) {
      var hValue = 0;
      var aValue = 0;
      var hName = '';
      var aName = '';
      const hoverOffset = 20;
      const activeOffset = 12;
      document.documentElement.style.setProperty(`--${this.id}`, this.value);
      //   if the item updated is a *_bg, set the hover and active values
      if (this.id.slice(-2) == "bg") {
        // console.log("bg found");
        hName = '--'.concat(this.id.slice(0, this.id.length - 2), 'hover');
        aName = '--'.concat(this.id.slice(0, this.id.length - 2), 'active');
        if (tinycolor(this.value).getLuminance() > 0.2) {
          hValue = tinycolor(this.value).darken(hoverOffset).toString();
          aValue = tinycolor(this.value).darken(activeOffset).toString();
        } else {
          hValue = tinycolor(this.value).lighten(hoverOffset).toString();
          aValue = tinycolor(this.value).lighten(activeOffset).toString();
        }
        document.documentElement.style.setProperty(hName, hValue);
        document.documentElement.style.setProperty(aName, aValue);
      }
      console.log(`--${this.id}`, this.value);
      console.log(hName, hValue);
      console.log(aName, aValue);
    }

    function setTheme() {
      console.log("applying previewed theme");
      var bodyStyles = window.getComputedStyle(document.body);
      document.documentElement.style.setProperty('--primary_bg', bodyStyles.getPropertyValue('--preview_primary_bg'));
      document.documentElement.style.setProperty('--primary_text', bodyStyles.getPropertyValue('--preview_primary_text'));
      document.documentElement.style.setProperty('--primary_hover', bodyStyles.getPropertyValue('--preview_primary_hover'));
      document.documentElement.style.setProperty('--primary_active', bodyStyles.getPropertyValue('--preview_primary_active'));
      document.documentElement.style.setProperty('--accent_bg', bodyStyles.getPropertyValue('--preview_accent_bg'));
      document.documentElement.style.setProperty('--accent_text', bodyStyles.getPropertyValue('--preview_accent_text'));
      document.documentElement.style.setProperty('--accent_hover', bodyStyles.getPropertyValue('--preview_accent_hover'));
      document.documentElement.style.setProperty('--accent_active', bodyStyles.getPropertyValue('--preview_accent_active'));
      document.documentElement.style.setProperty('--item_bg', bodyStyles.getPropertyValue('--preview_item_bg'));
      document.documentElement.style.setProperty('--item_text', bodyStyles.getPropertyValue('--preview_item_text'));
      document.documentElement.style.setProperty('--item_hover', bodyStyles.getPropertyValue('--preview_item_hover'));
      document.documentElement.style.setProperty('--item_active', bodyStyles.getPropertyValue('--preview_item_active'));
      document.documentElement.style.setProperty('--bar_bg', bodyStyles.getPropertyValue('--preview_bar_bg'));
      document.documentElement.style.setProperty('--bar_text', bodyStyles.getPropertyValue('--preview_bar_text'));
      document.documentElement.style.setProperty('--bar_hover', bodyStyles.getPropertyValue('--preview_bar_hover'));
      document.documentElement.style.setProperty('--bar_active', bodyStyles.getPropertyValue('--preview_bar_active'));
      document.documentElement.style.setProperty('--secondary_bg', bodyStyles.getPropertyValue('--preview_secondary_bg'));
      //save to local file?
    }

    function choosePreset(e) {
      //sets the selected preset as the currently previewed theme
      console.log("preset selected", this.value);
      var selectedTheme = {};
      const lightTheme = {
        '--preview_primary_bg': '#EEEEEE',
        '--preview_primary_text': '#000000',
        '--preview_primary_hover': '#bbbbbb',
        '--preview_primary_active': '#cfcfcf',
        '--preview_accent_bg': '#3F51B5',
        '--preview_accent_text': '#ffffff',
        '--preview_accent_hover': '#8591d5',
        '--preview_accent_active': '#6776ca',
        '--preview_item_bg': '#E8EAF6',
        '--preview_item_text': '#222222',
        '--preview_item_hover': '#9fa7d9',
        '--preview_item_active': '#bcc2e5',
        '--preview_bar_bg': '#000070',
        '--preview_bar_text': '#ffffff',
        '--preview_bar_hover': '#0000d6',
        '--preview_bar_active': '#0000ad',
        '--preview_secondary_bg': '#E0E0E0'
      };
      const darkTheme = {
        '--preview_primary_bg': '#262626',
        '--preview_primary_text': '#D3D3D3',
        '--preview_primary_hover': '#595959',
        '--preview_primary_active': '#454545',
        '--preview_accent_bg': '#00A478',
        '--preview_accent_text': '#ffffff',
        '--preview_accent_hover': '#003e2d',
        '--preview_accent_active': '#00674b',
        '--preview_item_bg': '#373737',
        '--preview_item_text': '#D3D3D3',
        '--preview_item_hover': '#6a6a6a',
        '--preview_item_active': '#565656',
        '--preview_bar_bg': '#060606',
        '--preview_bar_text': '#ffffff',
        '--preview_bar_hover': '#393939',
        '--preview_bar_active': '#252525',
        '--preview_secondary_bg': '#696969'
      };
      switch (document.getElementById('themePicker').value) {
        case "0":
          selectedTheme = lightTheme;
          break;
        case "1":
          selectedTheme = darkTheme;
          break;
        default:
          break;
      }
      for (var key in selectedTheme) {
        document.documentElement.style.setProperty(key, selectedTheme[key]);
        console.log(key, selectedTheme[key])
      }
    }

    function undoChanges() {
      //reverts the preview to the currently applied theme
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

// 
// function GetColors(text)) {
//   var inval = '#E8EAF6';
//   if (tinycolor(inval).getLuminance() > 0.2) {
//     console.log(tinycolor(inval).darken(hoverOffset).toString());
//     console.log(tinycolor(inval).darken(activeOffset).toString());
//   } else {
//     console.log(tinycolor(inval).lighten(hoverOffset).toString());
//     console.log(tinycolor(inval).lighten(activeOffset).toString());
//   }
// }
