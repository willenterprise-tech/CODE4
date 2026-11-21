// Keep the product context when a visitor requests a demo from the catalogue.
document.addEventListener('DOMContentLoaded', function(){
  const productId = new URLSearchParams(window.location.search).get('product');
  const products = new Map([
    ['wenix', 'Wenix'],
    ['cbt', 'CBT System']
  ]);
  const product = products.get(productId);
  if(!product) return;

  const message = document.querySelector('.contact-form [name="message"]');
  const intro = document.getElementById('contact-intro');
  if(message && !message.value.trim()){
    message.value = 'Hello G3 Labs, I would like a demo of ' + product + '. Please share more details about the features, setup and pricing.';
  }
  if(intro){
    intro.textContent = 'Interested in ' + product + '? Tell us about your organisation and we\'ll discuss a demo, setup and pricing.';
  }
});
