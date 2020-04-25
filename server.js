"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var cors_1 = __importDefault(require("cors"));
var next_1 = __importDefault(require("next"));
var pusher_1 = __importDefault(require("pusher"));
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
// @ts-ignore
var sentiment_1 = __importDefault(require("sentiment"));
var dotenv = require('dotenv').config();
var dev = process.env.NODE_ENV !== 'production';
var port = parseInt(process.env.PORT) || 3000;
var app = next_1["default"]({ dev: dev });
var handler = app.getRequestHandler();
var sentiment = new sentiment_1["default"]();
var pusher = new pusher_1["default"]({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    useTLS: true
});
app
    .prepare()
    .then(function () {
    var server = express_1["default"]();
    // @ts-ignore
    server.use(cors_1["default"]());
    server.use(body_parser_1["default"].json());
    server.use(body_parser_1["default"].urlencoded({ extended: true }));
    server.get('*', function (req, res) {
        return handler(req, res);
    });
    server.listen(3000, function (err) {
        if (err)
            throw err;
        console.log("> Ready on http://localhost:" + port);
    });
})["catch"](function (ex) {
    console.error(ex.stack);
    process.exit(1);
});
