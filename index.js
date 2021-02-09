var integrifyLambda = require('integrify-aws-lambda');
var request = require("request");
var fetch = require('node-fetch');


var config = {
    helpUrl: "http://www.integrify.com",
    inputs: [
        {key:"_requestId", type:"string"},
        {key:"_name", type:"string"},
        {key:"_body", type:"string"},
        {Key:"_decision", type:"string"}],
    outputs:[
        {key:"successMessage", type:"string"},
        {key:"RequestId", type:"string"},
        {key:"Result", type:"string"},
        {key:"body", type:"string"}]
        
  };

console.log("Got Here");

const exec = (event, context, callback) => {
    
    let process_id = process.env.process_id
    let username = process.env.username
    let integrifyServiceUrl = event.integrifyServiceUrl;
    let accessToken = event.accessToken;
    let body = event.inputs._body
    
    console.log(`The Event: ${event}`);
    console.log(`Access Token: ${accessToken}`);
    console.log(`Service URL: ${integrifyServiceUrl}`);

    const impersonatedToken = impersonateUser();
    
    const parseChoice = parseApprovalChoice(body);

    console.log(`Parsed Approval Choice: ${parseChoice}`);

    let processDetails = getProcess();
    console.log(`Process Details: ${processDetails}`)

    // const approvalTaskStatus = completeApprovalTask(parseChoice);
    
    let awsId = context.awsRequestId
    console.log(`AWS REQUEST ID: ${awsId}`)
    
    return callback(null,{"successMessage": "Request Succeeded", "RequestId": awsId, "body": body, "Result": processDetails});
    };

    const parseApprovalChoice = (body) => {
        console.log(`BodyText: ${body}`)
        let responseArray = body.split("\n");
        console.log(`Response Array: ${responseArray}`);
        let approvalChoice = responseArray[0];
        // console.log(`Approval Choice: ${approvalChoice}`);
        return approvalChoice
    }
    

const impersonateUser = () => {

    var request = require('request');
    var options = {
        'method': 'GET',
        'url': 'https://services7.integrify.com/access/impersonate?key=services_api&user=ebonertz',
        'headers': {
            'Cookie': 'AWSALB=SF2LnldVUql8gSVj3OwbsUqc1t6KiszJL4MgXsKW22gRcKjolbmwz5SY9iBjTPGAzCaXwRpPJI53wsL4u9/zask4JVE08NsNIbUhdc8CSjPvOuxmes0J4Dbsyyp4; AWSALBCORS=SF2LnldVUql8gSVj3OwbsUqc1t6KiszJL4MgXsKW22gRcKjolbmwz5SY9iBjTPGAzCaXwRpPJI53wsL4u9/zask4JVE08NsNIbUhdc8CSjPvOuxmes0J4Dbsyyp4'
        }
    };
    request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    let token = response.body.token
    return token;
    });

}

const getProcess = async () => {
        
    var requestOptions = {
      method: 'GET',
      headers: {
        'Authorization': '<token>',
        'Content-Type': 'application/json'
      }
    };

    try {
        const response = await fetch("https://services7.integrify.com/process/44755099-73aa-42ab-83ed-90628fc4d8ad", requestOptions)
        console.log(response);

        // const process = await response.json();
        return response;

      } catch (error) {
        console.log('error', error);
    }
};  
    
//     const completeApprovalTask = (parseChoice) => {
//     console.log(parseChoice);

//     var options = {
//         'method': 'POST',
//         'url': 'https://services7.integrify.com/tasktypes/approval/94975a8a-eeec-476d-bada-be784cc9d82a',
//         'headers': {
//             'Authorization': 'Bearer 7518bc65ea1e458face32ea089c4d8b3',
//             'Content-Type': 'application/json'
//         },
//         'body': JSON.stringify({ "Approval": parseChoice, "Comments": "These are some comments" })
//     };

//      request(options, function (error, response) {
//         if (error) {
//             throw new Error(error);
//         } else {
//             let approvalTaskResponse = await response.body;
//             console.log(`Response: ${approvalTaskResponse}`);
//             return approvalTaskResponse;
//         }
//     });
// }
    
  
    


config.execute = exec;

let customFunction = new integrifyLambda(config);

exports.handler = customFunction.handler;
