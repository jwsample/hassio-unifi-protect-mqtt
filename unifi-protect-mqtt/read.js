var readline = require('readline');
const YAML = require('yaml')
const { exec } = require("child_process");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

//Regex to match log lines that aren't json event data.
//Event objects occur after these lines
reLogLine = /^\d{4}-\d{2}/

let inObject = false
let objBuffer = ""

let testCmd = `mosquitto_pub -h ${process.env.mqtt_host} -u "${process.env.mqtt_user}" -P "${process.env.mqtt_password}" -m "starting" -t "unifi/protect/poll"`
exec(testCmd, (error, stdout, stderr) => {
    if (error) {
        console.log(`error connecting to mqtt: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`error connecting to mqtt: ${stderr}`);
        return;
    }
    console.log(`mqtt credentials working`);
});



function sendEvent(message, topic) {
    //Shell out to mosquitto_pub and let it handle all the intricacies. No need for extra code
    //Fire and forget
    let cmd = `mosquitto_pub -h ${process.env.mqtt_host} -u "${process.env.mqtt_user}" -P "${process.env.mqtt_password}" -m "${message}" -t "${topic}"`
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        //console.log(`stdout: ${stdout}`);
    });
}

rl.on('line', function (line) {

    if (process.env.verbose_logging == "true") {
        console.log(line)
    }


    //is this a log line? //YYYY-MM
    //OR:
    //a message from tail? happens when a file rotates or disappears. -F tail options should pick up new file when it appears
    if (reLogLine.test(line) || line.startsWith("tail:")) {
        //ignore
        return
    }

    //It appears event objects end on the only lines that end with '}'

    if (line.trim().endsWith("}")) {

        objBuffer += line

        inObject = false

        //Is there a JSON object in the buffer?
        try {

            if (objBuffer.length > 0) {

                //Log entries are not valid JSON, but are valid yaml
                //Parse as yaml then back to JSON for publishing
                newEvent = YAML.parse(objBuffer)

                objBuffer = ""
                inObject = false

                if (newEvent.hasOwnProperty("type") && newEvent['type'] == "ring") {
                    sendEvent(newEvent.cameraId, `${process.env.mqtt_ring_topic}`)
                }

                if (newEvent.hasOwnProperty("type") && newEvent['type'] == "motion") {
                    sendEvent(newEvent.cameraId, `${process.env.mqtt_motion_topic}`)
                }

            }

        } catch (error) {
            //Malformed log entry? Log and try to get back on track
            console.log("ERROR: " + error)
            console.log(objBuffer)
            objBuffer = ""
            inObject = false
        }

        return
    }

    if (line.startsWith("{")) {
        inObject = true
    }

    if (inObject) {
        objBuffer += line
    }

})
