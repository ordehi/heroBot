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
      looseMatch: true,
      isEnd: false,
    },
    {
      checkName: 'hjId',
      checkType: 'namespace',
      target: 'window.hjSiteSettings.site_id',
      matchValue: 14,
      looseMatch: false,
      isEnd: true,
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
    ifEnd: {
      effect: 'clearInterval',
      output: (value) => console.log(`Hotjar ID is ${value}`),
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
  namespace: (checkObj) => {
    // destructure the checkObj
    const { checkName, target, matchValue, looseMatch, isEnd } = checkObj;
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

    return {
      check: checkObj,
      value: result[checkName],
      evaluation: looseMatch
        ? !!result[checkName]
        : result[checkName] === matchValue,
    };
  },
};

// function called checks that calls a method from the checkMethods object based on the checkType
const runChecks = (checks) => {
  const resultOfChecks = {};
  checks.forEach((check) => {
    const result = checkMethods[check.checkType](check);
    resultOfChecks[check.checkName] = result;
  });

  return resultOfChecks;
};

// object called flowsMethods that contains methods that perform actions based on the result of the checks
const flowsMethods = {
  clearInterval: (reference) => {
    clearInterval(reference);
  },
};

// function checkResults that takes in the resultOfChecks object and the flows object and performs the appropriate action based on the result of the checks
const checkResults = (state, flows) => {
  const { timer, timeout, reference, resultOfChecks } = state;
  const { ifEnd } = flows;
  const { effect, output } = ifEnd;

  Object.keys(resultOfChecks).forEach((result) => {
    const { check, evaluation, value } = resultOfChecks[result];
    if ((check['isEnd'] && evaluation) || timer >= timeout) {
      flowsMethods[effect](reference);
      output(value);
    }
  });
};

// function that creates an interval that runs the checks and interaction functions
const initDevCheck = (pattern) => {
  const { descriptor, interval, timeout, checks, actions, flows } = pattern;
  const state = {};
  state.timer = 0;
  state.timeout = timeout;
  state.reference = setInterval(() => {
    interaction(actions);
    state.resultOfChecks = runChecks(checks);
    checkResults(state, flows);
    state.timer += interval;
  }, interval);
};
