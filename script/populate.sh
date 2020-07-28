#!/bin/sh

cd ..
cp ./data/billboard-hot-100.json ./data/billboard-hot-100.backup.json
until yarn run populate
do
    echo "Populate failed, trying again."
    sleep 60
done

exit $?
