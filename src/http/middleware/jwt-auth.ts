import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../../env'

declare global {
    namespace Express {
        interface Request {
            userId?: string
        }
    }
}

interface TokenPayload {
    sub: string
}

export function jwtAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
        return res.status(401).json({ 
            message: 'Token de acesso requerido' 
        })
    }
    
    // expected format: "Bearer jwt-token-here"
    const [, token] = authHeader.split(' ')
    
    if (!token) {
        return res.status(401).json({ 
            message: 'Token de acesso malformado' 
        })
    }
    
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload
        
        req.userId = decoded.sub
        next()
    } catch (error) {
        return res.status(401).json({ 
            message: 'Token de acesso inválido' 
        })
    }
}

// Authentication function for tsoa
export async function expressAuthentication(
    request: Request,
    securityName: string,
    scopes?: string[]
): Promise<any> {
    if (securityName === 'jwt') {
        const authHeader = request.headers.authorization
        
        if (!authHeader) {
            throw new Error('Token de acesso requerido')
        }
        
        const [, token] = authHeader.split(' ')
        
        if (!token) {
            throw new Error('Token de acesso malformado')
        }
        
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload
            request.userId = decoded.sub
            return decoded
        } catch (error) {
            throw new Error('Token de acesso inválido')
        }
    }
}