import { compressJpg, compressPng } from '@assetpack/plugin-compress';
import { audio, ffmpeg } from '@assetpack/plugin-ffmpeg';
import { json } from '@assetpack/plugin-json';
import { pixiManifest } from '@assetpack/plugin-manifest';
import { pixiTexturePacker } from '@assetpack/plugin-texture-packer';
import { webfont } from '@assetpack/plugin-webfont';

export default {
    entry: './raw-assets',
    output: './public/assets/',
    cache: false,
    plugins: {
        webfont: webfont(),
        compressJpg: compressJpg({
            compression: {
                quality: 80
            }
        }),
        compressPng: compressPng(),
        // audio: audio(), 
        ffmpeg: ffmpeg({
            inputs: ['.mp3', '.ogg', '.wav'],
            outputs: [
                {
                    formats: ['.mp3'],
                    recompress: true, // mp3转mp3也压缩
                    options: {
                        // audioBitrate: 96,
                        // audioChannels: 1,
                        // audioFrequency: 48000,
                    }
                },
            ]
        }),
        json: json(),
        texture: pixiTexturePacker({
            texturePacker: {
                removeFileExtension: true,
            },
            // resolutionOptions: {
            //     resolutions: {
            //         default: 2, low: 1
            //     }
            // }
        }),
        manifest: pixiManifest({
            output: './public/assets/assets-manifest.json'
        }),
    },
};