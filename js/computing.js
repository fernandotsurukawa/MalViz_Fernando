
function getColor(type) {
    return stackColor[categories.indexOf(type)];
}

function setLensing() {
    if (!lensingStatus) {
        document.getElementById("lensingBtn").classList.add('selected');
        d3.select("#magContainer")
            .style("display", "block");
        lensingStatus = !lensingStatus;
        return true;
    } else {
        document.getElementById("lensingBtn").classList.remove('selected');
        d3.select("#magContainer")
            .style("display", "none");
        lensingStatus = !lensingStatus;
        return false;
    }
}

function selectAll() {
    var selectAll = document.getElementById("opSelection").checked;
    firstClick = true;
    if (selectAll) {
        document.getElementById("commonSelection").checked = false;
        // show all rect
        d3.select("#heatmap").selectAll('rect[group=detail]')
            .style('visibility', "visible");

        // show all arc
        d3.selectAll(".arc")
            .classed("hidden", false)
            .classed("visible", true);

        // select all group
        d3.select("#overview").selectAll("rect")
            .classed("op1", true)
            .classed("op0 op2", false);

        operationShown.forEach(d => {
            active[d] = true;
        })
    }
    else {
        d3.select("#heatmap").selectAll('rect[group=detail]')
            .style('visibility', "hidden");

        // hide all arc
        d3.selectAll(".arc")
            .classed("hidden", true)
            .classed("visible", false);

        // hide all group
        d3.select("#overview").selectAll("rect")
            .classed("op0", true)
            .classed("op1 op2", false);

        operationShown.forEach(d => {
            active[d] = false;
        })
    }
}

var prevStatus;

function selectCommon() {
    var selectCommon = document.getElementById("commonSelection").checked;
    if (selectCommon) {
        prevStatus = JSON.parse(JSON.stringify(active));
        document.getElementById("opSelection").checked = false;
        // first, hide all
        d3.select("#heatmap").selectAll('rect[group=detail]')
            .style('visibility', "hidden");

        // hide arc
        d3.selectAll(".arc")
            .classed("hidden", true);

        // unselect group
        svgStats.selectAll("rect")
            .classed("op0", true)
            .classed("op1 op2", false);

        availableCommon.forEach(name => {
            let key = name.replace(" ", "");
            // show group
            d3.select("#ovRect" + key)
                .classed("op1", true)
                .classed("op2", false)
                .classed("op0", !!active[key]);

            // show arc
            d3.selectAll("[class*=o" + key + "]")
                .classed("visible", true)
                .classed("hidden", false);

            // show rect
            d3.select("#heatmap").selectAll('rect.' + key)
                .style('visibility', active[key] ? "hidden" : "visible");

            active[key] = !active[key];
        })
    }
    else {
        d3.select("#heatmap").selectAll('rect[group=detail]')
            .style('visibility', "hidden");

        // hide all arc
        d3.selectAll(".arc")
            .classed("hidden", true)
            .classed("visible", false);

        // hide all group
        d3.select("#overview").selectAll("rect")
            .classed("op0", true)
            .classed("op1 op2", false);

        operationShown.forEach(d => {
            active[d] = false;
        })
    }
}

function computeNodes(nodeObj, miniNode, type, rawPath, pos, len) {
    let path = rawPath.toLowerCase();
    let connectArray = new Array(len + 1).join("0");
    if (!nodeObj[path]) {
        // if havent existed
        nodeObj[path] = 1;
        miniNode.push({
            id: path,
            type: type,
            connect: connectArray.slice(0, pos) + "1" + connectArray.slice(pos + 1)
        });

    } else {
        nodeObj[path] += 1;
    }
}

function getIndex(list, item) {
    return list.indexOf(item);
}

function nodeid(n) {
    return n.size ? "_g_" + n.group : n.name;
}

function linkid(l) {
    var u = nodeid(l.source),
        v = nodeid(l.target);
    return u < v ? u + "|" + v : v + "|" + u;
}

function getGroup(n) {
    return n.group;
}

