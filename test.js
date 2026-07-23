const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html>
<html class="dark">
<head>
<style>
.box { background: blue; }
.box:where(.dark *) { background: red; }
</style>
</head>
<body>
  <div class="box">Test</div>
</body>
</html>`);
const box = dom.window.document.querySelector('.box');
const style = dom.window.getComputedStyle(box);
console.log("Background is:", style.background);
