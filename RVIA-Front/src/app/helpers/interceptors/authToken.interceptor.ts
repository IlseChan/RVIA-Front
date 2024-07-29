import { HttpHandlerFn, HttpRequest } from "@angular/common/http";

const regexApps = /\/applications|\/applications\/\d+|\/applications\/git/;
const methodsApps = ['GET','PATCH','POST'];
const checkRegex = (url: string): boolean => {
    return regexApps.test(url);
}

const regexUsers = /\/auth\/\d+|\/auth/;
const methodsUsers = ['GET','PATCH','DELETE'];
const checkRegexUsers = (url: string): boolean => {
    return regexUsers.test(url);
} 

const regexDown = /\/applications\/zip\/\d+/;
const checkRegexDown = (url: string): boolean => {
    return regexDown.test(url);
}

export const AuthInterceptor = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {       
    const token = localStorage.getItem('token') || null;
    
    try{
        const url = request.url;
        const method = request.method;
        
        if((url.includes('/auth/login') || url.includes('/auth/register') && method === 'POST')){
            return next(request);
        }
        
        //TODO revisar si es es para descargar pero que este en sesion (token y usuario)
        if((checkRegexDown(url) && token) && method === 'GET'){
            return next(request);
        }
        
        const newReq = request.clone({
            headers: request.headers.set('Authorization',`Bearer ${token}`)
        })

        //TODO Revisar si token y usuario para subir file zip
        if((token) && url.includes('applications/files') && method === 'POST'){
            return next(newReq);
        }

        newReq.headers.set( 'Content-Type','application/json');

        //TODO Revisar si token y usuario para aplicaciones
        if((token) && checkRegex(url) && methodsApps.includes(method)){
            return next(newReq);
        }

        //TODO Revisar si token y usuario y admin para usuarios
        if((token) && checkRegexUsers(url) && methodsUsers.includes(method)){
            return next(newReq);    
        }
        
        return next(request);
    } catch(e){
        return next(request);
    }
}