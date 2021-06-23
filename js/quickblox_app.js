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

async function startSession(login, password, userId, silent = false) {
  if (app.currentSession.ID || app.currentUser.id) {
    restartSession(true);
    return true;
  }

  app.helpers.setAppState(window.innerWidth <= 480 ?
    {
      ...app.initialAppState,
      maximized: true,
      callWaiting: true,
      shrunk: silent,
    } : {
      ...app.initialAppState,
      callWaiting: true,
      shrunk: silent,
    }
  ); 


  localStorage.setItem('qb_user_pw', password);

  app.helpers.activateClickListeners();
  await app.helpers.startSession(login, password);
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
  app.currentUser = {};
  localStorage.removeItem('qb_user_pw');

  if (restart && user && pass) {
    await startSession(user.login, pass, user.id, true);
  }
}

async function destroySession() {
  await app.helpers.destroySession();
}
