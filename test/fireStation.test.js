const superagent = require('superagent');

describe('/fireStations', function () {

    var server = require('../server/server');
    var request = require('supertest')(server);
    let domain = "http://localhost:3000/api/fireStations";
    var FireStations

    before(function () {
        FireStations = server.models.fireStations
    });

    beforeEach(function (done) {
        FireStations.upsert({ name: 'OSP OPS' }, function () { done() });
    });

    it('Post a new fireStations', function (done) {
        request
            .post("/api/fireStations")
            .send({ name: 'OSP OPS' })
            .expect(200, done)
    });

    it('Post a new interventions', function (done) {
        request
            .post("/api/interventions")
            .send({ type: 'pożar' })
            .expect(200, done)
    });
});