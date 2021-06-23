'use strict';

(function qbInit(CONFIG) {
  QB.init(
    CONFIG.CREDENTIALS.appId,
    CONFIG.CREDENTIALS.authKey,
    CONFIG.CREDENTIALS.authSecret,
    CONFIG.CREDENTIALS.accountKey,
    CONFIG.APP_CONFIG
  );
})(JSON.parse(localStorage.getItem('QB_CONFIG')));

/** GLOBAL */
window.app = new Proxy(
  {},
  {
    set: function (obj, prop, value) {
      if (prop === 'currentSession') {
        if (
          typeof value === 'object' &&
          value.callType &&
          value.callType === QB.webrtc.CallType.AUDIO
        ) {
          // TODO: hide video elements
        } else {
          // TODO: display video elements
        }
      }

      // The default behavior to store the value
      obj[prop] = value;

      // Indicate success
      return true;
    },
  }
);

app.helpers = {};
app.currentSession = {};
app.currentUser = {};
app.extension = {};
app.state = {
  callWaiting: false,
  callIncoming: false,
  callOngoing: false,
  waitingCallInfo: false,
  endCall: false,
  maximized: false,
  shrunk: false,
  audioMute: false,
  videoMute: false,
};

app.initialAppState = {
  callWaiting: false,
  callIncoming: false,
  callOngoing: false,
  waitingCallInfo: false,
  endCall: false,
  maximized: false,
  shrunk: false,
  audioMute: false,
  videoMute: false,
};

const classes = {
  waiting_call: 'waiting_call',
  incoming_call: 'incoming_call',
  video_call: 'video_call',
  waiting_call_info: 'waiting_call_info',
  end_call: 'end_call',
  video_maximize: 'video_maximize',
  video_minimize: 'video_minimize',
  shrink_btn: 'shrink_btn',
  expand_btn: 'expand_btn',
  video_call_mute_audio: 'video_call_mute_audio',
  video_call_unmute_audio: 'video_call_unmute_audio',
  video_call_mute_video: 'video_call_mute_video',
  video_call_unmute_video: 'video_call_unmute_video',
};

app.helpers.setAppState = function (incomingState) {
  const newState = {
    ...app.state,
    ...incomingState,
  };

  app.state = newState;

  const {
    callWaiting,
    callIncoming,
    callOngoing,
    waitingCallInfo,
    endCall,
    maximized,
    shrunk,
    audioMute,
    videoMute,
  } = newState;

  document
    .getElementById('drag_div')
    .setAttribute(
      'class',
      `qb_modal ${maximized ? 'non_draggable_modal' : 'draggable_modal'}`
    );

  Array.from(document.getElementsByClassName(classes.video_maximize)).forEach(
    (el) =>
      (el.style.display = callOngoing && window.innerWidth > 480 ? (maximized ? 'none' : 'block') : 'none')
  );

  Array.from(document.getElementsByClassName(classes.video_minimize)).forEach(
    (el) =>
      (el.style.display = callOngoing && window.innerWidth > 480  ? (maximized ? 'block' : 'none') : 'none')
  );

  document
    .getElementById('drag_div').style.top = shrunk ? 'unset' : 0;

  document.getElementById('modal_body').style.display = shrunk
    ? 'none'
    : 'flex';

  Array.from(document.getElementsByClassName(classes.shrink_btn)).forEach(
    (el) => (el.style.display = shrunk ? 'none' : 'block')
  );

  Array.from(document.getElementsByClassName(classes.expand_btn)).forEach(
    (el) => (el.style.display = shrunk ? 'block' : 'none')
  );

  Array.from(
    document.getElementsByClassName(classes.video_call_mute_audio)
  ).forEach((el) => (el.style.display = audioMute ? 'none' : 'block'));

  Array.from(
    document.getElementsByClassName(classes.video_call_unmute_audio)
  ).forEach((el) => (el.style.display = audioMute ? 'block' : 'none'));

  Array.from(
    document.getElementsByClassName(classes.video_call_mute_video)
  ).forEach((el) => (el.style.display = videoMute ? 'none' : 'block'));

  Array.from(
    document.getElementsByClassName(classes.video_call_unmute_video)
  ).forEach((el) => (el.style.display = videoMute ? 'block' : 'none'));

  Array.from(document.getElementsByClassName(classes.waiting_call)).forEach(
    (el) => (el.style.display = callWaiting ? 'block' : 'none')
  );

  Array.from(document.getElementsByClassName(classes.incoming_call)).forEach(
    (el) => (el.style.display = callIncoming ? 'block' : 'none')
  );

  Array.from(document.getElementsByClassName(classes.video_call)).forEach(
    (el) => (el.style.display = callOngoing ? 'block' : 'none')
  );

  Array.from(document.getElementsByClassName(classes.waiting_call_info)).forEach(
    (el) => (el.style.display = waitingCallInfo ? 'block' : 'none')
  );

  Array.from(document.getElementsByClassName(classes.end_call)).forEach(
    (el) => (el.style.display = endCall ? 'block' : 'none')
  );

  document.getElementById('drag_div').style.visibility =
    !callWaiting && !callIncoming && !callOngoing && !waitingCallInfo && !endCall ? 'hidden' : 'visible';
  
  document.getElementsByTagName('flt-glass-pane')[0].style.opacity =
    (!callWaiting && !callIncoming && !callOngoing && !waitingCallInfo && !endCall) || shrunk ? 'unset' : 0.5;
  
    document.getElementsByClassName('loading')[0].style.opacity =
    (!callWaiting && !callIncoming && !callOngoing && !waitingCallInfo && !endCall) || shrunk ? 'unset' : 0;
};

