import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

import { LoadingIndicatorPage, request } from 'strapi-helper-plugin';
import { getRequestUrl } from '../../utils';

import ConfigContext from '../../contexts/ConfigContext';

const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({});

  const fetchConfig = async () => {
    const requestURL = getRequestUrl('config');
    try {
      const data = await request(requestURL, {
        method: 'GET',
      });
      setConfig(data);
    } catch (err) {
      console.error(err);
      strapi.notification.toggle({
        type: 'warning',
        message: { id: 'notification.error' },
      });
      setConfig({ input: { types: ['*/*'] } });
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  if (isEmpty(config)) {
    return <LoadingIndicatorPage />;
  }

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};

ConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ConfigProvider;
