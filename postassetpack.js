import fs from "fs";
const json = JSON.parse(fs.readFileSync("./public/assets/assets-manifest.json", "utf8"));
json.bundles.forEach(bundle => {
    bundle.assets.forEach(asset => {
        console.log(asset.name);
        if (asset.name && asset.name.some(item => item.endsWith(".atlas"))) {
            asset.name = asset.name[0];
        }
    })
});
fs.writeFileSync("./public/assets/assets-manifest.json", JSON.stringify(json, null, 2));