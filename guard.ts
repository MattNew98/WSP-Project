import express from 'express';

export const isloggedin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session['user'] && Object.keys(req.session['user']).length > 0) {
        next()
        return
    }
    res.status(401).redirect("/login.html")
    return
}