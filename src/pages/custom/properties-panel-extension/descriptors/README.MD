## 在这个描述文件中, 我们定义了一个新类型LinDaiDaiStartEvent, 该类型扩展了该类型bpmn:StartEvent并向其添加“title”属性作为属性。
```
{
    "name": "Authority",
    "prefix": "authority",
    "uri": "http://authority",
    "xml": {
      "tagAlias": "lowerCase"
    },
    "associations": [],
    "types": [
      {
        "name": "LinDaiDaiStartEvent",
        "extends": [
          "bpmn:StartEvent"
        ],
        "properties": [
          {
            "name": "title",
            "isAttr": true,
            "type": "String"
          }
        ]
      }
    ]
  }
```


## 注️: 有必要在描述符中定义要扩展的元素。如果希望该属性对所有bpmn元素均有效，则可以扩展bpmn:BaseElement️
```
...
{
  "name": "LinDaiDaiStartEvent",
  "extends": [
    "bpmn:BaseElement"
  ],
  ...
}
```

