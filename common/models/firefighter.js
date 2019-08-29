module.exports = function(Firefighter) {

    'use strict';

    const app = require("../../server/server");
    const path = require("path");
    //const ObjectID = app.dataSources.mongo.ObjectID;

    /**
     * 
     * create user role
     */
    Firefighter.observe("after save", function (ctx, next){

        //if new user we have to create roles
        if(ctx.isNewInstance){

            let roleName = "", promises = [];
            let Role = app.models.Role;
            let RoleMapping = app.models.RoleMapping;

            // PrezesOSP registration process
            if(ctx.instance.code){

                roleName = "prezesOSP";


            }
        }
    })

};
