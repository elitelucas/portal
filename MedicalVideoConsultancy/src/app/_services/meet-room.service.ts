import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { Patient } from '../_model/user';
import { OnDestroy } from '@angular/core';

declare var Peer: any;


@Injectable({
  providedIn: 'root'
})
export class MeetRoomService {

  private socket ; //= io(environment.socket_endpoint);

  private localVideo = null;
  private localStream = null;
  private remoteVideo = null;

  public myPeer = null;
  public localCall = null;
  public myPeerId = null;


  constructor() {
  }

  public confirmConnect(userProvider) {
    this.socket = io(environment.socket_endpoint);
    console.log(this.socket);

    /* console.log("confirmConnect:", userProvider);
     console.log("confirmConnect:", this.myPeerId);*/
    this.socket.emit('confirmConnect', userProvider);
  }

  public async startLocalMediaVideo() {
    this.localStream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    this.localVideo.nativeElement.srcObject = this.localStream;
  }

  public disconnectMe() {
    console.log("disconnectMe");
    this.socket.disconnect();
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
        console.log("open");
        this.myPeerId = this.myPeer.id;
        observer.next(this.myPeerId)
      });

      this.myPeer.on('call', call => {
        console.log("call               ---------------------------------------")
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



  callPatient(patient) {
    console.log("callPatient ", patient.peerId)
    /*console.log("callPatient this.localStream", this.localStream)*/
    this.localCall = this.myPeer.call(patient.peerId, this.localStream);
    //console.log("stream 2")
    this.localCall.on('stream', (remoteStream) => {
      //console.log("stream 3 " , remoteStream)
      this.remoteVideo.nativeElement.srcObject = remoteStream;
    });
  }

  waitCallComplete() {
    console.log("waitCallComplete")
    return Observable.create((observer) => {
      this.myPeer.on('call', (call) => {
        console.log("call               23432423324-----------------")
        this.localCall = call;
        console.log("call")
        console.log("call this.localStream", this.localStream)
        call.answer(this.localStream);
        //console.log("answer localStream")
        call.on('stream', (remoteStream) => {
          //console.log("stream : " , remoteStream)
          this.remoteVideo.nativeElement.srcObject = remoteStream;
        });
        //console.log("stream 22")
        observer.next(call)
      });
    });
  }

  public updatePatientState() {
    return Observable.create((observer) => {
      this.socket.on('updatePatientState', (patient) => {
        observer.next(patient)
      });
    })
  }


  public confirmConnectPatient(patient: Patient) {
    //console.log("------------confirmConnectPatient:", patient);
    this.socket.emit('confirmConnectPatient', patient);
  }

  //send the information that the provider entered in pay-provider 
  //to patient that is in waiting room.

  public providerEnteredInPayProvider(provider, patietDni) {
    /*console.log("------------providerEndteredInPayProvider", provider);
    console.log("------------patientDni", patietDni);*/
    this.socket.emit('providerEnteredInPayProvider', provider, patietDni);
  }

  //send the information that the patient entered in pay-patient 
  //to provider that is in pay-provider.

  public patientEnteredInPayPatient(providerId, patietDni) {
    /*console.log("------------patientEnteredInPayPatient", providerId);
    console.log("------------patientDni", patietDni);*/
    this.socket.emit('patientEnteredInPayPatient', providerId, patietDni);
  }

  //send payAmount from provider to patient
  public sendPay(payAmount, patientSocketId) {
    //console.log("-----------payAmount", payAmount);
    this.socket.emit('sendPay', payAmount, patientSocketId);
  }

  //send confirm pay infomation  from patient to provider
  public confirmPay(providerId, payMethodSelect) {
    /*console.log('providerId')
    console.log(providerId)*/
    this.socket.emit('confirmPay', providerId, payMethodSelect);
  }

  //send confirm provider infomation  from provider to patient
  public confirmProvider(dni) {
    this.socket.emit('confirmProvider', dni);
  }

  //send uploadFileName from provider to patient

  public sendUploadFile(uploadFileName, key, othersId) {
    this.socket.emit('sendUploadFile', uploadFileName, key, othersId);
  }



  public providerEntered() {
    return Observable.create((observer) => {
      this.socket.on('providerEnteredInPayProvider', (data) => {
        observer.next(data)
      });
    })
  }

  public patientEntered() {
    return Observable.create((observer) => {
      this.socket.on('patientEnteredInPayPatient', (patientSocketId) => {
        observer.next(patientSocketId)
      });
    })
  }

  public receivePay() {
    return Observable.create((observer) => {
      this.socket.on('sendPay', (payAmount) => {
        observer.next(payAmount)
      });
    })
  }

  public receiveConfirmPay() {
    return Observable.create((observer) => {
      this.socket.on('confirmPay', (confirmPay) => {
        observer.next(confirmPay)
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

  public receiveUploadFile() {
    return Observable.create((observer) => {
      this.socket.on('sendUploadFile', (uploadFileName) => {
        observer.next(uploadFileName)
      });
    })
  }



  public activeProvider(userProvider) {
    userProvider.peerId = this.myPeerId;
    /*console.log("activeProvider:", userProvider);
    console.log("activeProvider:", this.myPeerId);*/
    this.trace("activeProvider:", userProvider);
    this.socket.emit('activate', userProvider);
  }

  public desactiveProvider(userProvider) {
    this.trace("desactiveProvider:", userProvider);
    this.socket.emit('desactivate', userProvider);
  }

  /*public countPatientRoom() {
    return Observable.create((observer) => {
      this.socket.on('countPatientRoom', (patients) => {
        observer.next(patients)
      });
    })
  }*/

  public connectioProvider() {
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
  }

  public disconnectPatients() {
    return Observable.create((observer) => {
      this.socket.on('patientsDisconnect', (patients) => {
        observer.next(patients)
      });
    })
  }

  public startCallPatient(provider, patient) {
    this.socket.emit("start_call_patient", {
      providerId: provider.id,
      peerId: provider.peerId,
      patientId: patient._id,
    });
  }

  public sendtext(to, text) {
    this.socket.emit("chat_provider", {
      text: text,
      from: this.socket.id,
      to: to
    });
  }

  public recivetext() {
    return Observable.create((observer) => {
      this.socket.on("chat_provider", async (data) => {
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


  public receiveEndCall() {
    return Observable.create((observer) => {
      this.socket.on("endCall", async (data) => {
        observer.next(data.text);
      });
    });
  }


  preparateVideoCallFormProvider(provider, patientId) {
    this.socket.emit("preparateVideoCallFormProvider", provider, patientId);
  }

  public preparateVideoCallFormProviderListener() {
    return Observable.create((observer) => {
      this.socket.on('preparateVideoCallFormProvider', (provider) => {
        observer.next(provider)
      });
    });
  }

  public patientConnected() {
    return Observable.create((observer) => {
      this.socket.on('patient_connected', (patient) => {
        observer.next(patient)
      });
    });
  }


  preparateVideoCallFormPatient(provider, patient) {
    this.socket.emit("preparateVideoCallFormPatient", {
      provider: provider,
      patient: patient,
    });
  }



  /*public confirmReadyPatient(patient) {
    this.trace("confirmReadyPatient :", patient);
    this.socket.emit('confirmReadyPatient', patient);
  }*/

  /*public confirmPatientCall() {
    this.trace("confirmReadyPatient :");
    return Observable.create((observer) => {
      this.socket.on('confirmReadyPatient', (patient) => {
        observer.next(patient)
      });
    });
  }*/

  /*public createRoom(data) {
    this.trace("createRoom :", data);
    this.socket.emit('createRoom', data);
  }*/

  /*public createProviderRoom(data) {
    this.trace("createProviderRoom :", data);
    this.socket.emit('createProviderRoom', data);
  }*/
  public receiveProvideId() {
    this.trace("receiveProviderId :");
    return Observable.create((observer) => {
      this.socket.on('receiveProviderId', (providerId) => {
        observer.next(providerId)
      });
    });
  }

  public publicMe(providerId) {
    this.socket.emit("publicMe", providerId);
  }

  public privateMe(providerId) {
    this.socket.emit("publicMe", providerId);
  }

  trace(...arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    //console.log(now + ': ', arg);
  }

}


