/**
 * SYZM_rank_tabs.js —— 新闻排行选项卡组件（点击排行 / 评论排行）
 * 作者：邵玉紫檬（SYZM）
 * 建立时间：2026-11-04
 * 使用大模型：DeepSeek-V4.1-Flash
 * 功能名称：排行榜单选项卡切换
 * 命名规则：所有 CSS 类名、id、JS 变量均以 SYZM_ 开头，注释均带 SYZM 标记
 */
(function (SYZM_window, SYZM_document) {
  'use strict';

  // SYZM：分组、选项卡、面板的选择器常量
  var SYZM_GROUP_SELECTOR = '[data-syzm-rank]';
  var SYZM_TAB_SELECTOR = '.SYZM_tab';
  var SYZM_PANEL_SELECTOR = '.SYZM_panel';
  var SYZM_ON_CLASS = 'SYZM_on';

  // SYZM：解析选项卡对应的面板，优先取 aria-controls 指向的 id，其次取分组内同键面板
  function SYZM_findPanel(SYZM_group, SYZM_tab) {
    var SYZM_panelId = SYZM_tab.getAttribute('aria-controls');
    var SYZM_panel = SYZM_panelId ? SYZM_document.getElementById(SYZM_panelId) : null;

    if (!SYZM_panel) {
      var SYZM_key = SYZM_tab.getAttribute('data-syzm-tab');
      SYZM_panel = SYZM_group.querySelector(
        SYZM_PANEL_SELECTOR + '[data-syzm-panel="' + SYZM_key + '"]'
      );
    }
    return SYZM_panel;
  }

  // SYZM：第一步 —— 清除分组内所有选项卡与面板的选中状态
  function SYZM_clearAll(SYZM_group) {
    var SYZM_tabs = SYZM_group.querySelectorAll(SYZM_TAB_SELECTOR);
    var SYZM_i;

    for (SYZM_i = 0; SYZM_i < SYZM_tabs.length; SYZM_i++) {
      var SYZM_panel = SYZM_findPanel(SYZM_group, SYZM_tabs[SYZM_i]);

      SYZM_tabs[SYZM_i].classList.remove(SYZM_ON_CLASS);
      SYZM_tabs[SYZM_i].setAttribute('aria-selected', 'false');
      SYZM_tabs[SYZM_i].setAttribute('tabindex', '-1');

      if (SYZM_panel) {
        SYZM_panel.classList.remove(SYZM_ON_CLASS);
        SYZM_panel.hidden = true;
      }
    }
  }

  // SYZM：第二步 —— 先清除全部，再设置当前选项卡与面板的选中状态
  function SYZM_activate(SYZM_group, SYZM_tab) {
    var SYZM_panel = SYZM_findPanel(SYZM_group, SYZM_tab);

    SYZM_clearAll(SYZM_group);

    SYZM_tab.classList.add(SYZM_ON_CLASS);
    SYZM_tab.setAttribute('aria-selected', 'true');
    SYZM_tab.setAttribute('tabindex', '0');

    if (SYZM_panel) {
      SYZM_panel.classList.add(SYZM_ON_CLASS);
      SYZM_panel.hidden = false;
    }
  }

  // SYZM：为单个排行分组绑定点击监听事件（事件委托），并初始化默认选中项
  function SYZM_bindGroup(SYZM_group) {
    var SYZM_tabs = SYZM_group.querySelectorAll(SYZM_TAB_SELECTOR);
    var SYZM_defaultTab = null;
    var SYZM_i;

    for (SYZM_i = 0; SYZM_i < SYZM_tabs.length; SYZM_i++) {
      if (SYZM_tabs[SYZM_i].classList.contains(SYZM_ON_CLASS)) {
        SYZM_defaultTab = SYZM_tabs[SYZM_i];
        break;
      }
    }
    if (!SYZM_defaultTab && SYZM_tabs.length) {
      SYZM_defaultTab = SYZM_tabs[0];
    }
    if (SYZM_defaultTab) {
      SYZM_activate(SYZM_group, SYZM_defaultTab);
    }

    SYZM_group.addEventListener('click', function (SYZM_event) {
      var SYZM_tab = SYZM_event.target.closest(SYZM_TAB_SELECTOR);
      if (!SYZM_tab || !SYZM_group.contains(SYZM_tab)) {
        return;
      }
      SYZM_activate(SYZM_group, SYZM_tab);
    });

    // SYZM：监听左右方向键，支持纯键盘切换选项卡
    SYZM_group.addEventListener('keydown', function (SYZM_event) {
      if (SYZM_event.key !== 'ArrowLeft' && SYZM_event.key !== 'ArrowRight') {
        return;
      }
      var SYZM_tab = SYZM_event.target.closest(SYZM_TAB_SELECTOR);
      if (!SYZM_tab) {
        return;
      }
      var SYZM_list = Array.prototype.slice.call(
        SYZM_group.querySelectorAll(SYZM_TAB_SELECTOR)
      );
      var SYZM_next =
        SYZM_list.indexOf(SYZM_tab) + (SYZM_event.key === 'ArrowRight' ? 1 : -1);
      SYZM_next = (SYZM_next + SYZM_list.length) % SYZM_list.length;

      SYZM_activate(SYZM_group, SYZM_list[SYZM_next]);
      SYZM_list[SYZM_next].focus();
      SYZM_event.preventDefault();
    });

    SYZM_group.setAttribute('data-syzm-rank-bound', 'true');
  }

  // SYZM：初始化页面内所有排行分组，重复调用不会重复绑定
  function SYZM_init(SYZM_scope) {
    var SYZM_groups = (SYZM_scope || SYZM_document).querySelectorAll(SYZM_GROUP_SELECTOR);
    var SYZM_i;

    for (SYZM_i = 0; SYZM_i < SYZM_groups.length; SYZM_i++) {
      if (SYZM_groups[SYZM_i].getAttribute('data-syzm-rank-bound') === 'true') {
        continue;
      }
      SYZM_bindGroup(SYZM_groups[SYZM_i]);
    }
  }

  // SYZM：对外暴露初始化方法，便于页面动态追加分组后手动初始化
  SYZM_window.SYZM_RankTabs = { init: SYZM_init };

  // SYZM：DOM 解析完成后自动初始化
  if (SYZM_document.readyState === 'loading') {
    SYZM_document.addEventListener('DOMContentLoaded', function () {
      SYZM_init(SYZM_document);
    });
  } else {
    SYZM_init(SYZM_document);
  }
})(window, document);
