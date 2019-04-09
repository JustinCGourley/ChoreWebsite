"use strict";

var account = {};

var LinkedAccounts = function LinkedAccounts(props) {
    if (props.data.length === 0) {
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
    }

    var childNodes = props.data.map(function (child) {
        return React.createElement(
            "div",
            { key: child._id, className: "childAccount" },
            React.createElement(
                "h3",
                null,
                "Account: ",
                child.username
            )
        );
    });

    return React.createElement(
        "div",
        { className: "childListAccount" },
        childNodes,
        React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf })
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

        showViews(token, data.data);
    });
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
        ) : React.createElement(
            "div",
            null,
            React.createElement(
                "h2",
                null,
                "Linked Accounts"
            ),
            React.createElement(LinkedAccounts, { data: props.data, csrf: props.csrf })
        ),
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
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    ReactDOM.render(React.createElement(FormView, { csrf: csrf, data: data }), document.querySelector('#account'));
};

var setup = function setup(csrf) {

    sendAjax('GET', 'getCurrentAccount', null, function (result) {
        account = result.data;
        showViews(csrf);
        if (account.type === 'Parent') {
            loadLinkedAccounts();
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
