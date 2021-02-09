"use strict";
var IntegrifyLambda = require ('../index')



let config = {
    inputs: [{key:"name", type:"string", min:0, max:10},
        {key:"targetDate", type:"date", required:true},
        {key:"birthday", type:"date", required:true}
    ],
    outputs: [{key:"name", type:"string", min:0, max:10},
        {key:"age", type:"numeric"},
        {key:"ageAtTargetYear", type:"numeric"},
        {key:"daysLived", type:"numeric"},
        {key:"message", type: "string"}
    ],
    execute: function(event, context, callback){
        var returnVals = {};
        try {
            let age = _calculateAge(new Date(event.inputs.birthday));
            returnVals.age = age;
            let daysLived = age * 365;
            returnVals.daysLived = daysLived;
            let ageAtTargetYear = _calculateAge(new Date(event.inputs.birthday), new Date(event.inputs.targetDate));
            returnVals.ageAtTargetYear = ageAtTargetYear;
            let message  = `Hi ${event.inputs.name}. You are ${age} years old. You have lived ${daysLived} days. You will be ${ageAtTargetYear} on ${new Date(event.inputs.targetDate)}.`
            returnVals.message = message;
            setTimeout(function(){
                "use strict";
                callback(null, returnVals);
            },1000)


        } catch(e){
            return callback('birthday and targetDate are required and must be a valid date.');
        }
    }
}

let _calculateAge = function _calculateAge(birthday, target) {
    // birthday is a date. target is a date, is optional and defaults to today
    var endDate = target ? target : Date.now();
    var ageDifMs = endDate - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}


let integrifyLambda = new IntegrifyLambda(config)

exports.handler = integrifyLambda.handler;




////test run code below - comment out before uploading to AWS
// let event = { "operation": "runtime.execute",
//     "inputs": {
//         "name": "Rich",
//         "birthday": "1968-02-07",
//         "targetDate": "2025-01-01" }
// }
// integrifyLambda.handler(event, null, function(err,result){
//     console.log(err || result)
// })
