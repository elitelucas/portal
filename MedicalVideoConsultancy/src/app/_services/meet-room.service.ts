import { Injectable } from '@angular/core';
import * as io from 'socket.io-client'
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { Patient } from '../_model/user';

declare var Peer:any;


@Injectable({
  providedIn: 'root'
})
export class MeetRoomService {

  private socket = io(environment.socket_endpoint);

  private localVideo = null;
  private localStream = null;
  private remoteVideo = null;
  private remoteStream = null;

  public  myPeer = null;
  public  myPeerId = null;

  constructor() {
  }

  public async init() {
    this.localStream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });
    this.localVideo.nativeElement.srcObject = this.localStream;
  }

  public connect() {
    return Observable.create((observer) => {
        this.myPeer = new Peer(undefined, {
        host: 'nemiac.com',
        port: '9000',      
        debug: 3,  
        path: '/peerjs',
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
                {url: 'stun:stun1.l.google.com:19302'},
                {url: 'stun:stun2.l.google.com:19302'},
                {url: 'stun:stun3.l.google.com:19302'},
                {url: 'stun:stun4.l.google.com:19302'},
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

  public setLocalElement(lv) {
    this.localVideo = lv;
    /*console.log("setLocalElement");
    console.log(this.localVideo);*/
  }

  public setRemoteElement(rv) {
    this.remoteVideo = rv;
    /*console.log("setRemoteElement");
    console.log(this.remoteVideo);*/
  }

  public confirmConnect(userProvider) {
    userProvider.peerId = this.myPeerId;
    console.log("confirmConnect:", userProvider);
    console.log("confirmConnect:", this.myPeerId);
    this.socket.emit('confirmConnect', userProvider);
  }

  public confirmConnectPatient(patient : Patient) {
    patient.peerId = this.myPeerId;
    console.log("------------confirmConnectPatient:", patient);
    this.socket.emit('confirmConnectPatient', patient);
  }


  public activeProvider(userProvider) {
    userProvider.peerId = this.myPeerId;
    console.log("activeProvider:", userProvider);
    console.log("activeProvider:", this.myPeerId);
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
    console.log("callPatient ", patient.peerId)
    console.log("callPatient this.localStream", this.localStream)
    var call = this.myPeer.call(patient.peerId, this.localStream);
    console.log("stream 2")
    call.on('stream', (remoteStream) => {
      console.log("stream 3 " , remoteStream)
      this.remoteVideo.nativeElement.srcObject = remoteStream;
    });
  }

  waitCallComplete() {
    console.log("waitCallComplete")
    return Observable.create((observer) => {
      this.myPeer.on('call', (call) => {
        console.log("call")
        console.log("call this.localStream", this.localStream)
        call.answer(this.localStream);
        console.log("answer localStream")
        call.on('stream', (remoteStream) => {
          console.log("stream : " , remoteStream)
          this.remoteVideo.nativeElement.srcObject = remoteStream;
        });
        console.log("stream 22")
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

  trace(...arg) {
    var now = (window.performance.now() / 1000).toFixed(3);
    //console.log(now + ': ', arg);
  }

}


