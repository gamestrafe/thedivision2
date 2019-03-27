#!/bin/bash

if [ -z "$1" ]; then
  echo -e "WARNING!!\nYou need to pass the WEBHOOK_URL as first argument" && exit
fi

echo -e "[Webhook]: Sending webhook to Slack...\\n";

AUTHOR_NAME="$(git log -1 "$TRAVIS_COMMIT" --pretty="%aN")"
COMMITTER_NAME="$(git log -1 "$TRAVIS_COMMIT" --pretty="%cN")"
COMMIT_SUBJECT="$(git log -1 "$TRAVIS_COMMIT" --pretty="%s")"
COMMIT_MESSAGE="$(git log -1 "$TRAVIS_COMMIT" --pretty="%b")"

if [ "$AUTHOR_NAME" == "$COMMITTER_NAME" ]; then
  CREDITS="$AUTHOR_NAME authored & committed"
else
  CREDITS="$AUTHOR_NAME authored & $COMMITTER_NAME committed"
fi

if [[ $TRAVIS_PULL_REQUEST != false ]]; then
  URL="https://github.com/$TRAVIS_REPO_SLUG/pull/$TRAVIS_PULL_REQUEST"
else
  URL=""
fi

TIMESTAMP=$(date --utc +%FT%TZ)
# Something is wrong with this, but can't figure out what, so skipping for now
#WEBHOOK_DATA='[{"type": "section","text": {"type": "mrkdwn","text": "*<'"$TRAVIS_BUILD_WEB_URL"'|'"$TRAVIS_REPO_SLUG"' deployed>*"}},{"type": "context","elements": [{"type": "mrkdwn","text": "Deployed at '"$TIMESTAMP"'"},{"type": "mrkdwn","text": "'"$CREDITS"'"},{"type": "mrkdwn","text": "Branch: '"<https://github.com/$TRAVIS_REPO_SLUG/tree/$TRAVIS_BRANCH|$TRAVIS_BRANCH>"'"}]}]'
WEBHOOK_DATA='{"text":"'"$TRAVIS_REPO_SLUG"' deployed at '"$TIMESTAMP"'"}'

echo -e "$WEBHOOK_DATA"

(curl --fail --progress-bar -X POST -H 'Content-type: application/json' --data "$WEBHOOK_DATA" "$1" && echo -e "Webhook sent successfully to slack") || echo -e "Webhook to slack failed"
