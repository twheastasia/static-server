var express = require('express'),
        serveIndex = require('serve-index'), //只能列表目录，不能下载文件？
        serveStatic = require('serve-static')
    ;

var LOCAL_BIND_PORT = 3000; //express's port
var path = '/home/share'

var app = express()
app.set('x-powered-by', false)
app.set('strict routing', true); //路径/a与/a/是不一样的（但是/a/*需要单独指出吗？）
app.set('trust proxy', true); //与Nginx反向代理配合使用？
 
//Trick:
app.getOrPost = function(urlPattern, callback){
    app.get(urlPattern, callback);
    app.post(urlPattern, callback);
}
 
var REQUEST_GLOBAL_NUM = 1;
app.use(function requestNumbering(req, res, next){
    var this_request_id = REQUEST_GLOBAL_NUM++; //for dump data file naming;
    req.request_id = (""+this_request_id).padStart(10, "0")
    next()
})
 
app.use(function addServerSideIPAddress(req, res, next){//log输出req.headers，FIXME：怎么log输出最终的res.headers？
    //console.log("["+req.request_id+"] logReqHeaders: req.ip=" + req.ip+" req.socket.localAddress="+req.socket.localAddress);
    //req.socketLocalIPv4Address = req.socket.localAddress.replace("::ffff:","").replace("::1","127.0.0.1")
    	//dirty hack to fix OS IPv6-first to use IPv4 address only
    console.log("["+req.request_id+"] req.headers: "+JSON.stringify(req.headers, null, 2));
    next();
})
 
//目录列表及静态文件下载
app.get("/", function(req, res){
    res.redirect(302, "/photos"); //test direct;
});
 
app.use('/photos', serveIndex(path, {'icons': true})) //This is Mac OS fs path;
var serve = serveStatic(path)
app.get('/photos/*', function(req, res){
    req.url = req.url.replace('/photos', '');
    console.log("["+req.request_id+"] GET static "+req.url);
    serve(req, res)
});
 
console.log(`Start static file server at ::${LOCAL_BIND_PORT}, Press ^ + C to exit`)
app.listen(LOCAL_BIND_PORT)
 
