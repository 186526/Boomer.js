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
};
addEventListener("fetch", (event) => {
    event.respondWith(fetchAndApply(event.request));
});

async function fetchAndApply(request) {
    var requestURL = new URL(request.url);
    var upstreamURL = new URL(config.basic.upstream[randomNum(0, config.basic.upstream.length - 1)]);

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
            let a = '/';
            for (let i of requestURL.pathname.split("/").slice(1, -1)) {
                a = a + i + "/";
            }
            if (a !== requestURL.pathname&&requestURL.search!=="?preview") {
                return new Response(null, { status: 302, headers: { Location: upstreamURL } });
            }
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
function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
            return 0;
    }
} 