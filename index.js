let config = {
    basic: {
        upstream: "https://<Your URL>/",//上游地址
    },

    optimization: {
        cacheTtl: 1000, //该项决定边缘缓存时间 可调大
    },
    om: {
        return: ["CN"],//此处填写世纪互联盘符名称
        return_upstream: ["?admin", "?setup"],//不用动
        bypass: ["nocache"],//此处填写需要略过缓存的文件夹&&文件名
    }
};
addEventListener("fetch", (event) => {
    event.respondWith(fetchAndApply(event.request));
});

async function fetchAndApply(request) {

    let requestURL = new URL(request.url);
    let upstreamURL = new URL(config.basic.upstream);

    console.log(requestURL);
    requestURL.protocol = upstreamURL.protocol;
    requestURL.host = upstreamURL.host;
    requestURL.pathname = upstreamURL.pathname + requestURL.pathname;

    for (let i in config.om.return) {
        if (requestURL.pathname.search(config.om.bypass[i]) != -1) {
            config.optimization.cacheEverything = false;
        } else {
            config.optimization.cacheEverything = true;
        }
    }

    for (let i in config.om.return) {
        if (requestURL.pathname.search(config.om.return[i]) != -1) {
            upstreamURL.pathname = requestURL.pathname;
            return new Response(null, { status: 302, headers: { Location: upstreamURL } });
        }
    }
    for (let i in config.om.return_upstream) {
        if (requestURL.search === config.om.return_upstream[i]) {
            upstreamURL.pathname = requestURL.pathname;
            return new Response(null, { status: 302, headers: { Location: upstreamURL } });
        }
    }

    let fetchedResponse = await fetch(
        new Request(requestURL, {
            cf: {
                cacheEverything: config.optimization.cacheEverything,
                cacheTtl: config.optimization.cacheTtl,
                mirage: true,
                polish: "on",
                minify: {
                    javascript: true,
                    css: true,
                    html: true,
                }
            },
            method: request.method,
            headers: request.headers,
            body: request.body,
        })
    );

    let modifiedResponseHeaders = new Headers(fetchedResponse.headers);

    return new Response(fetchedResponse.body, {
        headers: modifiedResponseHeaders,
        status: fetchedResponse.status,
        statusText: fetchedResponse.statusText,
    });
}