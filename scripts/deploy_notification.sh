#!/usr/bin/env bash

# The true bit is to ensure even if one hook fails, the next one runs

./slack.sh $SLACK_WEBHOOK || true
./discord.sh success $DISCORD_WEBHOOK || true