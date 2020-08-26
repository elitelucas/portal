var fs = require('fs');
var PeerServer = require('peer').PeerServer;
// /etc/nginx/ssl

var server = PeerServer({
    port: 3001,
    path: '/',
   /* ssl: {
        key: fs.readFileSync('/etc/letsencrypt/live/www.nemiac.com/privkey.pem', 'utf8'),
        cert: fs.readFileSync('/etc/letsencrypt/live/www.nemiac.com/fullchain.pem', 'utf8')
    }*/
});