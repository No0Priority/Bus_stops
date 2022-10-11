const { createProxyMiddleware } = require("http-proxy-middleware");
// fixing CORS crossorigin issue in case of localhost
module.exports = (app) => {
    app.use(
        "/proxy",
        createProxyMiddleware({
            target: "https://bus-stops-2a227.firebaseapp.com/",
            changeOrigin: true,
            pathRewrite: {
                "/proxy": "/",
            },
        })
    );
};
