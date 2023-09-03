import { defineConfig } from "vite"

export default defineConfig({
    server: {
        port: 5000,
        open: true,
    },
    build: {
        assetsDir: "pixi-game-match3"
    }
})