
var casperOptions = {
    viewportSize: {width: 1024, height: 768},
    verbose: "true",
    logLevel: "debug",
    timeout: 30000,
    onTimeout: function() {
        this.echo("Timed out. Take a look at abnamro-timeout.png to see what went wrong.", "ERROR");
        this.capture("abnamro-timeout.png");
        this.exit(-2);
    }
};

var casper = require('casper').create(casperOptions);

if(casper.cli.args.length != 3) {
    casper.echo("Usage: casperjs abnamro.js <account number> <pass number> <pincode>");
    casper.exit(-1);
}
var accountNumber = casper.cli.raw.get(0);
var cardNumber = casper.cli.raw.get(1);
var pincode = casper.cli.raw.get(2);

// define a standard waiting function
var timeout = 30 * 1000;
casper.waitUntil = function(selector, callback) {
    this.log("Waiting for " + selector + "...");
    return this.waitUntilVisible(selector, callback, function() {
        this.echo("Timeout while waiting for " + selector + ". See abnamro-timeout.png", "ERROR");
        this.capture("abnamro-timeout.png");
    }, timeout);
};

casper.onTimeout = function() {
    this.echo("Navigation timed out, see abnamro-timeout.png");
    this.capture("abnamro-timeout.png");   
};

casper.start('https://www.abnamro.nl', function() {
    this.waitUntil(".mcf-button-login", function() {
        this.log("Home page loaded", "debug");
        this.clickLabel("log in");
    });
});


// Wait until prompted for the soft/hard login choice
casper.then(function() {
    this.waitUntil(".mcf-loginSofttoken", function() {
        this.log("Choosing soft login...", "debug");
        this.click(".mcf-loginSofttoken");
    });
});

// Fill in the login form when it loads
casper.then(function() {
    this.log("Waiting for login form...", "debug");
    this.waitUntil('form.mcf-form-login', function() {
        this.log("Submitting credentials...", "debug");  
        this.sendKeys('input[name="accountnumberInput"]', accountNumber);
        this.sendKeys('input[name="cardnumberInput"]', cardNumber);
        for(var i=0;i<5;++i) {
            this.sendKeys('input[name="login-pincode-' + i + '"]', pincode.substring(i,i+1));
        }
        this.click('input[type="submit"]');
    });
});

// Wait until the account list appears, and navigate to our account
casper.then(function() {
    var accountId = accountNumber.replace(/^0+/, '');
    var account = 'li[data-account="' + accountId + '"]';
    this.waitUntil(account, function() {
        this.click(account);
    });
});


// Finally scrape the transaction list
casper.then(function() {
    this.waitUntil('tr.mcf-row-mutations', function() {
        var asText = function(info) { return info.text; }
        var asHtml = function(info) { return info.html; }
        var rows = this.getElementsInfo('tr.mcf-row-mutations');
        var dates = this.getElementsInfo('tr.mcf-row-mutations .mcf-col-date').map(asText);
        var counterparty = this.getElementsInfo('tr.mcf-row-mutations .mcf-mutationcontraacoountname').map(asText);
        var description = this.getElementsInfo('tr.mcf-row-mutations .mcf-mutationdetail').map(asHtml);
        var af = this.getElementsInfo('tr.mcf-row-mutations .mcf-col-amountmin').map(asText);
        var bij = this.getElementsInfo('tr.mcf-row-mutations .mcf-col-amountplus').map(asText);

        var results = [];
        for(var i in dates) {
            this.echo(description[i]);
            if(dates[i] && (af[i] || bij[i]) && counterparty[i]) {
                var time = rows[i].attributes["data-date"]; 
                results.push({
                    time: time,
                    date: formatDate(time),               
                    code: rows[i].attributes["data-mutationcode"], 
                    amount: formatAmount(af[i], bij[i]),
                    counterParty: counterparty[i],
                    description: formatDescription(counterparty[i], description[i])
                });
            }
        }
        require('utils').dump(results);
    });
});

var formatDate = function(time) {
    var year = time.substring(0, 4);
    var month = time.substring(4, 6);
    var day = time.substring(6, 8);
    return [year, month, day].join('-');
}

var formatAmount = function(af, bij) {
    var s = af.trim();
    if(!s) {
        s = bij.trim();
    }
    // remove spaces, '+' sign, and thousands separator
    s = s.replace(/[\.\s\+]/g, "");

    // use english decimal point
    s = s.replace(/,/, ".");
    return s;
}

var formatDescription = function(counterparty, desc) {

    // interpret <br> as newlines
    desc = desc.replace(/<br>/g, "\n");
    
    // strip out remaining  html tags
    desc = desc.replace(/<.+?>/g, " ");

    // collapse multiple spaces to a single space
    desc = desc.replace(/\s+/g, " ");
    desc = desc.replace(/\n+/g, "\n");

    return desc.trim();
}

casper.run();
