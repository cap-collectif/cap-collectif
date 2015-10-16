// import SynthesisBox from './components/Synthesis/SynthesisBox';
import IntlData from './translations/Synthesis/FR';
import RouterContainer from './services/RouterContainer';
import router from './router';
import AuthService from './services/AuthService';

RouterContainer.set(router);

AuthService
.login()
.then(() => {
  /*if ($('#render-synthesis-view-box').length) {
    React.render(
      <SynthesisBox synthesis_id={$('#render-synthesis-view-box').data('synthesis')} mode="view" {...IntlData} />,
      document.getElementById('render-synthesis-view-box')
    );
  }*/

  if ($('#render-synthesis-edit-box').length) {
    router.run((Handler, state) => {
      React.render(<Handler synthesis_id={$('#render-synthesis-edit-box').data('synthesis')} mode="edit" {...state} {...IntlData} />, document.getElementById('render-synthesis-edit-box'));
    });
  }
});
