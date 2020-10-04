let config = {basic: 
    {upstream: ["https://<Your URL1>/"],//上游地址 可填写多个
    },
    optimization: {cacheTtl: 1000, //该项决定边缘缓存时间 可调大
    },
    om: {return: ["CN"],//如果需要重定向到世纪互联盘,请修改内容为世纪互联盘盘符Tag,不需要此功能请留空
        return_upstream: ["?admin", "?setup"],//不用动
        bypass: ["nocache"],//此处填写需要略过缓存的文件夹&&文件名
    }
};
async function fetchAndApply(e){let t=new URL(e.url),n=new URL(config.basic.upstream[randomNum(0,config.basic.upstream.length-1)]);t.protocol=n.protocol,t.host=n.host,t.pathname=n.pathname+t.pathname;for(let e in config.om.return)-1!=t.pathname.search(config.om.bypass[e])?config.optimization.cacheEverything=!1:config.optimization.cacheEverything=!0;for(let e in config.om.return)if(-1!=t.pathname.search(config.om.return[e]))return n.pathname=t.pathname,new Response(null,{status:302,headers:{Location:n}});for(let e in config.om.return_upstream)if(t.search===config.om.return_upstream[e])return n.pathname=t.pathname,new Response(null,{status:302,headers:{Location:n}});let a=await fetch(new Request(t,{cf:{cacheEverything:config.optimization.cacheEverything,cacheTtl:config.optimization.cacheTtl,mirage:!0,polish:"on",minify:{javascript:!0,css:!0,html:!0}},method:e.method,headers:e.headers,body:e.body})),o=new Headers(a.headers);return new Response(a.body,{headers:o,status:a.status,statusText:a.statusText})}function randomNum(e,t){switch(arguments.length){case 1:return parseInt(Math.random()*e+1,10);case 2:return parseInt(Math.random()*(t-e+1)+e,10);default:return 0}}addEventListener("fetch",e=>{e.respondWith(fetchAndApply(e.request))});