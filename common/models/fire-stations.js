'use strict';

module.exports = function (Firestations) {

  const app = require('../../server/server');
  const FireStations = app.models.Firestations;

  Firestations.beforeRemote("findById", function (ctx, instance, next) {

      //@todo check logged user access

      const user = ctx.req.accessToken.user();

      Firestations.findOne({ where: { id: ctx.args.id, "firefighters.email" : user.email} }).then(hasAccess=>{

         if (hasAccess)     {
             return next();
         } else {
             return next(new Error("USER_HAS_NO_ACCESS"));
         }

      })

  });


  // --------------------------- OBSERVERS ---------------------------

  Firestations.observe("after save", function (ctx, next) {

    if (ctx.isNewInstance) {

      //sprawdzenie kto jest zalogowany, jak prezes, to przy tworzeniu nowej remizy dodaje prezesId jako ownerId
      let personalSettings, isPrezesOSPLogged = ctx.options.authorizedRoles.prezesOSP,
        prezesId = ctx.options.accessToken.userId;

      if (isPrezesOSPLogged) {
        personalSettings = {
          ownerId: prezesId
        }
      }

      ctx.instance.updateAttributes(personalSettings).then(function (model) {
        console.log("success");
        return model;

      }).catch(function (err) {
        console.error(">>> ERR :: error when creating fire stations", err);
        //return err;
        return next(err);
      });

    }
    return next();

  });


  // --------------------------- METHODS ---------------------------

  /**
   * Wyszukiwanie remizy i wozu strażackiego po ID, dodawanie do wozu nowego sprzętu
   *
   * @param {string} id - fire stations id
   * @param {string} fk - fire trucks foreign key
   * @param {object} data - body model
   * @param callback
   */
  Firestations.addFireTruckEquipments = function (id, fk, data, req, callback) {

    Firestations.findById(id, FireStations, function (findErr, FireStationsNode) {

      FireStationsNode.fireTrucks.findById(fk, FireStations, function (err, FireTrucksNode) {

        const equipment = FireTrucksNode.fireTruckEquipments();
        equipment.push(data);

        return FireStationsNode.save().then(saved => {
          //console.log("saved results", saved);
          callback(null, {status: true, saved})
        }).catch(err => {
          console.error(err);
          return err;
        })

      });

    });

  };

  /**
   * Usuwanie sprzętu z wozu strażackiego poprzez ID
   *
   * @param {string} id - fireStationsID
   * @param {string} fk - fireTrucksID
   * @param {string} fireTruckEquipmentsFK
   * @param req
   * @param callback
   */
  Firestations.deleteFireTruckEquipments = function (id, fk, fireTruckEquipmentsFK, callback) {

    Firestations.findById(id, FireStations, function (err, FireStationsNode) {

      if (FireStationsNode !== null) {
        FireStationsNode.fireTrucks.findById(fk, Firestations, function (err, FireTrucksNode) {

          if (FireTrucksNode !== null) {
            const equipments = FireTrucksNode.fireTruckEquipments();
            //console.log(equipments);

            equipments.forEach((equipment, index) => {
              console.log(index, equipment.id);

              if (equipment.id === fireTruckEquipmentsFK) {
                equipments.splice(index, 1);

                console.log(equipment);

                return FireStationsNode.save().then(removed => {
                  console.log("equipment removed", removed);
                  callback(null, {status: true, removed});
                })
              } else {
                console.error(">>> ERR :: FireTruckEquipments ");
                callback(null, {status: false, error: ">>> ERR :: Couldn't found FireTruckEquipments with that id"});
              }

            })
          } else {
            console.error(">>> ERR :: FireTrucks ");
            callback(null, {status: false, error: ">>> ERR :: Couldn't found FireTrucks with that fk"});
          }

        })
      } else {
        console.error(">>> ERR :: FireStations ");
        callback(null, {status: false, error: ">>> ERR :: Couldn't found FireStations with that id"});
      }

    })

  };

// --------------------------- REMOTE DEFINITIONS ---------------------------

  /**
   *
   * Dodawanie nowego sprzętu<fireTruckEquipments> dla wozu strażackiego<fireTrucks>
   */
  Firestations.remoteMethod("addFireTruckEquipments", {
    http: {path: "/:id/fireTrucks/:fk/fireTruckEquipments", verb: "post"},
    accepts: [
      {arg: "id", required: true, type: "string", source: "path", description: "fire stations id"},
      {arg: "fk", required: true, type: "string", source: "path", description: "klucz obcy dla fire trucks"},
      {arg: "data", type: "object", http: {source: "body"}}, {arg: "req", type: "object", http: {source: "req"}}
    ],
    returns: [{arg: "data", type: "any", description: "FireTruckEquipment added succesfull", root: true}],
    description: "Tworzy nową instancję w elemencie FireTruckEquipments tego modelu."
  });

  Firestations.remoteMethod("deleteFireTruckEquipments", {
    http: {path: "/:id/fireTrucks/:fk/fireTruckEquipments/:fireTruckEquipmentsFK", verb: "del"},
    accepts: [
      {arg: "id", required: true, type: "string", source: "path", description: "fire stations id"},
      {arg: "fk", required: true, type: "string", source: "path", description: "klucz obcy dla fire trucks"},
      {
        arg: "fireTruckEquipmentsFK",
        required: true,
        type: "string",
        source: "path",
        description: "klucz obcy dla fire truck equipments"
      }
    ],
    returns: [{arg: "data", type: "any", description: "FireTruckEquipment removed succesfull", root: true}],
    description: "Usuwa instancję w elemencie FireTruckEquipments tego modelu."
  });

};
