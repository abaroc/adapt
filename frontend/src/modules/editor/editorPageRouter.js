// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var ConfigModel = require('core/models/configModel');
  var ContentObjectModel = require('core/models/contentObjectModel');
  var CoreHelpers = require('core/helpers');
  var CourseModel = require('core/models/courseModel');
  var EditorConfigEditView = require('./views/editorConfigEditView');
  var EditorContentView = require('./views/editorContentView');
  var EditorCourseEditView = require('./views/editorCourseEditView');
  var EditorData = require('./editorDataLoader');
  var EditorExtensionsEditView = require('./views/editorExtensionsEditView');
  var EditorHelpers = require('./helpers');
  var EditorMenuSettingsEditView = require('./views/editorMenuSettingsEditView');
  var EditorThemeCollectionView = require('./views/editorThemeCollectionView');
  var EditorView = require('./views/editorView');
  var Origin = require('core/origin');

  var EditorEditSidebarOptions = function(data) {
    return {
      // backButton: { label: 'Back' },
      actions: [
        { name: 'save', type: 'primary', labels: { default: 'app.buttons.save' } },
        { name: 'cancel', type: 'secondary', label: 'app.buttons.cancel' },
      ],
      fieldsets: data.fieldsets || []
    };
  };

  function EditorPageRouter(data) {
    switch(data.type) {
      case 'project':
        if(route1 === 'new') return createNewCourse(data);
      case 'config':
        return loadEditorConfig(data);
      case 'course':
        return loadCourseEdit(data);
      case 'contentObject':
        if(data.action !== 'edit') return loadContentObjectStructure(data);
      case 'contentObject':
      case 'article':
      case 'block':
      case 'component':
        if(data.action === 'edit') return loadContentEdit(data);
      case 'menusettings':
        return loadMenuPicker(data);
      case 'selecttheme':
        return loadThemePicker(data);
      case 'extensions':
        return loadExtensions(data);
    }
  }

  function loadEditorConfig(data) {
    fetchModel('config', function(model) {
      var form = Origin.scaffold.buildForm({ model: model });
      EditorHelpers.setContentSidebar({ fieldsets: form.fieldsets });
      Origin.contentPane.setView(EditorConfigEditView, { model: model, form: form });
    });
  }

  function loadContentObjectStructure(data) {
    var route = function() {
      if(Origin.location.route2 === 'menu') {
        Origin.editor.scrollTo = 0;
      }
      updateSidebar({
        backButton: { label: data.id ? "Back to course structure" : "Back to courses" },
        actions: [
          { name: 'preview', type: 'primary', labels: { default: 'app.preview', processing: 'app.previewing' } },
          { name: 'download', type: 'secondary', labels: { default: 'app.download', processing: 'app.downloading' } },
          { name: 'export', type: 'secondary', labels: { default: 'app.export', processing: 'app.exporting' } }
        ],
        links: [
          { name: 'project', page: 'settings', label: 'app.editorsettings' },
          { name: 'config', page: 'config', label: 'app.editorconfig' },
          { name: 'selecttheme', page: 'selecttheme', label: 'app.themepicker' },
          { name: 'menusettings', page: 'menusettings', label: 'app.editormenusettings' },
          { name: 'extensions', page: 'extensions', label: 'app.editorextensions' }
        ]
      });
      Origin.contentPane.setView(EditorView, {
        currentCourseId: Origin.location.route1,
        currentView: Origin.location.route2,
        currentPageId: (data.id || null)
      });
    }
    if(!data.id) return route();

    fetchModel('contentObject', data.id, function(model) {
      route(_.extend(data, { model: model }));
    });
  }

  function loadExtensions(data) {
    Origin.sidebar.update({ backButton: { label: "Back to course" } });
    Origin.contentPane.setView(EditorExtensionsEditView, { model: new Backbone.Model({ _id: Origin.location.route1 }) });
  }

  function loadMenuPicker(data) {
    fetchModel('config', function(model) {
      EditorHelpers.setContentSidebar();
      Origin.contentPane.setView(EditorMenuSettingsEditView, { model: model });
    });
  }

  function loadThemePicker(data) {
    fetchModel('config', function(model) {
      EditorHelpers.setContentSidebar();
      Origin.contentPane.setView(EditorThemeCollectionView, { model: model });
    });
  }

  function loadCourseEdit() {
    // FIXME need to fetch config to ensure scaffold has the latest extensions data
    CoreHelpers.multiModelFetch([ createModel('course'), Origin.editor.data.config ], function(data) {
      var form = Origin.scaffold.buildForm({ model: data.course });
      EditorHelpers.setContentSidebar({ fieldsets: form.fieldsets });
      Origin.contentPane.setView(EditorCourseEditView, { model: data.course, form: form });
    });
  }

  function loadContentEdit(data) {
    fetchModel(data.type, data.id, function(model) {
      var form = Origin.scaffold.buildForm({ model: model });
      EditorHelpers.setContentSidebar({ fieldsets: form.fieldsets });
      Origin.contentPane.setView(EditorContentView, { model: model, form: form });
    });
  }

  function createNewCourse() {
    var model = new CourseModel({
      title: Origin.l10n.t('app.placeholdernewcourse'),
      displayTitle: Origin.l10n.t('app.placeholdernewcourse')
    });
    var form = Origin.scaffold.buildForm({ model: model });
    EditorHelpers.setContentSidebar({ fieldsets: form.fieldsets });
    Origin.contentPane.setView(EditorCourseEditView, { model: model, form: form });
  }

  function fetchModel(type, id, done) {
    if(typeof id === 'function') done = id;
    createModel(type, { _id: id }).fetch({ success: done, error: console.log });
  }

  function createModel(type, data) {
    var courseId = Origin.location.route1;
    switch(type) {
      case 'config': return new ConfigModel(_.extend({ _courseId: courseId }, data));
      case 'course': return new CourseModel(_.extend({ _id: courseId }, data));
      case 'contentObject': return new ContentObjectModel(data);
      case 'article': return new ArticleModel(data);
      case 'block': return new BlockModel(data);
      case 'component': return new ComponentModel(data);
    }
  }

  function updateSidebar(options) {
    Origin.sidebar.update(options);
  }

  function updateView(options) {

  }

  return EditorPageRouter;
});
