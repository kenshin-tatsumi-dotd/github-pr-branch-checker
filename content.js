function getRepoName() {
  const pathParts = window.location.pathname.split('/');
  const repoName = pathParts.slice(1, 3).join('/');
  console.log('Repository name:', repoName);
  return repoName;
}

function isPullRequestPage() {
  const isPR = /^\/[^\/]+\/[^\/]+\/pull\/\d+/.test(window.location.pathname);
  console.log('Is Pull Request page:', isPR);
  return isPR;
}

function checkBaseBranch() {
  console.log('Checking base branch...');
  if (!isPullRequestPage()) {
    console.log('Not a Pull Request page, skipping check.');
    return;
  }

  const baseBranchElement = document.querySelector('.base-ref');
  if (baseBranchElement) {
    const baseBranch = baseBranchElement.textContent.trim();
    const repoName = getRepoName();
    console.log('Base branch:', baseBranch);
    
    try {
      chrome.storage.sync.get('repoSettings', (data) => {
        if (chrome.runtime.lastError) {
          console.error('Extension context invalidated:', chrome.runtime.lastError);
          return;
        }
        console.log('Retrieved repo settings:', data);
        const repoSettings = data.repoSettings || {};
        const expectedBranch = repoSettings[repoName];
        console.log('Expected branch:', expectedBranch);
        
        if (expectedBranch && baseBranch !== expectedBranch) {
          console.log('Branch mismatch detected. Showing alert.');
          alert(`警告: このリポジトリ(${repoName})のベースブランチが ${expectedBranch} ではありません。現在のベースブランチ: ${baseBranch}`);
        } else {
          console.log('No branch mismatch detected or no expected branch set.');
        }
      });
    } catch (error) {
      console.error('Error in checkBaseBranch:', error);
    }
  } else {
    console.log('Base branch element not found.');
  }
}

function safeExecute(callback) {
  if (chrome.runtime && chrome.runtime.id) {
    try {
      callback();
    } catch (error) {
      console.error('Error executing callback:', error);
    }
  } else {
    console.warn('Extension context invalidated. Reloading page...');
    window.location.reload();
  }
}

// ページ読み込み完了時にチェックを実行
window.addEventListener('load', () => {
  console.log('Page loaded. Executing checkBaseBranch...');
  safeExecute(checkBaseBranch);
});

// URLの変更を監視
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    console.log('URL changed. Executing checkBaseBranch...');
    lastUrl = currentUrl;
    safeExecute(checkBaseBranch);
  }
});

safeExecute(() => {
  observer.observe(document, {subtree: true, childList: true});
  console.log('MutationObserver set up.');
});

// pushState と replaceState をオーバーライドして、SPA遷移を検知
const originalPushState = history.pushState;
history.pushState = function(...args) {
  originalPushState.apply(this, args);
  console.log('pushState called. Executing checkBaseBranch...');
  safeExecute(checkBaseBranch);
};

const originalReplaceState = history.replaceState;
history.replaceState = function(...args) {
  originalReplaceState.apply(this, args);
  console.log('replaceState called. Executing checkBaseBranch...');
  safeExecute(checkBaseBranch);
};

// popstate イベントをリッスンして、ブラウザバックとフォワードを検知
window.addEventListener('popstate', () => {
  console.log('popstate event detected. Executing checkBaseBranch...');
  safeExecute(checkBaseBranch);
});

// デバッグ用のログ
console.log('GitHub PR Branch Checker: Content script loaded');
safeExecute(checkBaseBranch);