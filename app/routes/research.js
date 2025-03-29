const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const {
    environmentalScripts
} = require("../../config/config");

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    this.displayResearch = (req, res) => {

        if (req.query.symbol) {
            const allowedUrls = {
                'AAPL': 'https://api.example.com/stocks/AAPL',
                'GOOGL': 'https://api.example.com/stocks/GOOGL',
                'MSFT': 'https://api.example.com/stocks/MSFT'
            };
            const url = allowedUrls[req.query.symbol];
            if (url) {
                return needle.get(url, (error, newResponse, body) => {
                    if (!error && newResponse.statusCode === 200) {
                        res.writeHead(200, {
                            "Content-Type": "text/html"
                        });
                    }
                    res.write("<h1>The following is the stock information you requested.</h1>\n\n");
                    res.write("\n\n");
                    if (body) {
                        res.write(body);
                    }
                    return res.end();
                });
            } else {
                res.writeHead(400, {
                    "Content-Type": "text/html"
                });
                res.write("<h1>Invalid symbol provided.</h1>\n\n");
                return res.end();
            }
        }

        return res.render("research", {
            environmentalScripts
        });
    };

}

module.exports = ResearchHandler;
