# upgrade-utility

Very basic usage at the moment.

1. Edit `config.json` or add a git-ignored `config.local.json`

    Example:
    ```json
    {
        "rootPath": "C:\\hostology\\hostology-admin-web",
        "portalPath": "portals\\admin"
    }
    ```
2. run `npm install` or `yarn`
3. Make sure you are in a clean/experimental branch in the repo that you want to target (it will make changes to files)
4. In the root directory run `node .`

I suggest that you test this with the admin repo to begin with.

What it should do is:

1. Recursively run through all the portal files, checking imports and compiling a list of files referencing in the portal and the two packages (ui and helpers)
2. Create a list of transforms that will shift any referenced files in the packages to the target directories in the portal
3. Perform the transforms

The code won't work without the changes I've pushed to `experimental-upgrade` branch in the admin portal (I have annotated the changes made). Some of these changes will probably need to remain manual - but we can probably automate merging package.json and there are a couple of fixes for module exports that need to be applied here. 
