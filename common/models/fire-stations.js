'use strict';

module.exports = function (Firestations) {

    // Firestations.beforeRemote("findById", function (ctx, instance, next) {

    //     //@todo check logged user access

    //     const user = ctx.req.accessToken.user();

    //     Firestations.findOne({ where: { id: ctx.args.id, "firefighters.email" : user.email} }).then(hasAccess=>{

    //        if (hasAccess)     {
    //            return next();
    //        } else {
    //            return next(new Error("USER_HAS_NO_ACCESS"));
    //        }

    //     })

    // })

    Firestations.observe("after save", function (ctx, next) {

        if (ctx.isNewInstance) {

            //sprawdzenie kto jest zalogowany, jak prezes, to przy tworzeniu nowej remizy dodaje prezesId jako ownerId
            let personalSettings, isPrezesOSPLogged = ctx.options.authorizedRoles.prezesOSP, prezesId = ctx.options.accessToken.userId

            if (isPrezesOSPLogged) {
                personalSettings = {
                    ownerId: prezesId
                }
            }

            ctx.instance.updateAttributes(personalSettings).then(function (model) {
                console.log("success")
                return model;
                
            }).catch(function (err) {
                console.error(">>> ERR :: error when creating fire stations", err);
                //return err;
                return next(err);
            });

        }
        return next();

    });

};
