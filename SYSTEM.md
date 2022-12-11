# Design

### Functions

#### checkAtInterval

Input:

- `url`: String - url of the page to run tests in
- `interval`: +Int - milliseconds for each interval at which to run the checks
- `timeout`: +Int - milliseconds after which the interval ends
- `pattern`: Obj - a collection of key value pairs that describes actions to carry out in the page at `url`

Signature for `pattern`

```js
const url = 'https://www.hotjar.com/';
const pattern = {
  descriptor: 'tcCheck',
  checks: [
    {
      checkName: 'hjGlobal',
      checkType: 'namespace',
      target: 'window.hj',
      matchValue: true,
      matchType: 'loose',
    },
    {
      checkName: 'hjId',
      checkType: 'namespace',
      target: 'window.hjSiteSettings.site_id',
      matchValue: 14,
      matchType: 'loose',
    },
  ],
  actions: [
    {
      actionName: 'scroll',
      actionType: 'scroll',
      actionValue: 500,
    },
    {
      actionName: 'click',
      actionType: 'click',
      actionValue: null,
    },
  ],
  flows: {
    ifMatch: {
      effect: 'clearInterval',
      output: null,
      reference: 'tcCheck',
    },
    ifNull: {
      effect: null,
      output: null,
      reference: null,
    },
    ifNotMatch: {
      effect: null,
      output: 'hjId',
      reference: null,
    },
    ifEnd: {
      effect: 'clearInterval',
      output: null,
      reference: 'tcCheck',
    },
  },
};
```
