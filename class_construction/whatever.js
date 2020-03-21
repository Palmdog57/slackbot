const api_response = require('./response_codes');
const Response = new api_response();

console.log(Response.codes.TEAPOT, Response.msg.TEAPOT);
Response.trace("They took our jooooobs");