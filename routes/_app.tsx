import { define } from "@/utils.ts";
import "./_app.css";

export default define.page(function App({ Component }) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Flair</title>
      </head>
      <body>
        <nav class="navbar">
          <div class="navbar-inner">
            <a href="/" class="navbar-brand">Flair</a>
          </div>
        </nav>
        <Component />
      </body>
    </html>
  );
});
