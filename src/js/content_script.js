class TweetLinksNavigator {
  getActiveTweet() {
    const el = document.activeElement;
    if (el.hasAttribute('role') && el.getAttribute('role') === "article") {
      return el;
    }
  }

  focusInLinks() {
    if (this.activeTweet && this.isTweetChild(document.activeElement)) return;
    this.activeTweet = this.getActiveTweet();
    if (!this.activeTweet) return;
    const enumerateChildren = (element) => {
      const children = Array.prototype.slice.call(element.children);
      return [element].concat(children.flatMap(el => enumerateChildren(el)));
    }
    this.tweetChildren = enumerateChildren(this.activeTweet);
    this.links = Array.prototype.slice.call(this.activeTweet.querySelectorAll('a[target="_blank"]'));
    return this.focus(0);
  }

  focusOut() {
    if (!this.activeTweet) return;
    this.activeTweet.focus();
    this.cleanState();
  }

  focusNextLink() {
    return this.focus(this.focusedIndex + 1);
  }

  focusPrevLink() {
    return this.focus(this.focusedIndex - 1);
  }

  focus(index) {
    if (!this.activeTweet || !this.links) return;
    if (!this.isTweetChild(document.activeElement)) {
      this.cleanState();
      return;
    }
    const inRange = index >= 0 && index < this.links.length;
    if (inRange) {
      this.links[index].focus();
      this.focusedIndex = index;
    }
    return inRange;
  }

  isTweetChild(element) {
    return this.tweetChildren && this.tweetChildren.includes(element);
    // 以下だと，active tweet自体にフォーカスした状態でaをタイプすると
    // active tweetはlinksに入ってないので，focus()の途中で止まる．
    // やはり有効無効の判定は初めに１つの口で判定した方がよさそう．
    //return this.links && this.links.includes(element);
  }

  cleanState() {
    this.activeTweet = undefined;
    this.tweetChildren = undefined;
    this.links = undefined;
    this.focusedIndex = undefined;
  }
}


const navigator = new TweetLinksNavigator();

const DOWN_KEYS = ['ArrowDown', 'KeyJ'];
const UP_KEYS = ['ArrowUp', 'KeyK'];
const ACTIVATE_KEYS = ['KeyA'];
const DEACTIVATE_KEYS = ['Escape'];

const focusInLinks = () => navigator.focusInLinks();
const focusNextLink = () => navigator.focusNextLink();
const focusPrevLink = () => navigator.focusPrevLink();
const focusOut = () => navigator.focusOut();

const keymap = {
  [ACTIVATE_KEYS]: focusInLinks,
  [DOWN_KEYS]: focusNextLink,
  [UP_KEYS]: focusPrevLink,
  [DEACTIVATE_KEYS]: focusOut,
};
const keyHandler = (e) => {
  const modKeys = [e.shiftKey, e.altKey, e.ctrlKey, e.metaKey]
  // ignore modifier keys so that the other shortcuts are able
  if (modKeys.some((hasKey) => hasKey)) return
  Object.keys(keymap).some((keys) => {
    if (keys.includes(e.code)) {
      const eventCatced = keymap[keys]();
      if (eventCatced) {
        e.preventDefault();
      }
      return eventCatced;
    }
  });
};

const activate = () => {
  document.addEventListener('keydown', keyHandler);
};

const init = () => {
  activate();
};

init();