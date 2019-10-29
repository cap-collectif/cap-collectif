// @flow
/* eslint-env jest */
require('./app.js');

it('Should return one script child with raw javascript as input with double quotes', () => {
  const scriptText = 'console.log("js");';
  const value = global.App.dangerouslyExecuteHtml(scriptText);
  const script = document.createElement('script');
  script.innerHTML = "console.log('js');";
  expect(value).toEqual([script]);
});

it('Should return one script child with raw javascript as input with simple quotes', () => {
  const scriptText = "console.log('js');";
  const value = global.App.dangerouslyExecuteHtml(scriptText);
  const script = document.createElement('script');
  script.innerHTML = "console.log('js');";
  expect(value).toEqual([script]);
});

it('Should return two scripts children and one noscript child with html tags', () => {
  const scriptText =
    "<script>console.log('js');</script><noscript><img src='blabla' height='1' width='1'/></noscript><script>console.log('end js');</script>";
  const value = global.App.dangerouslyExecuteHtml(scriptText);

  const script = document.createElement('script');
  const script2 = document.createElement('script');
  const noscript = document.createElement('div');
  script.innerHTML = "console.log('js');";
  script2.innerHTML = "console.log('end js');";
  noscript.innerHTML = "<img src='blabla' height='1' width='1'/>";

  expect(value).toEqual([script, noscript, script2]);
});
