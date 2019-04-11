const puppeteer = require('puppeteer');
const ffPuppeteer = require('puppeteer-firefox');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

async function getChromeScreenshots(userCode, sourceCode, width, height) {
    const browser = await puppeteer.launch({
        defaultViewport: {
            width,
            height
        }
    });

    const page = await browser.newPage();

    await page.setContent(userCode);
    const user = await page.screenshot();

    await page.setContent(sourceCode);
    const source = await page.screenshot();

    return {user, source}
}

async function getFFScreenshots(userCode, sourceCode, width, height) {
    const browser = await ffPuppeteer.launch({
        defaultViewport: {
            width,
            height
        }
    });

    const page = await browser.newPage();

    await page.setContent(userCode);
    const user = await page.screenshot();

    await page.setContent(sourceCode);
    const source = await page.screenshot();

    return {user, source}
}

module.exports = async function getSimilarity(userCode, sourceCode, width, height) {
    const { user: ChromeUser, source: ChromeSource } = await getChromeScreenshots(userCode, sourceCode, width, height);
    const { data: ChromeSourcePng } = PNG.sync.read(ChromeUser);
    const { data: ChromeUserPng } = PNG.sync.read(ChromeSource);

    const { user: FFUser, source: FFSource } = await getFFScreenshots(userCode, sourceCode, width, height);
    const { data: FFSourcePng } = PNG.sync.read(FFUser);
    const { data: FFUserPng } = PNG.sync.read(FFSource);

    const ChromeWrongPixels = pixelmatch(
        ChromeUserPng,
        ChromeSourcePng,
        null,
        width,
        height,
        {threshold: 0}
        );

    const FFWrongPixels = pixelmatch(
        FFSourcePng,
        FFUserPng,
        null,
        width,
        height,
        {threshold: 0}
        );

    return {
        chrome: 1 - (ChromeWrongPixels / (width * height)).toFixed(2),
        firefox: 1 - (FFWrongPixels / (width * height)).toFixed(2),
    }
}

// getSimilarity(
//     '<style>*{background-color: red}</style>',
//     '<style>*{background: red}</style>',
//     400,
//     300
// ).then((result) => {
//     console.log('red and red', result)
// });
//
// getSimilarity(
//     '<style>*{background-color: red}</style>',
//     '<style>*{background: blue}</style>',
//     400,
//     300
// ).then((result) => {
//     console.log('red and blue', result)
// });
//
// getSimilarity(
//     '<style>*{background-color: red}</style>',
//     '<style>*{background: linear-gradient(to right, red, red, blue)}</style>',
//     400,
//     300
// ).then((result) => {
//     console.log('red and gradient(red >> blue)', result)
// });