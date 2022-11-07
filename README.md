# YamaokaDiscord

### **If you want to contribute just fork that project!**

*Don't forget to add upstream remote to your forked project!*<br><br>`git remote add upstream <LINK OF THAT REPO>`

### **Commits & Pull Request Conventions**

### Naming
1. Commits must start with: **`feat, fix, ref`** then following by **`:`** with space after it. And commit message itself must starts with uppercase letter.<br><br>Example: `feat: Initialization`
2. Pull Requests can be named as **`feat, fix, ref`** then open **`():`** and place there type of files that you changing and after it name of the PR.
<br><br>Exmaple: `feat(commands): Added new fun command!`

### Branching and workflow
1. Always check updates for your develop branch<br><br>Example: `git pull upstream develop`
2. Don't forget to create new branch from updated develop branch!<br><br>`git checkout develop`<br>`git checkout -b <BRANCH NAME>`
3. Branch names must starts with: **`feature/, refactor/, fix/`** then simply add your feature or whoever name.<br><br>Example: `feature/delete-channel-command`
4. When you think you're done with your new feature you need to test it and after that merge your changes from your feature branch to your develop branch, then check updates from this remote repo<br><br>`git checkout develop`<br>`git pull upstream develop`<br><br>Solve any merge conflicts, test again and then you're ready to create your PR directly to main repo!

# Thanks to those who will contribute! 💖