let repoSettings = {};

function updateRepoList() {
  const repoListElement = document.getElementById('repoList');
  repoListElement.innerHTML = '';
  for (const [repo, branch] of Object.entries(repoSettings)) {
    const div = document.createElement('div');
    div.textContent = `${repo}: ${branch}`;
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteRepo(repo);
    div.appendChild(deleteButton);
    repoListElement.appendChild(div);
  }
}

function saveSettings() {
  chrome.storage.sync.set({repoSettings: repoSettings}, () => {
    console.log('Settings saved');
    updateRepoList();
  });
}

function deleteRepo(repo) {
  delete repoSettings[repo];
  saveSettings();
}

document.getElementById('add').addEventListener('click', () => {
  const repo = document.getElementById('repoName').value;
  const branch = document.getElementById('defaultBranch').value;
  if (repo && branch) {
    repoSettings[repo] = branch;
    saveSettings();
    document.getElementById('repoName').value = '';
    document.getElementById('defaultBranch').value = '';
  }
});

chrome.storage.sync.get('repoSettings', (data) => {
  if (data.repoSettings) {
    repoSettings = data.repoSettings;
    updateRepoList();
  }
});