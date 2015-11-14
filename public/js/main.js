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
        var rules = $('#rules:checked').length;
        var optin = $('#optin:checked').val();
        var email = $('input[name="email"]').val();
        
        if (first_name=='' || last_name=='' || address=='' || city=='' || state=='' || zip=='') {
            alert('Please fill out your full address.');
        } else if (password.length > 0 && password.length < 6) {
            alert('Your password must be at least 6 characters.');
        } else if (!rules) {
            alert('You must agree to the rules to enter the sweepstakes.');
        } else {
            console.log($('#form2').serialize())
            $.post('/enter-sweep', $('#form2').serialize(), function(res){
                if (res.code == '200') {
                   $('#form2').submit();
                } else if (res.code == '400') {
                    alert("Something went wrong.");
                }
            });
        }
        
    });

});

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}