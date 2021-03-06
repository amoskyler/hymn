'use strict';

var ReactCompositeComponent = require('react/lib/ReactCompositeComponent');
var DOM = require('react/lib/ReactDOM');
var PropTypes = require('react/lib/ReactPropTypes');

var Player = ReactCompositeComponent.createClass({
  displayName: 'Player',
  propTypes: {
    title: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    album: PropTypes.string.isRequired,

    autoPlay: PropTypes.bool,
    loop: PropTypes.bool,
    muted: PropTypes.bool,
    preload: PropTypes.bool,

    onSkip: PropTypes.func,
    onEnd: PropTypes.func
  },

  getDefaultProps: function() {
    return {
      autoPlay: false,
      loop: false,
      muted: false,
      preload: true
    };
  },

  getInitialState: function() {
    return {
      playing: this.props.autoPlay,
      duration: 0,
      position: 0
    };
  },

  // component states
  toggle: function() {
    this.setState({
      playing: !this.state.playing
    }, this.sync);
  },

  setPosition: function(e) {
    var audioTag = this.refs.audioTag.getDOMNode();
    var x = e.pageX - e.target.getBoundingClientRect().left;
    var scale = e.target.clientWidth;
    var time = this.state.duration*(x/scale);
    audioTag.currentTime = time;
  },

  // sync all non-props
  // back to the dom element
  sync: function() {
    var audioTag = this.refs.audioTag.getDOMNode();

    if (this.state.playing) {
      audioTag.play();
    } else {
      audioTag.pause();
    }

    if (!isNaN(audioTag.duration)) {
      this.setState({
        duration: Math.floor(audioTag.duration*10)/10,
        position: Math.floor(audioTag.currentTime*10)/10
      });
    }
  },

  componentDidMount: function() {
    // hacks around react bug
    // TODO: break this out into an audio wrapper
    var audioTag = this.refs.audioTag.getDOMNode();
    audioTag.addEventListener('timeupdate', this.sync, false);
    if (this.props.onEnd) {
      audioTag.addEventListener('ended', this.props.onEnd, false);
    }

    this.sync();
  },

  componentWillUnmount: function() {
    // hacks around react bug
    // TODO: break this out into an audio wrapper
    var audioTag = this.refs.audioTag.getDOMNode();
    audioTag.removeEventListener('timeupdate', this.sync, false);
    if (this.props.onEnd) {
      audioTag.removeEventListener('ended', this.props.onEnd, false);
    }
  },

  render: function(){
    var audioTag = DOM.audio({
      ref: 'audioTag',
      key: 'audioTag',
      controls: false,

      loop: this.props.loop,
      muted: this.props.muted,
      preload: this.props.preload,
      autoPlay: this.props.autoPlay,

      onTimeUpdate: this.sync,
      onEnded: this.props.onEnd
    }, this.props.children);

    // information
    var artwork = DOM.div({
      ref: 'artwork',
      key: 'artwork',
      className: 'hymn-artwork',
      style: {
        backgroundImage: 'url('+this.props.artwork+')'
      }
    });

    var title = DOM.p({
      ref: 'title',
      key: 'title',
      className: 'hymn-title',
      title: this.props.title
    }, this.props.title);

    var album = DOM.p({
      ref: 'album',
      key: 'album',
      className: 'hymn-album',
      title: this.props.album
    }, this.props.album);

    var artist = DOM.p({
      ref: 'artist',
      key: 'artist',
      className: 'hymn-artist',
      title: this.props.artist
    }, this.props.artist);

    var info = DOM.div({
      ref: 'info',
      key: 'info',
      className: 'hymn-info'
    }, [title, album, artist]);

    // controls
    var playPauseClass = this.state.playing ? 'hymn-pause' : 'hymn-play';
    var playPause = DOM.button({
      ref: 'playPause',
      key: 'playPause',
      className: 'hymn-control ' + playPauseClass,
      onClick: this.toggle
    });

    var skipButton = DOM.button({
      ref: 'skipButton',
      key: 'skipButton',
      className: 'hymn-control hymn-skip',
      onClick: this.props.onSkip
    });

    var progressBar = DOM.progress({
      ref: 'progressBar',
      key: 'progressBar',
      className: 'hymn-progress',
      value: this.state.position,
      max: this.state.duration,
      onClick: this.setPosition
    });

    var controlChildren = [playPause, progressBar];
    if (this.props.onSkip) {
      controlChildren.push(skipButton);
    }
    var controls = DOM.div({
      ref: 'controls',
      key: 'controls',
      className: 'hymn-controls'
    }, controlChildren);

    // bring it all in
    var container = DOM.div({
      ref: 'container',
      className: 'hymn-player'
    }, [artwork, info, controls, audioTag]);
    return container;
  }
});

module.exports = Player;