var Animal = require('./animal');

var justAGuy = new Animal();
justAGuy.name = 'Cat'; // The setter will be used automatically here.
justAGuy.sayHello(); // Will output 'Hello, my name is Martin, I have ID: id_1'