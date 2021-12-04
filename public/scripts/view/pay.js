(function () {
  const availableFundingSources = paypal.getFundingSources();
  const fundingSourceElements = {
    'paypal': '#payment-button-container-paypal-account',
    'sepa': '#payment-button-container-paypal-sepa'
  };

  const paymentParameters = getPaymentParameters();
  const purchaseUnit = getPurchaseUnitSafe(paymentParameters);

  for (const fundingSource in fundingSourceElements) {
    if (!fundingSourceElements.hasOwnProperty(fundingSource)) {
      continue;
    }
    if (!availableFundingSources.includes(fundingSource)) {
      console.warn('funding source', fundingSource, 'is not available');
      continue;
    }
    const elementId = fundingSourceElements[fundingSource];
    displayButton(elementId, fundingSource, purchaseUnit);
  }

  function displayButton(elementId, fundingSource, purchaseUnit) {
    const button = createButton(fundingSource, purchaseUnit);
    if (button.isEligible()) {
      button.render(elementId);
    }
  }

  function safeGetter(object) {
    return function (name) {
      if (!object.hasOwnProperty(name)) {
        throw Error('missing field "' + name + '"');
      }
      return object[name];
    };
  }

  function createDescription(paymentParameters) {
    const get = safeGetter(paymentParameters);
    return get('reference') + ' - ' + get('title');
  }

  function getPurchaseUnitSafe(paymentParameters) {
    const get = safeGetter(paymentParameters);
    return {
      "description": createDescription(paymentParameters),
      "amount": {
        "currency_code": get('currency_code'),
        "value": get('price')
      }
    };
  }

  function createButton(fundingSource, purchaseUnit) {
    return paypal.Buttons({
      fundingSource,
      style: {
        shape: 'rect',
        color: 'white',
        layout: 'horizontal',
        label: 'paypal',
        size: 'responsive',
        height: 55, // Bulma button height
        tagline: false
      },
      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [
            purchaseUnit
          ]
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture()
          .then(function (data) {
            // Full available details
            console.log('Capture result', data, JSON.stringify(data, null, 2));
            // Show a success message within this page, e.g.
            const element = document.getElementById('paypal-button-container');
            element.innerHTML = '';
            element.innerHTML = '<h3>Die Zahlung wurde erfolgreich durchgeführt!</h3>';
            // Or go to another URL:  actions.redirect('thank_you.html');
          });
      },
      onError: function (err) {
        console.error(err);
      }
    });
  }

  function getElementJsonData(element, dataName) {
    const attributeName = 'data-' + dataName;
    if (!element.hasAttribute(attributeName)) {
      throw 'the element does not have data with the name.';
    }
    const data = element.getAttribute(attributeName);
    return JSON.parse(data);
  }

  function getPaymentParameters() {
    const element = document.querySelector('#payment-parameters');
    return getElementJsonData(element, 'value');
  }
})();

(function () {
  const containers = document.querySelectorAll(".overlay-container");
  for (const container of containers) {
    const button = container.querySelector('.button');
    container.addEventListener('mouseover', function (e) {
      button.classList.add('hovering');
    });
    container.addEventListener('mouseout', function (e) {
      button.classList.remove('hovering');
    });
  }
})();

(function () {
  const first = document.querySelector('#view-payment-buttons');
  const second = document.querySelector('#view-bank-transfer');
  const on = document.querySelector('#button-bank-transfer');
  const off = second.querySelector('button.delete');

  function elementPosition(element) {
    if (!element.offsetParent) {
      return;
    }
    let top = 0;
    do {
        top += element.offsetTop;
    }
    while (element = element.offsetParent);
    return top;
  }

  on.addEventListener('click', function (e) {
    first.classList.add('is-hidden');
    second.classList.remove('is-hidden');
    setTimeout(function () {
      window.scroll({
        top: second.offsetTop - 25,
        behavior: 'smooth'
      });
    }, 50);
  });

  off.addEventListener('click', function (e) {
    first.classList.remove('is-hidden');
    second.classList.add('is-hidden');
  });
})();
