const express = require("express");
const app = express();
const ExpressError = require("./ExpressError");

app.listen(8080, () => {
    console.log("Connected to 8080");
});

const checkAccess = ("/random", (req, res, next) => {
    let { query } = req.query;
    console.log(query);
    if (query === "access") {
        return next();
    }
    else {
        throw new ExpressError(405, "Access Denied :(");
    }
    // res.send("Middleware Finished");
});

// app.use((req, res, next) => {
//     req.responseTime = new Date(Date.now()).toString();
//     console.log(req.responseTime);
//     next();
// });
app.get("/err", (req, res) => {
    abcd = abcd;
});
const adminAccess = ("/admin", (req, res, next) => {
    let { token } = req.query;
    if (token === "accessAdmin") {
        return next();
    }
    throw new ExpressError(403, "Only Admins Allowed");
});

app.get("/admin", adminAccess, (req, res) => {
    res.send("Admin Page");
});

// app.use((req,res,next)=>{
//     console.log("After error handling middleware");
//     next();
// });

// app.use((err,req,res,next)=>{
//     console.log("Error 2");
//     next();
// });

app.get("/", (req, res) => {
    res.send("Hello World...Learning Middlewares");
});

app.get("/random", checkAccess, (req, res) => {
    res.send("Random page's Access Granted");
});

app.use((err, req, res, next) => {
    let { status = 500, message = "Some Error" } = err;
    console.log("Error");
    res.status(status).send(message);
});
//error 404
// app.use((req, res) => {
//     res.status(404).send("Page not found :(")
// });


function asyncWrap(fn){
    return function(req,res,next){
        fn(req,res,next).catch((err)=>{
            next(err);
        }); 
    }
}