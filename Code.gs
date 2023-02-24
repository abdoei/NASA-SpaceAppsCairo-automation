// doGet is the function that is called when the user visits the web app URL that outputs from the deployment process.
function doGet() {
	return HtmlService.createHtmlOutputFromFile("NASA QR scanner");
}

// show the name of the user when scanning the QR code in the web app
function getNameForHTML(data = "44d3727e713a4ef9d8beacb78b33a6dd") {
	let ss = SpreadsheetApp.openById("1xvLQYfI80_DY132zLO2wB80dC6SqUlUea-LBxah0ZsA");
	let dataSheet = ss.getSheetByName("Data");
	let row = dataSheet.createTextFinder(data).findNext().getA1Notation();
	let nameCell = "B" + row.slice(1);
	return (dataSheet.getRange(nameCell).getValue());
	// return 5;
}

// return to the web app whether the user has used the QR code or not (got the meal or not)
function ifUsed(data = "2Amr Harb Hussein") {
	let name = data.slice(1);
	let meal = parseInt(data[0]);
	let ss = SpreadsheetApp.openById("1xvLQYfI80_DY132zLO2wB80dC6SqUlUea-LBxah0ZsA");
	let sheet = ss.getSheets()[meal];
	let row = sheet.createTextFinder(name).findNext()
	if (row == null) return -1;
	else row = row.getA1Notation();
	let dateCell = "C" + row.slice(1);
	let date = sheet.getRange(dateCell).getValue();
	if (date == '') {
		return 0;
	} else {
		/*Logger.log(date.toString());*/
		return date.toString().slice(0, -42);
	}

}

// register the user in the sheet when he scans the QR code and gets the meal
function registerFromHTML(name, mealNumber) {
	let ss = SpreadsheetApp.openById("1xvLQYfI80_DY132zLO2wB80dC6SqUlUea-LBxah0ZsA");
	let sheet = ss.getSheets()[mealNumber];
	let row = sheet.createTextFinder(name).findNext().getA1Notation();
	let date = "C" + row.slice(1);
	let d = new Date();
	let currentTime = d;
	sheet.getRange(date).setValue(currentTime);
	// Logger.log(currentTime);
}

/*
  Google charts api has no quota limitation policy but diprication policy
  so //TODO find any other api for back up purposes
  https://stackoverflow.com/questions/18185237/google-chart-api-request-limits
*/

// generate QR code from the hash code
function getQR(content = "default") {
	var imageData = UrlFetchApp.fetch('https://chart.googleapis.com/chart', {
		'method': 'post',
		'payload': {
			'cht': 'qr',
			'chl': content.toString(),
			'chs': '500x500'
		}
	}).getBlob();
	return imageData;
}


// store QR codes into the drive not to consume the google charts api quota
function storeQrDrive(fileName = "default", hashCode = "default") {
	var folder = DriveApp.getFolderById("1dtEEem-vzBkOhnRe9Gmjil7EOKvmaSO_");
	// create the file 
	let file = folder.createFile(getQR(hashCode)).setName(fileName)
	file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
	let fileID = file.getId();
	let fileUrl = file.getUrl();
	return [fileID, fileUrl];
	// Logger.log(file.getDownloadUrl());
}

// whatsapp api generator function
function WAAPI(num = 201144292107, url = "default", name = "name", todaysMessage = 'M', ord = "first") {
	url = "https://api.whatsapp.com/send?phone=" + num + "&text=Hi+" + encodeURIComponent(name) + "+%F0%9F%91%8B%F0%9F%98%8A%0D%0A" + "This+is+NASA+Space+Apps+Cairo+2022%2C+and+here+you+are+your+QR+code+for+the+" + ord + "+meal+for+today+%F0%9F%98%8B+%0A%2A" + (todaysMessage) + '%2A%0A' + url;
	Logger.log(url);
	return url;

}

// get a random nice message from the messages array
function getMessage() {
	messages = [
		"More smiles were seen this year because of your volunteer efforts during the hackathon. We will never forget your work. Thank you.",
		"The wealth of love that you have amassed by volunteering will pay interest in the form of happiness for the rest of your life. Thanks.",
		"Versatile, Optimistic, Lovable, Understanding, Nice, Talented, Energetic, Enthusiastic, Resilient – that is the kind of amazing VOLUNTEER that you are. Thanks.",
		"You are proof that volunteers are people who don’t want to be thanked for helping others but want to thank others for giving them the opportunity to help. God bless you."
	]
	let i = Math.floor(Math.random() * (messages.length));
	return messages[i];
}

