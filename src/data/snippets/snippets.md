---
title: Snippets
---

## JavaScript

```json
{
  "Use State Hook": {
    "prefix": "hookstate",
    "body": "const [$1, set$2] = useState($3);$0"
  },

  "For Loop for Array": {
    "prefix": "forarr",
    "body": [
      "for (let $index = 0; $index < $array.length; $index++) {",
      "\tconst element = $array[$index];",
      "\t",
      "}"
    ],
    "description": "This will create a for loop through an array"
  },
  "Get element by Id": {
    "prefix": "getid",
    "body": "const $el = document.getElementById('$el');",
    "description": "Get dom element by id"
  },
  "Add Event Listener": {
    "prefix": "addevent",
    "body": ["$1.addEventListener('$2', (e) => {", "$0", "});"]
  }
}
```
