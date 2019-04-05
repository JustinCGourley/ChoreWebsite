"use strict";

var account = {};
var handleDomo = function handleDomo(e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: 'hide' }, 350);

    if ($("#domoName").val() == '' || $("#domoAge").val() == '' || $('#domoDesc').val() == '') {
        handleError("All fields are required");
        return false;
    }

    sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function () {
        loadDomosFromServer();
    });
    return false;
};

var handleDelete = function handleDelete(e, domo) {
    console.log(domo);
    var token = document.querySelector('#csrfToken').value;
    var data = "id=" + domo._id + "&_csrf=" + token;

    sendAjax('POST', '/deleteDomo', data, function () {
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

    $("#domoMessage").animate({ width: 'hide' }, 350);

    if ($('#linkName').val() == '') {
        handleError("Must enter a username to link!");
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
            "Title: "
        ),
        React.createElement("input", { id: "domoName", type: "text", name: "title", placeholder: "Chore Title" }),
        React.createElement(
            "label",
            { id: "domoDescLabel", htmlFor: "description" },
            "Description: "
        ),
        React.createElement("input", { id: "domoDescription", type: "text", name: "description", placeholder: "Chore Description" }),
        React.createElement(
            "label",
            { htmlFor: "cost" },
            "Cost: "
        ),
        React.createElement("input", { id: "domoAge", type: "text", name: "cost", placeholder: "Chore Cost" }),
        React.createElement(
            "label",
            { htmlFor: "day" },
            "Day: "
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
        React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Make Domo" })
    );
};

var CompletedCheck = function CompletedCheck(props) {
    console.log("completed: " + props.completed);
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
            React.createElement(
                "h3",
                { className: "domoDesc" },
                domo.description
            ),
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
            { className: "domoList" },
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
            React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf }),
            React.createElement("input", { className: "linkUserSubmit", type: "submit", value: "Link Account" })
        )
    );
};

var loadDomosFromServer = function loadDomosFromServer() {

    var token = document.querySelector('#csrfToken').value;

    var dataSend = "link=" + account.link + "&type=" + account.type + "&_csrf=" + token;
    sendAjax('POST', '/getDomos', dataSend, function (data) {

        ReactDOM.render(React.createElement(DomoListDay, { domos: data.domos, csrf: token }), document.querySelector("#domos"));

        if (account.type === 'Child' && account.link !== 'none') {
            document.querySelector('#makeDomo').innerHTML = "";
        }
    });
};

var setup = function setup(csrf) {
    sendAjax('GET', '/getCurrentAccount', null, function (result) {
        account = result.data;
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
        ReactDOM.render(React.createElement(DomoForm, { csrf: csrf }), document.querySelector("#makeDomo"));

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
