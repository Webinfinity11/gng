// Contact forms are a local prototype; no personal details are transmitted.
document.addEventListener('submit', function (event) {
  const form = event.target.closest('form[data-prototype-form]');
  if (!form) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!form.reportValidity()) return;
  let notice = form.querySelector('.prototype-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.className = 'prototype-notice';
    notice.setAttribute('role', 'status');
    form.append(notice);
  }
  notice.textContent = 'This is a design preview. Your message has not been sent.';
}, true);
