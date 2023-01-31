


function greyToGreen(steps, lightness) {
    let hslGreen = [120, 100, lightness * 100];
    let result = [];
    for (let i = 0; i <= steps; i++) {
        let saturation = 100 - (i * (100 / steps));
        hslGreen[1] = saturation;
        result.push(hslToRgb(hslGreen));
    }
    return result;
}


function hslToRgb(hsl) {
    let hue = hsl[0] / 360;
    let saturation = hsl[1] / 100;
    let lightness = hsl[2] / 100;
    let a = saturation * Math.min(lightness, 1 - lightness);
    let f = (n, k = (n + hue) % 1) => lightness - a * Math.max(Math.min(k - 1, 2 - k), 0);
    let rgb = [f(0), f(8 / 3), f(4 / 3)];
    return rgb.map(x => Math.round(x * 255));
}