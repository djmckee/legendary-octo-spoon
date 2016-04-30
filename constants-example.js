// define function from https://stackoverflow.com/questions/8595509/how-do-you-share-constants-in-nodejs-modules
function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("PAGE_TOKEN", "");
define("APP_VERIFY", "");
define("APP_SECRET", "");
