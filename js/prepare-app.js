angular.module('greekr', ['indexedDB'])
  .config(function ($indexedDBProvider, $compileProvider) {

    $indexedDBProvider
      .connection('greekr')
      .upgradeDatabase(1, function(event, db, tx){
        var objStore = db.createObjectStore('hashes', {keyPath: 'hash'});
        objStore.createIndex('hash_idx', 'hash', {unique: true});
      });
    
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|filesystem:chrome-extension):/);
    
});