
const express = require('express');
const app = express();
const {
  socketPort
} = require('./../../config/vars');
const server = app.listen(socketPort);
const socketIo = require('socket.io');
const io = socketIo.listen(server);
const Patient = require('./../models/patient.model');
const User = require('./../models/user.model');
const Room = require('./../models/room.model')
const {
  createConsultEvent
} = require('./provider.controller');
const logger = require('../../config/logger')

logger.info("Start socket server: " + socketPort )

const updateUserPatientState = async (idc, userPatient) => {
  try {
    //console.log("updateUserPatientState:",userPatient)
    let id = null;
    if (userPatient) {
      id = userPatient._id ? userPatient._id : userPatient.id;
    } else {
      id = idc;
    }
    return await Patient.findOneAndUpdate({
      _id: id
    }, userPatient);
  } catch (e) {
    logger.error("updateUserPatientState e :" + e)
  }
};

const updateUserProviderState = async (idc, userProvider) => {
  try {
    console.log("updateUserProviderState:", userProvider)
    let id = null;
    if (userProvider) {
      id = userProvider._id ? userProvider._id : userProvider.id;
    } else {
      id = idc;
    }
    return await User.findOneAndUpdate({
      _id: id
    }, userProvider);
  } catch (e) {
    logger.error("updateUserProviderState e :" + e)
  }
};

//------------------------------------------

const confirmConnectProvider = async (idProvider, socketId, user) => {
  try {
    console.log("confirmConnectProvider" , user)
    const userProvider = await User.findOne({
      _id: idProvider
    });
    userProvider.connection = false;
    userProvider.calling = false;
    userProvider.state = true;
    userProvider.socketId = socketId;
    userProvider.peerId = user.peerId;
    return await updateUserProviderState(idProvider, userProvider);
  } catch (e) {
    logger.error("confirmConnectProvider e :" + e)
  }
};

const connectProvider = async (idProvider, socketId, user, notify) => {
  try {
    console.log("connectProvider" , user)
    const userProvider = await User.findOne({
      _id: idProvider
    });
    userProvider.connection = true;
    userProvider.calling = false;
    userProvider.state = true;
    userProvider.socketId = socketId;
    userProvider.peerId = user.peerId;
    await updateUserProviderState(idProvider, userProvider);
    notify(userProvider)
  } catch (e) {
    logger.error("confirmConnectProvider e :" + e)
  }
};


const disconnectProvider = async (idProvider, notify) => {
  try {
    const userProvider = await User.findOne({
      _id: idProvider
    });
    userProvider.connection = false;
    userProvider.calling = false;
    userProvider.socketId = null;
    userProvider.peerId = null;
    await updateUserProviderState(idProvider, userProvider);
    notify(userProvider);
  } catch (e) {
    logger.error("disconnectProvider e :" + e)
  }
};

//-----------------------

const startAttetionPatientForPay = async (idProvider, idPatient , callback) => {
  try {
    /*console.log("startAttetionPatientForPay")
    console.log(idProvider)*/
    const userProvider = await User.findOne({
      _id: idProvider
    });
    /*console.log(userProvider)
    console.log(idPatient)*/
    userProvider.calling = false;
    const patient = await Patient.findOne({
      _id: idPatient
    });
   
    patient.calling = false;
    console.log("userProvider")
    console.log(userProvider.socketId)
    console.log("patient")
    console.log(patient.socketId)
    //await updateUserPatientState(idPatient, patient);
    //await updateUserProviderState(idProvider, userProvider);
    callback(patient.socketId, userProvider.socketId);
  } catch (e) {
    logger.error("startCallProvider e :" + e)
  }
};


const startCallProvider = async (idProvider, idPatient , callback) => {
  try {  
    const userProvider = await User.findOne({
      _id: idProvider
    });
    userProvider.calling = true;
  
    const patient = await Patient.findOne({
      _id: idPatient
    });
    patient.calling = true;
    await updateUserPatientState(idPatient, patient);
    await updateUserProviderState(idProvider, userProvider);
    callback(patient.socketId, userProvider.socketId);
  } catch (e) {
    logger.error("startCallProvider e :" + e)
  }
};



