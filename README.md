# Trello Power-Ups

A GitHub Pages site that hosts several independent Trello Power-Ups. Each Power-Up lives in its own directory, has its own Trello registration and API key, and can be enabled alongside the others on the same board.

## Included Power-Up: Workflow Mover

Workflow Mover adds card-back buttons that enforce this workflow:

```text
Backlog -> Assigned -> In Progress -> Completed
                              -> Blocked
```

Only the valid next step is shown:

| Current list | Available button |
| --- | --- |
| Backlog | Move to Assigned |
| Assigned | Start Work |
| In Progress | Mark Completed, Mark Blocked |
| Completed or Blocked | None |

The list names are intentionally exact and case-sensitive. If a board has zero or more than one list with a required name, the move is refused with a clear message rather than choosing the wrong list.

## Publish to GitHub Pages

1. Create a GitHub repository, for example `trello-powerups`.
2. Upload this project and push it to the repository's default branch.
3. In GitHub, open **Settings -> Pages**, choose **GitHub Actions** as the source, and run the included **Deploy GitHub Pages** workflow.
4. The site will be available at:

   ```text
   https://YOUR-GITHUB-USERNAME.github.io/trello-powerups/
   ```

## Register Workflow Mover in Trello

1. In [Trello's Power-Up admin portal](https://trello.com/apps/admin), create a Power-Up named **Workflow Mover**.
2. Enable the **Card Buttons** capability.
3. Set its connector URL to:

   ```text
   https://YOUR-GITHUB-USERNAME.github.io/trello-powerups/powerups/workflow-mover/connector.html
   ```

4. On the Power-Up's **API Key** tab, generate an API key and add this allowed origin:

   ```text
   https://YOUR-GITHUB-USERNAME.github.io
   ```

5. Copy the API key into `powerups/workflow-mover/config.js` as `appKey`, and set `appAuthor` to your name or organization. Commit and push that change so GitHub Pages publishes it.
6. Enable Workflow Mover on a board whose lists are named `Backlog`, `Assigned`, `In Progress`, `Completed`, and `Blocked`.

On a member's first move, Trello asks for `read,write` access. Trello stores the resulting user token in that member's private Power-Up data; do not add a token to this repository.

## Add another Power-Up

1. Copy `powerups/_template` to a new lower-case folder, such as `powerups/due-date-helper`.
2. Give it its own `config.js`, connector page, and scripts.
3. Register it as a separate Power-Up in Trello with its own API key.
4. Use its own connector URL under the new folder.

Because every Power-Up has a separate connector URL and Trello registration, any number of them can be active on the same board.

## Local checks

Run the JavaScript checks before publishing:

```bash
node --check powerups/shared/workflow-rules.js
node --check powerups/shared/trello-workflow-api.js
node --check powerups/workflow-mover/connector.js
node --check powerups/workflow-mover/authorize.js
node --test tests/workflow-rules.test.js
```

