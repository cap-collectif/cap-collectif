import {ALLOWED_RULES} from '../constants/SynthesisDisplayConstants';

class SynthesisDisplayRules {

  getMatchingSettingsForElement(element, settings) {
    const matching = settings.filter((setting) => {
      return this.isElementMatchingConditions(setting.conditions, element) && this.areRulesAllowed(setting.rules);
    });
    return matching;
  }

  isElementMatchingConditions(conditions, element) {
    return conditions.every((condition) => {
      return this.isElementMatchingCondition(condition, element);
    });
  }

  isElementMatchingCondition(condition, element) {
    switch (condition.type) {
    case 'level': return element.level === condition.value;
    case 'display_type': return element.displayType === condition.value;
    default: return false;
    }
  }

  areRulesAllowed(rules) {
    return rules.every((rule) => {
      return this.isRuleAllowed(rule);
    });
  }

  isRuleAllowed(rule) {
    const category = rule.category;
    const name = rule.name;
    const allowed = ALLOWED_RULES[category].indexOf(name) > -1;
    if (!allowed) {
      console.warn(name + ' rule is not allow in category ' + category + '. Allowed rules are :', ALLOWED_RULES[category]);
    }
    return allowed;
  }

  buildStyle(settings, category = 'style') {
    const style = {};
    settings.map((setting) => {
      setting.rules.map((rule) => {
        if (rule.category === category) {
          style[rule.name] = rule.value;
        }
      });
    });
    return style;
  }

  getValueForRule(settings, category, name) {
    return settings.some((setting) => {
      return setting.rules.some((rule) => {
        if (rule.category === category && rule.name === name) {
          return rule.value;
        }
        return false;
      });
    });
  }

  getValueForRuleAndElement(element, allSettings, category, name) {
    if (!element) {
      return false;
    }
    const settings = this.getMatchingSettingsForElement(element, allSettings);
    return settings.some((setting) => {
      return setting.rules.some((rule) => {
        if (rule.category === category && rule.name === name) {
          return rule.value;
        }
        return false;
      });
    });
  }

}

export default new SynthesisDisplayRules();
