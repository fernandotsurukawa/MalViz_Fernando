var timeOut = 100;
var operationShown;
var active = {};
var firstClick;
var svgStats;
var lensingStatus = false;
var orderedArray = [];
var maxLink = 1;
var availableCommon;
const categories = ["Registry", "Network", "File", "exe", "dll"];
const stackColor = ["#247b2b", "#a84553", "#c37e37", "#396bab", "#7e7e7e"];
// const scaleHeight = d3.scaleThreshold()
//     .domain([3, 10, 40, 50, 200, 300, 500, 1000, 2000])
//     .range([80, 200, 200, 300, 350, 400, 450, 500, 600]);
const scaleHeight = d3.scaleLog()
    .domain([1, 400])
    .range([80, 500]);

const scaleHeightAfter = d3.scaleThreshold()
    .domain([10, 40, 120, 500, 1300, 2500])
    .range([80, 150, 300, 500, 600, 1000, 1500]);
