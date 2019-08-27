import { ALLOWED_RULES } from '../constants/SynthesisDisplayConstants';

class SynthesisDisplayRules {
  getMatchingSettingsForElement(element, settings, synthesisRules) {
    const matching = settings.filter(
      setting =>
        this.isElementMatchingConditions(setting.conditions, element, synthesisRules) &&
        this.areRulesAllowed(setting.rules),
    );
    return matching;
  }

  isElementMatchingConditions(conditions, element, synthesisRules) {
    return conditions.every(condition =>
      this.isElementMatchingCondition(condition, element, synthesisRules),
    );
  }

  isElementMatchingCondition(condition, element, synthesisRules) {
    const contributionsLevel = parseInt(synthesisRules.level, 10) || 0;
    switch (condition.type) {
      case 'contributions_level_delta':
        return element.level === contributionsLevel + condition.value;
      case 'level':
        return element.level === condition.value;
      case 'display_type':
        return element.displayType === condition.value;
      default:
        return false;
    }
  }

  areRulesAllowed(rules) {
    return rules.every(rule => this.isRuleAllowed(rule));
  }

  isRuleAllowed(rule) {
    const { category } = rule;
    const { name } = rule;
    const allowed = ALLOWED_RULES[category].indexOf(name) > -1;
    if (!allowed) {
      //      console.warn(name + ' rule is not allow in category ' + category + '. Allowed rules are :', ALLOWED_RULES[category]);
    }
    return allowed;
  }

  buildStyle(settings, category = 'style') {
    const style = {};
    settings.map(setting => {
      setting.rules.map(rule => {
        if (rule.category === category) {
          style[rule.name] = rule.value;
        }
      });
    });
    return style;
  }

  getValueForRule(settings, category, name) {
    return settings.some(setting =>
      setting.rules.some(rule => {
        if (rule.category === category && rule.name === name) {
          return rule.value;
        }
        return false;
      }),
    );
  }

  getValueForRuleAndElement(element, allSettings, category, name, synthesisRules) {
    if (!element) {
      return false;
    }
    const settings = this.getMatchingSettingsForElement(element, allSettings, synthesisRules);
    return settings.some(setting =>
      setting.rules.some(rule => {
        if (rule.category === category && rule.name === name) {
          return rule.value;
        }
        return false;
      }),
    );
  }
}

export default new SynthesisDisplayRules();
