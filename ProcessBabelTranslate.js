$(document).ready(function () {

	// Make neccessary module preparations
	var settings;
	settings = config.ProcessBabelTranslate;
	settings.ajaxUrl = config.urls.admin + 'page/babel-translate/';

	// Make Babel `translate`	action button dynamic.
	// Meaning load the action as an iframe via magnific popup.
	// Makes page translating much faster	
	(function () {
		var $translateButton, url;
		$(document).on('click', '.PageListActionBabel a', function (e) {

			$translateButton = $(this);
			if (!!$translateButton.data('magnificPopup')) return;

			e.preventDefault();
			url = $translateButton.attr('href');	
			$translateButton.attr('href', url + '&modal=1');

			$translateButton.magnificPopup({
				type : 'iframe'
			});

			$translateButton.trigger('click');
		});			
	})();



	// Listen to the change in babel_object_$language
	// inputfields and ask what to do via ajax from 
	// ProcessBabelTranslate
	(function function_name (argument) {
		var language, target, onObjectChange;

		settings.progress = {};

		function replaceDescription (id, data) {
			var target, text, key;
			target = $('#' + id + ' > .InputfieldContent > .description');
			text = target.text();
			for (key in data) {
				text = text.replace('{{'+ key +'}}', '"' + data[key] + '"');
			}
			target.text(text);
		}

		onObjectChange = function (language) {
			var id;
			return function (e, data) {
				if (!settings.progress[language.name]) {
					settings.progress[language.name] = $('<li class="ProcessBabelTranslate-progress"><i class="icon fa fa-fw fa-spinner fa-spin"></i></li>');
					$('#Inputfield_babel_' + language.name + '> .InputfieldContent > .Inputfields').append(settings.progress[language.name]);
				}
				settings.progress[language.name].fadeIn();
				$.get(settings.ajaxUrl + "?action=fieldObject&id="+ settings.pageId +"&object=" + data.id + "&language=" + language.id, function (data) {
					settings.progress[language.name].fadeOut(0);
					data = $.parseJSON(data);
					if (data.follow === 'dependency') {
						id = data.inputfieldId + '_' + language.name;
						replaceDescription(id, data.replace);
						$('#Inputfield_babel_hidden_' + language.name).val(data.hiddenValue).trigger('change');
					}
				});
			};
		};
		
		for (var i = 0; i < settings.languages.length; i++) {
			language = settings.languages[i];
			target = $('[name="babel_object_'+ language.name +'"]');
			target.on('pageSelected', onObjectChange(language));
		}
		
	})();
	
});