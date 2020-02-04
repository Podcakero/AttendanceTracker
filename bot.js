const Discord = require('discord.js');
const client = new Discord.Client();
const emoteID = '%F0%9F%91%8D';
let users = [];
const spreadsheetID = '1m4ah9_Gi5o1h3wocZqIIIhJOZUU8H4Wyt1j18xijLiM';
let count = 0;

var range ;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageReactionAdd', function(messageReaction, user) 
{
    if (messageReaction.emoji.identifier == emoteID && messageReaction.message.channel.name == 'calendar')
    {
        users[count] = [user.lastMessage.member.nickname];
        count++;
    }

    range = messageReaction.message.content.split('\n')[0];

    update3(range);

    update();
});

client.login('NjczOTEyNjk3NDk0MTc1NzU2.XjhCqA.NShLYDtY8d5Ghzs9JZBR8i_Rsu0');

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
function update()
{
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), sendData);
    });
}

function update3(sheetName)
{
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize3(JSON.parse(content), addSheet, sheetName);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize3(credentials, callback, sheetName) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client, sheetName);
    });
  }

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function sendData(auth)
{
    var sheets = google.sheets({version: 'v4', auth});

    var request = {
        // The ID of the spreadsheet to update.
        spreadsheetId: spreadsheetID,  // TODO: Update placeholder value.
    
        resource: {
          // How the input data should be interpreted.
          valueInputOption: 'RAW',  // TODO: Update placeholder value.
    
          // The new values to apply to the spreadsheet.
          data: [
              {
                  "values": 
                      users
                  ,
                  "range": range
              }
          ],  // TODO: Update placeholder value.
    
          // TODO: Add desired properties to the request body.
        },
    
        auth: fs.readFile(TOKEN_PATH, (err, content) => {
            return JSON.parse(content).access_token;
        }),
      };
    
      sheets.spreadsheets.values.batchUpdate(request, function(err, response) {
        if (err) {
          console.error(err);
          return;
        }
    
        // TODO: Change code below to process the `response` object:
        //console.log(JSON.stringify(response, null, 2));
      });
}

function addSheet(auth, sheetName)
{
    var sheets = google.sheets({version: 'v4', auth});

    let requests = [];

    requests.push({
        addSheet: {
            properties: {
                title: sheetName
            }
        }
    })

    sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetID, 
        resource: {requests}}, (err, response) => {
            if (err) {
                // Handle error
                console.log(err);
              }
        });
}

