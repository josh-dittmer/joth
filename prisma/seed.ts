import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

void (async function () {
    const passwordHash = await bcryptjs.hash('1234', 10);

    const testId = 'dd74961a-c348-4471-98a5-19fc3c5b5079';
    const test = await prisma.user.upsert({
        where: { id: testId },
        update: { 
            id: testId,
            email: 'test@example.com',
            createdIP: '127.0.0.1',
            passwordHash, },
        create: {
            id: testId,
            email: 'test@example.com',
            createdIP: '127.0.0.1',
            passwordHash,
        },
    });

    const clientId = '07e16139-fa29-4aae-836f-d6eb458b0706';

    const client = await prisma.oAuthClient.upsert({
        where: { id: clientId },
        update: {
            id: clientId,
            name: 'Test Client',
            secret: null,
            allowedGrants: ['authorization_code', 'client_credentials', 'refresh_token'],
            redirectUris: ['http://localhost:3000/callback'],
        },
        create: {
            id: clientId,
            name: 'Test Client',
            secret: null,
            allowedGrants: ['authorization_code', 'client_credentials', 'refresh_token'],
            redirectUris: ['http://localhost:3000/callback'],
        },
    });

    const scopeId = 'c3d49dba-53c8-4d08-970f-9c567414732e';
    const scope = await prisma.oAuthScope.upsert({
        where: { id: scopeId },
        update: {
            id: scopeId,
            name: 'read',
        },
        create: {
            id: scopeId,
            name: 'read',
        },
    });

    const scopeId2 = '22861a6c-dd8d-47b3-be1f-a3e7b67943bc';
    const scope2 = await prisma.oAuthScope.upsert({
        where: { id: scopeId2 },
        update: {
            id: scopeId2,
            name: 'write',
        },
        create: {
            id: scopeId2,
            name: 'write',
        },
    });
})();
