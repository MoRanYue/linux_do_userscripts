<center>

# LINUX DO用户脚本

</center>

---

## 列表

### 阻止愚蠢的排版（`ldbcp.user.js`）

它目前拥有数个功能，它们将对每个帖子按序执行。部分功能被默认关闭，请更改其中`AUTO_PROCESSORS`对象的值，以对各个功能进行开启或关闭：

1. 打印帖子元素（`print_elem`）：
    默认值：关闭
    描述：于控制台打印帖子元素。
1. 展平无意义的嵌套标注（`flatten_spamming_nested_callouts`）：
    默认值：开启
1. 移除无内容的标注（`remove_callouts_have_not_content`）：
    默认值：开启
    描述：当1个标注没有任何内容，且没有自定义的标题，它将被移除。
1. 展平仅有标题的标注（`flatten_callouts_with_only_title`）：
    默认值：开启
    描述：当1个标注没有任何内容，但拥有自定义标题，它将被转换为平常的文本。
1. 展开所有标注（`expand_all_callouts`）：
    默认值：关闭
    描述：展开所有可收缩的标注。
1. 将可收缩标注替换为`<details>`与`<summary>`（`replace_collapsable_callouts_to_summary_and_detail`）：
    默认值：关闭
    描述：基本上，它将可收缩标注转换为“隐藏详细信息”的形式。

测试示例：

- [964458](https://linux.do/t/topic/964458)
- [973395](https://linux.do/t/topic/973395)