const endCallProvider = async (idProvider, idPatient) => {
  try {
    const userProvider = await User.findOne({
      _id: idProvider
    });
    userProvider.calling = false;
    const patient = await Patient.findOne({
      _id: idPatient
    });
    patient.calling = true;
    await updateUserPatientState(idPatient, patient);
    return await updateUserProviderState(idProvider, userProvider);
  } catch (e) {
    logger.error("endCallProvider e :" + e)
  }
};

//------------------------------------------

const connectConfirmPatient = async (idPatient, socketId, p) => {
  try {
    //console.log("connectConfirmPatient", p)
    const patient = await Patient.findOne({
      _id: idPatient
    });
    patient.connection = true;
    patient.calling = false;
    patient.socketId = socketId;
    patient.peerId = p.peerId;
    return await updateUserPatientState(idPatient, patient);
  } catch (e) {
    logger.error("connectConfirmPatient e :" + e)
  }
};

const disconnectPatient = async (socketId) => {
  try {
    const patient = await Patient.findOne({
      socketId: socketId
    });
    patient.connection = true;
    patient.calling = false;
    patient.socketId = null;
    patient.socketId = null;
    return await updateUserPatientState(patient._id, userProvider);
  } catch (e) {
    logger.error("disconnectPatient e :" + e)
  }
};

///------------------------

const disconnectConnection = async (socketId, notifyProviderCallback, notifyPatientsCallback) => {
  try {
    let userProviderOrPatient = await User.findOne({
      socketId: socketId
    });
    let isProviderDisconnect = true;
    if (userProviderOrPatient == undefined || userProviderOrPatient == null) {
      userProviderOrPatient = await Patient.findOne({
        socketId: socketId
      });
      isProviderDisconnect = false;
    }    
    userProviderOrPatient.connection = false;
    userProviderOrPatient.state = false;
    userProviderOrPatient.calling = false;
    userProviderOrPatient.socketId = null;
    userProviderOrPatient.peerId = null;
    if (isProviderDisconnect) {
      notifyProviderCallback(userProviderOrPatient)
    } else{
      notifyPatientsCallback(userProviderOrPatient)
    }
    return userProviderOrPatient.role ?
      await User.findOneAndUpdate({
        _id: userProviderOrPatient.id
      }, userProviderOrPatient) :
      await Patient.findOneAndUpdate({
        _id: userProviderOrPatient._id
      }, userProviderOrPatient);
  } catch (e) {
    logger.error("disconnectConnection e :" + e)
  }
};

//-------------

const countPatientRoom = async (room,callback) => {
  try {
    if (room) {
      const patientsData = await Patient.find({
        room: room,
        connection: true
      }).sort({
        lastSeen: -1
      });
      const providerData = await User.findOne({
        room: room
      });
      logger.info("countPatientRoom send :" + providerData.id + "-" + providerData.socketId)
      callback(providerData.socketId, patientsData);    
    }
  } catch (e) {
    logger.error("countPatientRoom e :" + e)
  }
};


const emitDataByRoom = async (room) => {
  try {
    if (room) {
      const patientsData = await Patient.find({
        room: room,
        connection: true
      }).sort({
        lastSeen: -1
      });
      const providerData = await User.findOne({
        room: room
      });
      
      if (patientsData) {
        //socket.to(providerData.socketId).emit("updatePatientRoom", patientsData.length);
      }
      
      /*io.emit('stateUpdated', {
        patientsData: patientsData,
        providerData: providerData
      })*/
    }
  } catch (e) {
    logger.error("emitDataByRoom e :" + e)
  }
};

//------------------


