// This file includes parameters for all code.
// Constants

var config = module.exports = {};

config.DB_INIC = "monet";
config.DB_SERVER = "internuvem";

//config.MONGO_URL = "mongodb://172.16.1.94:27017";
//config.MONGO_URL = "mongodb://\"appCenso\":\"appCenso\"@200.144.244.241:27017";
config.MONGO_URL = "mongodb://censoApp:censoApp@200.144.244.241:27017";
config.MONGO_IP = "200.144.244.241";
config.MONGO_PORT = "27017";
config.MONGO_APP_USR = "censoApp";
config.MONGO_AUTH_DB = "admin";
config.MONGO_URL_AUTH_DB = "?authSource=" + config.MONGO_AUTH_DB;

config.MONGO_DB_GERAL = "tGeral";
config.MONGO_DB_APP_CENSO = "appCenso";

config.MONET_DB_HOST = "200.144.244.241";
config.MONET_DB_PORT = 50000;
config.MONET_DB_USER = "monetdb";
//config.MONET_DB_PASSWD = "monetdb";
//config.MONET_DB_OUTPUT_FOLDER = '/home/breno/meanprojects/censoappmdb/output/';
//config.MONET_DB_OUTPUT_FOLDER = '/home/ubuntu/meanprojects/censoappmdb/output/';
config.MONET_DB_OUTPUT_FOLDER = '/datacem/output/';
