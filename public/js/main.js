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



});

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}