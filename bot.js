const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const emoteID = '%F0%9F%91%8D';
let users = [];
let spreadsheetID = '';
let count = 0;
let botID = "";
let range;

const discordServerID = 266074632056995840;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

function login()
{
    client.login(botID);
}

client.on('messageReactionAdd', function(messageReaction, user) 
{
	let guilds = client.guilds.first();
	let name;
	
	// && messageReaction.message.author.bot
	
    if (messageReaction.emoji.identifier == emoteID && messageReaction.message.channel.name == 'calendar')
    {
		//fetchMember function wraps output in a Promise Object, had difficulty accessing
		if (guilds.member(user).nickname == null)
			name = [user.username];
		else
			name = [guilds.member(user).nickname];
		
		range = messageReaction.message.content.split('\n')[1] + ":" + messageReaction.message.content.split('\n')[0];
		updateSheets(range, name);
    }
});

client.on('messageReactionRemove', function(messageReaction, user)
{
	let guilds = client.guilds.first();
	let name;
	
	if (messageReaction.emoji.identifier == emoteID && messageReaction.message.channel.name == 'calendar')
	{
		//fetchMember function wraps output in a Promise Object, had difficulty accessing
		if (guilds.member(user).nickname == null)
			name = [user.username];
		else
			name = [guilds.member(user).nickname];
		
		range = messageReaction.message.content.split('\n')[1] + ":" + messageReaction.message.content.split('\n')[0];
		removeFromSheets(range, name);
	}
})

function grabSpreadSheetID()
{
    fs.readFile('spreadsheet.json', (err, content) => {
        if (err) return console.log("Error loading botID");
        spreadsheetID = "" + JSON.parse(content);
    })
}

function grabBotId()
{
    fs.readFile('bot.json', (err, content) => {
        if (err) return console.log("Error loading botID");
        botID = "" + JSON.parse(content);
        login();
    })
}

grabBotId();
grabSpreadSheetID();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

function updateSheets(sheetName, name)
{
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), addSheet, sheetName, name);
    });
}

function removeFromSheets(sheetName, name)
{
	fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), removeFromSheet, sheetName, name);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, sheetName, name) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client, sheetName, name);
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

function sendData(auth, name)
{
	//Create an ojbect to act as the google apiw
    var sheets = google.sheets({version: 'v4', auth});

	//Generate our request
    var request = 
	{
        // The ID of the spreadsheet to update.
        spreadsheetId: spreadsheetID,  // TODO: Update placeholder value.
		range: range,
		valueInputOption: 'RAW',
    
        resource: 
		{
    
			// The new values to apply to the spreadsheet.
			"values": 
			[
				name
			]
    
		},
    
		//Grab the authorization toen stored at token.json
        auth: fs.readFile(TOKEN_PATH, (err, content) => {
            return JSON.parse(content).access_token;
        }),
      };
    
		
	sheets.spreadsheets.values.append(request, function(err, response) 
		{
			if (err) 
			{
				console.error(err);
				return;
			}
			
			console.log("Spreadsheet Updated!");
      });
}

function removeFromSheet(auth, sheetName, name) 
{
	var sheets = google.sheets({version: 'v4', auth});

    /*var request = {
	  "requests": [
		{
		  "deleteDimension": {
			"range": {
			  "sheetId": sheetId,
			  "dimension": "ROWS",
			  "startIndex": 0,
			  "endIndex": 3
			}
		  }
		},
		{
		  "deleteDimension": {
			"range": {
			  "sheetId": sheetId,
			  "dimension": "COLUMNS",
			  "startIndex": 1,
			  "endIndex": 4
			}
		  }
		},
	  ],
	}*/
	
	let requests = [];
	
	requests.push({
	  findReplace: {
		find: name,
		replacement: "Test",
		//matchEntireCell: true,
		range: { sheetName }
	  },
	});


	sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetID, 
	resource: {requests}}, (err, response) => {
            if (err && err.response.status != 400) {
                // Handle error
                console.log(err);
              }
			  console.log("Success");
        });
}

function addSheet(auth, sheetName, name) {
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
            if (err && err.response.status != 400) {
                // Handle error
                console.log(err);
				sendData(auth, name);
              }
			  
			  sendData(auth, name);
        });
}