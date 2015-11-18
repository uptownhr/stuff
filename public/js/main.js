if (!Modernizr.localstorage) {
  window.localStorage = {
    _data       : {},
    setItem     : function(id, val) { return this._data[id] = String(val); },
    getItem     : function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
    removeItem  : function(id) { return delete this._data[id]; },
    clear       : function() { return this._data = {}; }
  };
}

jQuery(document).ready(function($){
    
    $('#form1 .submit').click(function(e){
        e.preventDefault();
        
        
        var email = $('#email').val();
        if (email=='') {
            alert('Please enter your email');
        } else if (!validateEmail(email)) {
            alert('Your email is invalid');
        } else{
            $.ajax({
                method: "POST",
                url: "http://condenast-specialprojects.com/self/add_info.php",
                data: { email: email }
            })
            .done(function( msg ) {
                console.log(msg)
                if (msg == 'Success' || msg == '122') {
                    $('#form1').submit();
                } else {
                    $('#form1').submit();
                }
            }).fail(function(jqXHR, textStatus, errorThrown){
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            });
        }
        return false;
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
            var data = {
                subscribe: optin? 'Yes': 'No',
                email: email,
                name: first_name + ' ' + last_name,
                address: address,
                city: city,
                state: state,
                zip: zip
            };
            $.ajax({
                method: "POST",
                url: "http://condenast-specialprojects.com/self/update_info.php",
                data: data
            })
            .done(function( msg ) {
                if (msg == 'Success') {
                    location.href = '/thank-you';
                } else {
                    location.href = '/thank-you';
                }
            });
          } else if (res.code == '400') {
            if (res.error['@code'] == 'error.invalid.zipCode') {
              alert ("Please enter a valid zip code.")
            } else if (res.error['@code'] == 'error.required.state') {
              alert ("Please enter a valid state in XX format.")
            }
          }
        }).fail( console.log );
      }
      return false;
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
    
    $('#state').change(function(){
       $(this).css('color','black'); 
    });

});

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}