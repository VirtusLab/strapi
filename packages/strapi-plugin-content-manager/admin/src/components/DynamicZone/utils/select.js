import { useMemo } from 'react';
import { get } from 'lodash';
import useDataManager from '../../../hooks/useDataManager';
import { isFieldVisible } from '../../../utils/conditionalLogic';

function useSelect(name) {
  const {
    addComponentToDynamicZone,
    createActionAllowedFields,
    isCreatingEntry,
    formErrors,
    layout,
    modifiedData,
    moveComponentUp,
    moveComponentDown,
    removeComponentFromDynamicZone,
    readActionAllowedFields,
    updateActionAllowedFields,
  } = useDataManager();

  const dynamicDisplayedComponents = useMemo(
    () => get(modifiedData, [name], []).map(data => data.__component),
    [modifiedData, name]
  );

  const isFieldAllowed = useMemo(() => {
    const allowedFields = isCreatingEntry ? createActionAllowedFields : updateActionAllowedFields;

    return allowedFields.includes(name);
  }, [name, isCreatingEntry, createActionAllowedFields, updateActionAllowedFields]);

  const isFieldReadable = useMemo(() => {
    const allowedFields = isCreatingEntry ? [] : readActionAllowedFields;

    return allowedFields.includes(name);
  }, [name, isCreatingEntry, readActionAllowedFields]);

  const conditionallyHidden = useMemo(() => {
    return !isFieldVisible({
      layout,
      key: name,
      modifiedData,
    });
  }, [modifiedData, layout, name]);

  return {
    addComponentToDynamicZone,
    formErrors,
    layout,
    isCreatingEntry,
    isFieldAllowed,
    isFieldReadable,
    moveComponentUp,
    moveComponentDown,
    removeComponentFromDynamicZone,
    dynamicDisplayedComponents,
    conditionallyHidden,
  };
}

export default useSelect;
