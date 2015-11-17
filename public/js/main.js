jQuery(document).ready(function($){
    
    $('#form1 .submit').click(function(e){
        e.preventDefault();
        
        var email = $('#email').val();
        if (email=='') {
            alert('Please enter your email');
        } else if (!validateEmail(email)) {
            alert('Your email is invalid');
        } else{
            $('#form1').submit();
        }
        
    });

    $('#form2 .submit').click(function(e){
        e.preventDefault();
        var first_name = $('#first-name').val();
        var last_name = $('#last-name').val();
        var address = $('#address').val();
        var city = $('#city').val();
        var state = $('#state').val();
        var zip = $('#zip').val();
        var password = $('#password').val();
        var rules = $('#rules').val();
        var optin = $('#optin').val();
        var email = $('input[name="email"]').val();

      if (password!=undefined && password.length > 0 && password.length < 6) {
        alert('Your password must be at least 6 characters.');

      } else if (first_name=='' || last_name=='' || address=='' || city=='' || state=='' || zip=='') {
        alert('Please fill out your full address.');
      } else if (rules!='1') {
        alert('You must agree to the rules to enter the sweepstakes.');
      } else {
        $.post('/enter-sweep', $('#form2').serialize(), function(res){
          if (res.code == '200') {
            location.href = '/thank-you'
          } else if (res.code == '400') {
            if (res.error['@code'] == 'error.invalid.zipCode') {
              alert ("Please enter a valid zip code.")
            } else if (res.error['@code'] == 'error.required.state') {
              alert ("Please enter a valid state in XX format.")
            }
          }
        }).fail( console.log );
      }
    });
    
    $('.checkbox').click(function(){
        $(this).toggleClass('hit');
        field = $(this).attr('data-field');
        if ($(this).hasClass('hit')){
            $('input[name="'+field+'"]').val('1');
        } else {
            $('input[name="'+field+'"]').val('0'); 
        }
    });

});

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}