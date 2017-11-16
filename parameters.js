// This file includes parameters for all code.
// Constants

/**
 * Password file (psw.js) is included here, and is not uploaded in Github.
 * User must create one and store it in root directory of app
 * Content of passwd file (pwd.js):
 * ------------------------------------
 * var config = module.exports = {};
 * config.MONGO_APP_PASSWD = <mongo app query passwd>;
 * config.MONGO_APP_W_PASSWD = <mongo app writer passwd>;
 * config.MONET_DB_PASSWD = <monet passwd>;
 * ------------------------------------
 */
var cfg = require ('./psw.js');

var config = module.exports = {};

//config.APP_MODE = "prod"
config.APP_MODE = "debug"
config.DB_INIC = "monet";
config.DB_SERVER = "internuvem";
//config.DB_SERVER = "local";

//config.APP_IP = "200.144.244.241";
config.APP_IP = "localhost";
config.APP_PORT = "3003";

//config.MONGO_IP = "localhost";
config.MONGO_IP = "172.16.1.94";
//config.MONGO_IP = "200.144.244.241";

config.MONGO_PORT = "27017";

config.MONGO_AUTH_DB = "admin";

if (config.MONGO_IP == "200.144.244.241") {
    config.MONGO_APP_USR = "censoApp";
    config.MONGO_APP_W_USR = "censoAppW";
    config.MONGO_APP_PASSWD = ":" + cfg.MONGO_APP_PASSWD;
    config.MONGO_APP_W_PASSWD = ":" + cfg.MONGO_APP_W_PASSWD;
    config.MONGO_URL_AUTH_DB = "?authSource=" + config.MONGO_AUTH_DB;
} else {
    config.MONGO_APP_USR = "";
    config.MONGO_APP_W_USR = "";
    config.MONGO_APP_PASSWD = ""
    config.MONGO_APP_W_PASSWD = "";
    config.MONGO_URL_AUTH_DB = "";
}

config.MONGO_URL = "mongodb://" + config.MONGO_APP_USR + config.MONGO_APP_PASSWD + "@" + config.MONGO_IP + ":" + config.MONGO_PORT;
config.MONGO_URL_W = "mongodb://" + config.MONGO_APP_W_USR + config.MONGO_APP_W_PASSWD + "@" + config.MONGO_IP + ":" + config.MONGO_PORT;


config.MONGO_DB_GERAL = "tGeral";
config.MONGO_DB_THEMES = "tThemes";
config.MONGO_DB_QUEUE = "tQueue";
config.MONGO_DB_APP_CENSO = "appCenso";

config.MONET_DB_HOST = "200.144.244.241";
//config.MONET_DB_HOST = "172.16.1.94";
config.MONET_DB_PORT = 50000;
config.MONET_DB_NAME = "censodb";
config.MONET_DB_USER = "monetdb";
config.MONET_DB_PASSWD = cfg.MONET_DB_PASSWD;

//config.MONET_DB_OUTPUT_FOLDER = '/home/breno/meanprojects/censoappmdb/output/';
//config.MONET_DB_OUTPUT_FOLDER = '/home/ubuntu/meanprojects/censoappmdb/output/';
config.MONET_DB_OUTPUT_FOLDER = '/datacem/output/';
//config.MONET_DB_OUTPUT_FOLDER = '/home/breno/censoProject/output/';

config.QUEUE_CHECK_INTERVAL_SECONDS = 3
config.MAX_CONCURRENT_PROCCESS = 2
