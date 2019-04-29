'use strict';

var account = {};
var curDomos = [];
var linkedAccounts = [];

var loadStats = function loadStats(csrf) {
    var dataSend = 'type=' + account.type + '&week=' + -1 + '&_csrf=' + csrf;

    sendAjax('POST', '/getDomos', dataSend, function (data) {
        curDomos = data.domos;
        var linkedDataSend = 'link=' + account.link + '&_csrf=' + csrf;
        sendAjax('POST', '/getLinked', linkedDataSend, function (linkedData) {
            if (linkedData.status === false) {
                handleError("Unable to load linked accounts");
                return;
            }
            linkedAccounts = linkedData.data;

            showViews(csrf);
        });
    });
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

var getMainData = function getMainData() {
    var data = {};

    //get total chores
    data.totalChores = curDomos.length;
    //get total completed chores and total amount earned
    data.completedChores = 0;
    data.totalEarned = 0;
    data.selfEarned = 0;
    data.totalCosts = 0;
    for (var i = 0; i < curDomos.length; i++) {
        if (curDomos[i].completed !== 'false') {
            data.completedChores += 1;
            data.totalEarned += curDomos[i].cost;
            if (curDomos[i].completed === account.user) {
                data.selfEarned += curDomos[i].cost;
            }
        }
        data.totalCosts += curDomos[i].cost;
    }

    return data;
};

//setup to draw pie chart
var loadChart = function loadChart(id, title, data) {
    var linkView = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var barChart = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    google.charts.load('current', { 'packages': ['corechart'] });
    if (!barChart) {
        google.charts.setOnLoadCallback(setupChart.bind(undefined, id, title, data, linkView));
    } else {
        google.charts.setOnLoadCallback(setupBarChart.bind(undefined, id, title, data, linkView));
    }
};

var setupBarChart = function setupBarChart(id, title, data, linkView) {
    var options = {
        title: title,
        backgroundColor: linkView ? 'lightgrey' : 'grey',
        chartArea: {
            width: '94%'
        },
        width: '100%',
        height: 300,
        bar: { groupWidth: "50%" },
        legend: { position: 'none' }
    };
    var chartData = google.visualization.arrayToDataTable(data);

    var chart = new google.visualization.BarChart(document.getElementById(id));
    chart.draw(chartData, options);
};

//sets up pie chart based on data and draws it to screen
var setupChart = function setupChart(id, title, data, linkView) {

    var options = {
        title: title,
        backgroundColor: linkView ? 'lightgrey' : 'grey',
        width: 350,
        height: 200
    };
    var chartData = google.visualization.arrayToDataTable(data);
    var chart = new google.visualization.PieChart(document.getElementById(id));
    chart.draw(chartData, options);
};

var TotalStats = function TotalStats(props) {
    var data = getMainData();

    if (data.completedChores !== 0) {
        loadChart('totalChart', 'Chores Completed', [["Chores", "Completion Amount"], ["Completed Chores", data.completedChores], ["Unfinished Chores", data.totalChores - data.completedChores]]);
        loadChart('totalMoneyChart', 'Earnings', [["Earnings", "Amount"], ["Total Earnings", data.totalEarned - data.selfEarned], ["Self Claimed", data.selfEarned], ["Money Unclaimed", data.totalCosts - data.totalEarned]]);
    }

    return React.createElement(
        'div',
        null,
        React.createElement(
            'h3',
            null,
            'Total Chores Completed: ',
            data.completedChores,
            '/',
            data.totalChores
        ),
        React.createElement(
            'h3',
            null,
            'Weeks Completed: ',
            account.currentWeek - 1
        ),
        React.createElement(
            'h3',
            null,
            'Total Amount Earned: $',
            data.totalEarned,
            data.selfEarned === 0 ? null : ' [$' + data.selfEarned + ' claimed by yourself]'
        ),
        React.createElement('div', { id: 'totalChart', className: 'googleChart' }),
        React.createElement('div', { id: 'totalMoneyChart', className: 'googleChart' })
    );
};

var getLinkedData = function getLinkedData() {

    var data = [];
    for (var i = 0; i < linkedAccounts.length; i++) {
        var accountData = { user: linkedAccounts[i].username };
        accountData.amountEarned = 0;
        accountData.completedChores = 0;
        for (var j = 0; j < curDomos.length; j++) {
            if (curDomos[j].completed == accountData.user) {
                accountData.amountEarned += curDomos[j].cost;
                accountData.completedChores += 1;
            }
        }

        data.push(accountData);
    }

    return data;
};

var LinkedStats = function LinkedStats(props) {
    var data = getLinkedData();
    var overallData = getMainData();
    var trackingData = [["Earnings", "Amount"]];

    var nodes = data.map(function (node) {
        loadChart(node.user + 'ID', node.user + '\'s Earnings', [["Earnings", "Amount"], ["Total Earned", node.amountEarned], ["Total Possible Earnings", overallData.totalCosts - node.amountEarned]], true);
        trackingData.push(["" + node.user, node.amountEarned]);
        return React.createElement(
            'div',
            { className: 'statsLinkedSubView' },
            React.createElement('div', { id: node.user + "ID", className: 'googleLinkChart' }),
            React.createElement(
                'h2',
                null,
                'Stats for: ',
                node.user
            ),
            React.createElement(
                'h3',
                null,
                'Completed Chores: ',
                node.completedChores
            ),
            React.createElement(
                'h3',
                null,
                'Amount Earned: $',
                node.amountEarned
            )
        );
    });

    loadChart('childrenOverallBar', 'Earnings Comparison', trackingData, false, true);

    return React.createElement(
        'div',
        null,
        React.createElement('div', { id: 'childrenOverallBar', className: 'googleChart' }),
        nodes
    );
};

var StatsView = function StatsView(props) {

    return React.createElement(
        'div',
        { className: 'statsMainView' },
        React.createElement(
            'div',
            { className: 'statsSubView' },
            React.createElement(
                'h1',
                null,
                'Overall Stats'
            ),
            React.createElement(TotalStats, null)
        ),
        React.createElement(
            'div',
            { className: 'statsSubView' },
            React.createElement(
                'h1',
                null,
                'Children Stats'
            ),
            React.createElement(LinkedStats, null)
        )
    );
};

//shows views based on account type
var showViews = function showViews(csrf) {
    if (account.type === 'Child') {
        ReactDOM.render(React.createElement(ChildShow, null), document.querySelector('#main'));
    } else {
        if (account.subscription === false) {
            ReactDOM.render(React.createElement(SubscribeView, null), document.querySelector('#main'));
            return false;
        } else {
            ReactDOM.render(React.createElement(StatsView, null), document.querySelector('#main'));
        }
    }
};
//grabs account and sets week and views up
var setup = function setup(csrf) {

    sendAjax('GET', 'getCurrentAccount', null, function (result) {
        account = result.data;
        showViews(csrf);
        if (account.type === 'Parent' && account.subscription) {
            loadStats(csrf);
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
