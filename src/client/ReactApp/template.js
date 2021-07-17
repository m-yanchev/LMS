export default function template(props = {}) {
    const app = props.app || ""
    const css = props.css || null
    const appData = props.appData ? props.appData.serialize() : null
    const meta = props.appData ? props.appData.meta : null
    const status = props.status
    const entryPoint = props.entryPoint || "main"

    return `
<!doctype html>
<html lang="ru">
<head>
    ${googleTagManager(process.env.NODE_ENV)}
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
    <meta name="google-site-verification" content="NJXPHzF7hBQ8fPL5wH4ETmk94AJsI2jhcufRR1Qoo8g" />
    ${meta ? `<meta name="Description" content="${meta.description}"/>` : ""}
    ${css ? `<style id="jss-server-side">${css}</style>` : ""}
    <link rel="shortcut icon" href="/images/favicon.svg" type="image/svg">
    <link href="https://fonts.googleapis.com/css?family=Fira+Sans+Condensed&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Old+Standard+TT&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
    <link rel="stylesheet" href="https://use.typekit.net/jft7iox.css">
    <link href="/styles.css" rel="stylesheet">
    <title>Тетрадка в клеточку</title>
    ${mathJaxScript()}
    <script type="text/javascript" async defer src="/${entryPoint}.bundle.js"></script>
    ${(appData || status) ? 
        `<script>${appData ? `window.data = ${appData};` : ""} window.status = ${status};</script>` : ""}
</head>
<body>
${googleTagManagerAfterBody(process.env.NODE_ENV)}
<div id="root" class="root">${app}</div>
<div id="avatar-root"></div>
<div id="modal-root"></div>
</body>
</html>`;

    function mathJaxScript() {
        const src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML"
        return `<script type="text/x-mathjax-config">
            MathJax.Hub.Config({
                AsciiMath: {
                    decimalsign: ","
                }, 
                skipStartupTypeset: true,
                showProcessingMessages: false,
                messageStyles: "none",
                showMathMenu: false,
                showMathMenuMSIE: false
            });
            MathJax.Hub.processSectionDelay = 0;
            MathJax.Hub.processUpdateTime = 0;
            MathJax.Hub.processUpdateDelay = 0;
            MathJax.Hub.Register.StartupHook("End", function() {window.waitMathJax && window.waitMathJax.queueTypesets()});
        </script>
        <script type="text/javascript" async src="${src}"></script>`
    }

    function googleTagManager(env) {
        return env === 'production' ? (`<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PJJQS8S');</script>
<!-- End Google Tag Manager -->`) : ""
    }

    function googleTagManagerAfterBody(env) {
        return env === 'production' ? (`<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PJJQS8S"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`) : ""
    }
}