const notifyPatients = async (provider, callback) => {
  try {
    const patientsData = await Patient.find({
      room: provider.room,
      connection: true
    }).sort({
      lastSeen: -1
    });
    callback(patientsData);
  } catch (e) {
    logger.error("emitDataByRoom e :" + e)
  }
};

const notifyProvider = async (patient, callback) => {
  try {
    const provider = await User.findOne({
      _id: patient.providerId
    });
    callback(provider);
  } catch (e) {
    logger.error("emitDataByRoom e :" + e)
  }
};

io.on('connection', (socket) => {
  console.log('sssss')
  logger.info('connection active :' + socket.id);

  socket.on('confirmConnect', async (userProvider) => {
    if (userProvider) {
      logger.info('confirmConnect :' + socket.id + ' - ' + userProvider.id);

      console.log("confirmConnect ", userProvider)


      await confirmConnectProvider(userProvider.id, socket.id, userProvider);
    }
  });

  socket.on('confirmConnectPatient', async (patient) => {
    if (patient) {
      logger.info('confirmConnectPatient :' + socket.id + ' - ' + patient._id);
      await connectConfirmPatient(patient._id, socket.id, patient);
      await countPatientRoom(patient.room, (socketId, patients) => {
        socket.to(socketId).emit("countPatientRoom", patients.length);
        socket.to(socketId).emit("updatePatientState", patient);
      });

    }
  });

//provider entered in pay-provider
  socket.on('providerEnteredInPayProvider', async (userProvider,dni) => {
    if (userProvider) {
      logger.info('providerEnteredInPayProvider :' + userProvider);
      logger.info('patient-dni:' + dni);

      await confirmConnectProvider(userProvider.id, socket.id, userProvider);

      const patient= await Patient.findOne({dni});
      if(patient.socketId){
        socket.to(patient.socketId).emit("providerEnteredInPayProvider", 'providerEntered');
      }
        else
        console.log('There is no patient with this dni');
    }
  });

  //patient entered in pay-patient
  socket.on('patientEnteredInPayPatient', async (providerId,dni) => {
    if (providerId) {
      logger.info('patientEnteredInPayPatient :providerId' + providerId);
      logger.info('patient-dni:' + dni);

      const patient= await Patient.findOneAndUpdate({dni},{$set:{socketId:socket.id}},{new:true});

      const provider= await User.findById(providerId);
      if(provider.socketId){
        socket.to(provider.socketId).emit("patientEnteredInPayPatient", patient.socketId);
      }
        else
        console.log('There is no provider with this _id');
    }
  });

  //send payAmount from provider to patient
  socket.on('sendPay', async(payAmount, patientSocketId)=>{
    logger.info('payAmount: ' + payAmount);
    socket.to(patientSocketId).emit('sendPay',payAmount);
  })

   //send pay confirm info from patient to provider
   socket.on('confirmPay', async(providerId)=>{
     if(providerId){
       const provider= await User.findById(providerId);
       if(provider.socketId)
       socket.to(provider.socketId).emit('confirmPay','confirm');
       else
       console.log('there is no such provider.socketId');
     }
  })

  //send confirm provider info from provider to patient
  socket.on('confirmProvider', async(dni)=>{
    if(dni){
      const patient= await Patient.findOne({dni});
      if(patient.socketId)
      socket.to(patient.socketId).emit('confirmProvider','confirmProvider');
      else
      console.log('there is no such patient.socketId');
    }
 })

 socket.on('sendUploadFile', async(uploadFileName,key,othersId)=>{
   var sender={};
  if(key==='provider')
     sender = await Patient.findById(othersId);
    else 
     sender = await User.findById(othersId);

    if(sender.socketId){
      socket.to(sender.socketId).emit('sendUploadFile',uploadFileName);
    }
    else
    console.log('there is no such patient.socketId');
})
  
 
  socket.on('activate', async (userProvider) => {
    if (userProvider) {
      logger.info('activate :' + socket.id + ' - ' + userProvider.id);
      console.log("activate:", userProvider)
      await connectProvider(userProvider.id, socket.id, userProvider, 
        (provider) => {
          notifyPatients(provider, (patients) => {
            if (patients && patients.length > 0) {
              patients.forEach(patient => {
                logger.info("providerConnect to patient :" + patient._id + " "+patient.socketId);
                socket.to(patient.socketId).emit("providerConnect", provider.id);
              });
            }
          });
        });
    }
  });

  socket.on('desactivate', async (userProvider) => {
    if (userProvider) {
      logger.info('desactivate :' + socket.id + ' - ' + userProvider.id);
      await disconnectProvider(userProvider.id,
        (provider) => {
          notifyPatients(provider, (patients) => {
            if (patients && patients.length > 0) {
              patients.forEach(patient => {
                logger.info("providerDisconnect to patient :" + patient._id + " "+patient.socketId);
                socket.to(patient.socketId).emit("providerDisconnect", provider.id);
              });
            }
          });
        }
      );
    }
  });

  socket.on('disconnect', async () => {
    logger.info('disconnect :' + socket.id);
    disconnectConnection(socket.id,
      (provider) => {
        notifyPatients(provider, (patients)=>{
          if(patients && patients.length > 0){
            patients.forEach(patient => {
              socket.to(patient.socketId).emit("providerDisconnect", provider.id);
              logger.info("providerDisconnect "+ patient._id);
            });
          }
        });
      }, 
      (patient) => {
        notifyProvider(patient, (provider)=>{   
          logger.info("patientsDisconnect "+ provider._id + " - " + provider.socketId);
          socket.to(provider.socketId).emit("patientsDisconnect", patient);
        });
      });
  });

  //------------

  socket.on('startAttetionPatientForPay', async (provider, patient, amountPayAttetion) => {
    logger.info('startAttetionPatientForPay :' + socket.id + " to " );
    console.log(provider);
    console.log(patient);
    await startAttetionPatientForPay(provider.id, patient._id, (patientSocketId, providerSocketId) => {
      socket.to(patientSocketId).emit("startAttetionPatientForPayListener", { 
        providerId : provider.id, 
        amount : amountPayAttetion
      });
    });
  });


  socket.on('confirmPayAttetion', async (provider, patient) => {
    logger.info('confirmPayAttetion :' + socket.id  );
    await startAttetionPatientForPay(provider._id, patient._id, (patientSocketId, providerSocketId) => {
      
      socket.to(providerSocketId).emit("confirmPayAttetionListener", { 
        patientId : patient._id,
        providerId : provider._id
      });
    });
  });

  

  //------------------------

  socket.on('startAttetion', async (provider, patient) => {
    logger.info('startAttetion :' + socket.id + " - " + provider.id );
    await startCallProvider(provider.id, patient._id, (patientSocketId, providerSocketId) => {
      socket.join(provider.room)
      socket.to(patientSocketId).emit("startAttetionOfProvider", providerSocketId);
    });
  });

  socket.on('confirmReadyPatient', async (patient) => {
    logger.info('confirmReadyPatient :' + socket.id + " - " + patient._id);
    notifyProvider(patient, (provider) => {
      socket.join(provider.room)
      logger.info("confirmReadyPatient " + provider._id + " - " + provider.socketId);
      socket.to(provider.socketId).emit("confirmReadyPatient", patient);
    });
  });
  
  socket.on("chat_provider", data => {
    console.log("chat_provider from: ", socket.id , data.from, data.text );
    socket.emit("chat_provider", {
      text: data.text,
      from: data.from,
      to: data.to
    });
    console.log("chat_provider to: ", socket.id , data.to, data.text );
    socket.to(data.to).emit("chat_provider", {
      text: data.text,
      from: data.from,
      to: data.to
    });
  });

  socket.on('createRoom',data=>{
    socket.join(data);
  })
  socket.on('createProviderRoom',data=>{
    socket.join(data.providerId);
    socket.emit('receiveProviderId',data.providerId);
    socket.to(data.dni).emit('receiveProviderId',data.providerId);
  })

});
/* 
 console.log("activeSockets:");
 console.log(activeSockets);
 console.log("mapuserProviderIdAndSocket:");
 console.log(mapuserProviderIdAndSocket);
 console.log("patientsByProviderId:");
 console.log(patientsByProviderId);
 console.log("--------------------------------------");

 socket.on('disconnect', () => {
   if (connectedUser) {
     console.log('user disconnected', connectedUser);
     connectedUser.connection = false;
     connectedUser.calling = true;
     if(activeSockets[socket.id]){
       delete  activeSockets[socket.id];
       delete  mapuserProviderIdAndSocket[connectedUser.id];
     }  
     updateUserState(connectedUser).then(async result => {
       console.log('disconnect updateUserState ',result);
       await getUserData(result)
     })
   }
 });
 
 socket.on('activate', (userProvider) => {    
   if (userProvider) {
     //console.log('user activate', userProvider);
     userProvider.connection = true;
     updateUserProviderState(userProvider).then(async result => {  
       
       mapuserProviderIdAndSocket[userProvider.id] = socket.id;
       activeSockets[socket.id] = {};
       activeSockets[socket.id]["provider"] = userProvider
       activeSockets[socket.id]["patients"] = []

       if(patientsByProviderId[userProvider.id] != undefined){
         patientsByProviderId[userProvider.id].forEach(element=>{
           activeSockets[socket.id]["patients"].push(element);
           socket.to(element.socketPatient).emit("provider", {
             userProvider
           });
         });
       }    
       //console.log('userProvider activate ', activeSockets ); 
       //console.log('userProvider mapuserProviderIdAndSocket ', mapuserProviderIdAndSocket); 
       //console.log('userProvider patientsByProviderId ', patientsByProviderId);      
     })
   }
 });

 socket.on('desactivate', (userProvider) => {
   if (userProvider) {
     //console.log('user desactivate', userProvider);
     userProvider.connection = false;
     updateUserProviderState(userProvider).then(async result => {
       if(activeSockets[socket.id]){
         delete activeSockets[socket.id];
         delete mapuserProviderIdAndSocket[userProvider.id];
       }        
       //console.log('userProvider desactivate ',activeSockets , mapuserProviderIdAndSocket);
     })
   }

 });

 socket.on('addPatient', (data) => {    
   if (data) {
     userPatient = data.patient;
     socketPatient = data.socketPatient;
     userPatient.connection = true;

     userProvider = data.userProvider;
     socketId = mapuserProviderIdAndSocket[userProvider._id]
     if(patientsByProviderId[userProvider._id] == undefined){
       patientsByProviderId[userProvider._id] = []
     }
     let existsPatient = false
     patientsByProviderId[userProvider._id].forEach(element => {
       if(element.data["dni"] == userPatient["dni"]){
         existsPatient = true;
         element.socketPatient = socket.id;
         element.data = userPatient;
       }
     });

     if(!existsPatient){
       patientsByProviderId[userProvider._id].push({
             socketPatient: socketPatient,
             data: userPatient
           })
     }

     console.log("patientsByProviderId addPatient:");
     console.log(patientsByProviderId);

     if(activeSockets[socketId]){

       let exists = false
       activeSockets[socketId]["patients"].forEach(element => {
         if(element.data["dni"] == userPatient["dni"]){
           exists = true;
         }
       });
       if(!exists){
         activeSockets[socketId]["patients"].push({
           socketPatient: socketPatient,
           data: userPatient
         });
       }
       updateUserState(userPatient).then(async result => {        
         socket.to(socketId).emit("listPatients", {
           list: activeSockets[socketId]["patients"]
         });
       });
     }
     
   }
 });

 
 socket.on("call-user", (data) => {
   //console.log('call-user activate ', JSON.stringify(activeSockets) ); 
   //console.log('call-user activate ', JSON.stringify(data) ); 
  // console.log("call-user : ",socket.id);
  // console.log("call-user : ",data.to);
   //console.log("call-user call-made: ", data );
   socket.to(data.to).emit("call-made", {
     offer: data.offer,
     socket: socket.id
   });
 });

 socket.on("make-answer", data => {
   //console.log('make-answer activate ', JSON.stringify(activeSockets) );
  // console.log('make-answer activate ', JSON.stringify(data) );
  // console.log("make-answer : ",socket.id);
  // console.log("make-answer : ",data.to);
   //console.log("make-answer make-answer: ",data);
   socket.to(data.to).emit("answer-made", {
     socket: socket.id,
     answer: data.answer
   });
 });

 /*  back


 socket.on('updateState', (userData) => {
   if(userData) connectedUser = userData;
   console.log('updateState ',userData);
   connectedUser.connection = true;
   updateUserState(userData).then(async result => {
     console.log('updateState updateUserState ',result);
     result["socketId"] = socket.id;
     await addPatientToRoom(socket.id, result);
     await getUserData(result)
   });
 });

 socket.on('signOut', (userData) => {
   if(userData)  userData.connection = false;
   console.log('signOut ',userData);
     updateUserState(userData).then( async result => {
       console.log('signOut updateUserState ',result);
       await getUserData(result)
     })
 });

 socket.on('checkoutCompleted', (userData) => {
   console.log('checkoutCompleted ',userData);
    getUserData(userData);
 });

 socket.on('startCall', (data) => {
   console.log('startCall :',data);
   if(data.patient) {
     data.patient.calling = true;
     updateUserState(data.patient).then(async result => {
       console.log('startCall updateUserState :',result);
       await getUserDataOffer(result, data)
       await createConsultEvent(result)
     });

   }
 });

 socket.on('sendOffertProvider', (data) => {
   console.log('sendOffertProvider to startCallToProvider :',data);
   io.emit('startCallToProvider', data)

 });
 

 socket.on('endCall', (userData) => {
   console.log('endCall ',userData);
   if(userData) {
     userData.calling = false; 
     userData.connection = false;
     updateUserState(userData).then(async result => {
       console.log('endCall updateUserState ',result);
       await getUserData(result)
     })
   }
 });

 //Activate or deactivate
 socket.on('changePatientRoomState', (userData) => {
   console.log('changePatientRoomState ',userData);
   updateUserState(userData).then(async result => {
     console.log('changePatientRoomState updateUserState ',result);
     await getUserData(result)
   })
 });

 socket.on('amountToPay', (patientDataToPay) => {
   console.log('amountToPay ',patientDataToPay);
   updateUserState(patientDataToPay).then(async result => {
     console.log('amountToPay updateUserState ',result);
     await getUserData(result)
   })
 })

 socket.on("message", (textMessage) => {
   //socket.to(id).emit("message", socket.id, message);
 });*/

/*
 */

/*const addPatientToRoom = async (socketId, result) => {
  let datauser = {
    "socketId":socketId,
    "dni":result["dni"],
    "email":result["email"],
    "phoneNumber":result["phoneNumber"],
    "_id":result["_id"]
  }
  if(patients[result["room"]] && patients[result["room"]].length > 0){
    let exists = false;
    patients[result["room"]].forEach(element => {
      if(element["dni"] == datauser["dni"]){
        exists = true;
      }
    });
    if(exists){
      patients[result["room"]] = patients[result["room"]].push(datauser);
    }       
  } else {
    patients[result["room"]] = [datauser]
  }
  console.log('updateState patients ',patients);
};*/


/*const updateUserState = async (userData) => {
  try{
    const id = userData && userData._id ? userData._id : userData.id;
    return userData && userData.role ?  await User.findOneAndUpdate({_id: id}, userData, {new: true}) : await Patient.findOneAndUpdate({_id: id}, userData, {new: true});
  } catch (e) {
    console.log("updateUserState e :",e)
  }
};*/
