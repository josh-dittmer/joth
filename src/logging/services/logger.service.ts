import { Injectable, LoggerService } from '@nestjs/common';
import { LOG_LEVEL } from '../../lib/common/values.js';

const MainPrefix = '[HC]';

type LogLevelT = {
    prefix: string;
    color: string;
};

const LogLevel: Record<string, LogLevelT> = {
    normal: { prefix: '[LOG]', color: '37' },
    fatal: { prefix: '[FATAL]', color: '91' },
    error: { prefix: '[ERROR]', color: '31' },
    warning: { prefix: '[WARN]', color: '33' },
    debug: { prefix: '[DEBUG]', color: '90' },
    verbose: { prefix: '[VERBOSE]', color: '90' },
};

@Injectable()
export class JothLogger implements LoggerService {
    private level: number;

    constructor(level: number) {
        this.level = level;
    }

    log(message: any, context?: string) {
        if (this.level >= 1) this.print(LogLevel.normal, message, context);
    }

    fatal(message: any, context?: string) {
        if (this.level >= 0) this.print(LogLevel.fatal, message, context);
    }

    error(message: any, stack?: string, context?: string) {
        if (this.level >= 1) this.print(LogLevel.error, message, context);
    }

    warn(message: any, context?: string) {
        if (this.level >= 1) this.print(LogLevel.warning, message, context);
    }

    debug(message: any, context?: string) {
        if (this.level >= 2) this.print(LogLevel.debug, message, context);
    }

    verbose(message: any, context?: string) {
        if (this.level >= 3) this.print(LogLevel.verbose, message, context);
    }

    print(logLevel: LogLevelT, message: any, context?: string) {
        if (context && context.length > 11) {
            context = context.substring(0, 11) + '...';
        }

        const spaces1 = ' '.repeat(10 - logLevel.prefix.length);
        const spaces2 = context ? ' '.repeat(15 - context.length) : '';

        console.log(
            `\x1b[${logLevel.color}m${MainPrefix} ${this.getTimestamp()} ${logLevel.prefix}${spaces1}[${context}]${spaces2}${message}\x1b[0m`,
        );
    }

    getTimestamp() {
        const d = new Date();

        const mdy = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

        let hours = d.getHours();
        const s = hours < 12 ? 'AM' : 'PM';

        if (hours === 0) hours = 12;
        else if (hours > 12) hours -= 12;

        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return `${mdy} ${hours}:${minutes}:${seconds} ${s}`;
    }

    static register() {
        let level = 0;

        switch (LOG_LEVEL) {
            case 'NORMAL':
                level = 1;
                break;
            case 'DEBUG':
                level = 2;
                break;
            case 'VERBOSE':
                level = 3;
                break;
        }

        return {
            provide: JothLogger,
            useFactory: () => new JothLogger(level),
        };
    }
}
