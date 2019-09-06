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


};
