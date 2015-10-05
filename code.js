function decode_utf8(s)
{
  var d = unescape(encodeURIComponent(s));
  var b = new Uint8Array(d.length);
  var i;
  for (i = 0; i < d.length; i++)
    b[i] = d.charCodeAt(i);
  return b;
}

function select_element()
{
  if (window.getSelection && document.createRange) {
    sel = window.getSelection();
    range = document.createRange();
    range.selectNodeContents(this);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(this);
      range.select();
    } else {
      alert ("Do not know how to select.");
    }
  }
}

function number_or_default (default_value, element)
{
  return function() {
    var number = parseInt(element[0].textContent);
    console.debug ("number: %d", number);
    var result = (number == number) ? number : default_value;
    console.debug ("result: %d", result);
    return result;
  };
}

$(document).ready(function(){
  var domain   = $('#domain');
  var variant  = $('#variant');
  var identity = $('#identity');
  var secret   = $('#secret');
  var account  = $('#account');
  var password = $('#password');
  var account_hash;
  var password_hash;
  var account_length = number_or_default(8, $('#account_length'));
  var password_length = number_or_default(20, $('#password_length'));

  console.debug("account_length: %d", account_length());
  console.debug("password_length: %d", password_length());
  
  var account_alphabet = "abcdefghijklmnopqrstuvwxyz";
  var password_alphabet =
      "0123456789" + 
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
      "abcdefghijklmnopqrstuvwxyz" +
      "^!$%&/()=?{[]}+*#,;.:-_<>";

  function update (element, hash, alphabet, data) {
    hash.update(data);
    var digest = hash.digest();
    var text = "";
    for (var i = 0; i < digest.length; i++)
      text += alphabet[digest[i] % alphabet.length];
    element.text(text);
  }

  $('input').on('input change paste', function () {

    account_hash = new BLAKE2s(account_length(), decode_utf8(identity.val()));
    password_hash = new BLAKE2s(password_length(), decode_utf8(secret.val()));

    update(account, account_hash, account_alphabet,
	   decode_utf8(domain.val()));
    update(password, password_hash, password_alphabet,
	   decode_utf8(
	     domain.val() + variant.val() + identity.val()));
  });

  // Does not work on Apple WebJunk.
  //account.click(select_element);
  //password.click(select_element);

  // Localization
  var lang = navigator.language.split("-")[0];
  var l15n = $('span.l15n > span:lang('+lang+')');
  if (l15n.length > 0) {
    $('span.l15n > span').css('display', 'none');
    l15n.css('display', 'initial');
  }

  domain.focus();
});
