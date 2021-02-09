"use strict";
var IntegrifyLambda = require("../index.js");
var expect = require("expect")

let _calculateAge = function _calculateAge(birthday, target) {
    // birthday is a date. target is a date, is optional and defaults to today
    var endDate = target ? target : Date.now();
    var ageDifMs = endDate - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

var config = {
    inputs: [{key:"name", type:"string", min:0, max:10},
        {key:"targetDate", type:"date", required:true},
        {key:"birthday", type:"date", required:true}
    ],
    outputs: [{key:"name", type:"string", min:0, max:10},
        {key:"age", type:"int"},
        {key:"ageAtTargetYear", type:"numeric"},
        {key:"daysLived", type:"numeric"},
        {key:"message", type: "string"}
    ],
    icon: "https://daily.integrify.com/integrify/resources/css/taskshapes/counter.svg",
    helpUrl: "http://www.integrify.com",
    execute: function(event, context, callback){
        var returnVals = {};
        try {
            let _age = _calculateAge(new Date(event.inputs.birthday));
            returnVals.age = _age;
            let _daysLived = _age * 365;
            returnVals.daysLived = _daysLived;
            let _ageAtTargetYear = _calculateAge(new Date(event.inputs.birthday), new Date(event.inputs.targetDate));
            returnVals.ageAtTargetYear = _ageAtTargetYear;
            let _message  = `Hi ${event.inputs.name}. You are ${_age} years old. You have lived ${_daysLived} days. You will be ${_ageAtTargetYear} on ${new Date(event.inputs.targetDate)}.`
            returnVals.message = _message;
            setTimeout(function(){
                "use strict";
                callback(null, returnVals);
            },1000)


        } catch(e){
            return callback('birthday and targetDate are required and must be a valid date.');
        }
    }
}

//create an instance of the IntegrifyLambda with the config
let myLambda = new IntegrifyLambda(config);

it("should return config.inputs", function() {
    var event = {"operation": "config.getInputs"}
    myLambda.handler(event, null, function(err,result){
        "use strict";
        //console.log(result)
        expect(result.length).toBeGreaterThan(0);

    })

});

it("should return config.getHelp", function() {
    var event = {"operation": "config.getHelpUrl"}
    myLambda.handler(event, null, function(err,result){
        "use strict";
        //console.log(result)
        expect(result.length).toBeGreaterThan(0);

    })

});


it("should return config.outputs", function() {
    var event = {"operation": "config.getOutputs"}
    myLambda.handler(event, null, function(err,result){
        "use strict";
        //console.log(result)
        expect(result.length).toBeGreaterThan(0);

    })

});

it("should return config.icon", function() {
    var event = {"operation": "config.getIcon"}
    myLambda.handler(event, null, function(err,result){
        "use strict";
        console.log(result)

        expect(result.indexOf(".svg")).toBeGreaterThan(0);

    })

});

it("should execute and return values", function(done) {
    var event = { "operation": "runtime.execute",
        "inputs": {
            "name": "Awsome Developer",
            "birthday": "1968-02-07",
            "targetDate": "2025-01-01" }
    }

    myLambda.handler(event, null, function(err,result){
        "use strict";
        //console.log(result)
        expect(result.age).toBeGreaterThan(0);
        done();

    })

});