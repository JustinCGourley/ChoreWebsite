"use strict";

var account = {};
var curDomos = [];
var week = 0;

var CompletedCheck = function CompletedCheck(props) {
    return React.createElement(
        "div",
        { className: "domoCompleted" },
        React.createElement(
            "h3",
            { className: props.completed !== 'false' ? "completedDesc domoIsCompleted" : "completedDesc domoNotCompleted" },
            props.completed !== 'false' ? "Completed by: " + props.completed : "Not Completed"
        )
    );
};

var DomoList = function DomoList(props) {

    var domoNodes = props.domos.map(function (domo) {
        return React.createElement(
            "div",
            { key: domo._id, className: "domo" },
            React.createElement(
                "h3",
                { className: "domoCost" },
                "$",
                domo.cost
            ),
            React.createElement(
                "h3",
                { className: "domoName" },
                domo.title
            ),
            domo.description ? React.createElement(
                "h3",
                { className: "domoDesc" },
                domo.description
            ) : null,
            React.createElement(CompletedCheck, { completed: domo.completed })
        );
    });

    return React.createElement(
        "div",
        { className: "domoList" },
        domoNodes,
        React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf })
    );
};

var sortDomosByDay = function sortDomosByDay(domos) {
    var sortedList = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] };
    for (var i = 0; i < domos.length; i++) {
        switch (domos[i].day) {
            case 'monday':
                sortedList.monday.push(domos[i]);
                break;
            case 'tuesday':
                sortedList.tuesday.push(domos[i]);
                break;
            case 'wednesday':
                sortedList.wednesday.push(domos[i]);
                break;
            case 'thursday':
                sortedList.thursday.push(domos[i]);
                break;
            case 'friday':
                sortedList.friday.push(domos[i]);
                break;
            case 'saturday':
                sortedList.saturday.push(domos[i]);
                break;
            case 'sunday':
                sortedList.sunday.push(domos[i]);
                break;
        }
    }

    return sortedList;
};

var DomoListDay = function DomoListDay(props) {
    if (props.domos.length === 0) {
        return React.createElement(
            "div",
            { className: "domoList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "No Chores Found"
            ),
            React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf })
        );
    }

    var domos = sortDomosByDay(props.domos);

    return React.createElement(
        "div",
        null,
        React.createElement(
            "div",
            { className: "day" },
            React.createElement(
                "h1",
                null,
                "Monday"
            ),
            React.createElement(DomoList, { domos: domos.monday, csrf: props.csrf })
        ),
        React.createElement(
            "div",
            { className: "day" },
            React.createElement(
                "h1",
                null,
                "Tuesday"
            ),
            React.createElement(DomoList, { domos: domos.tuesday, csrf: props.csrf })
        ),
        React.createElement(
            "div",
            { className: "day" },
            React.createElement(
                "h1",
                null,
                "Wednesday"
            ),
            React.createElement(DomoList, { domos: domos.wednesday, csrf: props.csrf })
        ),
        React.createElement(
            "div",
            { className: "day" },
            React.createElement(
                "h1",
                null,
                "Thursday"
            ),
            React.createElement(DomoList, { domos: domos.thursday, csrf: props.csrf })
        ),
        React.createElement(
            "div",
            { className: "day" },
            React.createElement(
                "h1",
                null,
                "Friday"
            ),
            React.createElement(DomoList, { domos: domos.friday, csrf: props.csrf })
        ),
        React.createElement(
            "div",
            { className: "day" },
            React.createElement(
                "h1",
                null,
                "Saturday"
            ),
            React.createElement(DomoList, { domos: domos.saturday, csrf: props.csrf })
        ),
        React.createElement(
            "div",
            { className: "day" },
            React.createElement(
                "h1",
                null,
                "Sunday"
            ),
            React.createElement(DomoList, { domos: domos.sunday, csrf: props.csrf })
        )
    );
};

var loadDomosFromServer = function loadDomosFromServer(csrf) {

    var dataSend = "link=" + account.link + "&type=" + account.type + "&week=" + week + "&_csrf=" + csrf;
    sendAjax('POST', '/getDomos', dataSend, function (data) {
        ReactDOM.render(React.createElement(DomoListDay, { domos: data.domos, csrf: csrf }), document.querySelector("#main"));
        curDomos = data.domos;
        ReactDOM.render(React.createElement(LinkedAccounts, { csrf: csrf }), document.querySelector('#children'));
    });
};

var LinkedAccounts = function LinkedAccounts(csrf) {
    var accounts = {};

    for (var i = 0; i < curDomos.length; i++) {
        var name = curDomos[i].completed;
        if (name !== 'false') {
            if (accounts[name] === undefined) {
                accounts[name] = 0.0;
            }
            accounts[name] += curDomos[i].cost;
        }
    }
    var data = [];

    for (var key in accounts) {
        if (accounts.hasOwnProperty(key)) {
            data.push({ user: key, num: accounts[key] });
        }
    }

    var nodes = data.map(function (node) {
        return React.createElement(
            "div",
            { className: "child" },
            React.createElement(
                "h2",
                null,
                "User: ",
                node.user
            ),
            React.createElement(
                "h3",
                { className: "childEarned" },
                "Amount Earned: ",
                node.num,
                " "
            )
        );
    });

    if (data.length === 0) {
        return React.createElement(
            "div",
            { className: "earningsHistory" },
            React.createElement(
                "h1",
                null,
                "Earnings:"
            ),
            React.createElement(
                "h2",
                null,
                "No data / No Completed Tasks"
            )
        );
    }

    return React.createElement(
        "div",
        { className: "earningsHistory" },
        React.createElement(
            "h1",
            null,
            "Earnings:"
        ),
        nodes
    );
};

var handleWeekChange = function handleWeekChange(e, change) {
    week += change;
    var token = document.querySelector('#csrfToken').value;
    showViews(token);
    loadDomosFromServer(token);
};

var Controls = function Controls(props) {
    return React.createElement(
        "div",
        { className: "historyControls" },
        React.createElement("input", { type: "submit", onClick: function onClick(e) {
                return handleWeekChange(e, -1);
            }, value: "Previous Week",
            id: week > 1 ? null : "dontShow" }),
        React.createElement(
            "h1",
            null,
            "Current Week: ",
            week
        ),
        React.createElement("input", { type: "submit", onClick: function onClick(e) {
                return handleWeekChange(e, 1);
            }, value: "Next Week",
            id: week < account.currentWeek - 1 ? null : "dontShow" })
    );
};

var showViews = function showViews(csrf) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    if (account.type === 'Child') {} else {
        ReactDOM.render(React.createElement(Controls, null), document.querySelector('#header'));
        ReactDOM.render(React.createElement(LinkedAccounts, { csrf: csrf }), document.querySelector('#children'));
        ReactDOM.render(React.createElement(DomoListDay, { csrf: csrf, domos: [] }), document.querySelector('#main'));
    }
};

var setup = function setup(csrf) {

    sendAjax('GET', 'getCurrentAccount', null, function (result) {
        account = result.data;
        week = account.currentWeek - 1;
        showViews(csrf);
        if (account.type === 'Parent') {
            loadDomosFromServer(csrf);
        }
    });
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
"use strict";

var handleError = function handleError(message) {
    $("#errorMessage").text(message);
    $("#domoMessage").animate({ width: 'toggle' }, 350);
};

var redirect = function redirect(response) {
    $("#domoMessage").animate({ width: 'hide' }, 350);
    window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};