// make a hash code for each user
function MD5(input = "defaul", salt = "salt") {
	input = input + salt;
	var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input);
	var txtHash = '';
	for (i = 0; i < rawHash.length; i++) {
		var hashVal = rawHash[i];
		if (hashVal < 0) {
			hashVal += 256;
		}
		if (hashVal.toString(16).length == 1) {
			txtHash += '0';
		}
		txtHash += hashVal.toString(16);
	}
	return txtHash;
}

// validate the phone number
function validatePhoneEgypt(num = "0 106 367 7989") {
	if (num[0] != '2') {
		if (num[0] == '0') num = '2' + num;
		else if (num[0] == '1') num = '20' + num;
	}
	num = num.toString().split(" ").join("");
	// Logger.log(num);
	return num;
}

// make a link to be put in the cell
function linkCellContents(cell = "H11", txt = "text", url = "url") {
	var range = SpreadsheetApp.getActive().getRange(cell);
	var richValue = SpreadsheetApp.newRichTextValue()
		.setText(txt)
		.setLinkUrl(url)
		.build();
	range.setRichTextValue(richValue);
}

// get the first name from the full name
function getFirstName(name = "full name") {
	let i = 0;
	while (name[i] != ' ') i++;
	return name.slice(0, i);
}

// generate the user hash code and store it in the sheet
function buttonTrigger() {
	let l = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getLastRow();
	let ss = SpreadsheetApp.getActiveSpreadsheet();
	let dataSheet = ss.getSheetByName("Data");
	let counter = dataSheet.getRange("L2").getValue();
	// var counter = 9;
	let hashColumn = 'G'
	while (counter <= l) {
		// let ss = SpreadsheetApp.openById("1lZxLfQtyoaqfMIz7HImkv1cqR3KtnvDdb_FDShIWgqw");
		if (dataSheet.getRange(hashColumn + counter).getValue() == '') {
			let name = dataSheet.getRange('B' + counter).getValue();
			let email = dataSheet.getRange('D' + counter).getValue();
			let phone = dataSheet.getRange('C' + counter).getValue();
			let salt = MD5(counter);

			celN = hashColumn + counter;

			// hash the values
			let hash = MD5(name + email + phone + salt);

			// // generate QR code and store it
			// let fileProparties =storeQrDrive(name, hash);
			// let fileIdDrive  = fileProparties[0];
			// let fileUrlToSend = fileProparties[1];

			// set the ID in place (Column G)
			dataSheet.getRange('G' + counter).setValue(hash);

			// // set the Rich in place (Column B) 
			// linkCellContents('B'+counter, name, WAAPI(validatePhoneEgypt(phone), encodeURIComponent(fileUrlToSend), getFirstName(name), encodeURIComponent(getMessage())));

			// // open url when clicking
			// // openUrl(WAAPI(validatePhoneEgypt(phone), encodeURIComponent(fileUrlToSend), name));
			counter++;
			// dataSheet.getRange(celN).setValue("QR genrated!");
		} else {
			continue;
		}
		dataSheet.getRange("L2").setValue(counter);
	}
}


// functions to be triggered by the button on each sheet which will generate and store on the sheet, the link to send the qr code to the user
// they are four meals and two days so there are four functions for each day and meal
// the naming convention is dayMeal() where day is the day number and meal is the meal number
function oneOne() {
	let ss = SpreadsheetApp.getActiveSpreadsheet();
	let dataSheet = ss.getSheetByName("1meal1day");
	let data = ss.getSheetByName("Data");
	let l = dataSheet.getLastRow();
	var counter = 2;
	let linkColumn = 'B'
	while (counter <= l) {
		// let ss = SpreadsheetApp.openById("1lZxLfQtyoaqfMIz7HImkv1cqR3KtnvDdb_FDShIWgqw");
		if (dataSheet.getRange(linkColumn + counter).getValue() == '') {
			celN = linkColumn + counter;
			// data from Data
			let hash = data.getRange("G" + counter).getValue();
			let phone = data.getRange("C" + counter).getValue();

			let name = dataSheet.getRange("A" + counter).getValue();
			// generate QR code and store it
			let fileProparties = storeQrDrive(name + ", the first meal of the first day", "1" + hash /*add one in the first place to make decoding the QR faster*/ );
			// let fileIdDrive  = fileProparties[0];
			let fileUrlToSend = fileProparties[1];

			// set the Rich in place (Column B) 
			linkCellContents('B' + counter, "send to " + name, WAAPI(validatePhoneEgypt(phone), encodeURIComponent(fileUrlToSend, ), getFirstName(name), (getMessage()), "first"));
			counter++;
		}
	}
}


