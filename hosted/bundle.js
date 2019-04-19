"use strict";

var account = {};
var curDomos = [];
var loadedWeek = true;
//handles creating a new chore
var handleDomo = function handleDomo(e) {
    e.preventDefault();

    $("#domoMessage").animate({ height: 'hide' }, 350);

    if ($("#domoName").val() == '' || $("#domoCost").val() == '' || $('#domoDesc').val() == '') {
        handleError("All * fields are required");
        return false;
    }

    sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function () {
        handleError("Created Chore", true, true);
        loadDomosFromServer();
    });
    return false;
};
//handles deleting a chore
var handleDelete = function handleDelete(e, domo) {
    var token = document.querySelector('#csrfToken').value;
    var data = "id=" + domo._id + "&_csrf=" + token;

    sendAjax('POST', '/deleteDomo', data, function (err) {
        if (err.done === false) {
            console.log(err);
            handleError("Unable to delete domo");
        }
        handleError("Deleted Chore", true);
        loadDomosFromServer();
    });

    return false;
};
//handles pressing complete chore button
var handleCheckClick = function handleCheckClick(e, domo) {

    var token = document.querySelector('#csrfToken').value;

    var set = account.user;
    if (domo.completed !== 'false') {
        set = 'false';
    }
    var data = "set=" + set + "&_csrf=" + token + "&id=" + domo._id;

    sendAjax('POST', '/updateCompleted', data, function (data) {
        if (!data.status) {
            handleError("Unable to find domo?");
        }
        loadDomosFromServer();
    });
};
//handles linking account - for child accounts
var handleAccountLink = function handleAccountLink(e, account) {

    e.preventDefault();

    $("#domoMessage").animate({ height: 'hide' }, 350);

    if ($('#linkName').val() == '' || $('#linkPass').val() == '') {
        handleError("Fill out everything to link!");
        return false;
    }

    sendAjax('POST', $("#linkForm").attr("action"), $("#linkForm").serialize(), function (err) {
        if (err.status === false) {
            handleError(err.error);
        } else {
            setup();
        }
    });

    return false;
};
//handles next week button being pressed
var handleNextWeek = function handleNextWeek(e) {
    e.preventDefault();

    var token = document.querySelector('#csrfToken').value;
    var data = "_csrf=" + token;

    sendAjax('POST', '/newWeek', data, function (err) {
        if (err.status === false) {
            console.log("ERROR");
            handleError(err.error);
        }
        handleError("Finished Week", true, true);
        sendAjax('GET', '/getCurrentAccount', null, function (result) {
            account = result.data;
            loadDomosFromServer();
        });
    });
};

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

    loadDomosFromServer();
};

