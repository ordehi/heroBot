const url = 'https://www.hotjar.com/';
const pattern = {
  descriptor: 'tcCheck',
  interval: 1000,
  timeout: 10000,
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
      matchType: 'strict',
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
      actionValue: 'body',
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

// object with methods that perform click and scroll actions
const actionMethods = {
  click: (selector) => {
    const element = document.querySelector(selector);
    element.click();
  },
  scroll: (value) => {
    window.scrollTo(0, value);
  },
};

// function called interaction that takes in an actions array and executes a function for each action
const interaction = (actions) => {
  // iterate through the actions array
  actions.forEach((action) => {
    // destructure the action object
    const { actionName, actionType, actionValue } = action;
    // call the appropriate function based on the actionType
    actionMethods[actionType](actionValue);
  });
  // call the appropriate function based on the actionType
};

// object with methods that perform checks
const checkMethods = {
  namespace: (checkName, target, matchValue, matchType) => {
    // split the target string into an array
    const targetArray = target.split('.');
    // iterate through the targetArray
    const result = {};
    targetArray.forEach((target) => {
      // if the target is window, set the result to window
      if (target === 'window') {
        result[checkName] = window;
      }
      // if the target is not window, set the result to the target
      result[checkName] = result[checkName][target];
    });

    // if the matchType is loose, return the result
    if (matchType === 'loose') {
      return !!result[checkName];
    }
    // if the matchType is strict, return the result
    if (matchType === 'strict') {
      return result[checkName] === matchValue;
    }
  },
};

// function called checks that calls a method from the checkMethods object based on the checkType
const runChecks = (checks) => {
  const resultOfChecks = {};
  checks.forEach((check) => {
    const { checkName, checkType, target, matchValue, matchType } = check;
    const result = checkMethods[checkType](
      checkName,
      target,
      matchValue,
      matchType
    );
    resultOfChecks[checkName] = result;
  });

  return resultOfChecks;
};

// function that creates an interval that runs the checks and interaction functions
const initDevCheck = (pattern) => {
  // destructure the pattern object
  const { descriptor, interval, timeout, checks, actions, flows } = pattern;
  // create an interval
  let timer = 0;
  const routine = setInterval(() => {
    // call the checks function
    interaction(actions);
    const resultOfChecks = runChecks(checks);
    // if the result of the checks is true, call clearInterval and return the result
    if (resultOfChecks.hjId || timer > timeout) {
      clearInterval(routine);
      console.log(resultOfChecks);
      return resultOfChecks;
    }
    // increment the timer
    timer += interval;
  }, interval);
};
