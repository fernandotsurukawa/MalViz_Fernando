function make2Darray(rows, cols) {
    var arr = new Array(rows);
    for (var i = 0; i < rows; i++) {
        arr[i] = new Array(cols);
        for (j = 0; j < cols; j++) {
            arr[i][j] = {x: j, y: i, z: []};
        }
    }
    return arr;
}

function ProcessDataV2(originalData, domain) {
    var processNameList = d3.nest().key(d => d.Process_Name)
        .entries(originalData)
        .map(d => d.key.toLowerCase());
        // .filter(d => d.toLowerCase() !== "procmon.exe");

    var globalData = [];
    var domainFormat = /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/;
    var previoustime;
    var previoustep = 0;
    var count = 0;
    originalData.forEach(function (row, index) {
        //Preprocess Data
        var time = row.Timestamp.split(':');
        var hour = +time[0];
        var minute = +time[1];
        var second = +time[2].split('.')[0];
        var milisecond = +time[2].split('.')[1].split(' ')[0].slice(0, 5);
        var currentTimeStamp = (hour * 3600 + minute * 60 + second) * 100000 + milisecond;

        if (index == 0) {
            previoustime = currentTimeStamp;
        }
        var timediff = currentTimeStamp - previoustime;
        var currentStep = previoustep + timediff;

        //Assign value
        var obj = new Object();
        obj.Timestamp = row.Timestamp;
        obj.Process_Name = row.Process_Name.toLowerCase();
        obj.Path = row.Path.toLowerCase();
        obj.PID = row.PID;
        obj.Operation = row.Operation;
        obj.Detail = row.Detail;
        obj.currenttimestamp = currentTimeStamp;
        obj.Step = currentStep;
        obj.Process = getOperationType(row.Operation);
        obj.index = index; //globalData.index refers to the index on the CSV
        obj.order = index; //globalData.order is further manipulated to represent the order of the operation within a process only

        for (var i = 0; i < processNameList.length; i++) {
            if (row.Path.toLowerCase().endsWith("\\" + processNameList[i])) {
                obj.targetProcessName = row.Path.replace(/^.*[\\\/]/, '').toLowerCase();
            }
        }

        if (row.Operation == 'UDP Send') {

            var getdomain = row.Path.slice(row.Path.indexOf('->') + 3, -5);

            if (getdomain.match(domainFormat)) {
                if (getdomain.split('.').length > 2) {
                    getdomain = getdomain.slice(getdomain.indexOf('.') + 1);
                    obj.Domain = getdomain;
                } else {
                    obj.Domain = getdomain;
                }
                domain.forEach(function (dm_value) {
                    if (dm_value.domain == obj.Domain) {

                        var obj_child = {}
                        obj_child.count = +dm_value.count;
                        obj_child.harmless = +dm_value.harmless;
                        obj_child.malicious = +dm_value.malicious;
                        obj_child.suspicious = +dm_value.suspicious;
                        obj_child.undetected = +dm_value.undetected;
                        obj.VirusTotal = obj_child;
                    }
                })
            }

        }
        if (row.Path.slice(-3).toLowerCase() == 'dll') {
            obj.library = row.Path.replace(/^.*[\\\/]/, '')
        }
        //Push value
        globalData.push(obj);

        //After pushing data update previous time
        previoustime = currentTimeStamp;
        previoustep = currentStep;
    });

    //distinct is an array formed by the distinct processes throughout the globalData
    var distinctProcesses = Array.from(new Set(globalData.map(s => s.Process_Name)));

    //the following loop searches globalData for the minimum index of each process in distinct and stores it into distinctIndex
    let distinctIndices = [];
    distinctProcesses.forEach((element, index) => {
        distinctIndices[index] = globalData.filter(data => {
            return data.Process_Name == element;
        })[0].order;
    });

    //the following loop iterates through globalData subtracting each order with its distinctIndex
    globalData.forEach(element => {
        let process = element.Process_Name;
        let processNumber = distinctProcesses.indexOf(process);
        element.order = element.order - distinctIndices[processNumber];
    });

    return globalData;
}

function UpdateProcessNameWithChild(processLst, links) {
    processLst.forEach(function (proc, parentIndex) {
        proc.selfCalls = [];
        proc.childs = [];
        proc.childInfo = {};
        links.forEach(function (link) {
            if ((proc.key === link.Process_Name) && (link.Process === "ProcessThread")) {    // if key = parent
                let index = getProcessNameIndex(processLst, link.targetProcessName);
                // index = stt child in processLst
                if (index != parentIndex) {
                    // if chld != parent

                    //Check for loop insertion
                    if (processLst[index].hasOwnProperty('childs')) {
                        if (!processLst[index].childs.includes(parentIndex)) {
                            if (!proc.childs.includes(index)){
                                proc.childs.push(index);
                            }
                            if (!proc.childInfo[link.targetProcessName]){    // if havent met this process
                                proc.childInfo[link.targetProcessName] = [];
                                proc.childInfo[link.targetProcessName].push({
                                    event: link.Operation,
                                    step: link.Step
                                })
                            } else{
                                proc.childInfo[link.targetProcessName].push({
                                    event: link.Operation,
                                    step: link.Step
                                })
                            }
                        }
                    } else {
                        if (!proc.childs.includes(index)){
                            proc.childs.push(index);
                        }
                        if (!proc.childInfo[link.targetProcessName]){
                            proc.childInfo[link.targetProcessName] = [];
                            proc.childInfo[link.targetProcessName].push({
                                event: link.Operation,
                                step: link.Step
                            })
                        } else{
                            proc.childInfo[link.targetProcessName].push({
                                event: link.Operation,
                                step: link.Step
                            })
                        }
                    }
                }
                else {
                    proc.selfCalls.push({
                        event: link.Operation,
                        step: link.Step
                    });
                }
            }
        });
    });
    return processLst;
}


function getProcessNameIndex(processlst, key) {
    let index;
    processlst.forEach(function (d, i) {
        if (d.key === key) {
            index = i;
        }
    });
    return index;
}


Array.prototype.groupBy = function (props) {
    var arr = this;
    var partialResult = {};

    arr.forEach(el=>{

        var grpObj = {};

        props.forEach(prop=>{
            grpObj[prop] = el[prop]
        });

        var key = JSON.stringify(grpObj);

        if(!partialResult[key]) partialResult[key] = [];

        partialResult[key].push(el);

    });

    var finalResult = Object.keys(partialResult).map(key=>{
        var keyObj = JSON.parse(key);
        keyObj.values = partialResult[key];
        return keyObj;
    })

    return finalResult;
}