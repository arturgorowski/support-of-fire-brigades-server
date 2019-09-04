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


    // --------------------------- OBSERVERS ---------------------------

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


    // --------------------------- METHODS ---------------------------

    /**
     *
     * @param {string} id - fire stations id
     * @param {string} fk - fire trucks foreign key
     * @param {object} data - data object
     * @param {Function(Error)} callback
     */
    Firestations.addFireTruckEquipments = function (id, fk, data, req,callback) {
        

        //Firestations.updateAll({'_id': id}, {data})
        Firestations.findById(id).then(station =>{

                if (station){

                    // const trucks = station.fireTrucks();
                    // const foundTruck = trucks.find(item=> item.id === fk);

                    const foundTruck = station.fireTrucks.findById(fk);

                    if (foundTruck){
                        const promise = foundTruck.fireTruckEquipments.create(data,function(err, _res) {
                            if(err){
                              console.log(err);
                            }
                            //DOES NOT INHERIT MODEL CLASS LIKE HASMANY ETC.
                            console.log(_res.itemList);
                          });
                        //equipment.push(data);    
                        
                        // return promise.then(saved=>{
                        //         console.log("saved results", saved)
                        //         callback(null,{status:true, saved})
                        //     }) 

                    }

                    // return station.save().then(saved=>{
                    //     console.log("saved results", saved)
                    //     callback(null,{status:true, saved})
                    // }) 


                } else {
                    callback(null,{status:false})
                }


        }).catch(err=>{
            console.error(">>> ERR :: addFireTruckEquipments", err)
            callback(err, null)
        })


        
    };



    // --------------------------- REMOTE DEFINITIONS ---------------------------

    /**
     *
     *
     */
    Firestations.remoteMethod("addFireTruckEquipments", {
        http: { path: "/:id/fireTrucks/:fk/fireTruckEquipments", verb: "post" },
        accepts: [
            { arg: "id", required: true, type: "string", source: "path", description: "fire stations id" },
            { arg: "fk", required: true, type: "string", source: "path", description: "klucz obcy dla fire trucks" },
            { arg: "data", type: "object", http: { source: "body" } }, { arg: "req", type: "object", http: { source: "req" } }
        ],
        returns: [{ arg: "data", type: "any", description: "FireTruckEquipment added succesfull", root: true }],
        description: "Tworzy nową instancję w elemencie FireTruckEquipments tego modelu."
    });

};
