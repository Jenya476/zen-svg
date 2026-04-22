# ZenSVG

A professional tool for automating SVG icon optimization and building them into a single SVG sprite. Designed to maintain clean code and icon consistency across projects.

## 🚀 Overview

This project streamlines the process of handling "dirty" SVG files exported from graphic editors like Figma or Adobe Illustrator. It automatically:
- Removes unnecessary metadata and redundant code.
- Standardizes icons (e.g., converting hardcoded colors to `currentColor`).
- Combines all icons into a single SVG sprite for efficient usage.
- **Smart Incremental Updates**: Ability to "unpack" existing sprites from the `src` folder and merge them with new icons.
- **Generates a Premium Icon Gallery** with click-to-copy functionality for developers.

## 🛠 Tech Stack

- **[Node.js](https://nodejs.org/)** — Runtime environment.
- **[SVGO](https://github.com/svg/svgo)** — A powerful tool for optimizing SVG files.
- **[svg-sprite](https://github.com/svg-sprite/svg-sprite)** — A high-level tool for creating SVG sprites.

## 📦 Installation

1. Ensure you have Node.js installed.
2. Clone this repository or copy the project files.
3. Install dependencies:
   ```bash
   npm install
   ```

## 📂 Project Structure

- `src/` — Place your raw SVG icons here.
- `optimized/` — Cleaned icons will be generated here after running the script.
- `svgo.config.mjs` — SVGO optimization configuration.
- `generate-demo.mjs` — Custom script for generating the premium gallery.
- `dist/` — The final build folder containing:
    - `sprite.svg` — The generated SVG sprite.
    - `index.html` — **Premium Gallery**: preview all icons and click to copy usage code.

## 🛠 Getting Started

### 1. Prepare Icons
Drop your `.svg` files into the `src/` folder.

**💡 Pro Tip (Incremental Updates):** If you have an existing `sprite.svg` and want to add just one icon, you don't need the original source files. Just drop the `sprite.svg` and your new icon into the `src/` folder. The system will "explode" the sprite, optimize everything, and merge it all into a new build.

### 2. Build and Optimize
Run the full build process (clean, optimization + sprite generation):
```bash
npm run build
```

### Available Commands:
- `npm run build` — Full cycle: cleans old files, optimizes `src/` to `optimized/`, and builds `sprite.svg`.
- `npm run watch` — Automatically rebuilds the sprite whenever you change or add a file in `src/`.
- `npm run clean` — Deletes the `optimized/` folder and `sprite.svg`.
- `npm run optimize` — Just optimizes icons from `src` to `optimized`.
- `npm run sprite` — Just builds the sprite from the `optimized/` folder.

## 💡 Usage Example

To use an icon from the generated sprite in your HTML/React project:

```html
<svg class="icon">
  <use href="dist/sprite.svg#icon-name"></use>
</svg>
```
*Note: `icon-name` is the filename of your SVG in the `src/` folder (e.g., `arrow` for `arrow.svg`).*

## ⚙️ Configuration

The project uses `svgo.config.mjs` with several key features:
- **`multipass: true`** — Optimizes SVGs multiple times to find the smallest size.
- **`removeViewBox: false`** — Preserves the `viewBox` attribute for proper scaling.
- **`convertColors: { currentColor: true }`** — Replaces hardcoded colors with `currentColor`, allowing you to change icon colors via the CSS `color` property.
- **`removeDimensions`** — Removes `width` and `height` attributes, letting `viewBox` handle the aspect ratio.

---
*Built for fast and efficient icon management in modern web applications.*
