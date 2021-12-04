(function () {
  const form = document.querySelector('#payment-form');
  const button = document.querySelector('#submit-button');
  button.addEventListener('click', function (e) {
    button.setAttribute('disabled', 'true');
    button.classList.add('is-loading');
    form.submit.click();
    setTimeout(function () {
      button.removeAttribute('disabled');
      button.classList.remove('is-loading');
    }, 1000);
  });
})();

(function () {
  if (isMobile()) {
    const container = document.querySelector('#payment-form-container');
    const form = document.querySelector('#payment-form');
    const spacer = document.querySelector('#spacer');
    for (const element of form.querySelectorAll('textarea,input:not(.button)')) {
      element.addEventListener('click', function (e) {
        spacer.classList.remove('is-hidden');
        setTimeout(function () {
          // Scroll the form into view for mobile users.
          container.scrollIntoView();
          setTimeout(function () {
            // Wait until the keyboard opened on the phone.
            spacer.classList.add('is-hidden');
          }, 1000);
        }, 0);
      });
    }
  }
})();
