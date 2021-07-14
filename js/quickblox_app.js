'use strict';

const sounds = {
  call: 'callingSignal',
  end: 'endCallSignal',
  ringtone: 'ringtoneSignal',
};

const mediaParams = {
  audio: true,
  video: true,
};

/**
 * QB Event listener.
 *
 * Chat:
 * - onDisconnectedListener
 * WebRTC:
 * - onCallListener
 * - onUpdateCallListener
 * - onRemoteStreamListener
 * - onSessionCloseListener
 * - onSessionConnectionStateChangedListener
 *
 * below are not required for our use case, only needed for caller
 * - onAcceptCallListener
 * - onRejectCallListener
 * - onUserNotAnswerListener
 * - onStopCallListener
 */

async function startSession(
  login,
  password,
  userId,
  appId,
  authKey,
  authSecret,
  accountKey,
  apiEndpoint,
  chatEndpoint,
  silent = false
) {
  if (app.currentSession.ID || app.currentUser.id) {
    restartSession(true);
    return true;
  }

  const creds = {
    appId,
    authKey,
    authSecret,
    accountKey,
  };

  const config = {
    debug: { mode: 1 }, //false,
    webrtc: {
      answerTimeInterval: 60,
      dialingTimeInterval: 5,
      disconnectTimeInterval: 35,
    },
    endpoints: {
      api: apiEndpoint.replace('https://', ''),
      chat: chatEndpoint.replace('https://', ''),
    },
  };

  const QB_CONFIG = {
    CREDENTIALS: creds,
    APP_CONFIG: config,
  };

  localStorage.setItem('QB_CONFIG', JSON.stringify(QB_CONFIG));
  localStorage.setItem('qb_user_pw', password);

  app.helpers.setAppState(
    window.innerWidth <= 480
      ? {
          ...app.initialAppState,
          maximized: true,
          callWaiting: true,
          shrunk: silent,
        }
      : {
          ...app.initialAppState,
          callWaiting: true,
          shrunk: silent,
        }
  );

  app.helpers.activateClickListeners();
  await app.helpers.startSession(login, password, QB_CONFIG);
  await app.helpers.connectToChat(userId, password);
  await app.helpers.activateListeners();
}

async function restartSession(restart = false) {
  if (app.currentSession.ID) {
    QB.destroySession(() => null);
  }

  QB.chat.disconnect();
  app.currentSession = {};

  const user = app.currentUser;
  const pass = localStorage.getItem('qb_user_pw');
  const QB_CONFIG = JSON.parse(localStorage.getItem('QB_CONFIG') || null);

  app.currentUser = {};
  localStorage.removeItem('QB_CONFIG');
  localStorage.removeItem('qb_user_pw');

  if (restart && user && pass && QB_CONFIG) {
    await startSession(
      user.login,
      pass,
      user.id,
      QB_CONFIG.CREDENTIALS.appId,
      QB_CONFIG.CREDENTIALS.authKey,
      QB_CONFIG.CREDENTIALS.authSecret,
      QB_CONFIG.CREDENTIALS.accountKey,
      QB_CONFIG.APP_CONFIG.endpoints.api,
      QB_CONFIG.APP_CONFIG.endpoints.chat,
      true
    );
  }
}

async function destroySession() {
  await app.helpers.destroySession();
}
