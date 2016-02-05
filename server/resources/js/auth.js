"use strict";

function login() {
    var user = document.getElementsByName('user')[0].value;
    var pass = document.getElementsByName('pass')[0].value;
    
    if (!user || !pass)
        $('#error').html('<font color="red">Please enter username and password!</font>');
	else {
        $.post('login', {
		user : user,
		pass : pass},
        function(responseText) {
            if (responseText === 'OK')
                window.location='/';
            else
                $('#error').html('<font color="red">' + responseText + ' </font>');
		});
	}
}

function createUser() {
	var user = document.getElementById('user').value;
	var name = document.getElementById('name').value;
	var pass = document.getElementById('pass').value;
	var passCheck = document.getElementById('passCheck').value;
    var descr = document.getElementById('descr').value;
    var easyPayUser = document.getElementById('easyPayUser').value;
    var easyPayAccount = document.getElementById('easyPayAccount').value;
	var role = $('input[name="role"]:checked').val();
	
	if (!user) {
	    $('#error').html('<font color="red">Please enter a username!</font>');
        return;
    }
    
    if (!name) {
	    $('#error').html('<font color="red">Please enter a display name!</font>');
        return;
    }
    
    if (!pass) {
	    $('#error').html('<font color="red">Please enter a password!</font>');
        return;
    }
    
    if (!easyPayAccount) {
	    $('#error').html('<font color="red">Please enter an EasyPay account!</font>');
        return;
    }
    
    if (!easyPayUser) {
	    $('#error').html('<font color="red">Please enter an EasyPay username.</font>');
        return;
    }
        
	if (pass !== passCheck)
            $('#error').html('<font color="red">Passwords do not match!</font>');
	else {
        $.post('register', {
		user : user,
		name : name,
		pass : pass,
		role : role,
        description : descr,
        easyPayUser : easyPayUser,
        easyPayAccount : easyPayAccount},
        function(responseText) {
            if (responseText === 'OK')
                window.location='/register_google?user=' + user;
            else
                $('#error').html('<font color="red">' + responseText + '</font>');
		});
	}
}