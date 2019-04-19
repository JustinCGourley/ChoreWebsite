'use strict';

var account = {};

var handleUnlink = function handleUnlink(e, child) {
    e.preventDefault();

    var token = document.querySelector('#csrfToken').value;
    var data = 'user=' + child.username + '&_csrf=' + token;

    sendAjax('POST', '/unlinkChild', data, function (err) {
        if (!err.status) {
            handleError("Something went wrong");
        }

        loadLinkedAccounts();
    });
};

//shows linked accounts view
var LinkedAccounts = function LinkedAccounts(props) {
    if (props.data.length === 0) {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'h2',
                null,
                'Linked Accounts:'
            ),
            React.createElement(
                'h3',
                null,
                'None'
            )
        );
    }

    var childNodes = props.data.map(function (child) {
        return React.createElement(
            'div',
            { key: child._id, className: 'childAccount' },
            React.createElement(
                'h3',
                null,
                'Account: ',
                child.username
            ),
            React.createElement('input', { type: 'submit', className: 'makeDomoSubmit linkPassSubmit',
                id: 'unlinkButton',
                onClick: function onClick(e) {
                    return handleUnlink(e, child);
                }, value: 'Unlink' })
        );
    });

    return React.createElement(
        'div',
        { className: 'childListAccount' },
        React.createElement(
            'h2',
            null,
            'Linked Accounts:'
        ),
        childNodes,
        React.createElement('input', { id: 'csrfToken', type: 'hidden', name: '_csrf', value: props.csrf })
    );
};
//loading in linked accounts
var loadLinkedAccounts = function loadLinkedAccounts() {
    var token = document.querySelector('#csrfToken').value;

    var dataSend = 'link=' + account.link + '&_csrf=' + token;

    sendAjax('POST', '/getLinked', dataSend, function (data) {
        if (data.status === false) {
            handleError('Error when loading linked accounts');
            return;
        }

        showViews(token, data.data);
    });
};
//handles changing link password
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
//handles changing password
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
//handles subscribe button being pressed
var handleSubscribe = function handleSubscribe(e, csrf) {
    e.preventDefault();

    var data = '_csrf=' + csrf;

    sendAjax('POST', '/subscribe', data, function (data) {
        if (!data.status) {
            handleError("Something went wrong!");
        } else {
            handleError("Thank you for subscribing!", true);
            setup(csrf);
        }
    });
};
//link password form
var LinkPass = function LinkPass(props) {
    return React.createElement(
        'form',
        { id: 'linkPassForm',
            onSubmit: handleLinkPass,
            name: 'linkPassForm',
            action: '/setLinkPass',
            method: 'POST',
            className: 'linkPassForm'
        },
        React.createElement(
            'h3',
            { htmlFor: 'linkPass' },
            'Set Link Password: '
        ),
        React.createElement('br', null),
        React.createElement('input', { className: 'inputBox linkPassSubmit', id: 'linkPass',
            type: 'text', name: 'linkPass', placeholder: 'Link Password' }),
        React.createElement('br', null),
        React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
        React.createElement('input', { className: 'linkPassSubmit makeDomoSubmit', type: 'submit', value: 'Set Link Password' })
    );
};
//pass change form
var ChangePass = function ChangePass(props) {
    return React.createElement(
        'form',
        {
            id: 'changePass',
            className: 'changePass',
            onSubmit: handleChangePass,
            name: 'passForm',
            action: '/changePass',
            method: 'POST'
        },
        React.createElement(
            'h3',
            null,
            'Reset Password:'
        ),
        React.createElement('input', { id: 'pass', className: 'inputBox', type: 'password', name: 'pass', placeholder: 'Password' }),
        React.createElement('input', { id: 'pass2', type: 'password', name: 'pass2', placeholder: 'Retype Password' }),
        React.createElement('input', { id: 'csrfToken', type: 'hidden', name: '_csrf', value: props.csrf }),
        React.createElement('input', { className: 'linkPassSubmit makeDomoSubmit', type: 'submit', value: 'Change Password' })
    );
};
//subscribe view (changes based on if account is currently subscribed or not)
var SubscribeView = function SubscribeView(props) {

    if (account.type === 'Child') {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'h2',
                { className: 'subscribeActive' },
                'Subscription: '
            ),
            React.createElement(
                'h2',
                { className: account.subscription ? "subscribeActive domoIsCompleted" : "subscribeActive domoNotCompleted" },
                account.subscription ? "Active" : "Inactive"
            ),
            account.subscription ? null : React.createElement(
                'p',
                null,
                'Only your parent can activate an account subscription'
            )
        );
    }

    if (account.subscription) {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'h2',
                { className: 'subscribeActive' },
                'Subscription: '
            ),
            React.createElement(
                'h2',
                { className: 'subscribeActive domoIsCompleted' },
                'Active'
            )
        );
    }

    return React.createElement(
        'div',
        null,
        React.createElement(
            'h2',
            { className: 'subscribeActive' },
            'Subscription: '
        ),
        React.createElement(
            'h2',
            { className: 'subscribeActive domoNotCompleted' },
            ' Inactive'
        ),
        React.createElement(
            'p',
            null,
            'What can a subscription offer you?'
        ),
        React.createElement(
            'p',
            null,
            '+ Access to history'
        ),
        React.createElement(
            'p',
            null,
            '+ No Ads'
        ),
        React.createElement(
            'p',
            null,
            'Only $10 a year!'
        ),
        React.createElement('input', { className: 'makeDomoSubmit linkPassSubmit', type: 'submit',
            onClick: function onClick(e) {
                return handleSubscribe(e, props.csrf);
            }, value: 'Subscribe for $10' })
    );
};
//main screen view
var FormView = function FormView(props) {
    return React.createElement(
        'div',
        { className: account.subscription ? "mainViewSubbed" : "mainView" },
        React.createElement(
            'div',
            { className: 'accountSubscribe accountSubview' },
            React.createElement(SubscribeView, { csrf: props.csrf })
        ),
        React.createElement(
            'div',
            { className: 'accountHeader accountSubview' },
            React.createElement(ChangePass, { csrf: props.csrf }),
            React.createElement(
                'div',
                { id: 'accountUserInfo' },
                React.createElement(
                    'h1',
                    null,
                    'User: ',
                    account.user
                ),
                React.createElement(
                    'h3',
                    null,
                    'Account Type: ',
                    account.type
                )
            )
        ),
        React.createElement(
            'div',
            { className: 'accountLinked accountSubview' },
            account.type === 'Parent' ? React.createElement(LinkPass, { csrf: props.csrf }) : null,
            account.type === 'Child' ? React.createElement(
                'h3',
                null,
                'Account linked to: ',
                account.link
            ) : React.createElement(LinkedAccounts, { data: props.data, csrf: props.csrf }),
            React.createElement('br', null)
        )
    );
};
//shows view
var showViews = function showViews(csrf) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    ReactDOM.render(React.createElement(FormView, { csrf: csrf, data: data }), document.querySelector('#account'));
};
//grabs account and sets up views (including ads)
var setup = function setup(csrf) {

    sendAjax('GET', '/getCurrentAccount', null, function (result) {
        account = result.data;
        showViews(csrf);
        if (account.type === 'Parent') {
            loadLinkedAccounts();
        }
        if (account.subscription === false) {
            ShowAds();
        } else {
            document.querySelector('#ads').innerHTML = "";
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