app.helpers.startSession = async function (login, password) {
  const userRequiredParams = {
    login: login,
    password: password,
  };

  return await new Promise(function (resolve, reject) {
    QB.createSession(function (csErr, csRes) {
      if (csErr) {
        reject(csErr);
      } else {
        QB.login(userRequiredParams, function (loginErr, loginUser) {
          if (loginErr) {
            reject(loginErr);
          } else {
            app.currentUser = loginUser;
            resolve(loginUser);
          }
        });
      }
    });
  });
};

app.helpers.destroySession = async function (restart = false) {
  app.helpers.setAppState(
    {
      ...app.initialAppState
    }
  );

  await restartSession();
}

app.helpers.connectToChat = async function (userId, password) {
  const userRequiredParams = {
    userId: userId,
    password: password,
  };

  return await new Promise(function (resolve, reject) {
    QB.chat.connect(userRequiredParams, function (connectErr, connectRes) {
      if (connectErr) {
        reject(connectErr);
      } else {
        resolve(connectRes);
      }
    });
  });
};

app.helpers.activateClickListeners = function () {
  // click listener on call waiting close button
  document
    .getElementById('waiting_call_close')
    .addEventListener('click', function () {
      app.helpers.setAppState(window.innerWidth <= 480 ?
        {
          ...app.initialAppState,
          maximized: true,
          waitingCallInfo: true,
        } : {
          ...app.initialAppState,
          waitingCallInfo: true,
        }
      );
    });
  
  // click listener on call waiting info close button
  document
    .getElementById('waiting_call_info_close')
    .addEventListener('click', function () {
      app.helpers.setAppState({
        ...app.initialAppState,
      });
    });
  
    // click listener on call end close button
  document
  .getElementById('end_call_close')
  .addEventListener('click', function () {
    app.helpers.setAppState({
      ...app.initialAppState,
    });
  });

  // click listener on maximize button
  document
    .getElementById('video_maximize')
    .addEventListener('click', function () {
      app.helpers.setAppState({ maximized: true, shrunk: false });
    });

  // click listener on minimize button
  document
    .getElementById('video_minimize')
    .addEventListener('click', function () {
      app.helpers.setAppState({ maximized: false });
    });

  // click listener on shrink button
  document.getElementById('shrink_btn').addEventListener('click', function () {
    app.helpers.setAppState(window.innerWidth <= 480 ?  { shrunk: true } : { shrunk: true, maximized: false });
  });

  // click listener on expand button
  document.getElementById('expand_btn').addEventListener('click', function () {
    app.helpers.setAppState({ shrunk: false });
  });
};

