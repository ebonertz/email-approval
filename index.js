var integrifyLambda = require('integrify-aws-lambda');
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

const exec = async (event, context, callback) => {
    
    let process_id = process.env.process_id
    let username = process.env.username
    let integrifyServiceUrl = event.integrifyServiceUrl;
    let accessToken = event.accessToken;
    let body = event.inputs._body
    
    console.log(`The Event: ${JSON.stringify(event)}`);
    console.log(`Access Token: ${accessToken}`);
    console.log(`Service URL: ${integrifyServiceUrl}`);
    
    try {

    
    const parseChoice = parseApprovalChoice(body);
    const approvalChoice = parseChoice[0];
    const comments = parseChoice[1];
    const parsedUsername = parseChoice[25];
    const recipTaskSid = parseChoice[26];
    
    console.log(`Parse Email Body Array: ${parseChoice}`)
    console.log(`Parsed Approval Choice: ${approvalChoice}`);
    console.log(`Comments: ${comments}`);
    console.log(`Parsed Username:${parsedUsername}`);

    let userToken = await impersonateUser(parsedUsername);
    console.log(`Impersonated Token: ${userToken}`);

    let processDetails = await getProcess(userToken);
    console.log(`Process Details: ${processDetails}`)

    const approvalTaskStatus = completeApprovalTask(approvalChoice, comments, userToken, recipTaskSid);
    console.log(`Approval Response: ${approvalTaskStatus}`)
    
    let awsId = context.awsRequestId
    console.log(`AWS REQUEST ID: ${awsId}`)
    
    return callback(null,{"successMessage": "Request Succeeded", "RequestId": awsId, "body": body, "Result": approvalTaskStatus});

    } catch (error) {
        return callback(error);
    }
};

const parseApprovalChoice = (body) => {
    console.log(`BodyText: ${body}`)
    let responseArray = body.split("\n");
    console.log(`Response Array: ${responseArray}`);
    return responseArray
}
    
const impersonateUser = async (parsedUsername) => {

    var options = {
        'method': 'GET',
        'url': "https://services7.integrify.com/access/impersonate?key=services_api&user=" + parsedUsername
    };
    
    let response =  await fetch(options.url)
    let data = await response.json();
    let token = data.token
    return token;

    };

const getProcess = async (userToken) => {
        
    var requestOptions = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + userToken,
        'Content-Type': 'application/json'
      }
    };

    try {
        const response = await fetch("https://services7.integrify.com/processes/44755099-73aa-42ab-83ed-90628fc4d8ad", requestOptions)
        console.log(response.body);
        const data = await response.json();
        const processDetails = JSON.stringify(data)

        console.log(`Data: ${processDetails}`);
        return processDetails;

      } catch (error) {
        console.log('error', error);
    }
};  
    
    const completeApprovalTask = async (approvalChoice, comments, userToken, recipTaskSid) => {
    console.log(approvalChoice);
    console.log(comments);
    console.log(userToken);
    console.log(recipTaskSid);

    let url = 'https://services7.integrify.com/tasktypes/approval/' + recipTaskSid

    let requestOptions = {
        'method': 'POST',
        'headers': {
            'Authorization': 'Bearer ' + userToken,
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify({ "Approval": approvalChoice, "Comments": comments })
    };

    try {
        const response = await fetch(url, requestOptions)
        const data = await response.json();
        const approvalResponse = JSON.stringify(data);

        console.log(`Approval Response: ${approvalResponse}`);
        return approvalResponse;

      } catch (error) {
        console.log('error', error);
    }
}
    

config.execute = exec;

let customFunction = new integrifyLambda(config);

exports.handler = customFunction.handler;

// customFunction.handler({
//     "operation": "runtime.execute",
//     "inputs": {
//         "_decision": "",
//         "_body": "Approved\nThis is a comment for you\n\nFrom: integrifyemailapproval@gmail.com <integrifyemailapproval@gmail.com>\nDate: Tuesday, February 9, 2021 at 2:40 PM\nTo: Evan Bonertz <evan.bonertz@integrify.com>\nSubject: A message from Integrify\n\nYour approval has been requested for the following:\n\nREQUEST SUMMARY\nRequest #: 1726\nRequest Type: Email Approval Test\nRequested by: Evan Bonertz\nCurrent Status: Started - 09-Feb-2021\n\nTo view the details and complete your approval for this request click the following link:\nhttps://services7.integrify.com/#/section-dashboard/recipienttask/787e6911-429b-44a9-80a3-639132cdd8e7\n\n\n\n123\n\nProcess SID:44755099-73aa-42ab-83ed-90628fc4d8ad\n\nebonertz\n84bcc7c6-9cba-4d94-8a84-0b3f97cfd877\n\n\n\n\n\n\n",
//         "_name": "Evan Bonertz",
//         "_requestId": 1727
//     },
//     "integrifyServiceUrl": "https://services7.integrify.com",
//     "accessToken": "57478415f1f34b518e87741735cdd831"
// },null, function(error,result){
//     console.log(result);
// })
