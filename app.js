
var uid;
var pattern

$(document).ready(function(){  



//----------tab-вкладки основного меню----------

	$('ul.nav').each(function(){
	$(this).find('li').each(function(i){
		$(this).click(function(){
			$(this).addClass('active').siblings().removeClass('active');
			var p = $('div#square');
	        p.find('div.content').hide();
	        p.find('div.content:eq(' + i + ')').show();
			});
		});
	});




//----------подгружаем данные при включении приложения----------

	$.getJSON('http://applicants-tenet.rhcloud.com/api/1/Silverxak/applicants', function(data){
	  var i;
	  for(i = 0; i < data.length; i++)
	    $('<tr><td>' + data[i].id + '</td><td>' + data[i].name + '</td><td>' + data[i].surname + '</td><td><img src="delete.png" class="rm"><img src="edit.png" class="ed"></td></tr>').appendTo('#list');
	});




//----------обработчики событий кнопок удаления и редактирования----------

	$(function(){
    $('table').on('click', '.rm', function(){
    	if(confirm('Вы уверены, что хотите удалить: ' + $(this).closest('tr').find('td:eq(1)').text() + ' ' + $(this).closest('tr').find('td:eq(2)').text() + ' ?')){
			$.ajax({
			    type: 'DELETE',
			    url: 'http://applicants-tenet.rhcloud.com/api/1/Silverxak/applicants/' + $(this).closest('tr').find('td:first').text()
			});
			$(this).closest('tr').remove();
    	}
    	});
	});

	$(function(){
	    $('table').on('click', '.ed', function(){

	    	$('#errmsg').hide();

	    	uid = $(this).closest('tr').find('td:first').text();

	    	var fname = $('#fname').val($(this).closest('tr').find('td:eq(1)').text());
	    	var fsname = $('#fsname').val($(this).closest('tr').find('td:eq(2)').text());

	    	$('#popup').show();

	    	$(this).closest('tr').find('td:eq(1)').text($('#fname').val());
	    	$(this).closest('tr').find('td:eq(2)').text($('#fsname').val());

	    	$('#btnTrue').attr('onclick', 'editMember();');

	    });
	});

});



//----------горячая проверка фамилии фамилия->паттерн / паттерн->фамилия----------

	$(function(){
    $('#testpat').keyup(function(){
    	var pattern = new RegExp($('#pattern').val());
    	if(pattern.test($(this).val()))
    		$(this).css('color', 'green');
    	else if(!(pattern.test($(this).val())))
    		$(this).css('color', 'red');
    	});
	});

	$(function(){
    $('#pattern').keyup(function(){
    	var pattern = new RegExp($(this).val());
    	if(pattern.test($('#testpat').val()))
    		$('#testpat').css('color', 'green');
    	else if(!(pattern.test($('#testpat').val())))
    		$('#testpat').css('color', 'red');
    	});
	});	




//----------функция добавления соискателя----------

function addMember(arg, uid){
	if($('#fname').val() && $('#fsname').val()){
		var fname = $('#fname').val();
		var fsname = $('#fsname').val();
		if(pattern.test($('#fsname').val()) && pattern.test($('#fsname').val())){
			$.ajax({
				url: "http://applicants-tenet.rhcloud.com/api/1/Silverxak/applicants",
				type: "POST",
				ContentType: "application/json",
				data: ({ name: fname, surname: fsname}),
				success: function(msg){
					$('#popup').hide();
					$('<tr><td>' + msg.id + '</td><td>' + fname + '</td><td>' + fsname + '</td><td><img src="delete.png" class="rm"><img src="edit.png" class="ed"></td></tr>').appendTo('#list');
					$('#fname').val('');
					$('#fsname').val('');
					$('#trmsg').show().text('Пользователь успешно добавлен в базу!').fadeOut(3000);
				},

				error: function(data){
					if(/duplicate/.test(data.responseText))
						$('#errmsg').show().text('Такой соискатель уже есть!');
					else if(/Некорректное/.test(data.responseText))
						$('#errmsg').show().text('Проверьте правильность фио!');
				}
			});
		}
		else{
			$('#errmsg').show().text('Несоответствует паттерну: ' + pattern);
		}
	}
	else{
		$('#errmsg').show().text('Проверьте поля имени и фамилии!');
	}	
}



//----------функция редактирования соискателя----------

	function editMember(){
		var fname = $('#fname').val();
    	var fsname = $('#fsname').val();
		if(fname && fsname){
			if(pattern.test($('#fsname').val()) && pattern.test($('#fsname').val())){
				$.ajax({
					url: "http://applicants-tenet.rhcloud.com/api/1/Silverxak/applicants/" + uid,
					type: "PUT",
					ContentType: "application/json",
					data: ({ name: fname, surname: fsname}),
					success: function(){
						$('table').find('tr').find('td:first:contains("' + uid + '") ~ td:eq(0)').text(fname);
						$('table').find('tr').find('td:first:contains("' + uid + '") ~ td:eq(1)').text(fsname);
						$('#popup').hide();
						$('#errmsg').hide();
						$('#trmsg').show().text('Пользователь успешно изменен в базе!').fadeOut(3000);					
					},

					error: function(data){
						if(/duplicate/.test(data.responseText))
							$('#errmsg').show().text('Такой соискатель уже есть!');
						else if(/Некорректное/.test(data.responseText))
							$('#errmsg').show().text('Проверьте правильность фио!');
					}				
				});
			}
			else{
				$('#errmsg').show().text('Невалидное фио, см. настройки->паттерн!');
			}
		}
		else{
			$('#errmsg').show().text('Проверьте поля имени и фамилии!');
		}
	}



//----------вызов диалога на добавление----------

	function dialogNewMember(){
		if($('#list tr:not(:has("th"))').length < 7){
			$('#popup').show();
	    	$('#fname').val(''); 
	    	$('#fsname').val('');
	    	$('#errmsg').hide();
	    	$('#btnTrue').attr('onclick', 'addMember();');		
		}
		else
			$('#trmsg').show().text('Лимита добавления [7], удалите неиспользуемых и повторите попытку!').fadeOut(3000);
	}




//----------обработчик событияна изменение фона через настройки----------

	$(function(){
	    $('.setcol').on('click', '.curcol', function(){

	    	$('.gen').css('background-color', $(this).css('background-color'));
	    });
	});




//----------сохраняем настройки----------

	function sendSettings(){
		var color = $('.gen').css('background-color');
		var pattern = $('#pattern').val();
		$.ajax({
			url: "http://applicants-tenet.rhcloud.com/api/1/Silverxak/settings",
			type: "PUT",
			ContentType: "application/json",
			data: ({ background: color, validate: pattern}),

			success: function(){
				$('#trsetmsg').show().text('Настройки успешно сохранены').fadeOut(3000);
			}
		});		
	}



//----------устанавливаем цвет при включении и паттерн----------

		$.ajax({
		url: "http://applicants-tenet.rhcloud.com/api/1/Silverxak/settings",
		type: "GET",
		ContentType: "application/json",
        success: function(resp){
            $('.gen').css('background-color', resp.background);
	    	$('#pattern').val(resp.validate);
	    	pattern = new RegExp(resp.validate);
        }
	});




/*//----------устанавливаем паттерн при включении----------	
	
	$.ajax({
		url: "http://applicants-tenet.rhcloud.com/api/1/Silverxak/settings",
		type: "GET",
		ContentType: "application/json",
	    success: function(resp){
	    	$('#pattern').val(resp.validate);
	    	pattern = new RegExp(resp.validate);
	    }
	});
*/