import filterLinks from '../filterLinks';

describe('ADMIN | CONTAINERS | LeftMenu | utils | filterLinks', () => {
  it('should return the displayable links', () => {
    const data = [
      {
        isDisplayed: false,
      },
      {
        isDisplayed: true,
      },
      { isDisplayed: true },
    ];

    expect(filterLinks(data)).toHaveLength(2);
  });

  it('should return the displayable & manageable links', () => {
    const data = [
      {
        isDisplayed: false,
      },
      {
        isDisplayed: true,
      },
      { isDisplayed: true, isManaged: false },
    ];

    expect(filterLinks(data)).toHaveLength(1);
  });
});
