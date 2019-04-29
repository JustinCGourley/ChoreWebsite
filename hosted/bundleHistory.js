'use strict';

var account = {};
var curDomos = [];
var week = 0;
var loadedWeek = true;

var changeView = function changeView(e, view) {
    if (view == 'week') {
        if (loadedWeek) {
            return;
        }
        loadedWeek = true;
    } else {
        if (!loadedWeek) {
            return;
        }
        loadedWeek = false;
    }

    var token = document.querySelector('#csrfToken').value;
    ReactDOM.render(React.createElement(DomoListView, { domos: curDomos, csrf: token }), document.querySelector("#main"));
};

//completed view on chore view
var CompletedCheck = function CompletedCheck(props) {
    return React.createElement(
        'div',
        { className: 'domoCompleted' },
        React.createElement(
            'h3',
            { className: props.completed !== 'false' ? "completedDesc domoIsCompleted" : "completedDesc domoNotCompleted" },
            props.completed !== 'false' ? 'Completed by: ' + props.completed : "Not Completed"
        )
    );
};
//view for a single chore
var DomoList = function DomoList(props) {

    var domoNodes = props.domos.map(function (domo) {
        return React.createElement(
            'div',
            { key: domo._id, className: 'domo' },
            React.createElement(
                'h3',
                { className: 'domoCost' },
                '$',
                domo.cost
            ),
            React.createElement(
                'h3',
                { className: 'domoName' },
                domo.title
            ),
            domo.description ? React.createElement(
                'h3',
                { className: 'domoDesc' },
                domo.description
            ) : null,
            React.createElement(CompletedCheck, { completed: domo.completed })
        );
    });

    return React.createElement(
        'div',
        { className: 'domoList' },
        domoNodes,
        React.createElement('input', { id: 'csrfToken', type: 'hidden', name: '_csrf', value: props.csrf })
    );
};
//sorts chores into days
var sortDomosByDay = function sortDomosByDay(domos) {

    if (loadedWeek === false) {
        var list = [];
        for (var i = 0; i < domos.length; i++) {
            if (domos[i].day === 'other') {
                list.push(domos[i]);
            }
        }

        return list;
    }

    var sortedList = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] };
    for (var _i = 0; _i < domos.length; _i++) {
        switch (domos[_i].day) {
            case 'monday':
                sortedList.monday.push(domos[_i]);
                break;
            case 'tuesday':
                sortedList.tuesday.push(domos[_i]);
                break;
            case 'wednesday':
                sortedList.wednesday.push(domos[_i]);
                break;
            case 'thursday':
                sortedList.thursday.push(domos[_i]);
                break;
            case 'friday':
                sortedList.friday.push(domos[_i]);
                break;
            case 'saturday':
                sortedList.saturday.push(domos[_i]);
                break;
            case 'sunday':
                sortedList.sunday.push(domos[_i]);
                break;
        }
    }

    return sortedList;
};
//displays chores by day
var DomoListDay = function DomoListDay(props) {

    var domos = sortDomosByDay(props.domos);

    //if showing other list - show one row of chores
    if (loadedWeek === false) {
        return React.createElement(
            'div',
            { className: 'domoList' },
            React.createElement(
                'div',
                { className: 'day' },
                React.createElement(
                    'h1',
                    null,
                    'Other'
                ),
                React.createElement(DomoList, { domos: domos, csrf: props.csrf })
            )
        );
    }

    return React.createElement(
        'div',
        { className: 'domoList' },
        React.createElement(
            'div',
            { className: 'day' },
            React.createElement(
                'h1',
                null,
                'Monday'
            ),
            React.createElement(DomoList, { domos: domos.monday, csrf: props.csrf })
        ),
        React.createElement(
            'div',
            { className: 'day' },
            React.createElement(
                'h1',
                null,
                'Tuesday'
            ),
            React.createElement(DomoList, { domos: domos.tuesday, csrf: props.csrf })
        ),
        React.createElement(
            'div',
            { className: 'day' },
            React.createElement(
                'h1',
                null,
                'Wednesday'
            ),
            React.createElement(DomoList, { domos: domos.wednesday, csrf: props.csrf })
        ),
        React.createElement(
            'div',
            { className: 'day' },
            React.createElement(
                'h1',
                null,
                'Thursday'
            ),
            React.createElement(DomoList, { domos: domos.thursday, csrf: props.csrf })
        ),
        React.createElement(
            'div',
            { className: 'day' },
            React.createElement(
                'h1',
                null,
                'Friday'
            ),
            React.createElement(DomoList, { domos: domos.friday, csrf: props.csrf })
        ),
        React.createElement(
            'div',
            { className: 'day' },
            React.createElement(
                'h1',
                null,
                'Saturday'
            ),
            React.createElement(DomoList, { domos: domos.saturday, csrf: props.csrf })
        ),
        React.createElement(
            'div',
            { className: 'day' },
            React.createElement(
                'h1',
                null,
                'Sunday'
            ),
            React.createElement(DomoList, { domos: domos.sunday, csrf: props.csrf })
        )
    );
};

