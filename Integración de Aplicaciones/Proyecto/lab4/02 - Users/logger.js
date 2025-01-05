const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
    winston.format.printf(({ timestamp, message }) => {
      return `[${timestamp}] ${message}`;
    })
  ),
  transports: [
    // Transmisión a la consola
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
            winston.format.printf(({ message }) => {
              return `${message}`;
            })
          ),
    }),
    // Transmisión a un archivo (por ejemplo, 'logs/app.log')
    new winston.transports.File({ filename: 'logs/Users.log', 
        format: winston.format.combine(
            winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
            winston.format.printf(({ timestamp, message }) => {
              return `[${timestamp}] ${message.replace(/\x1b\[[0-9;]*m/g, '')}`;
            })
          ),
    })
    
  ],
});

// Exportar el logger para usarlo en otras partes del proyecto
module.exports = logger;