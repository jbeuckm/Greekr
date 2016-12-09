angular.module('greekr', [])
  .config(function ($compileProvider) {    
    
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|filesystem:chrome-extension):/);

});