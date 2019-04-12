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
        React.createElement(
            "h2",
            null,
            "Linked Accounts:"
        ),
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

    $("#domoMessage").animate({ height: 'hide' }, 350);

    if ($("#linkPass").val() === '') {
        handleError("Must enter a password");
        return false;
    }

    sendAjax('POST', $("#linkPassForm").attr("action"), $("#linkPassForm").serialize(), function (data) {
        document.querySelector('#linkPass').value = "";
        if (data.status) {
            console.log("test");
            handleError("Password link set!", true);
        }
    });

    return false;
};

var handleChangePass = function handleChangePass(e) {
    e.preventDefault();

    $("#domoMessage").animate({ height: 'hide' }, 350);

    if ($("#pass").val() === '' || $("#pass2").val() === '') {
        handleError("Please enter a password");
        return false;
    } else if ($("#pass").val() !== $("#pass2").val()) {
        handleError("Passwords must match");
        return false;
    }

    sendAjax('POST', $('#changePass').attr("action"), $('#changePass').serialize(), function (data) {
        if (data.status) {
            handleError("Changed Password Successfully", true);
        } else {
            handleError(data.error);
        }
    });
};

var handleSubscribe = function handleSubscribe(e, csrf) {
    e.preventDefault();

    var data = "_csrf=" + csrf;

    sendAjax('POST', '/subscribe', data, function (data) {
        if (!data.status) {
            handleError("Something went wrong!");
        } else {
            handleError("Thank you for subscribing!", true);
            setup(csrf);
        }
    });
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
        React.createElement("br", null),
        React.createElement("input", { className: "inputBox linkPassSubmit", id: "linkPass",
            type: "text", name: "linkPass", placeholder: "Link Password" }),
        React.createElement("br", null),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "linkPassSubmit makeDomoSubmit", type: "submit", value: "Set Link Password" })
    );
};

var ChangePass = function ChangePass(props) {
    return React.createElement(
        "form",
        {
            id: "changePass",
            className: "changePass",
            onSubmit: handleChangePass,
            name: "passForm",
            action: "/changePass",
            method: "POST"
        },
        React.createElement(
            "h3",
            null,
            "Reset Password:"
        ),
        React.createElement("input", { id: "pass", className: "inputBox", type: "password", name: "pass", placeholder: "Password" }),
        React.createElement("input", { id: "pass2", type: "password", name: "pass2", placeholder: "Retype Password" }),
        React.createElement("input", { id: "csrfToken", type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "linkPassSubmit makeDomoSubmit", type: "submit", value: "Change Password" })
    );
};

var SubscribeView = function SubscribeView(props) {

    if (account.type === 'Child') {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "h2",
                { className: "subscribeActive" },
                "Subscription: "
            ),
            React.createElement(
                "h2",
                { className: account.subscription ? "subscribeActive domoIsCompleted" : "subscribeActive domoNotCompleted" },
                account.subscription ? "Active" : "Inactive"
            ),
            account.subscription ? null : React.createElement(
                "p",
                null,
                "Only your parent can activate an account subscription"
            )
        );
    }

    if (account.subscription) {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "h2",
                { className: "subscribeActive" },
                "Subscription: "
            ),
            React.createElement(
                "h2",
                { className: "subscribeActive domoIsCompleted" },
                "Active"
            )
        );
    }

    return React.createElement(
        "div",
        null,
        React.createElement(
            "h2",
            { className: "subscribeActive" },
            "Subscription: "
        ),
        React.createElement(
            "h2",
            { className: "subscribeActive domoNotCompleted" },
            " Inactive"
        ),
        React.createElement(
            "p",
            null,
            "What can a subscription offer you?"
        ),
        React.createElement(
            "p",
            null,
            "+ Access to history"
        ),
        React.createElement(
            "p",
            null,
            "+ No Ads"
        ),
        React.createElement(
            "p",
            null,
            "Only $10 a year!"
        ),
        React.createElement("input", { className: "makeDomoSubmit linkPassSubmit", type: "submit",
            onClick: function onClick(e) {
                return handleSubscribe(e, props.csrf);
            }, value: "Subscribe for $10" })
    );
};

var FormView = function FormView(props) {
    return React.createElement(
        "div",
        { className: account.subscription ? "mainViewSubbed" : "mainView" },
        React.createElement(
            "div",
            { className: "accountSubscribe accountSubview" },
            React.createElement(SubscribeView, { csrf: props.csrf })
        ),
        React.createElement(
            "div",
            { className: "accountHeader accountSubview" },
            React.createElement(
                "h1",
                null,
                "User: ",
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
            React.createElement(ChangePass, { csrf: props.csrf })
        ),
        React.createElement(
            "div",
            { className: "accountLinked accountSubview" },
            account.type === 'Child' ? React.createElement(
                "h3",
                null,
                "Account linked to: ",
                account.link
            ) : React.createElement(LinkedAccounts, { data: props.data, csrf: props.csrf }),
            React.createElement("br", null),
            account.type === 'Parent' ? React.createElement(LinkPass, { csrf: props.csrf }) : null
        )
    );
};

var showViews = function showViews(csrf) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    ReactDOM.render(React.createElement(FormView, { csrf: csrf, data: data }), document.querySelector('#account'));
};

var setup = function setup(csrf) {

    sendAjax('GET', '/getCurrentAccount', null, function (result) {
        account = result.data;
        showViews(csrf);
        if (account.type === 'Parent') {
            loadLinkedAccounts();
        }
        if (account.subscription === false) {
            ShowAds();
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
