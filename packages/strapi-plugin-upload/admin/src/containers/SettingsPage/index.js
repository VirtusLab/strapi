import React, { useEffect, useReducer, useRef } from 'react';
import Select from 'react-select';
import { Header, Inputs } from '@buffetjs/custom';
import { isEqual } from 'lodash';
import { LoadingIndicatorPage, useGlobalContext, request } from 'strapi-helper-plugin';

import { getRequestUrl, getTrad } from '../../utils';
import Text from '../../components/Text';
import Divider from './Divider';
import SectionTitleWrapper from './SectionTitleWrapper';
import Wrapper, { customStyles } from './Wrapper';
import init from './init';
import reducer, { initialState } from './reducer';

const SettingsPage = () => {
  const { formatMessage } = useGlobalContext();
  const [reducerState, dispatch] = useReducer(reducer, initialState, init);
  const { initialData, isLoading, modifiedData } = reducerState.toJS();
  const isMounted = useRef(true);
  const getDataRef = useRef();
  const abortController = new AbortController();

  getDataRef.current = async () => {
    try {
      const { signal } = abortController;
      const { data } = await request(getRequestUrl('settings', { method: 'GET', signal }));

      if (isMounted.current) {
        dispatch({
          type: 'GET_DATA_SUCCEEDED',
          data: {
            ...data,
            supportFormat: (data.supportFormat || []).map(label => {
              const value = data.supportFormatOptions.find(_ => _.label === label)?.regex;

              return { label, value };
            }),
            supportFormatOptions: (data.supportFormatOptions || []).map(({ label, regex }) => ({
              label,
              value: regex,
            })),
          },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getDataRef.current();

    return () => {
      abortController.abort();
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    const supportFormat = modifiedData.supportFormat || [];
    const supportFormatOptions = modifiedData.supportFormatOptions || [];
    const payload = {
      ...modifiedData,
      supportFormat: supportFormat.map(({ label }) => label),
      supportFormatOptions: supportFormatOptions.map(({ label, value }) => ({
        label,
        regex: value,
      })),
    };
    try {
      await request(getRequestUrl('settings'), {
        method: 'PUT',
        body: payload,
      });

      if (isMounted.current) {
        dispatch({
          type: 'SUBMIT_SUCCEEDED',
        });
      }

      strapi.notification.toggle({
        type: 'success',
        message: { id: 'notification.form.success.fields' },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const headerProps = {
    title: {
      label: formatMessage({ id: getTrad('settings.header.label') }),
    },
    content: formatMessage({
      id: getTrad('settings.sub-header.label'),
    }),
    actions: [
      {
        color: 'cancel',
        disabled: isEqual(initialData, modifiedData),
        // TradId from the strapi-admin package
        label: formatMessage({ id: 'app.components.Button.cancel' }),
        onClick: () => {
          dispatch({
            type: 'CANCEL_CHANGES',
          });
        },
        type: 'button',
      },
      {
        disabled: false,
        color: 'success',
        // TradId from the strapi-admin package
        label: formatMessage({ id: 'app.components.Button.save' }),
        onClick: handleSubmit,
        type: 'button',
      },
    ],
  };

  const handleChange = ({ target: { name, value } }) => {
    dispatch({
      type: 'ON_CHANGE',
      keys: name,
      value,
    });
  };
  const onChangeSupportFormat = value => {
    dispatch({
      type: 'ON_CHANGE',
      keys: 'supportFormat',
      value,
    });
  };

  if (isLoading) {
    return <LoadingIndicatorPage />;
  }

  return (
    <>
      <Header {...headerProps} />
      <Wrapper>
        <div className="container-fluid">
          <div className="row">
            <SectionTitleWrapper className="col-12">
              <Text fontSize="xs" fontWeight="semiBold" color="#787E8F">
                {formatMessage({ id: getTrad('settings.section.common.label') })}
              </Text>
            </SectionTitleWrapper>
            <div className="col-6">
              <label htmlFor="support-formats">
                {formatMessage({ id: getTrad('settings.form.supportFormats.label') })}
              </label>
              <section>
                <Select
                  isMulti
                  id="support-formats"
                  onChange={onChangeSupportFormat}
                  options={modifiedData.supportFormatOptions}
                  styles={customStyles}
                  value={modifiedData.supportFormat}
                />
              </section>
              <p>{formatMessage({ id: getTrad('settings.form.supportFormats.description') })}</p>
            </div>
          </div>
          <Divider />
          <div className="row">
            <SectionTitleWrapper className="col-12">
              <Text fontSize="xs" fontWeight="semiBold" color="#787E8F">
                {formatMessage({ id: getTrad('settings.section.image.label') })}
              </Text>
            </SectionTitleWrapper>
            <div className="col-6">
              <Inputs
                label={formatMessage({
                  id: getTrad('settings.form.responsiveDimensions.label'),
                })}
                description={formatMessage({
                  id: getTrad('settings.form.responsiveDimensions.description'),
                })}
                name="responsiveDimensions"
                onChange={handleChange}
                type="bool"
                value={modifiedData.responsiveDimensions}
              />
            </div>
            <div className="col-6">
              <Inputs
                label={formatMessage({
                  id: getTrad('settings.form.sizeOptimization.label'),
                })}
                name="sizeOptimization"
                onChange={handleChange}
                type="bool"
                value={modifiedData.sizeOptimization}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <Inputs
                label={formatMessage({
                  id: getTrad('settings.form.autoOrientation.label'),
                })}
                description={formatMessage({
                  id: getTrad('settings.form.autoOrientation.description'),
                })}
                name="autoOrientation"
                onChange={handleChange}
                type="bool"
                value={modifiedData.autoOrientation}
              />
            </div>
          </div>

          {/*
          <Divider />
          <div className="row">
            <SectionTitleWrapper className="col-12">
              <Text fontSize="xs" fontWeight="semiBold" color="#787E8F">
                {formatMessage({ id: getTrad('settings.section.video.label') })}
              </Text>
            </SectionTitleWrapper>
            <div className="col-6">
              <Inputs
                label={formatMessage({
                  id: getTrad('settings.form.videoPreview.label'),
                })}
                description={formatMessage({
                  id: getTrad('settings.form.videoPreview.description'),
                })}
                name="videoPreview"
                onChange={handleChange}
                type="bool"
                value={modifiedData.videoPreview}
              />
            </div>
          </div> */}
        </div>
      </Wrapper>
    </>
  );
};

export default SettingsPage;
