// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define([
  'require',
  'core/origin',
  './editorDataLoader',
  './editorEventHub',
  './editorSidebarLinkRouter',
  './EditorPageRouter',
], function(require, Origin, EditorData, EventHub, LinkRouter, PageRouter) {
  /**
  * Load the appropriate editor data when needed
  */
  Origin.on({
    'origin:dataReady login:changed': EditorData.loadGlobalData,
    'router:editor editor:refreshData': EditorData.loadCourseData,
    'editor:resetData': EditorData.reset
  });
  Origin.on({
    'router:editor': EventHub,
    'sidebar:link': LinkRouter,
    'editor': PageRouter
  });
});
