// Module to control application life.
const app = require('app');
// Module to create native browser window.
const BrowserWindow = require('electron').BrowserWindow;
// Report crashes to our server.
require('crash-reporter').start();
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;
var session = {};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 700
        , 'auto-hide-menu-bar': true//true
    });

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/login.html');
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        //mainWindow.webContents.session.cookies
        mainWindow = null;
        exit();
    });

});
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    exit();
});


// In main process. Use to message between BrowserWindow.
var ipcMain = require('electron').ipcMain;

ipcMain.on('jump_to_list', function (event, arg) {
    mainWindow.loadUrl('file://' + __dirname + arg.url);
    event.returnValue = true;
});

ipcMain.on('session', function (event, arg) {  // arg->{opt:'', key:'', value:''}
    var opt = arg.opt;
    if (opt == 'get') {
        var ret = session[arg.key];
        if (typeof(ret) == 'undefined')
            event.returnValue = 'undefined';
        else
            event.returnValue = ret;
    } else if (opt == 'put') {
        session[arg.key] = arg.value;
        event.returnValue = true;

    } else if (opt == 'remove') {
        var bln = false;
        event.returnValue = bln;
    } else if (opt == 'clear') {
        session = {};
        event.returnValue = 'true';
    }
});


// Exit app.
function exit() {
    if (process.platform != 'darwin') {
        app.quit();
    }
}