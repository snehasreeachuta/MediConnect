const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function check() {
  console.log('--- Checking MySQL / MariaDB on host ---');
  
  // Check common dirs
  const candidateDirs = [
    'C:\\Program Files\\MySQL',
    'C:\\Program Files (x86)\\MySQL',
    'C:\\xampp\\mysql',
    'C:\\wamp64\\bin\\mysql',
    'C:\\laragon\\bin\\mysql',
    'C:\\tools\\mysql',
    'D:\\xampp\\mysql',
    'D:\\MySQL'
  ];

  for (const d of candidateDirs) {
    if (fs.existsSync(d)) {
      console.log('Found directory:', d);
      try {
        console.log('Contents:', fs.readdirSync(d));
      } catch (e) {}
    }
  }

  // Check windows service
  try {
    const scOut = execSync('sc query state= all', { encoding: 'utf8' });
    const matches = scOut.match(/SERVICE_NAME:\s*([^\r\n]*mysql[^\r\n]*)/gi) ||
                    scOut.match(/SERVICE_NAME:\s*([^\r\n]*maria[^\r\n]*)/gi);
    if (matches) {
      console.log('Found services:', matches);
    } else {
      console.log('No mysql/mariadb service found in sc query');
    }
  } catch (err) {
    console.log('sc query error:', err.message);
  }
}

check();