//display for chore creation window
var DomoForm = function DomoForm(props) {
    return React.createElement(
        "form",
        { id: "domoForm",
            onSubmit: handleDomo,
            name: "domoForm",
            action: "/maker",
            method: "POST",
            className: "domoForm"
        },
        React.createElement(
            "label",
            { htmlFor: "title" },
            "* Title: "
        ),
        React.createElement("input", { id: "domoName", type: "text", name: "title", placeholder: "Chore Title" }),
        React.createElement("br", null),
        React.createElement(
            "label",
            { id: "domoDescLabel", htmlFor: "description" },
            "Description: "
        ),
        React.createElement("input", { id: "domoDescription", type: "text", name: "description", placeholder: "Chore Description" }),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "cost" },
            "* Cost: "
        ),
        React.createElement("input", { id: "domoCost", type: "number", min: "0.0", step: "0.01", name: "cost", placeholder: "Chore Cost" }),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "day" },
            "* Day: "
        ),
        React.createElement(
            "select",
            { id: "domoDay", className: "domoMakeLabel", name: "day" },
            React.createElement(
                "option",
                { value: "monday" },
                "Monday"
            ),
            React.createElement(
                "option",
                { value: "tuesday" },
                "Tuesday"
            ),
            React.createElement(
                "option",
                { value: "wednesday" },
                "Wednesday"
            ),
            React.createElement(
                "option",
                { value: "thursday" },
                "Thursday"
            ),
            React.createElement(
                "option",
                { value: "friday" },
                "Friday"
            ),
            React.createElement(
                "option",
                { value: "saturday" },
                "Saturday"
            ),
            React.createElement(
                "option",
                { value: "sunday" },
                "Sunday"
            ),
            React.createElement(
                "option",
                { value: "other" },
                "Other"
            )
        ),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "type" },
            "* Type:"
        ),
        React.createElement(
            "select",
            { id: "domoType", className: "domoMakeLabel", name: "type" },
            React.createElement(
                "option",
                { value: "recurring" },
                "Recurring Chore"
            ),
            React.createElement(
                "option",
                { value: "single" },
                "One-Time Chore"
            )
        ),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "childSet" },
            "Child"
        ),
        React.createElement(
            "select",
            { id: "", className: "domoMakeLabel", name: "childSet" },
            React.createElement(
                "option",
                { value: "any" },
                "Any"
            ),
            props.data.map(function (child) {
                return React.createElement(
                    "option",
                    { value: child.username },
                    child.username
                );
            })
        ),
        React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("br", null),
        React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Make Chore" })
    );
};
//gets how much a child has currently earned
var getAmountForChild = function getAmountForChild(name) {
    var amount = 0.0;
    for (var i = 0; i < curDomos.length; i++) {
        if (curDomos[i].completed === name) {
            amount += curDomos[i].cost;
        }
    }
    return amount;
};
//shows linked accounts
var ChildInfo = function ChildInfo(props) {
    if (props.data.length <= 0) {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "h3",
                null,
                "None Linked"
            )
        );
    }

    var childNodes = props.data.map(function (child) {
        return React.createElement(
            "div",
            { key: child._id, className: "child" },
            React.createElement(
                "h2",
                null,
                "Account: ",
                child.username
            ),
            React.createElement(
                "h3",
                { className: "childEarned" },
                "Earned Amount: $",
                getAmountForChild(child.username)
            )
        );
    });

    return React.createElement(
        "div",
        { className: "childList" },
        childNodes,
        React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf })
    );
};
//Shows info on week, and linked accounts
var ChoreInfo = function ChoreInfo(props) {
    return React.createElement(
        "div",
        { className: "ChoreInfo" },
        account.linkSet ? null : React.createElement(
            "a",
            { id: "setLinkPass", href: "/account" },
            "Please set your link password!"
        ),
        React.createElement(
            "h1",
            { id: "weekHeader" },
            "Week ",
            account.currentWeek
        ),
        React.createElement(
            "h2",
            null,
            "Linked Accounts:"
        ),
        React.createElement(ChildInfo, { csrf: props.csrf, data: props.data }),
        React.createElement("input", { type: "submit", onClick: handleNextWeek, className: "makeDomoSubmit", value: "Finish Week" })
    );
};
//view setup for creating chores and linked info
var DomoMake = function DomoMake(props) {
    return React.createElement(
        "div",
        { className: account.subscription ? "mainViewSubbed" : "mainView" },
        React.createElement(ChoreInfo, { csrf: props.csrf, data: props.data }),
        React.createElement(DomoForm, { csrf: props.csrf, data: props.data })
    );
};
//shows completion status on each chore
var CompletedCheck = function CompletedCheck(props) {
    return React.createElement(
        "div",
        { className: "domoCompleted" },
        React.createElement(
            "h3",
            { className: props.completed !== 'false' ? "completedDesc domoIsCompleted" : "completedDesc domoNotCompleted" },
            props.completed !== 'false' ? "Completed by: " + props.completed : "Not Completed"
        ),
        React.createElement("input", { type: "submit", onClick: props.onClick,
            className: "completedSubmit makeDomoSubmit", value: props.completed === 'false' ? "Finish Chore" : "Undo" })
    );
};
//view for delete button on each chore
var DeleteOption = function DeleteOption(props) {
    return React.createElement("img", { src: "/assets/img/trashcan.png", alt: "trash",
        className: "domoDelete", onClick: function onClick(e) {
            return handleDelete(e, props.info);
        }, name: "test" });
};

