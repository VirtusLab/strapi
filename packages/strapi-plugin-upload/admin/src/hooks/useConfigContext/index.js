import { useContext } from 'react';
import ConfigContext from '../../contexts/ConfigContext';

const useConfigContext = () => useContext(ConfigContext);

export default useConfigContext;
