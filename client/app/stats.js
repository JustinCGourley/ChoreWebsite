
let account = {};
let curDomos = [];
let linkedAccounts = [];

const loadStats = (csrf) => {
    let dataSend = `type=${account.type}&week=${-1}&_csrf=${csrf}`;
    
    sendAjax('POST', '/getDomos', dataSend, (data) => {
        curDomos = data.domos;
        let linkedDataSend = `link=${account.link}&_csrf=${csrf}`;
        sendAjax('POST', '/getLinked', linkedDataSend, (linkedData) => {
            if (linkedData.status === false)
            {
                handleError("Unable to load linked accounts");
                return;
            }
            linkedAccounts = linkedData.data;

            showViews(csrf);
        });
    });
};

//view for child accounts
const ChildShow = (props) => {
    return(
        <div className="baseView">
            <h1>This screen is only available for your parent</h1>
        </div>
    );
};
//shows subscribe view for non-subscribers
const SubscribeView = (props) => {
    return(
        <div className="historySubView mainViewSubbed">
            <h1>History is only available for subscribers</h1>
            <h3>A subscription is only $10 a year!</h3>
            <p>What do I get?</p>
            <p>+ Access to history</p>
            <p>+ No ads</p>
            <a id="setLinkPass" href="/account">Go Subscribe!</a>
        </div>
    );
};

const getMainData = () =>
{
    let data = {};

    //get total chores
    data.totalChores = curDomos.length;
    //get total completed chores and total amount earned
    data.completedChores = 0;
    data.totalEarned = 0;
    data.selfEarned = 0;
    data.totalCosts = 0
    for (var i = 0; i < curDomos.length; i++)
    {
        if (curDomos[i].completed !== 'false')
        {
            data.completedChores += 1;
            data.totalEarned += curDomos[i].cost;
            if (curDomos[i].completed === account.user)
            {
                data.selfEarned += curDomos[i].cost;
            }
        }
        data.totalCosts += curDomos[i].cost;
    }

    return data;
};

//setup to draw pie chart
const loadChart = (id, title, data, linkView = false, barChart = false) => {
    google.charts.load('current', {'packages':['corechart']});
    if (!barChart)
    {
        google.charts.setOnLoadCallback(setupChart.bind(this, id, title, data, linkView));
    }else{
        google.charts.setOnLoadCallback(setupBarChart.bind(this, id, title, data, linkView));
    }
};

const setupBarChart = (id, title, data, linkView) => {
    var options = {
        title:title,
        backgroundColor: (linkView) ? 'lightgrey' : 'grey',
        chartArea:{
            width: '94%'
        },
        width: '100%',
        height: 300,
        bar: {groupWidth: "50%"},
        legend: {position:'none'}
    };
    var chartData = google.visualization.arrayToDataTable(data);

    var chart = new google.visualization.BarChart(document.getElementById(id));
    chart.draw(chartData, options);
};

//sets up pie chart based on data and draws it to screen
const setupChart = (id, title, data, linkView) => {

    var options = {
        title:title, 
        backgroundColor: (linkView) ? 'lightgrey' : 'grey',
        width: 350,
        height: 200
    };
    var chartData = google.visualization.arrayToDataTable(data);
    var chart = new google.visualization.PieChart(document.getElementById(id));
    chart.draw(chartData, options);
};

const TotalStats = (props) => {
    let data = getMainData();

    if (data.completedChores !== 0)
    {
        loadChart('totalChart', 'Chores Completed',[
            ["Chores", "Completion Amount"],
            ["Completed Chores", data.completedChores],
            ["Unfinished Chores", (data.totalChores - data.completedChores)]
        ]);
        loadChart('totalMoneyChart', 'Earnings',[
            ["Earnings", "Amount"],
            ["Total Earnings", data.totalEarned - data.selfEarned],
            ["Self Claimed", data.selfEarned],
            ["Money Unclaimed", data.totalCosts - data.totalEarned]
        ]);
    }

    return(
        <div>
            <h3>Total Chores Completed: {data.completedChores}/{data.totalChores}</h3>
            <h3>Weeks Completed: {account.currentWeek - 1}</h3>
            <h3>Total Amount Earned: ${data.totalEarned} 
            {data.selfEarned === 0 ? null : ` [$${data.selfEarned} claimed by yourself]`}</h3>
            <div id="totalChart" className="googleChart"></div>
            <div id="totalMoneyChart" className="googleChart"></div>
        </div>
    );
};

const getLinkedData = () => {

    let data = [];
    for (var i = 0; i < linkedAccounts.length; i++)
    {
        let accountData = {user: linkedAccounts[i].username};
        accountData.amountEarned = 0;
        accountData.completedChores = 0;
        for (var j = 0; j < curDomos.length; j++)
        {
            if (curDomos[j].completed == accountData.user)
            {
                accountData.amountEarned += curDomos[j].cost;
                accountData.completedChores += 1;
            }
        }

        data.push(accountData);
    }

    return data;
};

const LinkedStats = (props) => {
    let data = getLinkedData();
    let overallData = getMainData();
    let trackingData = [["Earnings", "Amount"]];

    let nodes = data.map(function(node){
        loadChart(node.user+'ID', node.user + '\'s Earnings',[
            ["Earnings", "Amount"],
            ["Total Earned", node.amountEarned],
            ["Total Possible Earnings", overallData.totalCosts - node.amountEarned]
        ], true);
        trackingData.push([""+node.user, node.amountEarned]);
        return(
            <div className="statsLinkedSubView">
                <div id={node.user+"ID"} className="googleLinkChart"></div>
                <h2>Stats for: {node.user}</h2>
                <h3>Completed Chores: {node.completedChores}</h3>
                <h3>Amount Earned: ${node.amountEarned}</h3>
            </div>
        );
    });

    loadChart('childrenOverallBar', 'Earnings Comparison', trackingData, false, true);

    return(
        <div>
            <div id="childrenOverallBar" className="googleChart"></div>
            {nodes}
        </div>
    );
};

const StatsView = (props) => {

    return(
        <div className="statsMainView">
            <div className="statsSubView">
                <h1>Overall Stats</h1>
                <TotalStats />
            </div>    
            <div className="statsSubView">
                <h1>Children Stats</h1>
                <LinkedStats />
            </div>
        </div>
    );
};

//shows views based on account type
const showViews = (csrf) => {
    if (account.type === 'Child')
    {
        ReactDOM.render(
            <ChildShow />, document.querySelector('#main')
        );
    }
    else
    {
        if (account.subscription === false)
        {
            ReactDOM.render(
                <SubscribeView />, document.querySelector('#main')                
            );
            return false;
        }
        else
        {
            ReactDOM.render(
                <StatsView />, document.querySelector('#main')
            );
        }
    }
};
//grabs account and sets week and views up
const setup = (csrf) => {

    sendAjax('GET', 'getCurrentAccount', null, (result) => {
        account = result.data;
        showViews(csrf);
        if (account.type === 'Parent' && account.subscription)
        {
            loadStats(csrf);
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