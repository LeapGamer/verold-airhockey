$(function() {
  window.GameUI = {};
  window.GameUI.player1 = undefined;
  window.GameUI.player2 = undefined;
  window.GameUI.specators = new Backbone.Collection();

  _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/g
  };

  window.GameUI.Templates = {};

  window.GameUI.Templates.playerTemplate = _.template($('#player-template').html());

  window.GameUI.Templates.spectatorTemplate = _.template($('#spectator-template').html());

  window.GameUI.Templates.goalTemplate = _.template($('#goal-template').html());

  window.GameUI.Views = {};

  window.GameUI.Views.GoalView = Backbone.View.extend({
    template: window.GameUI.Templates.goalTemplate,
    tagName: 'div',
    className: 'goal',

    initialize: function() {
      this.render();
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      $(this.el).appendTo('body');
    }
  });

  window.GameUI.Views.SpectatorsView = Backbone.View.extend({
    el: '#spectators',

    initialize: function() {
      this.collection.on('add', this.spectatorAdded, this);
      this.collection.on('remove', this.spectatorRemoved, this);
      this.subViews = [];
    },

    spectatorAdded: function(model) {
      var view = new window.GameUI.Views.SpectatorView({ model: model });
      this.subViews.push(view);
      view.render();
      model.view = view;

      $(view.el).appendTo(this.el);
    },

    spectatorRemoved: function(model) {
      model.view.remove();
    }
  });

  window.GameUI.Views.SpectatorView = Backbone.View.extend({
    template: window.GameUI.Templates.spectatorTemplate,
    tagName: 'li',
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
    }
  });

  window.GameUI.Views.PlayerView = Backbone.View.extend({
    template: window.GameUI.Templates.playerTemplate,

    initialize: function() {
      this.model = new window.GameUI.Models.PlayerModel();

      this.model.on('change', this.render, this);
    },

    setPlayerNumber: function(playerNumber) {
      this.playerNumber = playerNumber;
    },

    render: function() {
      if (this.model.get('name')) {
        var data = this.model.toJSON();
        data.playerNumber = this.playerNumber;

        $(this.el).html(this.template(data));
      } else {
        $(this.el).html('');
      }
    }
  });

  window.GameUI.Views.PlayerSetupView = Backbone.View.extend({
    el: '#player-setup',

    initialize: function() {
      var name = localStorage.name || 'Guest' + Math.floor(Math.random() * 1000)
        , email = localStorage.email || '';


      window.AirHockey.socket.on('playerRegistered', $.proxy(this.onRegistered, this));
      $('#input-name').val(name);
      $('#input-email').val(email);
      $(this.el).show();
    },

    events: {
      'submit #player-setup-form': 'save'
    },

    save: function(e) {
      e.preventDefault();

      var name = $('#input-name').val()
        , email = $('#input-email').val();

      if (!name.length) {
        return alert('invalid name!');
      }

      localStorage.name = name;
      localStorage.email = email;

      window.AirHockey.socket.emit('playerRegister', { name: name, email: email });
    },

    onRegistered: function() {
      console.log('Registered, hiding dialog...');
      $(this.el).hide();
    }
  });

  window.GameUI.Models = {};

  window.GameUI.Models.PlayerModel = Backbone.Model.extend({
    toJSON: function() {
      var json = _.clone(this.attributes);

      json.gravatarUrl = 'http://en.gravatar.com/avatar/' + json.gravatarHash + '?s=64&d=retro';

      return json;
    }
  });

  window.GameUI.Collections = {};

  window.GameUI.Collections.SpectatorsCollection = Backbone.Collection.extend({});
});
