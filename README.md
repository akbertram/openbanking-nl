open-banking-nl
===============

Small set of tools to enable Dutching banking clients to freely and 
programatically access their own data. 


Setup
-----

Install casperjs and its prerequisites as described here:
http://casperjs.readthedocs.org/en/latest/installation.html

Usage
-----

    casperjs abnamro.js <account number> <pas number> <pincode>
    casperjs ics.js <username> <password>

For ABN AMRO, you'll need to setup an "identificatie code":
https://www.abnamro.nl/portalserver/nl/prive/betalen/internet-bankieren/overboeken-met-identificatiecode.html

Both scripts dump the latest transactions to stdout.

Example
-------

    casperjs abnamro.js 050000000 000 00000

Outputs:

    [  
      {
        "time": "20140422191343350",
        "date": "2014-04-22",
        "code": "654",
        "amount": "1010.11",
        "counterParty": "HOLLANDSE BAKKER BV",
        "description": "SEPA Overboeking IBAN: NL00INGB0123456789 BIC: INGBNL2A Naam: HOLLANDSE BAKKER BV BV Omschrijving: factuur 186 Kenmerk: NOTPROVIDED SCT INCOMING"
      },
      {
        "time": "20140418105854290",
        "date": "2014-04-18",
        "code": "658",
        "amount": "-1452.00",
        "counterParty": "ANOTHER DUTCH BV",
        "description": "SEPA Overboeking IBAN: NL00ABNA0123456789 BIC: ABNANL2A Naam: ANOTHER DUTCH BV Omschrijving: Factuur 201404-013 ID debiteur: 234324234 SCT SINGLE OUTG"
      },
      {
        "time": "20140418105854240",
        "date": "2014-04-18",
        "code": "654",
        "amount": "3921.17",
        "counterParty": "CLIENT BV",
        "description": "SEPA Overboeking IBAN: NL00ABNA0123456789 BIC: ABNANL2A Naam: CLIENT BV Omschrijving: Factuur 203 ID debiteur: 034300343 SCT SINGLE OUTG"
      }
    ]



Debugging
---------

If something should go wrong, try running again with logging enabled:

    casperjs --verbose --log-level=debug abnamro.js ...

Pull requests welcome!



