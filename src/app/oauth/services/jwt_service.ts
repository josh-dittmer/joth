import { ExtraAccessTokenFieldArgs, JwtService } from '@jmondi/oauth2-server';
import { Injectable } from '@nestjs/common';
import fs from 'fs';
import jwt, { VerifyOptions } from 'jsonwebtoken';

// todo: implement asymmetric encryption

@Injectable()
export class JothJwtService extends JwtService {
    private privateKey: Buffer;
    private publicKey: Buffer;

    constructor(privateKeyPath: string, publicKeyPath: string) {
        super('');

        this.privateKey = fs.readFileSync(privateKeyPath);
        this.publicKey = fs.readFileSync(publicKeyPath);
    }

    verify(token: string, options?: VerifyOptions): Promise<Record<string, unknown>> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.publicKey, { algorithms: ['RS256'] }, (err, decoded: any) => {
                if (decoded) {
                    resolve(decoded);
                } else {
                    reject(err);
                }
            });
        });
    }

    sign(payload: string | Buffer | Record<string, unknown>): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, this.privateKey, { algorithm: 'RS256' }, (err, encoded) => {
                if (encoded) {
                    resolve(encoded);
                } else {
                    reject(err);
                }
            });
        });
    }

    extraTokenFields({ user, client }: ExtraAccessTokenFieldArgs) {
        return {
            email: user?.email,
            client: client.name,
        };
    }

    static register(privateKeyPath: string, publicKeyPath: string) {
        return {
            provide: JothJwtService,
            useFactory: () => new JothJwtService(privateKeyPath, publicKeyPath),
        };
    }
}