// constructs the network to visualize
function network(data, prev, getGroup, expand) {
    let L = 600;
    let scope = L/4 + Math.random()*L/2;
    expand = expand || {};
    var groupMap = {},    // group map
        nodeMap = {},    // node map
        linkMap = {},    // link map
        prevGroupNode = {},    // previous group nodes
        prevGroupCentroid = {},    // previous group centroids
        nodes = [], // output nodes
        links = []; // output links
    // process previous nodes for reuse or centroid calculation
    if (prev) {
        prev.nodes.forEach(function (n) {
            let i = getGroup(n), o;
            if (n.size > 0) {
                prevGroupNode[i] = n;
                n.size = 0;
            } else {
                o = prevGroupCentroid[i] || (prevGroupCentroid[i] = {x: 0, y: 0, count: 0});
                o.x += n.x;
                o.y += n.y;
                o.count += 1;
            }
        });
    }
    // determine nodes
    for (var k = 0; k < data.nodes.length; ++k) {
        var n = data.nodes[k],
            i = getGroup(n),    // i is the freaking group
            g = groupMap[i] ||
                (groupMap[i] = prevGroupNode[i]) ||
                (groupMap[i] = {group: i, size: 0, nodes: []});
        if (expand[i]) {
            // the node should be directly visible
            nodeMap[n.id] = nodes.length;
            n.x = L/4 + Math.random()*L/2;
            n.y = L/4 + Math.random()*L/2;
            nodes.push(n);
            if (prevGroupNode[i]) {
                // place new nodes at cluster location (plus jitter)
                n.x = prevGroupNode[i].x + Math.random();
                n.y = prevGroupNode[i].y + Math.random();
            }
        } else {
            // the node is part of a collapsed cluster
            if (g.size == 0) {
                // if new cluster, add to set and position at centroid of leaf nodes
                nodeMap[i] = nodes.length;
                g.x = L/4 + Math.random()*L/2;
                g.y = L/4 + Math.random()*L/2;
                nodes.push(g);
                if (prevGroupCentroid[i]) {
                    g.x = prevGroupCentroid[i].x / prevGroupCentroid[i].count;
                    g.y = prevGroupCentroid[i].y / prevGroupCentroid[i].count;
                }
            }
            g.nodes.push(n);
        }
        // always count group size as w e also use it to tweak the force graph strengths/distances
        g.size += 1;
        n.group_data = g;       // circular data
    }
    for (i in groupMap) {
        groupMap[i].link_count = 0;
    }

    // determine links
    for (k = 0; k < data.links.length; ++k) {
        var e, u, v;        // u, v are group names
        e = data.links[k];
        if (e.source.group) {
            u = getGroup(e.source);
        }
        else continue;
        if (e.target.group) {
            v = getGroup(e.target);
        }
        else continue;
        if (u != v) {
            // link_count is the number of links to that node
            groupMap[u].link_count += e.value;
            groupMap[v].link_count += e.value;
        }
        u = expand[u] ? nodeMap[e.source.id] : nodeMap[u];
        v = expand[v] ? nodeMap[e.target.id] : nodeMap[v];
        var index = (u < v ? u + "|" + v : v + "|" + u),
            l = linkMap[index] || (linkMap[index] = {source: u, target: v, size: 0});

        if (e.img) {
            l.img = true;
        }
        l.size += e.value;
    }
    for (i in linkMap) {
        if (maxLink < linkMap[i].size) {
            maxLink = linkMap[i].size;
        }
        links.push(linkMap[i]);
    }
    console.log(nodes);
    return {nodes: nodes, links: links};
}

function convexHulls(nodes, index, offset) {
    var hulls = {};
    var groupType = {};
    // create point sets
    for (var k = 0; k < nodes.length; ++k) {
        var n = nodes[k];
        if (n.size) continue;
        // if nodes are grouped, continue !!!

        var i = index(n),
            l = hulls[i] || (hulls[i] = []);

        groupType[i] = n.type;

        // each node -> 4 nodes including offset
        l.push([n.x - offset, n.y - offset]);
        l.push([n.x - offset, n.y + offset]);
        l.push([n.x + offset, n.y - offset]);
        l.push([n.x + offset, n.y + offset]);
    }

    // create convex hulls
    var hullset = [];
    for (i in hulls) {
        hullset.push({
            group: i,
            path: d3.polygonHull(hulls[i]),
            type: groupType[i]
        })
    }
    return hullset;
}

function adjustHeight(item, expand, height) {
    let existHull = false;
    d3.keys(expand).some(d => {
        if (expand[d]) {
            existHull = true;
        }
        return expand[d];
    });
    if (!existHull) {
        d3.select("#svg" + item.replace(/[.]/g, ""))
        // .transition()
        // .duration(200)
            .attr("height", height)
    }
    else {
        d3.select("#svg" + item.replace(/[.]/g, ""))
        // .transition()
        // .duration(200)
            .attr("height", "600")
    }
}
