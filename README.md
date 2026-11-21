# G3 Labs — Static Marketing Website

This is a premium, responsive static marketing website for G3 Labs built with HTML, CSS and JavaScript. It uses a dark, futuristic design with glassmorphism and neon accents.

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

- Products are showcased in `products.html`, with Wenix and the CBT System, and linked from every main menu and footer. The homepage includes a product showcase.
- Demo links open the contact page with a product-specific enquiry. `scripts/product-enquiry.js` accepts only known product identifiers and preserves any existing message. Update its product mapping when adding a product.
- Contact form is a static fallback that opens the user's email client (mailto) — replace with a real backend or email service if you need server-side handling.
- Styles are in [styles/globals.css](styles/globals.css) and scripts in [scripts/main.js](scripts/main.js).
- Logo: [assets/images/G3 Labs Logo.png](assets/images/G3%20Labs%20Logo.png)

Animations

- The site includes animated background particles, floating code symbols, subtle chart animations, and staggered scroll-reveal effects implemented in `scripts/main.js` and styled in `styles/globals.css`.
- Animations respect the user's `prefers-reduced-motion` setting and will be disabled automatically for accessibility.
