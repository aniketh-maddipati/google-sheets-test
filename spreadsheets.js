var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');
var doc = new GoogleSpreadsheet('1wkycSVsaQznm1LyP-v506ELnx1zXjQacsNXiZYQjCj4');

var async = require('async');
var sheet;

const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser');
const { google } = require('googleapis');
var sheets = google.sheets('v4');



app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies




// Authenticate with the Google Spreadsheets API.
app.get('/rows', (req, res) => {
    // Create a document object using the ID of the spreadsheet - obtained from its URL.
    doc.useServiceAccountAuth(creds, function (err) {
        doc.getRows(1, function (err, rows) {
            console.log(rows);
            res.json(rows)
        });
    });
})

// app.get('/batch/:range',(req, res) => {

// })

app.get('/info', (req, res) => {
    doc.useServiceAccountAuth(creds, async function (err) {
        doc.getInfo(function (err, info, step) {
            res.json('Loaded doc: ' + info.title + ' by ' + info.author.email);
        })
    });
})

app.get('/:name', (req, res) => {
    doc.useServiceAccountAuth(creds, async () => {
        await doc.getRows({
            where: {
                name: JSON.stringify(req.params.name)

            }
        },
            (err, rows) => {
                if (err) {
                    res.status(400).send(err)
                } else {
                    res.json(rows)
                }
            })
    })
})
app.post('/', async (req, res, next) => {
    console.log(req.body.years)
    console.log('HERE')
    // res.json(req.body)
    var inputJSON = {
        name: req.body.name,
        city: req.body.city,
        position: req.body.position,
        company: req.body.company,
        Years_of_Experience: req.body.years
    }
    await doc.useServiceAccountAuth(creds, async function () {
        await doc.getRows(1, (err) => {
            if (err) {
                res.status(404).send(err)
            }
            else {
                doc.addRow(1, inputJSON, function (err) {
                    if (err) {
                    }
                    else {
                        res.status(200).send(inputJSON)
                    }
                })
            }
        })
    });
})

app.put('/:rownum', (req, res, next) => {
    var inputJSON = {
        name: req.body.name,
        city: req.body.city,
        position: req.body.position,
        company: req.body.company,
        years_of_experience: req.body.years_of_experience
    }
    doc.useServiceAccountAuth(creds, async (err) => {
        doc.getRows(1, function (err, rows) {
            // console.log(rows);
            res.json(rows)
        });
    })

});


app.delete('/:rownum', (req, res, next) => {
    doc.useServiceAccountAuth(creds, async () => {
        doc.getRows(1, function (err, rows) {
            // console.log(rows[0])
            if (err) {
                res.status(404).send(err)
            } else {
                // res.json(rows);
                rows[0, rows.length - 1].del(req.params.rownum) // this is asynchronous  
                res.json(rows)
            }
        });
    });
})




app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
