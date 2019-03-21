#!/bin/bash

if [ -z "$1" ]; then
  echo -e "WARNING!!\nYou need to pass the WEBHOOK_URL as first argument" && exit
fi

echo -e "[Webhook]: Sending webhook to slack...\\n";

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
WEBHOOK_DATA='[
	{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "*<'"$TRAVIS_BUILD_WEB_URL"'|Job #'"$TRAVIS_JOB_NUMBER"' (Build #'"$TRAVIS_BUILD_NUMBER"') '"$STATUS_MESSAGE"' - '"$TRAVIS_REPO_SLUG"'>*\n'"$COMMIT_SUBJECT"'\n'"${COMMIT_MESSAGE//$'\n'/ }"\\n\\n"$CREDITS"'"
		}
	},
    {
		"type": "context",
		"elements": [
			{
				"type": "mrkdwn",
				"text": "Deployed at '"$TIMESTAMP"'"
			},
			{
				"type": "mrkdwn",
				"text": "Branch: '"$TRAVIS_BRANCH"'"
			}
		]
	}
]'

(curl --fail --progress-bar -X POST -H 'Content-type: application/json' --data "$WEBHOOK_DATA" "$1" && echo -e "Webhook sent successfully to slack") || echo -e "Webhook to slack failed"
