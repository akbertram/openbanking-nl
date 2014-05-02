
var casperOptions = {
    viewportSize: {width: 800, height: 600},
    timeout: 10000
};

var casper = require('casper').create(casperOptions);

if(casper.cli.args.length != 2) {
    casper.echo("Usage: casperjs ics.js <username> <password>");
    casper.exit(-1);
}

casper.start('https://www.icscards.nl/ics/login', function() {
    this.fill("form#pkmslogin-form", {
        username: casper.cli.get(0),
        password: casper.cli.get(1) 
    }, true);
    
    // wait until the ajax-y login completes 
    this.waitForText("Ingelogd als", null, function() {
        this.capture("ics-login-timeout.png");
    }, 20000);
});


// Navigate to list of the most recent statements
casper.thenOpen("https://www.icscards.nl/ics/mijn/accountoverview", function() {
    this.capture("ics-list.png");

    var asText = function(info) { return info.text; }
    var dates = this.getElementsInfo('tr.show td.col1').map(asText);
    var description = this.getElementsInfo('tr.show td:nth-child(3)').map(asText);
    var type = this.getElementsInfo('tr.show td:nth-child(5)').map(asText);
    var foreignCurrency = this.getElementsInfo('tr.show td:nth-child(6)').map(asText);
    var amounts = this.getElementsInfo('tr.show td:nth-child(7)').map(asText);
    
    var results = [];

    for(var i in dates) {
        var amount = formatAmount(type[i], amounts[i]);
        var originalCurrency = parseCurrency(foreignCurrency[i]);
        var originalAmount;
        if(originalCurrency == 'EUR') {
            originalAmount = amount;
        } else {
            originalAmount = formatAmount(type[i], foreignCurrency[i])
        }
        results.push({
            date: dates[i], 
            description: formatDescription(description[i]), 
            originalCurrency: originalCurrency,
            originalAmount: originalAmount,
            amount: amount });
    }    
    
    require('utils').dump(results);
})


// reformat date from dd-mm-yyyy to yyyy-mm-dd
var formatDate = function(date) {
    var parts = date.split(/-/);
    return [ parts[2], parts[1], parts[0] ].join('-');
}

// format the transaction description
var formatDescription = function(description) {

    var lines = description.split('\n');
    var desc = lines[0];
    
    // eliminate new lines and commas
    desc = desc.trim().replace(/[\n\r,]/g, " ");

    // collapse multiple spaces to a single space
    desc = desc.replace(/\s+/g, " ");

    // remove any non-ascii characters
    desc = desc.replace(/[^A-Za-z 0-9 \.,!@#\$%\^&\*\(\)-_=\+;:]/g, '') ; 
    return desc;
}

// format amount from "DEBET 3,45" to -3.45
var formatAmount = function(type, amount) {
    if(!amount || !amount.trim()) {
        return;
    }

    amount = amount.replace(/[^0-9,]/g, '');
    amount = amount.replace(/,/, '.');    
    
    if(type.indexOf('Debet') != -1) {
        amount = "-" + amount;
    }

    return amount;
}

// parse the 3-Letter currency code
var parseCurrency = function(foreignCurrency) {
    currency = foreignCurrency.replace(/[^A-Z]/g, '');
    if(!currency) {
        return "EUR";
    }
    return currency;
}


casper.run();
