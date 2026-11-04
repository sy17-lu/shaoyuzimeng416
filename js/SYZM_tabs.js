/**
 * SYZM_tabs.js —— 可复用的 Tab 选项卡组件（SYZM 命名规范）
 * 作者：邵玉紫檬（SYZM）
 * 建立时间：2026-11-04
 * 使用大模型：DeepSeek-V4.1-Flash
 * 功能名称：新闻分类选项卡切换
 * 用法：容器加 data-syzm-tabs；标签按钮用 .SYZM_tab + data-syzm-tab="k"；
 *       内容面板用 .SYZM_tab_panel + data-syzm-panel="k"（k 为同一分组内的唯一键）。
 *       同一页面可放任意多个分组，互不影响。
 */
(function (SYZM_window, SYZM_document) {
  'use strict';

  // SYZM：分组、选项卡、面板的选择器与选中态类名
  var SYZM_GROUP_SELECTOR = '[data-syzm-tabs]';
  var SYZM_TAB_SELECTOR = '.SYZM_tab';
  var SYZM_PANEL_SELECTOR = '.SYZM_tab_panel';
  var SYZM_ACTIVE_CLASS = 'SYZM_is-active';

  // SYZM：解析选项卡对应的内容面板，优先取 aria-controls 指向的 id，其次取分组内同键面板，
  // SYZM：因此面板既可以放在分组容器内部，也可以放在容器外部
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

  // SYZM：清除分组内所有选项卡与面板的选中状态
  function SYZM_clearAll(SYZM_group) {
    var SYZM_tabs = SYZM_group.querySelectorAll(SYZM_TAB_SELECTOR);
    var SYZM_i;

    for (SYZM_i = 0; SYZM_i < SYZM_tabs.length; SYZM_i++) {
      var SYZM_panel = SYZM_findPanel(SYZM_group, SYZM_tabs[SYZM_i]);

      SYZM_tabs[SYZM_i].classList.remove(SYZM_ACTIVE_CLASS);
      SYZM_tabs[SYZM_i].setAttribute('aria-selected', 'false');
      SYZM_tabs[SYZM_i].setAttribute('tabindex', '-1');

      if (SYZM_panel) {
        SYZM_panel.classList.remove(SYZM_ACTIVE_CLASS);
        SYZM_panel.hidden = true;
      }
    }
  }

  // SYZM：激活指定选项卡并显示对应面板——先清除全部选中状态，再设置当前元素的选中状态
  function SYZM_activate(SYZM_group, SYZM_tab) {
    var SYZM_panel = SYZM_findPanel(SYZM_group, SYZM_tab);

    // SYZM：第一步，清除所有选项卡的选中状态
    SYZM_clearAll(SYZM_group);

    // SYZM：第二步，设置当前元素的选中状态
    SYZM_tab.classList.add(SYZM_ACTIVE_CLASS);
    SYZM_tab.setAttribute('aria-selected', 'true');
    SYZM_tab.setAttribute('tabindex', '0');

    if (SYZM_panel) {
      SYZM_panel.classList.add(SYZM_ACTIVE_CLASS);
      SYZM_panel.hidden = false;
    }
  }

  // SYZM：为单个选项卡分组绑定点击监听事件（事件委托，动态追加的选项卡同样生效）
  function SYZM_bindGroup(SYZM_group) {
    var SYZM_defaultTab = null;
    var SYZM_tabs = SYZM_group.querySelectorAll(SYZM_TAB_SELECTOR);
    var SYZM_i;

    // SYZM：找出初始默认项，优先 HTML 中已标记选中的，否则取第一个
    for (SYZM_i = 0; SYZM_i < SYZM_tabs.length; SYZM_i++) {
      if (SYZM_tabs[SYZM_i].classList.contains(SYZM_ACTIVE_CLASS)) {
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

    // SYZM：监听点击，命中 .SYZM_tab 时切换
    SYZM_group.addEventListener('click', function (SYZM_event) {
      var SYZM_tab = SYZM_event.target.closest(SYZM_TAB_SELECTOR);
      if (!SYZM_tab || !SYZM_group.contains(SYZM_tab)) {
        return;
      }
      SYZM_activate(SYZM_group, SYZM_tab);
    });

    // SYZM：监听键盘左右方向键，便于用键盘在不同选项卡间移动
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

    SYZM_group.setAttribute('data-syzm-tabs-bound', 'true');
  }

  // SYZM：初始化作用域内所有选项卡分组，重复调用不会重复绑定
  function SYZM_initTabs(SYZM_scope) {
    var SYZM_groups = (SYZM_scope || SYZM_document).querySelectorAll(SYZM_GROUP_SELECTOR);
    var SYZM_i;

    for (SYZM_i = 0; SYZM_i < SYZM_groups.length; SYZM_i++) {
      if (SYZM_groups[SYZM_i].getAttribute('data-syzm-tabs-bound') === 'true') {
        continue;
      }
      SYZM_bindGroup(SYZM_groups[SYZM_i]);
    }
  }

  // SYZM：对外暴露初始化方法，页面可手动初始化新增的选项卡分组
  SYZM_window.SYZM_Tabs = { init: SYZM_initTabs };

  // SYZM：DOM 解析完成后自动初始化页面内所有分组
  if (SYZM_document.readyState === 'loading') {
    SYZM_document.addEventListener('DOMContentLoaded', function () {
      SYZM_initTabs(SYZM_document);
    });
  } else {
    SYZM_initTabs(SYZM_document);
  }
})(window, document);