function twoOne() {
	let ss = SpreadsheetApp.getActiveSpreadsheet();
	let dataSheet = ss.getSheetByName("2meal1day");
	let data = ss.getSheetByName("Data");
	let l = dataSheet.getLastRow();
	var counter = 2;
	let linkColumn = 'B'
	while (counter <= l) {
		// let ss = SpreadsheetApp.openById("1lZxLfQtyoaqfMIz7HImkv1cqR3KtnvDdb_FDShIWgqw");
		if (dataSheet.getRange(linkColumn + counter).getValue() == '') {
			celN = linkColumn + counter;
			// data from Data
			let hash = data.getRange("G" + counter).getValue();
			let phone = data.getRange("C" + counter).getValue();

			let name = dataSheet.getRange("A" + counter).getValue();
			// generate QR code and store it
			let fileProparties = storeQrDrive(name + ", the second meal of the first day", "2" + hash /*add two in the first place to make decoding the QR faster*/ );
			// let fileIdDrive  = fileProparties[0];
			let fileUrlToSend = fileProparties[1];

			// set the Rich in place (Column B) 
			linkCellContents('B' + counter, "send to " + name, WAAPI(validatePhoneEgypt(phone), encodeURIComponent(fileUrlToSend, ), getFirstName(name), (getMessage()), "second"));
			counter++;
		}
	}
}


function oneTwo() {
	let ss = SpreadsheetApp.getActiveSpreadsheet();
	let dataSheet = ss.getSheetByName("1meal2day");
	let data = ss.getSheetByName("Data");
	let l = dataSheet.getLastRow();
	var counter = 2;
	let linkColumn = 'B'
	while (counter <= l) {
		// let ss = SpreadsheetApp.openById("1lZxLfQtyoaqfMIz7HImkv1cqR3KtnvDdb_FDShIWgqw");
		if (dataSheet.getRange(linkColumn + counter).getValue() == '') {
			celN = linkColumn + counter;
			// data from Data
			let hash = data.getRange("G" + counter).getValue();
			let phone = data.getRange("C" + counter).getValue();

			let name = dataSheet.getRange("A" + counter).getValue();
			// generate QR code and store it
			let fileProparties = storeQrDrive(name + ", the first meal of the first day", "3" + hash /*add three in the first place to make decoding the QR faster*/ );
			// let fileIdDrive  = fileProparties[0];
			let fileUrlToSend = fileProparties[1];

			// set the Rich in place (Column B) 
			linkCellContents('B' + counter, "send to " + name, WAAPI(validatePhoneEgypt(phone), encodeURIComponent(fileUrlToSend, ), getFirstName(name), (getMessage()), "first"));
			counter++;
		}
	}
}


function twoTwo() {
	let ss = SpreadsheetApp.getActiveSpreadsheet();
	let dataSheet = ss.getSheetByName("2meal2day");
	let data = ss.getSheetByName("Data");
	let l = dataSheet.getLastRow();
	var counter = 2;
	let linkColumn = 'B'
	while (counter <= l) {
		// let ss = SpreadsheetApp.openById("1lZxLfQtyoaqfMIz7HImkv1cqR3KtnvDdb_FDShIWgqw");
		if (dataSheet.getRange(linkColumn + counter).getValue() == '') {
			celN = linkColumn + counter;
			// data from Data
			let hash = data.getRange("G" + counter).getValue();
			let phone = data.getRange("C" + counter).getValue();

			let name = dataSheet.getRange("A" + counter).getValue();
			// generate QR code and store it
			let fileProparties = storeQrDrive(name + ", the second meal of the first day", "4" + hash /*add four in the first place to make decoding the QR faster*/ );
			// let fileIdDrive  = fileProparties[0];
			let fileUrlToSend = fileProparties[1];

			// set the Rich in place (Column B) 
			linkCellContents('B' + counter, "send to " + name, WAAPI(validatePhoneEgypt(phone), encodeURIComponent(fileUrlToSend, ), getFirstName(name), (getMessage()), "second"));
			counter++;
		}
	}
}