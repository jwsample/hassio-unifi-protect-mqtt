#!/usr/bin/with-contenv bashio

CONFIG_PATH=/data/options.json

cloudkey_host="$(bashio::config 'cloudkey_host')"
cloudkey_user="$(bashio::config 'cloudkey_user')"
cloudkey_password="$(bashio::config 'cloudkey_password')"
cloudkey_fingerprint="$(bashio::config 'cloudkey_fingerprint')"

export mqtt_ring_topic="$(bashio::config 'mqtt_ring_topic')"
export mqtt_motion_topic="$(bashio::config 'mqtt_motion_topic')"
export mqtt_host="$(bashio::config 'mqtt_host')"
export mqtt_user="$(bashio::config 'mqtt_user')"
export mqtt_password="$(bashio::config 'mqtt_password')"
export verbose_logging="$(bashio::config 'verbose_logging')"

echo "Starting unifi event listener."

mkdir ~/.ssh
echo $cloudkey_fingerprint > ~/.ssh/known_hosts

while :
do
    sshpass -p "${cloudkey_password}" \
      ssh -t ${cloudkey_user}@${cloudkey_host} "tail -n 0 -F /srv/unifi-protect/logs/events.cameras.log" \
      | node read.js 

    echo "SSH connection failure."
    sleep 5
    echo "Retrying SSH connection."
done
