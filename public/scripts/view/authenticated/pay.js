function loginFirst() {
  const next = window.location.pathname.replace(/^\//g, '');
  window.location.href = window.location.protocol + '//'
    + window.location.host + '/login?next=' + encodeURIComponent(next);
}

(function () {
  const toggleClasses = ['is-first', 'is-second'];

  function toggleButton(button) {
    const classes = button.parentElement.classList;
    const activeClass = classes[classes.length - 1];
    const index = toggleClasses.findIndex(c => c === activeClass);
    const other = (index + 1) % 2;
    classes.remove(activeClass);
    classes.add(toggleClasses[other]);
  }

  const buttons = document.querySelectorAll('button.status-button');
  for (const button of buttons) {
    button.addEventListener('click', function (e) {
      button.classList.add('is-loading');

      const url = window.location.href + '/status';

      const data = {};
      data[this.dataset.status] = JSON.parse(this.dataset.value);
      const payload = JSON.stringify(data);

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status === 200) {
          toggleButton(this);
          if (this.dataset.status === 'paid') {
            location.reload();
          }
        } else if (xhr.status === 401) {
          loginFirst();
        } else {
          console.error(xhr.status, xhr.response);
        }
        button.classList.remove('is-loading');
      }
      xhr.send(payload);
    });
  }
})();

(function () {
  const button = document.querySelector('button.delete-button');
  button.addEventListener('click', function (e) {
    button.classList.add('is-loading');
    const xhr = new XMLHttpRequest();
    
    console.log(window.location.href);
    xhr.open('DELETE', window.location.href, true);
    xhr.onload = () => {
      if (xhr.readyState == 4 && xhr.status === 204) {
        location.reload();
      } else if (xhr.status === 401) {
        loginFirst();
      } else {
        console.error(xhr.status, xhr.response);
      }
      button.classList.remove('is-loading');
    };
    xhr.send();
  });
})();
