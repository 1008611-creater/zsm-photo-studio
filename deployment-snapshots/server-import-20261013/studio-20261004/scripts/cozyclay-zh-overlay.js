/*
 * Local Chinese UI layer for the embedded CozyClay build.
 * The upstream submodule remains untouched; this small, deterministic layer
 * translates visible controls and labels after React renders them.
 */
(() => {
  const translations = {
    "Choose project": "选择项目",
    "Create your first shot": "创建你的第一个镜头",
    "Start with a named project, then place a character and frame the shot. Your work is saved in that project.": "先创建一个命名项目，再放置人物并设置镜头。你的工作会保存在该项目中。",
    "First shot steps": "第一个镜头步骤",
    "Create a project": "创建项目",
    "Open a project": "打开项目",
    "Place": "放置",
    "Choose a character and move it on the stage.": "选择人物并在舞台上移动它。",
    "Frame": "取景",
    "Set the camera view for your shot.": "设置镜头的摄影机视角。",
    "Press play to see the scene come alive.": "点击播放查看场景运动。",
    "Start from a scene": "从场景开始",
    "Recent projects": "最近项目",
    "No projects yet — save one and it shows up here.": "还没有项目，保存一个后会显示在这里。",
    "Projects folder": "项目文件夹",
    "Choose folder…": "选择文件夹…",
    "Open file…": "打开文件…",
    "Project navigation": "项目导航",
    "Recent": "最近项目",
    "New Project": "新建项目",
    "Samples": "示例项目",
    "Learn": "学习",
    "Blank Stage": "空白舞台",
    "City Block": "城市街区",
    "The set from the cozyclay.org tutorial: an alley, parked cars, one character mid-walk.": "来自教程的街区场景：小巷、停靠的汽车和正在行走的人物。",
    "Open project file…": "打开项目文件…",
    "Project templates": "项目模板",
    "Template categories": "模板分类",
    "Project preview": "项目预览",
    "All": "全部",
    "Film": "电影",
    "Dialogue": "对话",
    "Action": "动作",
    "Vehicle": "载具",
    "Name": "名称",
    "Location": "存储位置",
    "Browser project store": "浏览器项目存储",
    "Frame rate": "帧率",
    "Units": "单位",
    "Meters": "米",
    "Feet": "英尺",
    "Cancel": "取消",
    "Create": "创建",
    "No recent projects yet.": "还没有最近项目。",
    "Save": "保存",
    "Save project": "保存项目",
    "Export": "导出",
    "Settings": "设置",
    "Scene": "场景",
    "Camera": "摄影机",
    "Timeline": "时间线",
    "Objects": "对象",
    "Characters": "人物",
    "Add object": "添加对象",
    "Delete": "删除",
    "Undo": "撤销",
    "Redo": "重做",
    "Play": "播放",
    "Pause": "暂停",
    "Stop": "停止",
    "Close": "关闭",
    "Reset": "重置",
    "Help": "帮助",
    "Project": "项目",
    "Shot": "镜头",
    "Shots": "镜头",
    "Keyframe pack": "关键帧包",
    "Export keyframe pack": "导出关键帧包",
    "Add": "添加",
    "Add character": "添加人物",
    "Add camera": "添加摄影机",
    "Add light": "添加灯光",
    "Move": "移动",
    "Rotate": "旋转",
    "Scale": "缩放",
    "Transform": "变换",
    "Properties": "属性",
    "Inspector": "检查器",
    "Hierarchy": "层级",
    "Playhead": "播放头",
    "Frame range": "帧范围",
    "Frames": "帧",
    "Duration": "时长",
    "Prompt": "提示词",
    "Motion": "动作",
    "Lighting": "灯光",
    "Composition": "构图",
    "Add shot": "添加镜头",
    "Delete shot": "删除镜头",
    "Shot camera": "镜头摄影机",
    "Open": "打开",
    "Back": "返回",
    "Next": "下一步",
    "Previous": "上一步",
  };

  const translate = (value) => {
    const text = value.trim();
    const replacement = translations[text];
    return replacement ? value.replace(text, replacement) : value;
  };

  const translateNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const next = translate(node.nodeValue || "");
      if (next !== node.nodeValue) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    for (const attr of ["aria-label", "title", "placeholder"]) {
      if (node.hasAttribute(attr)) node.setAttribute(attr, translate(node.getAttribute(attr) || ""));
    }
    for (const child of node.childNodes) translateNode(child);
  };

  const apply = () => translateNode(document.body);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
