let account = {};

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
            {childNodes}
            <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
        </div>
    );
};

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

const handleLinkPass = (e) => {
    e.preventDefault();

    $("#domoMessage").animate({width: 'hide'},350);

    if ($("#linkPass").val() == ''){
        handleError("Must enter a password");
        return false;
    }

    sendAjax('POST', $("#linkPassForm").attr("action"), $("#linkPassForm").serialize(), function(data) {
        document.querySelector('#linkPass').value = "";
        if (data.status)
        {
            handleError("Password link set!")
        }
    });

    return false;
}

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
            <label htmlFor="linkPass">Set Account Link Password: </label>
            <input id="linkPass" type="text" name="linkPass" placeholder="Link Password"/>
            <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
            <input className="linkPassSubmit" type="submit" value="Set Link Password"/>
        </form>
    );
};

const FormView = function(props){
    return(
        <div className="accountView">
            <h1>Hello {account.user}</h1>
            <br/>
            <h3>Account Type: {account.type}</h3>
            <br/>            
            {account.type === 'Child' ? <h3>Account linked to: {account.link}</h3> :
             <div>
             <h2>Linked Accounts</h2>
             <LinkedAccounts data={props.data} csrf={props.csrf}/>
             </div>}
            <br/>
             {account.type === 'Parent' ? <LinkPass csrf={props.csrf} /> : null}
            <br/>
            <br/>
            <h3>Subscription: {account.subscription ? "Premium" : "None"}</h3>
        </div>
    );
};

const showViews = (csrf, data = []) => {
    ReactDOM.render(
        <FormView csrf={csrf} data={data}/>, document.querySelector('#account')
    );
};

const setup = (csrf) => {

    sendAjax('GET', 'getCurrentAccount', null, (result) => {
        account = result.data;
        showViews(csrf);
        if (account.type === 'Parent')
        {
            loadLinkedAccounts();
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