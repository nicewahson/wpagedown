var cp = require('child_process');
cp.exec('node c2.js', function(err, sin, sout){
    console.log(sin, sout)
})