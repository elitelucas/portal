import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { Patient } from '../_model/user';

declare var Peer: any;


@Injectable({
  providedIn: 'root'
})
export class MeetRoomPatientService {

  private socket ; //= io(environment.socket_endpoint);

  private localVideo = null;
  private localStream = null;
  private remoteVideo = null;

  public myPeer = null;
  public localCall = null;
  public myPeerId = null;

  constructor() {
  }


  public confirmConnectPatient(patient: Patient) {
    this.socket = io(environment.socket_endpoint);
    //console.log(this.socket);
    this.socket.emit('confirmConnectPatient', patient);
  }

  /*public connectioProvider() {
    return Observable.create((observer) => {
      this.socket.on('providerConnect', (patients) => {
        observer.next(patients)
      });
    })
  }

  public disconnectioProvider() {
    return Observable.create((observer) => {
      this.socket.on('providerDisconnect', (patients) => {
        observer.next(patients)
      });
    })
  }*/


  public providerEntered() {
    return Observable.create((observer) => {
      this.socket.on('providerEnteredInPayProvider', (data) => {
        observer.next(data)
      });
    })
  }


  public receiveConfirmProvider() {
    return Observable.create((observer) => {
      this.socket.on('confirmProvider', (confirmProvider) => {
        observer.next(confirmProvider)
      });
    })
  }

  public receiveEndCall() {
    return Observable.create((observer) => {
      this.socket.on("endCall", async (data) => {
        observer.next(data.text);
      });
    });
  }

  public endCall(to, text) {
    this.socket.emit("endCall", {
      text: text,
      from: this.socket.id,
      to: to
    });
  }


  public stopVideoAudio() {
    try {

      if (this.localStream != null) {
        this.localStream.getTracks().forEach((track) => {
          if (track.readyState == 'live' && track.kind === 'video') {
            track.stop();
          }
          if (track.readyState == 'live' && track.kind === 'audio') {
            track.stop();
          }
        });
        this.localStream = null;
      }
      if (this.localVideo != null) {
        this.localVideo.nativeElement.srcObject = null;
        this.localVideo = null;
      }
      this.remoteVideo = null;
      if (this.localCall != null) {
        this.localCall.close();
      }
    } catch (error) {
      console.log(error);
    }
  }

  public disconnectMe() {
    console.log("disconnectMe");
    //this.socket.disconnect();
  }

  public confirmPay(providerId, payMethodSelect) {
    this.socket.emit('confirmPay', providerId, payMethodSelect);
  }

  public patientEnteredInPayPatient(providerId, patietDni) {
    this.socket.emit('patientEnteredInPayPatient', providerId, patietDni);
  }

  public receivePay() {
    return Observable.create((observer) => {
      this.socket.on('sendPay', (payAmount) => {
        observer.next(payAmount)
      });
    })
  }

  public setLocalElement(lv) {
    this.localVideo = lv;
    this.localVideo.nativeElement.volume = 0;
    this.localVideo.nativeElement.muted = 0;
  }

  public setRemoteElement(rv) {
    this.remoteVideo = rv;
  }

  public localMuteActive(active) {
    this.localStream.getAudioTracks()[0].enabled = !active;
  }

  public localVideoActive(active) {
    this.localStream.getVideoTracks()[0].enabled = !active;
  }
  public async startLocalMediaVideo() {
    this.localStream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    this.localVideo.nativeElement.srcObject = this.localStream;
  }
  public preparateVideoCallFormProviderListener() {
    return Observable.create((observer) => {
      this.socket.on('preparateVideoCallFormProvider', (provider) => {
        observer.next(provider)
      });
    });
  }

  public connect() {
    return Observable.create((observer) => {
      let config = {
        host: environment.peerServerHost,
        port: environment.peerServerPort,
        path: environment.peerServerPath,
        debug: environment.peerServerDebugLevel,
        secure: environment.peerServerSecure,
        config: environment.peerConfig.config
      };
      this.myPeer = new Peer(undefined, config);

      this.myPeer.on('open', () => {
        this.myPeerId = this.myPeer.id;
        observer.next(this.myPeerId)
      });

      this.myPeer.on('call', call => {
        this.localCall = call;
        call.answer(this.localStream)
        call.on('stream', userVideoStream => {
          this.remoteVideo.nativeElement.srcObject = userVideoStream;
        })
      })

      this.myPeer.on('error', (err) => {
        console.log("err")
        console.log(err);
      });

    })
  }

  public preparateVideoCallFormPatient(provider, patient) {
    this.socket.emit("preparateVideoCallFormPatient", {
      provider: provider,
      patient: patient,
    });
  }

  public receiveUploadFile() {
    return Observable.create((observer) => {
      this.socket.on('sendUploadFile', (uploadFileName) => {
        observer.next(uploadFileName)
      });
    })
  }

  public recivetext() {
    return Observable.create((observer) => {
      this.socket.on("chat_provider", async (data) => {
        observer.next(data.text);
      });
    });
  }

  public sendtext(to, text) {
    this.socket.emit("chat_provider", {
      text: text,
      from: this.socket.id,
      to: to
    });
  }

  public sendUploadFile(uploadFileName, key, othersId) {
    this.socket.emit('sendUploadFile', uploadFileName, key, othersId);
  }

  /*
  revisar si es necesario
    public receiveProvideId() {
      this.trace("receiveProviderId :");
      return Observable.create((observer) => {
        this.socket.on('receiveProviderId', (providerId) => {
          observer.next(providerId)
        });
      });
    }
  */

  trace(...arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    //console.log(now + ': ', arg);
  }
}


