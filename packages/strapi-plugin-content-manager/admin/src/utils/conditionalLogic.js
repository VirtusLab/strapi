import { get } from 'lodash';

const isVisibleCondition = (conditionalLogic, modifiedData) => {
  return conditionalLogic.every(({ attributeKey, operator, value }) => {
    const field = get(modifiedData, attributeKey);
    switch (operator) {
      case 'equal':
        return field === value;
      case 'greater':
        return field > value;
      case 'greaterOrEqual':
        return field >= value;
      case 'less':
        return field < value;
      case 'lessOrEqual':
        return field <= value;
      default:
        return true;
    }
  });
};

export const isFieldVisible = ({ layout, key, modifiedData }) => {
  const conditionalLogic = get(layout, ['schema', 'options', 'conditionalLogic', key]);

  if (!conditionalLogic) {
    return true;
  }

  return isVisibleCondition(conditionalLogic, modifiedData);
};

export const resetHiddenFields = (layout, modifiedData) => {
  const data = { ...modifiedData };
  const conditionalLogic = get(layout, ['schema', 'options', 'conditionalLogic'], {});
  Object.entries(conditionalLogic).forEach(([key, conditions]) => {
    const isFieldHidden = !isVisibleCondition(conditions, data);
    const fieldValue = data[key];

    if (isFieldHidden) {
      if (Array.isArray(fieldValue) && fieldValue.length > 0) {
        data[key] = [];
      }
      if (fieldValue) {
        data[key] = null;
      }
    }
  });

  return data;
};
