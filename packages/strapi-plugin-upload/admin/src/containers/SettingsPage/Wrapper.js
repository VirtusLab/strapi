/*
 *
 * This should be a component in the helper plugin that will be used
 * by the webhooks views
 */

import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 25px 10px;
  margin-top: 33px;
  border-radius: ${({ theme }) => theme.main.sizes.borderRadius};
  box-shadow: 0 2px 4px ${({ theme }) => theme.main.colors.darkGrey};
  background: ${({ theme }) => theme.main.colors.white};
  section {
    + p {
      color: #9ea7b8;
      width: 100%;
      padding-top: 9px;
      font-size: 13px;
      line-height: normal;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: -8px;
    }
  }
`;

// copy from packages/strapi-admin/admin/src/components/Webhooks/HeadersInput/index.js:28
const getBorderColor = ({ isFocused = false }) => (isFocused ? '#78caff' : '#E3E9F3');

export const customStyles = {
  control: (base, state) => ({
    ...base,
    border: `1px solid ${getBorderColor({ isFocused: state.isFocused })} !important`,
    borderRadius: '2px !important',
  }),
  menu: base => {
    return {
      ...base,
      padding: '0',
      border: '1px solid #e3e9f3',
      borderTop: '1px solid #78caff',
      borderTopRightRadius: '0',
      borderTopLeftRadius: '0',
      borderBottomRightRadius: '3px',
      borderBottomLeftRadius: '3px',
      boxShadow: 'none',
      marginTop: '-1px;',
    };
  },
  menuList: base => ({
    ...base,
    maxHeight: '224px',
    paddingTop: '0',
  }),
  option: (base, state) => {
    return {
      ...base,
      backgroundColor: state.isSelected || state.isFocused ? '#f6f6f6' : '#fff',
      color: '#000000',
      fontSize: '13px',
      fontWeight: state.isSelected ? '600' : '400',
      cursor: state.isFocused ? 'pointer' : 'initial',
      height: '32px',
      lineHeight: '16px',
    };
  },
};

export default Wrapper;
