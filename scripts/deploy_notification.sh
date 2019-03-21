#!/usr/bin/env bash

scripts_dir=`dirname $0`

# The true bit is to ensure even if one hook fails, the next one runs

# Slack notification has some issues, needs more debug
#$scripts_dir/slack.sh $SLACK_WEBHOOK || true
$scripts_dir/discord.sh success $DISCORD_WEBHOOK || true