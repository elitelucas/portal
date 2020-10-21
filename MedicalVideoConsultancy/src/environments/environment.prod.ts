export const environment = {
  production: true,
  domain: 'nemiac.com/',
  jitBaseUrl: 'pasatrae.com/',
  baseUrl: 'https://nemiac.com/api/v1/',
  socket_endpoint: 'https://nemiac.com',
  peerServerHost:'nemiac.com',
  peerServerPort:'9000',
  peerServerPath:'/peerjs',
  peerServerSecure: true, 
  peerServerDebugLevel: 3, 
  peerConfig: {
    config: {
      'iceServers': [
        { url: 'stun:stun1.l.google.com:19302' },
        { url: 'stun:stun2.l.google.com:19302' },
        { url: 'stun:stun3.l.google.com:19302' },
        { url: 'stun:stun4.l.google.com:19302' },
        {
          url: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
        }
      ]
    }
  }
};
