'use strict';

(function initQbConfig(window) {
  const MESSAGES = {
    login:
      'Login as any user on this computer and another user on another computer.',
    create_session: 'Creating a session...',
    connect: 'Connecting...',
    connect_error:
      'Something went wrong with the connection. Check internet connection or user info and try again.',
    login_as: 'Logged in as ',
    title_login: 'Choose a user to login with:',
    title_callee: 'Choose users to call:',
    calling: 'Calling...',
    webrtc_not_avaible: 'WebRTC is not available in your browser',
    no_internet: 'Please check your Internet connection and try again',
  };

  /** Test server / app by defaults */
  const creds = {
    appId: '23',
    authKey: 'RPKOssfCxxBtrSv',
    authSecret: 'MW3MmaFjYYu5dgX',
    accountKey: 'XbuBzVEBSpya4-P23riQ',
  };

  const config = {
    debug: false, //{ mode: 1 },
    webrtc: {
      answerTimeInterval: 60,
      dialingTimeInterval: 5,
      disconnectTimeInterval: 35,
    },
    endpoints: {
      api: 'apistagingbayshore.quickblox.com',
      chat: 'chatstagingbayshore.quickblox.com',
    },
  };

  localStorage.setItem(
    'QB_CONFIG',
    JSON.stringify({
      CREDENTIALS: creds,
      APP_CONFIG: config,
      MESSAGES: MESSAGES,
    })
  );
})(window);
