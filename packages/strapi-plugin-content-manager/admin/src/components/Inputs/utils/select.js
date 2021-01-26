import { useMemo } from 'react';
import { get } from 'lodash';
import useDataManager from '../../../hooks/useDataManager';
import useEditView from '../../../hooks/useEditView';
import { isFieldVisible } from '../../../utils/conditionalLogic';

function useSelect(keys) {
  const {
    createActionAllowedFields,
    formErrors,
    isCreatingEntry,
    modifiedData,
    onChange,
    readActionAllowedFields,
    shouldNotRunValidations,
    updateActionAllowedFields,
    layout,
  } = useDataManager();
  const { layout: currentContentTypeLayout } = useEditView();

  const allowedFields = useMemo(() => {
    return isCreatingEntry ? createActionAllowedFields : updateActionAllowedFields;
  }, [isCreatingEntry, createActionAllowedFields, updateActionAllowedFields]);

  const readableFields = useMemo(() => {
    return isCreatingEntry ? [] : readActionAllowedFields;
  }, [isCreatingEntry, readActionAllowedFields]);

  const value = get(modifiedData, keys, null);
  const conditionallyHidden = useMemo(() => {
    return !isFieldVisible({
      layout,
      key: keys,
      modifiedData,
    });
  }, [modifiedData, layout, keys]);

  return {
    allowedFields,
    currentContentTypeLayout,
    formErrors,
    isCreatingEntry,
    onChange,
    readableFields,
    shouldNotRunValidations,
    value,
    conditionallyHidden,
  };
}

export default useSelect;
