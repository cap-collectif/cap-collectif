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
    return ALLOWED_RULES[category].indexOf(name) > -1;
  }
}

export default new SynthesisDisplayRules();
