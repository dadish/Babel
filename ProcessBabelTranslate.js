$(document).ready(function () {

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  // Taken from underscore.js. See http://underscorejs.org#debounce
  function now () {
    return new Date().getTime();
  }

  function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

	// Make neccessary module preparations
	var settings;
	settings = config.ProcessBabelTranslate;
	settings.ajaxUrl = config.urls.admin + 'page/babel-translate/';
	settings.ajaxNameExistsUrl = config.urls.admin + 'page/add/exists';

	// Make Babel `translate`	action button dynamic.
	// Meaning load the action as an iframe via magnific popup.
	// Makes page translating much faster	
	(function () {
		var $translateButton, url;
		$(document).on('click', '.PageListActionBabel', function (e) {

			$translateButton = $(this);
			if (!$translateButton.is('a')) $translateButton = $translateButton.find('a');
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
	if ($('[data-babel-form="1"]').length) {
		(function function_name (argument) {
			var language, target, onObjectChange, onNameChange;

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
						settings.progress[language.name] = $('<li class="ProcessBabelTranslateProgress"><i class="icon fa fa-fw fa-spinner fa-spin"></i></li>');
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
				if (language.name === settings.currentLanguageName) continue;
				target = $('[name="babel_object_'+ language.name +'"]');
				target.on('pageSelected', onObjectChange(language));
			}


			onNameChange = function (language, status, note) {
				var target, parent, name;
				return function (ev) {
					target = $(ev.target);
					parent = $('[name="babel_parent_' + language.name + '"]');
					$.get(settings.ajaxNameExistsUrl, {
						parent_id : parent.val(),
						name : target.val()
					}, function (data) {
						status.html(' ' + data);
						if ($(data).hasClass('taken')) {
							target.addClass('ui-state-error-text');
							note.show(200);
						} else {
							target.removeClass('ui-state-error-text');
							note.hide(200);
						}
					});
				}
			}

			var status, note;
			for (var i = 0; i < settings.languages.length; i++) {
				language = settings.languages[i];
				if (language.name === settings.currentLanguageName) continue;
				target = $('[name="babel_name_'+ language.name +'"]');

				// add a status wrapper right beside the label
				status = $('<span></span>');
				$('[for="Inputfield_babel_name_'+ language.name +'"]').append(status);

				// add a dupe note
				note = $('<p class="notes">' + target.attr('data-note') + '</p>');
				note.insertAfter(target);
				note.hide(200)
				
				target.on('keyup', debounce(onNameChange(language, status, note), 250));
			}
						
		})();
	}


	// If we are on a batch translationPage
	// then init neccessary hooks and binds...
	if ($('.ProcessBabelTranslateContent').length) {
		(function () {
			var form, progressDiv, contentDiv, bodyDiv, infoDiv, onSelectChange, onAjaxResponse, onPageClick, changeOther;

			progressDiv = $('.ProcessBabelTranslateProgress');
			contentDiv = $('.ProcessBabelTranslateContent');
			form = $('#Inputfield_ProcessBabelTranslateHeader');
			bodyDiv = $('.ProcessBabelTranslateBody');
			infoDiv = $('.ProcessBabelTranslateInfo');

			onSelectChange = function (e) {
				var filter, from, to, page, limit;
				filter = form.find('[name="filter"]').val();
				from = form.find('[name="from"]').val();
				to = form.find('[name="to"]').val();
				limit = form.find('[name="limit"]').val();
				requestData(settings.ajaxUrl, {
					filter : filter,
					from : from,
					to : to,
					limit : limit,
					page : 1
				});
			};

			requestData = function (url, data) {
				contentDiv.animate({opacity : 0}, 200);
				progressDiv.fadeIn(200);
				$.get(url, data, function (res) {
					res = $.parseJSON(res);
					bodyDiv.empty().append(res.body);
					infoDiv.empty().append(res.info);
					contentDiv.animate({opacity : 1}, 200);
					progressDiv.fadeOut(200);
				});
			};

			onPageClick = function (e) {
				var target, href;
				e.preventDefault();
				target = $(e.target);
				href = target.attr('href');
				requestData(href);
			};

			changeOther = function (e) {
				var target, victum;
				target = $(e.target);
				victum = (target.is('#Inputfield_from')) ? $('#Inputfield_to') : $('#Inputfield_from');

				var targetVal = target.val();
				var victumVal = victum.val();
				if (targetVal != victumVal || targetVal == '') return;

				var options = victum.find('option');
				for (var i = 0; i < options.length; i++) {
					victumVal = $(options[i]).attr('value');
					if (targetVal != victumVal && victumVal != '') {
						victum.val(victumVal);
						break;
					}
				}
			}

			// bind handler on languge change
			form.on('change', '#Inputfield_from, #Inputfield_to', changeOther);

			// bind ajax request on form change
			form.on('change', 'select', onSelectChange);

			// bind ajax request on pagination click
			infoDiv.on('click', '.ProcessBabelPageLink', onPageClick);

			// Request initial state
			requestData(window.location.href);

		})();
	}
	
});