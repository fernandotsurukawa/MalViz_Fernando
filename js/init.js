var settings = {
    ProcessArea: {
        svg_height: 220,
        left: 150,
        bar_height: 35,
        scale_xMin: 10,
        scale_xMax: 800
    },
    MatrixArea: {
        padding: 1,
        row_text_width: 250,
        minValue: 5,
        rect_width: 15,
        rect_height: 15
    }
};

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
const scaleHeight = d3.scaleThreshold()
    .domain([3, 10, 40, 50, 200, 300, 500, 1000, 2000])
    .range([80, 200, 200, 300, 350, 400, 450, 500, 600]);

var scaleLimit = d3.scaleThreshold()
    .domain([200, 500])
    .range([8, 15, 30]);

const scaleHeightAfter = d3.scaleThreshold()
    .domain([10, 40, 120, 500, 1300, 2500])
    .range([80, 150, 300, 500, 600, 1000, 1500]);

// let halfLen = len % 2 === 0 ? len / 2 : (len - 1) / 2;
