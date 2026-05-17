# Code4 — Static Marketing Website

This is a premium, responsive static marketing website for Code4 built with HTML, CSS and JavaScript. It uses a dark, futuristic design with glassmorphism and neon accents.

Preview locally

- Open `index.html` in your browser directly, or run a simple static server. Recommended options:

1) Using the VS Code "Live Server" extension: open the workspace and click "Go Live".

2) Using `npx serve`:

```powershell
npx serve -l 5000 .
# then open http://localhost:5000
```

3) Using `http-server`:

```powershell
npx http-server -p 5000 .
```

Notes

- Contact form is a static fallback that opens the user's email client (mailto) — replace with a real backend or email service if you need server-side handling.
- Styles are in [styles/globals.css](styles/globals.css) and scripts in [scripts/main.js](scripts/main.js).
- Logo: [assets/images/Code4 Logo.1.png](assets/images/Code4%20Logo.1.png)

Animations

- The site includes animated background particles, floating code symbols, subtle chart animations, and staggered scroll-reveal effects implemented in `scripts/main.js` and styled in `styles/globals.css`.
- Animations respect the user's `prefers-reduced-motion` setting and will be disabled automatically for accessibility.

