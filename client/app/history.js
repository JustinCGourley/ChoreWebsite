let account = {};
let curDomos = [];
let week = 0;

const CompletedCheck = (props) => {
    return(
        <div className = "domoCompleted">
            <h3 className = {(props.completed !== 'false') ? "completedDesc domoIsCompleted" : "completedDesc domoNotCompleted"} >
            {(props.completed !== 'false') ? `Completed by: ${props.completed}` : "Not Completed"}
            </h3>
        </div>
    );
};

const DomoList = function(props) {

    const domoNodes = props.domos.map(function(domo) {
        return(
            <div key={domo._id} className="domo">
            <h3 className="domoCost">${domo.cost}</h3>
            <h3 className="domoName">{domo.title}</h3>
            {(domo.description) ? <h3 className="domoDesc">{domo.description}</h3> : null}
            <CompletedCheck completed={domo.completed} />
            </div>
        );
    });

    return (
        <div className="domoList">
            {domoNodes}
            <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
        </div>
    );
};

const sortDomosByDay = (domos) => {
    const sortedList = {monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []};
    for (let i = 0; i < domos.length; i++)
    {
        switch(domos[i].day)
        {
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
}

const DomoListDay = function(props){
    if (props.domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Chores Found</h3>
                <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
            </div>
        );
    }

    let domos = sortDomosByDay(props.domos);

    return (
        <div className="dayContainer">
            <div className="day">
                <h1>Monday</h1>
                <DomoList domos={domos.monday} csrf={props.csrf} />
            </div>
            <div className="day">
                <h1>Tuesday</h1>
                <DomoList domos={domos.tuesday} csrf={props.csrf}/>
            </div>
            <div className="day">
                <h1>Wednesday</h1>
                <DomoList domos={domos.wednesday} csrf={props.csrf}/>
            </div>
            <div className="day">
                <h1>Thursday</h1>
                <DomoList domos={domos.thursday} csrf={props.csrf}/>
            </div>
            <div className="day">
                <h1>Friday</h1>
                <DomoList domos={domos.friday} csrf={props.csrf}/>
            </div>
            <div className="day">
                <h1>Saturday</h1>
                <DomoList domos={domos.saturday} csrf={props.csrf}/>
            </div>
            <div className="day">
                <h1>Sunday</h1>
                <DomoList domos={domos.sunday} csrf={props.csrf}/>
            </div>
        </div>
    );
};

const loadDomosFromServer = (csrf) => {

    let dataSend = `link=${account.link}&type=${account.type}&week=${week}&_csrf=${csrf}`;
    sendAjax('POST', '/getDomos', dataSend, (data) => {
        ReactDOM.render(
            <DomoListDay domos={data.domos} csrf={csrf}/>, document.querySelector("#main")
        );
        curDomos = data.domos;
        ReactDOM.render(
            <LinkedAccounts csrf={csrf} />, document.querySelector('#children')
        );
    });
};

const LinkedAccounts = (csrf) => {
    let accounts = {};

    for (let i = 0; i < curDomos.length; i++)
    {
        let name = curDomos[i].completed;
        if (name !== 'false')
        {
            if (accounts[name] === undefined){accounts[name] = 0.0;}
            accounts[name] += curDomos[i].cost;
        }
    }
    let data = [];

    for (let key in accounts)
    {
        if (accounts.hasOwnProperty(key))
        {
            data.push({user: key, num: accounts[key]});
        }
    }

    let nodes = data.map(function(node){
        return(
            <div className="child">
                <h2>User: {node.user}</h2>
                <h3 className="childEarned">Amount Earned: {node.num} </h3>
            </div>
        );
    });
    
    if (data.length === 0)
    {
        return(
            <div className="earningsHistory">
                <h1>Earnings:</h1>
                <h2>No data / No Completed Tasks</h2>
            </div>
        );
    }

    return(
        <div className="earningsHistory">
            <h1>Earnings:</h1>
            {nodes}
        </div>
    );
}

const handleWeekChange = (e, change) => {
    week += change;
    let token = document.querySelector('#csrfToken').value;
    showViews(token);
    loadDomosFromServer(token);

};

const Controls = (props) => {
    return(
        <div className="historyControls">
            <input type="submit" onClick={(e) => handleWeekChange(e, -1)} value="Previous Week" 
            id={(week > 1) ? null : "dontShow"}/>
            <h1>Week: {week}</h1>
            <input type="submit" onClick={(e) => handleWeekChange(e, 1)} value="Next Week"
             id={(week < account.currentWeek - 1) ? null : "dontShow"}/>
        </div>
    );  
};

const ChildShow = (props) => {
    return(
        <div className="baseView">
            <h1>This view is only available for your parent</h1>
        </div>
    );
};

const SubscribeView = (props) => {
    return(
        <div className="historySubView">
            <h1>History is only available for subscribers</h1>
            <h3>A subscription is only $10 a year!</h3>
            <p>What do I get?</p>
            <p>+ Access to history</p>
            <p>+ No ads</p>
            <a id="setLinkPass" href="/account">Go Subscribe!</a>
        </div>
    );
};

const showViews = (csrf, data = []) => {
    if (account.type === 'Child')
    {
        ReactDOM.render(
            <ChildShow />, document.querySelector('#main')
        );
    }
    else
    {
        console.log(account);
        if (account.subscription === false)
        {
            ReactDOM.render(
                <SubscribeView />, document.querySelector('#main')                
            );
            return false;
        }
        ReactDOM.render(
            <Controls />,document.querySelector('#header')
        );
        ReactDOM.render(
            <LinkedAccounts csrf={csrf}/>,document.querySelector('#children')
        );
        ReactDOM.render(
            <DomoListDay csrf={csrf} domos={[]}/>, document.querySelector('#main')
        );
    }
};

const setup = (csrf) => {

    sendAjax('GET', 'getCurrentAccount', null, (result) => {
        account = result.data;
        week = account.currentWeek-1;
        showViews(csrf);
        if (account.type === 'Parent' && account.subscription)
        {
            loadDomosFromServer(csrf);
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