var DomoListView = function DomoListView(props) {
    return React.createElement(
        'div',
        { className: account.subscription ? "mainViewSubbed" : "mainView" },
        React.createElement(
            'div',
            null,
            React.createElement('input', { type: 'submit', value: 'View Week',
                id: 'weekViewButton', className: 'makeDomoSubmit viewButton',
                onClick: function onClick(e) {
                    return changeView(e, 'week');
                } }),
            React.createElement('input', { type: 'submit', value: 'View Other',
                id: 'otherViewButton', className: 'makeDomoSubmit viewButton',
                onClick: function onClick(e) {
                    return changeView(e, 'other');
                } })
        ),
        React.createElement(DomoListDay, { domos: props.domos, csrf: props.csrf })
    );
};

//loads chores from server
var loadDomosFromServer = function loadDomosFromServer(csrf) {

    var dataSend = 'link=' + account.link + '&type=' + account.type + '&week=' + week + '&_csrf=' + csrf;
    sendAjax('POST', '/getDomos', dataSend, function (data) {
        curDomos = data.domos;
        ReactDOM.render(React.createElement(DomoListView, { domos: data.domos, csrf: csrf }), document.querySelector("#main"));
        ReactDOM.render(React.createElement(LinkedAccounts, { csrf: csrf }), document.querySelector('#children'));
    });
};
//shows linked accounts for currently selected week
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
            'div',
            { className: 'child' },
            React.createElement(
                'h2',
                null,
                'User: ',
                node.user
            ),
            React.createElement(
                'h3',
                { className: 'childEarned' },
                'Amount Earned: ',
                node.num,
                ' '
            )
        );
    });

    if (data.length === 0) {
        return React.createElement(
            'div',
            { className: 'earningsHistory' },
            React.createElement(
                'h1',
                null,
                'Earnings:'
            ),
            React.createElement(
                'h2',
                null,
                'No data / No Completed Tasks'
            )
        );
    }

    return React.createElement(
        'div',
        { className: 'earningsHistory' },
        React.createElement(
            'h1',
            null,
            'Earnings:'
        ),
        nodes
    );
};
//handle button presses
var handleWeekChange = function handleWeekChange(e, change) {
    week += change;
    var token = document.querySelector('#csrfToken').value;
    showViews(token);
    loadDomosFromServer(token);
};
//shows controls view
var Controls = function Controls(props) {
    return React.createElement(
        'div',
        { className: 'historyControls' },
        React.createElement('input', { type: 'submit', onClick: function onClick(e) {
                return handleWeekChange(e, -1);
            }, value: 'Previous Week',
            id: week > 1 ? null : "dontShow" }),
        React.createElement(
            'h1',
            null,
            'Week: ',
            week
        ),
        React.createElement('input', { type: 'submit', onClick: function onClick(e) {
                return handleWeekChange(e, 1);
            }, value: 'Next Week',
            id: week < account.currentWeek - 1 ? null : "dontShow" })
    );
};
//view for child accounts
var ChildShow = function ChildShow(props) {
    return React.createElement(
        'div',
        { className: 'baseView' },
        React.createElement(
            'h1',
            null,
            'This screen is only available for your parent'
        )
    );
};
//shows subscribe view for non-subscribers
var SubscribeView = function SubscribeView(props) {
    return React.createElement(
        'div',
        { className: 'historySubView mainViewSubbed' },
        React.createElement(
            'h1',
            null,
            'History is only available for subscribers'
        ),
        React.createElement(
            'h3',
            null,
            'A subscription is only $10 a year!'
        ),
        React.createElement(
            'p',
            null,
            'What do I get?'
        ),
        React.createElement(
            'p',
            null,
            '+ Access to history'
        ),
        React.createElement(
            'p',
            null,
            '+ No ads'
        ),
        React.createElement(
            'a',
            { id: 'setLinkPass', href: '/account' },
            'Go Subscribe!'
        )
    );
};
//shows views based on account type
var showViews = function showViews(csrf) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    if (account.type === 'Child') {
        ReactDOM.render(React.createElement(ChildShow, null), document.querySelector('#main'));
    } else {
        if (account.subscription === false) {
            ReactDOM.render(React.createElement(SubscribeView, null), document.querySelector('#main'));
            return false;
        }
        ReactDOM.render(React.createElement(Controls, null), document.querySelector('#header'));
        ReactDOM.render(React.createElement(LinkedAccounts, { csrf: csrf }), document.querySelector('#children'));
        ReactDOM.render(React.createElement(DomoListView, { csrf: csrf, domos: [] }), document.querySelector('#main'));
    }
};
//grabs account and sets week and views up
var setup = function setup(csrf) {

    sendAjax('GET', 'getCurrentAccount', null, function (result) {
        account = result.data;
        week = account.currentWeek - 1;
        showViews(csrf);
        if (account.type === 'Parent' && account.subscription) {
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

var hideCount = 0;
//shows error message
var handleError = function handleError(message) {
    var change = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var quick = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    $("#errorMessage").text(message);
    $("#domoMessage").animate({ height: 'toggle' }, 350);

    var errorMessage = document.querySelector('#errorMessage');
    errorMessage.style.color = change ? '#1cc425' : 'red';

    hideCount++;

    var time = quick ? 1500 : 5000;
    setTimeout(hideError, time);
};

//hides error window
var hideError = function hideError() {
    hideCount--;
    if (hideCount !== 0) {
        return;
    }
    $("#domoMessage").animate({ height: 'hide' }, 350);
};

//redirects window
var redirect = function redirect(response) {
    $("#domoMessage").animate({ height: 'hide' }, 350);
    window.location = response.redirect;
};

//helper funcion to send ajax message
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

//TEMPORARY - actual ad view would go here
var Ad = function Ad(props) {
    return React.createElement(
        "div",
        { className: "adView" },
        React.createElement(
            "h1",
            null,
            "AD HERE"
        ),
        React.createElement(
            "h1",
            null,
            "AD HERE"
        ),
        React.createElement(
            "h1",
            null,
            "AD HERE"
        )
    );
};

var AdView = function AdView(props) {
    return React.createElement(
        "div",
        { className: "adContainer" },
        React.createElement(Ad, null),
        React.createElement(Ad, null)
    );
};

//ran to show ads view
var ShowAds = function ShowAds() {
    ReactDOM.render(React.createElement(AdView, null), document.querySelector('#ads'));
};

var testNavBar = function testNavBar(accountType) {
    if (accountType === "Child") {
        document.querySelector('#navHistory').style.display = 'none';
        document.querySelector('#navStats').style.display = 'none';
    }
};
