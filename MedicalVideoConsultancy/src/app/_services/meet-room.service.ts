import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { Patient } from '../_model/user';

declare var Peer: any;


@Injectable({
  providedIn: 'root'
})
export class MeetRoomService {

  private socket = io(environment.socket_endpoint);

  private localVideo = null;
  private localStream = null;
  private remoteVideo = null;
  private remoteStream = null;

  public myPeer = null;
  public myPeerId = null;

  constructor() {
  }

  public async startLocalMediaVideo() {
    this.localStream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });
    this.localVideo.nativeElement.srcObject = this.localStream;
  }

  public setLocalElement(lv) {
    this.localVideo = lv;
  }

  public setRemoteElement(rv) {
    this.remoteVideo = rv;
  }

  public connect() {
    return Observable.create((observer) => {
      this.myPeer = new Peer(undefined, {
        host: environment.peerServerHost,
        port: environment.peerServerPort,
        path: environment.peerServerPath,
        debug: 3,
        secure: true,
        config: {
          'iceServers': [
                /*{
                    url: 'stun:stun.nemiac.com:5349',
                    credential: '12345', 
                    username: 'robin'
                },
                {
                    url: 'turn:turn.nemiac.com:5349',
                    credential: 'guest', 
                    username: 'somepassword'
                }*//**/,
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
      });

      this.myPeer.on('open', () => {
        this.myPeerId = this.myPeer.id;
        observer.next(this.myPeerId)
      });

      this.myPeer.on('disconnected', () => {
        console.log('Connection lost. Please reconnect');
        this.myPeer.reconnect();
      });

      this.myPeer.on('error', (err) => {
        console.log(err);
      });

    })
  }

  public updatePatientState() {
    return Observable.create((observer) => {
      this.socket.on('updatePatientState', (patient) => {
        observer.next(patient)
      });
    })
  }


  public confirmConnect(userProvider) {
    userProvider.peerId = this.myPeerId;
    /* console.log("confirmConnect:", userProvider);
     console.log("confirmConnect:", this.myPeerId);*/
    this.socket.emit('confirmConnect', userProvider);
  }

  public confirmConnectPatient(patient: Patient) {
    patient.peerId = this.myPeerId;
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
  public confirmPay(providerId) {
    /*console.log('providerId')
    console.log(providerId)*/
    this.socket.emit('confirmPay', providerId);
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

  public countPatientRoom() {
    return Observable.create((observer) => {
      this.socket.on('countPatientRoom', (patients) => {
        observer.next(patients)
      });
    })
  }

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


  public startAttetion(provider, patient) {
    this.trace("startAttetion :", provider, patient);
    this.socket.emit('startAttetion', provider, patient);
  }

  public startAttetionOfProvider() {
    return Observable.create((observer) => {
      this.socket.on('startAttetionOfProvider', (providerSocket) => {
        observer.next(providerSocket)
      });
    });
  }


  callPatient(patient) {
    /*console.log("callPatient ", patient.peerId)
    console.log("callPatient this.localStream", this.localStream)*/
    var call = this.myPeer.call(patient.peerId, this.localStream);
    //console.log("stream 2")
    call.on('stream', (remoteStream) => {
      //console.log("stream 3 " , remoteStream)
      this.remoteVideo.nativeElement.srcObject = remoteStream;
    });
  }

  waitCallComplete() {
    console.log("waitCallComplete")
    return Observable.create((observer) => {
      this.myPeer.on('call', (call) => {
        /*console.log("call")
        console.log("call this.localStream", this.localStream)*/
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

  public confirmReadyPatient(patient) {
    this.trace("confirmReadyPatient :", patient);
    this.socket.emit('confirmReadyPatient', patient);
  }

  public confirmPatientCall() {
    this.trace("confirmReadyPatient :");
    return Observable.create((observer) => {
      this.socket.on('confirmReadyPatient', (patient) => {
        observer.next(patient)
      });
    });
  }

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

  trace(...arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    //console.log(now + ': ', arg);
  }

}


