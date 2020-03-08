const marky = function(app) {
 
    app.post('/marky', function(req, res) {
        console.log("Hey ho lets go.");
    });
}

const billie = function(billie){
    app.post('/billie', function(req, res) {
        console.log("Eilish.");
    });
}

module.exports = {
    marky,
    billie
}