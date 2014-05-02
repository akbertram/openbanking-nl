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

Debugging
---------

If something should go wrong, try running again with logging enabled:

    casperjs --verbose --log-level=debug abnamro.js ...

Pull requests welcome!



