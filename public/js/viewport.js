var version = parseFloat(navigator.appVersion);
if( /Android/i.test(navigator.userAgent) ) {
    if( version < 535 ) {
        document.write('<meta name="viewport" content="width=640, initial-scale=0.5, maximum-scale=0.5">'); 
    } else {
        //continue
    }
} else {
    document.write('<meta name="viewport" content="width=640, user-scalable=no">');
}