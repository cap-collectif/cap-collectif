describe('Login check', () => {
  it('should return invalid check for unauthenticated user', async () => {
    const response = await fetch('https://capco.test/login_check', {
      method: 'GET',
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: false });
  });
});
