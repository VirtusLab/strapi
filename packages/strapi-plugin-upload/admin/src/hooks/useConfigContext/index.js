import { useContext } from 'react';
import ConfigContext from '../../contexts/ConfigContext';

const useAppContext = () => useContext(ConfigContext);

export default useAppContext;
