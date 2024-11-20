import { DateDuration } from "@jmondi/date-duration";
import { User } from "@prisma/client";
import { Response } from "express";
import { JothJwtService } from "../app/oauth/services/jwt_service.js";

export async function createSessionCookie(user: User, jwt: JothJwtService, res: Response) {
    const expiresAt = new DateDuration(`${process.env.SESSION_LIFETIME}s`);

    const token = await jwt.sign({
        userId: user.id,
        email: user.email,

        iat: Math.floor(Date.now() / 1000),
        exp: expiresAt.endTimeSeconds,
    });

    res.cookie('jid', token, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        expires: expiresAt.endDate,
    });
}