//view for a single chore
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
            React.createElement(CompletedCheck, { completed: domo.completed, onClick: function onClick(e) {
                    return handleCheckClick(e, domo);
                } }),
            account.type === "Parent" && domo.childSet ? React.createElement(
                "h3",
                { className: "domoSet" },
                "Set to Child: ",
                domo.childSet
            ) : null,
            account.type === "Parent" ? React.createElement(DeleteOption, { info: domo }) : null
        );
    });

    return React.createElement(
        "div",
        { className: "domoList" },
        domoNodes,
        React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf })
    );
};
//sorts out chores based on day
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
//displays each chore based on day
var DomoListDay = function DomoListDay(props) {

    if (props.domos.length === 0) {
        return React.createElement(
            "div",
            { className: account.subscription ? "domoList" : "domoList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "No Chores Added"
            ),
            React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf })
        );
    }

    var domos = sortDomosByDay(props.domos);

    //if showing other list - show one row of chores
    if (loadedWeek === false) {
        return React.createElement(
            "div",
            { className: "domoList" },
            React.createElement(
                "div",
                { className: "day" },
                React.createElement(
                    "h1",
                    null,
                    "Other"
                ),
                React.createElement(DomoList, { domos: domos, csrf: props.csrf })
            )
        );
    }

    return React.createElement(
        "div",
        { className: "domoList" },
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

var DomoListView = function DomoListView(props) {
    return React.createElement(
        "div",
        { className: account.subscription ? "mainViewSubbed" : "mainView" },
        React.createElement(
            "div",
            null,
            React.createElement("input", { type: "submit", value: "View Week",
                id: "weekViewButton", className: "makeDomoSubmit viewButton",
                onClick: function onClick(e) {
                    return changeView(e, 'week');
                } }),
            React.createElement("input", { type: "submit", value: "View Other",
                id: "otherViewButton", className: "makeDomoSubmit viewButton",
                onClick: function onClick(e) {
                    return changeView(e, 'other');
                } })
        ),
        React.createElement(DomoListDay, { domos: props.domos, csrf: props.csrf })
    );
};

//view for child requesting them to link their account
var LinkView = function LinkView(props) {
    return React.createElement(
        "div",
        { className: "noLinkView" },
        React.createElement(
            "h1",
            null,
            "Your account is not linked to any parent, please link it!"
        ),
        React.createElement(
            "form",
            { id: "linkForm",
                onSubmit: handleAccountLink,
                name: "linkForm",
                action: "/linkAccount",
                method: "POST",
                className: "linkForm"
            },
            React.createElement(
                "label",
                { htmlFor: "user" },
                "Parents Username: "
            ),
            React.createElement("input", { id: "linkName", type: "text", name: "name", placeholder: "Parents Username" }),
            React.createElement("br", null),
            React.createElement(
                "label",
                { htmlFor: "linkPass" },
                "Link Password: "
            ),
            React.createElement("input", { id: "linkPass", type: "text", name: "pass", placeholder: "Link Password" }),
            React.createElement("br", null),
            React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf }),
            React.createElement("input", { className: "linkPassSubmit makeDomoSubmit", id: "noLinkSubmit",
                type: "submit", value: "Link Account" })
        )
    );
};
//load linked accounts if account is parent type and render them
var loadLinkedAccounts = function loadLinkedAccounts() {
    var token = document.querySelector('#csrfToken').value;

    var dataSend = "link=" + account.link + "&_csrf=" + token;

    sendAjax('POST', '/getLinked', dataSend, function (data) {
        if (data.status === false) {
            handleError('Error when loading linked accounts');
            return;
        }
        ReactDOM.render(React.createElement(DomoMake, { csrf: token, data: data.data }), document.querySelector('#makeDomo'));
    });
};
//load all chores from the server and render them into the view
var loadDomosFromServer = function loadDomosFromServer() {

    var token = document.querySelector('#csrfToken').value;

    var dataSend = "link=" + account.link + "&type=" + account.type + "&_csrf=" + token;
    sendAjax('POST', '/getDomos', dataSend, function (data) {

        curDomos = data.domos;

        ReactDOM.render(React.createElement(DomoListView, { domos: data.domos, csrf: token }), document.querySelector("#domos"));

        if (account.type === 'Child' && account.link !== 'none') {
            document.querySelector('#makeDomo').innerHTML = "";
        }

        if (account.type === 'Parent') {
            loadLinkedAccounts();
        }
    });
};
//grab account and start setting up views
var setup = function setup(csrf) {
    sendAjax('GET', '/getCurrentAccount', null, function (result) {
        account = result.data;
        if (account.subscription === false) {
            ShowAds();
        } else {
            document.querySelector('#ads').innerHTML = "";
        }
        setupViews(csrf);
    });
};

//sets up all views based on account and account type
var setupViews = function setupViews(csrf) {
    if (account.type === "Child" && account.link === 'none') {
        ReactDOM.render(React.createElement(LinkView, { csrf: csrf }), document.querySelector('#makeDomo'));
    } else if (account.type === "Child" && account.link !== 'none') {
        ReactDOM.render(React.createElement(DomoListView, { domos: [], csrf: csrf }), document.querySelector("#domos"));

        loadDomosFromServer();
    } else {
        ReactDOM.render(React.createElement(DomoMake, { csrf: csrf, data: [] }), document.querySelector("#makeDomo"));

        ReactDOM.render(React.createElement(DomoListView, { domos: [], csrf: csrf }), document.querySelector("#domos"));

        loadDomosFromServer();
    }
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
