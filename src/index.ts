import Koa from 'koa';
import path from "path";
import {fileURLToPath} from "url";
import views from "co-views";
import * as z from "zod"
import bodyParser from "koa-bodyparser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const renderView = views(__dirname + "/views", {
    ext: "ejs",
});

const app = new Koa();
app.use(bodyParser())

app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// response

app.use(async ctx => {
    ctx.type = "html";
    if(ctx.path === "/") {
        ctx.body = await renderView("index");
    } else if (ctx.path === "/hello") {
        const Body = z.object({
            name: z.string(),
        })
        const body = Body.parse(ctx.request.body);
        ctx.body = await renderView("hello", { name: body.name });
    } else {
        ctx.status = 404;
        ctx.body = await renderView("404");
    }


});

app.listen(3000);
