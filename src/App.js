import React, {Component} from 'react';
import store from './store';
import {Provider} from 'react-redux';

import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import hash from "./hash.js";
import logo from './logo.svg';


import Header from './components/moleculas/headerRep/headerRep'
import HeaderBuscador from './components/moleculas/headBuscador/headBuscador';
import PortadaCurrent from './components/organismos/portadaCurrent/portadaCurrent';
import Controls from './components/organismos/controls/controls'
import BtnAdelante from './components/atomos/btnAdelante/btnAdelante';
import BtnAtras from './components/atomos/btnAtras/btnAtras';
import BtnPlay from './components/atomos/btnPlay/btnPlay';
import BtnRandom from './components/atomos/btnRandom/btnRandom'
import Main from './components/organismos/mainContent/main'

import './App.css';
import './scss/configurations.scss';

class  App extends Component {

  constructor(props){
    super(props);
   
    this.state = {
      token: null,
      deviceId: "",
      loggedIn: false,
      error: "",
      trackName: "Track Name",
      artistName: "Artist Name",
      albumName: "Album Name",
      albumImg: "",
      shuffle:false,
      playing: false,
      position: 0,
      duration: 0,
    }
    this.playerCheckInterval = null;
  }
  componentDidMount() {
    
    // Set token
    let _token = hash.access_token;

    if (_token) {

      // Set token
      this.setState({ loggedIn: true });
      this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
      this.setState({
        token: _token
      });
    }
    
  }
  checkForPlayer() {
    const { token } = this.state;
  
    if (window.Spotify !== null) {
      clearInterval(this.playerCheckInterval);
      this.player = new window.Spotify.Player({
        name: "Kryztof's Spotify Player",
        getOAuthToken: cb => { cb(token); },
      });
     this.createEventHandlers();
  
      // finally, connect!
      this.player.connect();
    }
  }
  createEventHandlers() {
    this.player.on('initialization_error', e => { console.error(e); });
    this.player.on('authentication_error', e => {
      console.error(e);
      this.setState({ loggedIn: false });
    });
    this.player.on('account_error', e => { console.error(e); });
    this.player.on('playback_error', e => { console.error(e); });

    // Playback status updates
    this.player.on('player_state_changed', state => this.onStateChanged(state));

    // Ready
    this.player.on('ready', async data => {
      let { device_id } = data;
      await this.setState({ deviceId: device_id });
      this.transferPlaybackHere();
    });
  }
  onStateChanged(state) {
    if (state !== null) {
      
      const {
        current_track: currentTrack,
        position,
        duration,
      } = state.track_window;
      const trackName = currentTrack.name;
      const albumName = currentTrack.album.name;
      const albumImg = currentTrack.album.images[0].url;
      const artistName = currentTrack.artists
        .map(artist => artist.name)
        .join(", ");
      const playing = !state.paused;
      this.setState({
        position,
        duration,
        trackName,
        albumName,
        artistName,
        albumImg,
        playing
      });

    }
  }
  onPrevClick() {
    this.player.previousTrack();
  }
  
  onPlayClick() {
    this.player.togglePlay();
  }
  
  onNextClick() {
    this.player.nextTrack();
  }
  onRandom(){
    const { deviceId, token } = this.state;
    if(this.state.shuffle == false){
      fetch("https://api.spotify.com/v1/me/player/shuffle?state=true", {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      this.setState({shuffle: true})
    }
    else {
      fetch("https://api.spotify.com/v1/me/player/shuffle?state=false", {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      this.setState({shuffle: false})
    }
  }
  transferPlaybackHere() {
    const { deviceId, token } = this.state;
    fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "device_ids": [ deviceId ],
        "play": true, // true para reporducir aquí
      }),
    });
  }
  render(){
    const {
      token,
      loggedIn,
      artistName,
      trackName,
      albumName,
      albumImg,
      error,
      position,
      duration,
      playing,
      shuffle

    } = this.state;
    return (

      <Provider store={store}>
        <div className="App">
          <Header/>
          

          {error && <p>Error: {error}</p>}
          {!this.state.token && (
                  
                  <a
                    className=""
                    href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}>
                    Iniciar Spotify
                  </a>
          )}
          {this.state.token && (
            <React.Fragment>
              
              <HeaderBuscador/>
              <div className="container">
                <PortadaCurrent artistName={this.state.artistName} albumName={this.state.albumName} albumImg={this.state.albumImg} trackName={this.state.trackName} />
                <Controls>
                  <BtnRandom className={shuffle==true ? "active" : "noActive"} onClick={(e) => this.onRandom(e)}/>
                  <BtnAtras onClick={(e) => this.onPrevClick(e)}/> 
                  <BtnPlay onClick={(e) => this.onPlayClick(e)}>{playing ? <i className="material-icons">pause</i> : <i className="material-icons">play_arrow</i>} </BtnPlay>
                  <BtnAdelante onClick={(e) => this.onNextClick(e)}/>
                </Controls>
              </div>
              <hr/>
              <Main/>
              

          </React.Fragment>
        )}
      </div>
      </Provider>

    );
  }
}

export default App;
