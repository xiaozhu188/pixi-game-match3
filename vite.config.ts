import { defineConfig } from "vite"

export default defineConfig({
    server: {
        port: 5000,
        open: true,
    },
    base: "pixi-game-match3",
})