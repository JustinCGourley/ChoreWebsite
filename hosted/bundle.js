"use strict";

var account = {};
var curDomos = [];
var handleDomo = function handleDomo(e) {
    e.preventDefault();

    $("#domoMessage").animate({ height: 'hide' }, 350);

    if ($("#domoName").val() == '' || $("#domoAge").val() == '' || $('#domoDesc').val() == '') {
        handleError("All * fields are required");
        return false;
    }

    sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function () {
        loadDomosFromServer();
    });
    return false;
};

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

var handleNextWeek = function handleNextWeek(e) {
    e.preventDefault();

    var token = document.querySelector('#csrfToken').value;
    var data = "_csrf=" + token;

    sendAjax('POST', '/newWeek', data, function (err) {
        if (err.status === false) {
            console.log("ERROR");
            handleError(err.error);
        }
        handleError("Finished Week", true);
        sendAjax('GET', '/getCurrentAccount', null, function (result) {
            account = result.data;
            loadDomosFromServer();
        });
    });
};

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
            "*Title: "
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
            "*Cost: "
        ),
        React.createElement("input", { id: "domoCost", type: "number", min: "0.0", step: "0.01", name: "cost", placeholder: "Chore Cost" }),
        React.createElement("br", null),
        React.createElement(
            "label",
            { htmlFor: "day" },
            "*Day: "
        ),
        React.createElement(
            "select",
            { id: "domoDay", name: "day" },
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
            )
        ),
        React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("br", null),
        React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Make Chore" })
    );
};

var getAmountForChild = function getAmountForChild(name) {
    var amount = 0.0;
    for (var i = 0; i < curDomos.length; i++) {
        if (curDomos[i].completed === name) {
            amount += curDomos[i].cost;
        }
    }
    return amount;
};

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

var DomoMake = function DomoMake(props) {
    return React.createElement(
        "div",
        { className: account.subscription ? "mainViewSubbed" : "mainView" },
        React.createElement(ChoreInfo, { csrf: props.csrf, data: props.data }),
        React.createElement(DomoForm, { csrf: props.csrf })
    );
};

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
            className: "completedSubmit", value: props.completed === 'false' ? "Finish Chore" : "Undo" })
    );
};

var DeleteOption = function DeleteOption(props) {
    return React.createElement("img", { src: "/assets/img/trashcan.png", alt: "trash",
        className: "domoDelete", onClick: function onClick(e) {
            return handleDelete(e, props.info);
        }, name: "test" });
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
            React.createElement(CompletedCheck, { completed: domo.completed, onClick: function onClick(e) {
                    return handleCheckClick(e, domo);
                } }),
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
            { className: account.subscription ? "domoList mainViewSubbed" : "domoList mainView" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "No Chores Added"
            ),
            React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf })
        );
    }

    var domos = sortDomosByDay(props.domos);

    return React.createElement(
        "div",
        { className: account.subscription ? "domoList mainViewSubbed" : "domoList mainView" },
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

var loadDomosFromServer = function loadDomosFromServer() {

    var token = document.querySelector('#csrfToken').value;

    var dataSend = "link=" + account.link + "&type=" + account.type + "&_csrf=" + token;
    sendAjax('POST', '/getDomos', dataSend, function (data) {
        ReactDOM.render(React.createElement(DomoListDay, { domos: data.domos, csrf: token }), document.querySelector("#domos"));

        if (account.type === 'Child' && account.link !== 'none') {
            document.querySelector('#makeDomo').innerHTML = "";
        }

        curDomos = data.domos;
        if (account.type === 'Parent') {
            loadLinkedAccounts();
        }
    });
};

var setup = function setup(csrf) {
    sendAjax('GET', '/getCurrentAccount', null, function (result) {
        account = result.data;
        if (account.subscription === false) {
            ShowAds();
        }
        setupViews(csrf);
    });
};

var setupViews = function setupViews(csrf) {
    if (account.type === "Child" && account.link === 'none') {
        ReactDOM.render(React.createElement(LinkView, { csrf: csrf }), document.querySelector('#makeDomo'));
    } else if (account.type === "Child" && account.link !== 'none') {
        ReactDOM.render(React.createElement(DomoListDay, { domos: [], csrf: csrf }), document.querySelector("#domos"));

        loadDomosFromServer();
    } else {
        ReactDOM.render(React.createElement(DomoMake, { csrf: csrf, data: [] }), document.querySelector("#makeDomo"));

        ReactDOM.render(React.createElement(DomoListDay, { domos: [], csrf: csrf }), document.querySelector("#domos"));

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
var handleError = function handleError(message) {
    var change = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    $("#errorMessage").text(message);
    $("#domoMessage").animate({ height: 'toggle' }, 350);

    var errorMessage = document.querySelector('#errorMessage');
    errorMessage.style.color = change ? '#1cc425' : 'red';

    hideCount++;
    setTimeout(hideError, 5000);
};

var hideError = function hideError() {
    hideCount--;
    if (hideCount !== 0) {
        return;
    }
    $("#domoMessage").animate({ height: 'hide' }, 350);
};

var redirect = function redirect(response) {
    $("#domoMessage").animate({ height: 'hide' }, 350);
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

var ShowAds = function ShowAds() {
    console.log("showing ads?");
    ReactDOM.render(React.createElement(AdView, null), document.querySelector('#ads'));
};
