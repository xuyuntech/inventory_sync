import winston from 'winston';


export default winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'log.log' }),
  ],
});
