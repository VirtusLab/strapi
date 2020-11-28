import React, { useEffect, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { LoadingIndicatorPage, request, useUserPermissions } from 'strapi-helper-plugin';
import { isEmpty } from 'lodash';
import pluginId from '../../pluginId';
import pluginPermissions from '../../permissions';
import { AppContext } from '../../contexts';

import HomePage from '../HomePage';
import ConfigContext from '../../contexts/ConfigContext';
import { getRequestUrl } from '../../utils';

const App = () => {
  const state = useUserPermissions(pluginPermissions);
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
    if (!state.isLoading) {
      fetchConfig();
    }
  }, [state.isLoading]);

  // Show a loader while all permissions are being checked
  if (state.isLoading || isEmpty(config)) {
    return <LoadingIndicatorPage />;
  }

  if (state.allowedActions.canMain) {
    return (
      <AppContext.Provider value={state}>
        <ConfigContext.Provider value={config}>
          <Switch>
            <Route path={`/plugins/${pluginId}`} component={HomePage} />
          </Switch>
        </ConfigContext.Provider>
      </AppContext.Provider>
    );
  }

  return <Redirect to="/" />;
};

export default App;
