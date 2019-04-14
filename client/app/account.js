let account = {};
//shows linked accounts view
const LinkedAccounts = function(props)
{
    if (props.data.length === 0)
    {
        return(
            <div>
                <h2>Linked Accounts:</h2>
                <h3>None</h3>
            </div>
        );
    }

    const childNodes = props.data.map(function(child) {
        return(
            <div key={child._id} className="childAccount">
                <h3>Account: {child.username}</h3>
            </div>
        );
    });

    return (
        <div className="childListAccount">
            <h2>Linked Accounts:</h2>
            {childNodes}
            <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
        </div>
    );
};
//loading in linked accounts
const loadLinkedAccounts = () => {
    let token = document.querySelector('#csrfToken').value;

    let dataSend = `link=${account.link}&_csrf=${token}`;

    sendAjax('POST', '/getLinked', dataSend, (data) => {
        if (data.status === false)
        {
            handleError('Error when loading linked accounts');
            return;
        }

        showViews(token, data.data);
    });
};
//handles changing link password
const handleLinkPass = (e) => {
    e.preventDefault();

    $("#domoMessage").animate({height: 'hide'},350);

    if ($("#linkPass").val() === ''){
        handleError("Must enter a password");
        return false;
    }

    sendAjax('POST', $("#linkPassForm").attr("action"), $("#linkPassForm").serialize(), function(data) {
        document.querySelector('#linkPass').value = "";
        if (data.status)
        {
            console.log("test");
            handleError("Password link set!", true)
        }
    });

    return false;
}
//handles changing password
const handleChangePass = (e) => {
    e.preventDefault();

    $("#domoMessage").animate({height: 'hide'}, 350);

    if ($("#pass").val() === '' || $("#pass2").val() === '')
    {
        handleError("Please enter a password");
        return false;
    }
    else if ($("#pass").val() !== $("#pass2").val())
    {
        handleError("Passwords must match");
        return false;
    }

    sendAjax('POST', $('#changePass').attr("action"), $('#changePass').serialize(), function(data) {
        if (data.status)
        {
            handleError("Changed Password Successfully", true);
        }
        else
        {
            handleError(data.error);
        }
    });

};
//handles subscribe button being pressed
const handleSubscribe = (e, csrf) => {
    e.preventDefault();

    let data = `_csrf=${csrf}`;

    sendAjax('POST', '/subscribe', data, function(data){
        if (!data.status)
        {
            handleError("Something went wrong!");
        }
        else
        {
            handleError("Thank you for subscribing!", true);
            setup(csrf);
        }
    });
};
//link password form
const LinkPass = function(props)
{
    return(
        <form id="linkPassForm"
        onSubmit={handleLinkPass}
        name="linkPassForm"
        action="/setLinkPass"
        method="POST"
        className="linkPassForm"
        >
            <h3 htmlFor="linkPass">Set Link Password: </h3>
            <br/>
            <input className="inputBox linkPassSubmit" id="linkPass" 
            type="text" name="linkPass" placeholder="Link Password"/>
            <br/>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input className="linkPassSubmit makeDomoSubmit" type="submit" value="Set Link Password"/>
        </form>
    );
};
//pass change form
const ChangePass = function(props)
{
    return(
        <form 
        id="changePass"
        className="changePass"
        onSubmit={handleChangePass}
        name="passForm"
        action="/changePass"
        method="POST"
        >
            <h3>Reset Password:</h3>
            <input id="pass" className="inputBox" type="password" name="pass" placeholder="Password"/>
            <input id="pass2" type="password" name="pass2" placeholder="Retype Password"/>
            <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
            <input className="linkPassSubmit makeDomoSubmit" type="submit" value="Change Password"/>
        </form>
    );
};
//subscribe view (changes based on if account is currently subscribed or not)
const SubscribeView = (props) =>{

    if (account.type === 'Child')
    {
        return(
            <div>
            <h2 className="subscribeActive">Subscription: </h2>
            <h2 className={account.subscription ? "subscribeActive domoIsCompleted" 
            : "subscribeActive domoNotCompleted"}>
            {account.subscription ? "Active" : "Inactive"}</h2>
            {account.subscription ? null : <p>Only your parent can activate an account subscription</p>}
            </div>
        )
    }

    if (account.subscription)
    {
        return(
            <div>
            <h2 className="subscribeActive">Subscription: </h2>
            <h2 className="subscribeActive domoIsCompleted">Active</h2>
            </div>
        ); 
    }

    return(
        <div>
            <h2 className="subscribeActive">Subscription: </h2> 
            <h2 className="subscribeActive domoNotCompleted"> Inactive</h2>
            <p>What can a subscription offer you?</p>
            <p>+ Access to history</p>
            <p>+ No Ads</p>
            <p>Only $10 a year!</p>
            <input className="makeDomoSubmit linkPassSubmit" type="submit" 
            onClick={(e) => handleSubscribe(e, props.csrf)} value="Subscribe for $10"/>
        </div>
    );
};
//main screen view
const FormView = function(props){
    return(
        <div className={account.subscription ? "mainViewSubbed" : "mainView"}>
            <div className="accountSubscribe accountSubview">
                <SubscribeView csrf={props.csrf}/>
            </div>
            <div className="accountHeader accountSubview">
                <ChangePass csrf={props.csrf}/>
                <div id="accountUserInfo">
                    <h1>User: {account.user}</h1>
                    <h3>Account Type: {account.type}</h3>
                </div>
            </div>
            <div className="accountLinked accountSubview">
                {account.type === 'Parent' ? <LinkPass csrf={props.csrf} /> : null}
                {account.type === 'Child' ? <h3>Account linked to: {account.link}</h3> :
                <LinkedAccounts data={props.data} csrf={props.csrf}/>}
                <br/>
            </div>
        </div>
    );
};
//shows view
const showViews = (csrf, data = []) => {
    ReactDOM.render(
        <FormView csrf={csrf} data={data}/>, document.querySelector('#account')
    );
};
//grabs account and sets up views (including ads)
const setup = (csrf) => {

    sendAjax('GET', '/getCurrentAccount', null, (result) => {
        account = result.data;
        showViews(csrf);
        if (account.type === 'Parent')
        {
            loadLinkedAccounts();
        }
        if (account.subscription === false)
        {
            ShowAds();
        }
        else
        {
            document.querySelector('#ads').innerHTML = "";
        }
    });
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});