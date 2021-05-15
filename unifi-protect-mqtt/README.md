# Hass.io Add-on : Unifi Protect MQTT Bridge

Bridges motion and doorbell ring events to Hassio/MQTT.

Primarily meant for doorbell ring events although motion events are published as well. 


## Installation

Add https://github.com/jwsample/hassio-unifi-protect-mqtt as a repository in Supervisor -> Add-on store

## About

I needed a simple doorbell event in hassio but most of the solutions required either installing extra packages on the doorbell or install installing HACS.

This is a simple MQTT bridge that monitors events through a persistent SSH connection to a cloud key and publishes a subset to MQTT.

## Config

### cloudkey_host

IP address of the cloud key. Host based naming might work, but I've found mDNS resolution flaky on hass.io.

### cloudkey_user

SSH user name. Probably 'ubnt' unless you've changed it. This is not a unifi cloud account, it must be a local user.

**SSH must be enabled in the cloud key**

Currently this is enabled at Settings -> Advanced -> SSH

### cloudkey_password

SSH password.

### cloudkey_fingerprint

We can't do cert based SSH auth without modifying the doorbell/camera, but we can at least verify the identity of cloudkey before sending the password.

Run the following command:

    ssh-keyscan <cloudkey_host> 2> /dev/null

Copy the output into this setting.

### mqtt_ring_topic

MQTT topic for doorbell rings. Payload is the doorbell MAC address

Defaults to unifi/protect/doorbell

### mqtt_motion_topic

MQTT topic for motion events. Payload is the camera MAC address

Defaults to unifi/protect/motion 

### mqtt_host

MQTT host name or IP. Defaults to 'core-mosquitto' to match default Mosquitto broker. 

### mqtt_user

MQTT user name

### mqtt_password

MQTT password

### verbose_logging

If enabled, essentially copies the entire cloud key event log into the output log of this addon. Useful for debugging.

## Notes

The add-on publishes a single event to "unifi/protect/poll" at startup to test the MQTT connection