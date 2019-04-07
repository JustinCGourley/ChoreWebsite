"use strict";

var account = {};

var LinkedAccounts = function LinkedAccounts(props) {
    return React.createElement(
        "div",
        null,
        React.createElement(
            "h2",
            null,
            "Linked Accounts:"
        ),
        React.createElement(
            "h3",
            null,
            "None"
        )
    );
};

var handleLinkPass = function handleLinkPass(e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: 'hide' }, 350);

    if ($("#linkPass").val() == '') {
        handleError("Must enter a password");
        return false;
    }

    sendAjax('POST', $("#linkPassForm").attr("action"), $("#linkPassForm").serialize(), function (data) {
        document.querySelector('#linkPass').value = "";
        if (data.status) {
            handleError("Password link set!");
        }
    });

    return false;
};

var LinkPass = function LinkPass(props) {
    return React.createElement(
        "form",
        { id: "linkPassForm",
            onSubmit: handleLinkPass,
            name: "linkPassForm",
            action: "/setLinkPass",
            method: "POST",
            className: "linkPassForm"
        },
        React.createElement(
            "label",
            { htmlFor: "linkPass" },
            "Set Account Link Password: "
        ),
        React.createElement("input", { id: "linkPass", type: "text", name: "linkPass", placeholder: "Link Password" }),
        React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "linkPassSubmit", type: "submit", value: "Set Link Password" })
    );
};

var FormView = function FormView(props) {
    return React.createElement(
        "div",
        { className: "accountView" },
        React.createElement(
            "h1",
            null,
            "Hello ",
            account.user
        ),
        React.createElement("br", null),
        React.createElement(
            "h3",
            null,
            "Account Type: ",
            account.type
        ),
        React.createElement("br", null),
        account.type === 'Child' ? React.createElement(
            "h3",
            null,
            "Account linked to: ",
            account.link
        ) : React.createElement(LinkedAccounts, { csrf: props.csrf }),
        React.createElement("br", null),
        account.type === 'Parent' ? React.createElement(LinkPass, { csrf: props.csrf }) : null,
        React.createElement("br", null),
        React.createElement("br", null),
        React.createElement(
            "h3",
            null,
            "Subscription: ",
            account.subscription ? "Premium" : "None"
        )
    );
};

var showViews = function showViews(csrf) {
    ReactDOM.render(React.createElement(FormView, { csrf: csrf }), document.querySelector('#account'));
};

var setup = function setup(csrf) {

    sendAjax('GET', 'getCurrentAccount', null, function (result) {
        account = result.data;
        showViews(csrf);
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
