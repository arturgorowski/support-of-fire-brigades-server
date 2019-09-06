'use strict';

module.exports = function (Locationhistory) {

  const app = require('../../server/server');

  /**
   *
   * Automatyczne dodawanie firefighterId i czasu
   */
  Locationhistory.beforeRemote("create", function (ctx, modelInstance, next) {

    let userId = ctx.req.accessToken.userId;
    let timestamp = new Date().getTime();
    console.log("current user>>>>>>", userId);
    console.log("time>>>>>>", timestamp, ctx.args.data);

    ctx.args.data = Object.assign(ctx.args.data, {
      firefighterId: userId,
      time: timestamp
    });

    return next();
  });

  /**
   *
   * Dołączanie obecnej lokalizacji do strażaka
   */
  Locationhistory.afterRemote("create", function (ctx, modelInstance, next) {

    const Firefighter = app.models.Firefighter;
    let userId = ctx.req.accessToken.userId;

    Firefighter.updateAll({id: userId}, {lastLocation: [ctx.args.data.location]});

    return next();
  });


  // --------------------------- METHODS ---------------------------

  /**
   * Zwraca lokalizację strażaków z tej samej jednostki
   *
   * @params id - fireStationId
   * @params req
   * @params callback
   */
  // Locationhistory.getFirefightersLocalization = function (id, req, callback) {
  //
  // };


  // --------------------------- REMOTE DEFINITIONS ---------------------------

  /**
   *
   *Zwraca lokalizację strażaków z tej samej jednostki
   */
  // Locationhistory.remoteMethod("getFirefightersLocalization", {
  //   http: {path: "/:id", verb: "get"},
  //   accepts: [
  //     {arg: "id", required: true, type: "string", source: "path", description: "fireStationId"}
  //   ],
  //   returns: [{arg: "data", type: "any", description: "FireTruckEquipment added succesfull", root: true}],
  //   description: "Zwraca lokalizację strażaków z tej samej jednostki."
  // });

};