app.helpers.activateListeners = async function () {
  // incoming call
  QB.webrtc.onCallListener = function onCallListener(session, extension) {
    console.group('onCallListener.');
    console.log('Session: ', session);
    console.log('Extension: ', extension);
    console.groupEnd();

    app.currentSession = session;

    // check the current session state
    if (app.currentSession.state !== QB.webrtc.SessionConnectionState.CLOSED) {
      document.getElementById(sounds.ringtone).play();

      app.helpers.setAppState(window.innerWidth <= 480 ?
        {
          ...app.initialAppState,
          maximized: true,
          callIncoming: true,
        } : {
          ...app.initialAppState,
          callIncoming: true,
        }
      );
    }
  };

  // click listener on accept button
  document
    .getElementById('incoming_call_accept')
    .addEventListener('click', async function () {
      document.getElementById(sounds.ringtone).pause();

      await new Promise(function (resolve, reject) {
        app.currentSession.getUserMedia(
          mediaParams,
          async function (error, stream) {
            if (error) {
              console.log(error);
              app.currentSession.reject(app.extension);
              reject(error);
            } else {
              app.currentSession.attachMediaStream('local_video', stream);
              app.currentSession.accept(app.extension);
              app.helpers.setAppState(window.innerWidth <= 480 ?
                {
                  ...app.initialAppState,
                  maximized: true,
                  callOngoing: true
                } : {
                  ...app.initialAppState,
                  callOngoing: true,
                }
              );
              resolve(stream);
            }
          }
        );
      });
    });

  // click listener on reject button
  document
    .getElementById('incoming_call_reject')
    .addEventListener('click', async function () {
      document.getElementById(sounds.end).play();
      document.getElementById(sounds.ringtone).pause();

      app.currentSession.reject(app.extension);
    });

  // click listener on disconnect button
  document
    .getElementById('video_call_disconnect')
    .addEventListener('click', async function () {
      document.getElementById(sounds.end).play();

      app.currentSession.stop(app.extension);
    });

  // click listener on audio mute button
  document
    .getElementById('video_call_mute_audio')
    .addEventListener('click', async function () {
      app.currentSession.mute('audio');
      app.helpers.setAppState({ audioMute: true });
    });

  // click listener on audio un-mute button
  document
    .getElementById('video_call_unmute_audio')
    .addEventListener('click', async function () {
      app.currentSession.unmute('audio');
      app.helpers.setAppState({ audioMute: false });
    });

  // click listener on video mute button
  document
    .getElementById('video_call_mute_video')
    .addEventListener('click', async function () {
      app.currentSession.mute('video');
      app.helpers.setAppState({ videoMute: true });
    });

  // click listener on video un-mute button
  document
    .getElementById('video_call_unmute_video')
    .addEventListener('click', async function () {
      app.currentSession.unmute('video');
      app.helpers.setAppState({ videoMute: false });
    });

  // incoming stream after accepting call
  QB.webrtc.onRemoteStreamListener = function onRemoteStreamListener(
    session,
    userId,
    stream
  ) {
    console.group('onRemoteStreamListener.');
    console.log('userId: ', userId);
    console.log('Session: ', session);
    console.log('Stream: ', stream);
    console.groupEnd();

    const state = app.currentSession.connectionStateForUser(userId),
      peerConnList = QB.webrtc.PeerConnectionState;

    if (
      state === peerConnList.DISCONNECTED ||
      state === peerConnList.FAILED ||
      state === peerConnList.CLOSED
    ) {
      return false;
    }

    app.currentSession.peerConnections[userId].stream = stream;

    console.info(
      'onRemoteStreamListener add video to the video element',
      stream
    );

    app.currentSession.attachMediaStream('remote_video', stream);
  };

  // on session closed
  QB.webrtc.onSessionCloseListener = async function onSessionCloseListener(
    session
  ) {
    console.log('onSessionCloseListener: ', session);

    document.getElementById(sounds.end).play();
    document.getElementById(sounds.ringtone).pause();

    app.currentSession.detachMediaStream('remote_video');
    app.currentSession.detachMediaStream('local_video');

    app.helpers.setAppState(window.innerWidth <= 480 ?
      {
        ...app.initialAppState,
        maximized: true,
        endCall: true,
      } : {
        ...app.initialAppState,
        endCall: true,
      }
    );
    await restartSession(session.acceptCallTime === 0);
  };

  // on chat server disconnection
  QB.chat.onDisconnectedListener = async function () {
    console.log('onDisconnectedListener.');
  };

  // when an ongoing call is updated
  QB.webrtc.onUpdateCallListener = function onUpdateCallListener(
    session,
    userId,
    extension
  ) {
    console.group('onUpdateCallListener.');
    console.log('UserId: ' + userId);
    console.log('Session: ' + session);
    console.log('Extension: ' + JSON.stringify(extension));
    console.groupEnd();
  };

  // on session connection state change
  QB.webrtc.onSessionConnectionStateChangedListener =
    function onSessionConnectionStateChangedListener(
      session,
      userId,
      connectionState
    ) {
      console.group('onSessionConnectionStateChangedListener.');
      console.log('UserID:', userId);
      console.log('Session:', session);
      console.log('Сonnection state:', connectionState);
      console.groupEnd();
    };
  
  // when browser tab is closed or reloaded 
  window.onunload = function() {
    app.helpers.destroySession(true);
  };
};

app.helpers.getConnectionStateName = function (num) {
  const answ = 'CONNECTING';

  switch (num) {
    case QB.webrtc.PeerConnectionState.DISCONNECTED:
    case QB.webrtc.PeerConnectionState.FAILED:
    case QB.webrtc.PeerConnectionState.CLOSED:
      answ = 'DISCONNECTED';
      break;
    default:
      answ = 'CONNECTING';
  }

  return answ;
};
