module.exports = function (Firefighter) {

  'use strict';

  const app = require("../../server/server");
  //const ObjectID = app.dataSources.mongo.ObjectID;


  // --------------------------- OBSERVERS ---------------------------
  /**
   *
   *  create user role
   *
   */
  Firefighter.observe("after save", function (ctx, next) {

    // if new user we have to create roles
    if (ctx.isNewInstance) {

      let roleName = "";
      let Role = app.models.Role;
      let RoleMapping = app.models.RoleMapping;

      // TODO sprawdzenie kto jest zalogowany, jak prezes, to przy tworzeniu nowych uzytkowników dodaje userów z ROLĄ strazak
      let personalSettings, isPrezesOSPLogged = ctx.options.authorizedRoles.prezesOSP;

      if (isPrezesOSPLogged) {

        roleName = "strazak";
        personalSettings = {
          role: roleName,
          emailVerified: false
        };

      } else {

        roleName = "prezesOSP";
        personalSettings = {
          role: roleName,
          emailVerified: false
        };

      }

      ctx.instance.updateAttributes(personalSettings).then(function (model) {

        return model;

      }).catch(function (err) {
        // ...
        console.error(">>> ERR :: error when registering user", err);
        return err;
      });

      // --------------------------- CREATE ROLES ---------------------------

      Role.findOrCreate({
        where: {name: roleName}
      }, {
        name: roleName
      }, function (err, role) {
        if (!err) {
          role.principals.create({
            principalType: RoleMapping.USER,
            principalId: ctx.instance.id.toString()
          }, function (err, principal) {
            if (err) console.error(">>> ERR :: CREATE ROLE MAPPING", err, roleName);
          });

          return next();
        } else {
          console.error(">>> ERR :: CREATE ROLE ", err, roleName);
          return next(err);
        }
      });

    } else {
      return next();
    }
  });


  // --------------------------- METHODS ---------------------------

  /**
   * Wyszukiwanie strażaków należących do remizy o konkretnym id
   *
   * @param {string} id - fireStationId
   * @params req
   * @params callback
   */
  Firefighter.searchFirefighters = function (id, callback) {

    // TODO zamienic stroing na ObjectId i wyszukac go w bazie, nastepnie zwrocic
    // let fireStationId =
    //query the database for a single matching fireStation
    Firefighter.find({where: {id: id}}, function (err, firefighters) {
      console.log()

      //return only the location property of the dog
      //callback(null, firefighters);

    });
  };


  // --------------------------- REMOTE DEFINITIONS ---------------------------

  /**
   *
   * Wyszukiwanie strażaków należących do tej samej jednostki OSP
   */
  Firefighter.remoteMethod("searchFirefighters", {
    http: {path: "/fireStation/:id", verb: "get"},
    accepts: [
      {arg: "id", required: true, type: "string", source: "path", description: "fireStationId"}
    ],
    returns: [{arg: "data", type: "any", description: "Firefighters from the same OSP", root: true}],
    description: "Zwraca strażaków z tej samej jednostki."
  });


};
