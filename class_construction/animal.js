class Animal{

    constructor(name){
        this.name = name ;
    }

    sayHello(){
        console.log('Name is :'+ this.name);
    }
}

module.exports = Animal;