function getComponent() {
  return import(/* webpackChunkName: "lodash" */ 'lodash').then(({ default: _ }) => {
    var element = document.createElement('div');

    element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    return element;
  }).catch(err => 'err occured', err);
}

getComponent().then(component => {
  document.body.appendChild(component);
});
