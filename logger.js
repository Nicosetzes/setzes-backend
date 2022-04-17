const log4js = require("log4js");
require("dotenv").config;

log4js.configure({
  appenders: {
    console: { type: "console" },
    warnDebug: { type: "file", filename: "warn.log" },
    errorDebug: { type: "file", filename: "error.log" },
    loggerConsole: {
      type: "logLevelFilter",
      appender: "console",
      level: "info",
    },
    loggerWarnDebug: {
      type: "logLevelFilter",
      appender: "warnDebug",
      level: "warn",
    },
    loggerErrorDebug: {
      type: "logLevelFilter",
      appender: "errorDebug",
      level: "error",
    },
  },
  categories: {
    default: {
      appenders: ["loggerConsole"],
      level: "all",
    },
    prod: {
      appenders: ["loggerConsole", "loggerWarnDebug", "loggerErrorDebug"],
      level: "all",
    },
  },
});

let logger = null;

if ((process.env.NODE_ENV = "PROD")) {
  //Si no le pongo un solo "=", no funciona!
  logger = log4js.getLogger("prod");
} else {
  logger = log4js.getLogger();
}

module.exports = logger;
