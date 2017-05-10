Using Secret Credentials
========================

When running a wallboard you propably need to access some kind of protected APIs. This may be a
public API like twitter or github, or just a private issue tracker instance. To get access to
private informations you need some kind of API keys or user password combinations and you won't
publish them in your source code for everyone who is able to access your wallboard. The problem
is that cyboard uses the same configuration code in the front- and backend. To protect your
credentials anyway, cyboard offers a special mechanism: the credentials file.

The credentials file is just a simple json file which named `credentials.json` next to your
`Cyboardfile.jsx`.

```json
{
    "jira": {
        "username": "wallboarduser",
        "password": "supersecretpassword"
    }
}
```

It will be automatically loaded and injected to your main configuration function. But this is only done in the backend where your *data sources* needs to act. In the frontend just
an empty object will be passed and your credentials stay secret.

```javascript
// Cyboardfile.jsx
import React from 'react';
import { Cyboard } from 'cyboard';
import { createJiraCountBackend, IssueCounter } from 'cyboard-issues';

// the main configuration function gets passed the parsed json from the crednetials.json
export default (auth) => {

    const bugsCount = createJiraCountBackend({
        ...auth.jira, // and we just merge the jira credentials into the data source config
        host: 'https://jira.example.com/',
        jql: 'type = bug'
    });

    <Cyboard>
        <Board name="My first Wallboard">
            <Widget shape={{ top: 0, left: 0, height: 2, width: 5 }} backend={bugsCount}>
                {data => <IssueCounter {...data} />}
            </Widget>
        </Board>
    </Cyboard>
}
```
