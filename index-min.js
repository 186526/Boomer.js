let config = {
    basic: {
        upstream: ["https://<Your URL1>/"],//上游地址 可填写多个
    },

    optimization: {
        cacheTtl: 14400, //该项决定边缘缓存时间 可调大
    },
    om: {
        return: ["CN"],//如果需要重定向到世纪互联盘,请修改内容为世纪互联盘盘符Tag,不需要此功能请留空
        return_upstream: ["?admin", "?setup"],//不用动
        bypass: ["nocache"],//此处填写需要略过缓存的文件夹&&文件名
    }
};async function fetchAndApply(e){var t=new URL(e.url),a=new URL(config.basic.upstream[randomNum(0,config.basic.upstream.length-1)]);t.protocol=a.protocol,t.host=a.host,t.pathname=a.pathname+t.pathname;for(let e in config.om.return)-1!=t.pathname.search(config.om.bypass[e])?config.optimization.cacheEverything=!1:config.optimization.cacheEverything=!0;for(let e in config.om.return)if(-1!=t.pathname.search(config.om.return[e])){a.pathname=t.pathname;let e="/";for(let a of t.pathname.split("/").slice(1,-1))e=e+a+"/";if(e!==t.pathname&&"?preview"!==t.search)return new Response(null,{status:302,headers:{Location:a}})}for(let e in config.om.return_upstream)if(t.search===config.om.return_upstream[e])return a.pathname=t.pathname,new Response(null,{status:302,headers:{Location:a}});let n=await fetch(new Request(t,{cf:{cacheEverything:config.optimization.cacheEverything,cacheTtl:config.optimization.cacheTtl,mirage:!0,polish:"on",minify:{javascript:!0,css:!0,html:!0}},method:e.method,headers:e.headers,body:e.body})),r=new Headers(n.headers);return new Response(n.body,{headers:r,status:n.status,statusText:n.statusText})}function randomNum(e,t){switch(arguments.length){case 1:return parseInt(Math.random()*e+1,10);case 2:return parseInt(Math.random()*(t-e+1)+e,10);default:return 0}}addEventListener("fetch",e=>{e.respondWith(fetchAndApply(e.request))});