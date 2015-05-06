$(document).ready(function () {

//===============================================================================================================
// UNDERSCORE HELPER FUNCTIONS
//===============================================================================================================
  // Taken from underscore.js. See http://underscorejs.org/docs/underscore.html

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  var helperFunctions = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'];
  for (var i = 0; i < helperFunctions.length; i++) {
  	var name = helperFunctions[i];
    window['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    window.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  function bind(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (isObject(result)) return result;
      return self;
    };
    return bound;
  };

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

//===============================================================================================================
// END UNDERSCORE HELPER FUNCTIONS
//===============================================================================================================


	// Make neccessary module preparations
	var settings;
	settings = config.ProcessBabelTranslate;
	settings.ajaxUrl = config.urls.admin + 'page/babel-translate/';
	settings.ajaxNameExistsUrl = config.urls.admin + 'page/add/exists';
	settings.batchForm = !!$('[data-babel-batch-form="1"]').length;
	settings.translateForm = !!$('[data-babel-translate-form="1"]').length;

	// Listen to the change in babel_object_$language
	// inputfields and ask what to do via ajax from 
	// ProcessBabelTranslate
	if (settings.translateForm) {
		(function () {
			var language, babelObject, babelObjectSelect, babaelName, status, note;

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

			function onObjectChange (language) {
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

			function onNameChange (language, status, note) {
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

			function unlinkObject (target, language) {
				var $input, $listRoot;
				return function (ev) {
					$input = target.children('input#Inputfield_babel_object_' + language.name);
					$listRoot = target.children('.PageListRoot');

					$listRoot.find('*').off();
					$listRoot.remove();
					$input.val('');
					$input.ProcessPageList(config.ProcessBabelTranslate.translateSelectSettings);
				}
			}

			for (var i = 0; i < settings.languages.length; i++) {
				language = settings.languages[i];
				if (language.name === settings.currentLanguageName) continue;

				// listen to page change on babel_object
				babelObject = $('[name="babel_object_'+ language.name +'"]');
				babelObject.on('pageSelected', onObjectChange(language));

				// listen to name change and notify about the dupes
				babelName = $('[name="babel_name_'+ language.name +'"]');
				
				// add a status wrapper right beside the label
				status = $('<span></span>');
				$('[for="Inputfield_babel_name_'+ language.name +'"]').append(status);
				
				// add a dupe note
				note = $('<p class="notes">' + babelName.attr('data-note') + '</p>');
				note.insertAfter(babelName);
				note.hide(200)
				
				babelName.on('keyup', debounce(onNameChange(language, status, note), 250));

				// bind event on babelActionEdit
				$('#Inputfield_babel_'+ language.name +' .PageListActionsBabel').on('click', 'li.PageListActionEdit a', function (ev) {
					ev.preventDefault();
					parent.$('body').trigger('babel:action:edit', $(ev.target).attr('href'));
				});

				// bind event on babelActionView
				$('#Inputfield_babel_'+ language.name + ' .PageListActionsBabel').on('click', 'li.PageListActionView a', function (ev) {
					ev.preventDefault();
					parent.$('body').trigger('babel:action:view', $(ev.target).attr('href'));
				});

				// bind event on babelActionUnlink
				babelObjectSelect = $('#Inputfield_babel_'+ language.name + ' #wrap_Inputfield_babel_object_' + language.name + ' .InputfieldContent');
				$('#Inputfield_babel_'+ language.name + ' .PageListActionsBabel').on('click', 'li.PageListActionUnlink a', unlinkObject(babelObjectSelect, language));				
			}						
		})();
	}


	// If we are on a batch translationPage
	// then init neccessary hooks and binds...

	var BabelBatcher = {
		
		progressDiv : $('.ProcessBabelTranslateProgress'),

		contentDiv : $('.ProcessBabelTranslateContent'),

		filterForm : $('#Inputfield_ProcessBabelTranslateHeader'),

		bodyDiv : $('.ProcessBabelTranslateBody'),

		infoDiv : $('.ProcessBabelTranslateInfo'),

		onSelectChange : function (e) {
			var filter, to, page, limit;
			filter = this.filterForm.find('[name="filter"]').val();
			from = this.filterForm.find('[name="from"]').val();
			to = this.filterForm.find('[name="to"]').val();
			limit = this.filterForm.find('[name="limit"]').val();
			this.requestData(settings.ajaxUrl, {
				filter : filter,
				from : from,
				to : to,
				limit : limit,
				page : 1
			});
		},

		requestData : function (url, data) {
			this.contentDiv.animate({opacity : 0}, 200);
			this.progressDiv.fadeIn(200);

			function then (res) {
				res = $.parseJSON(res);
				this.bodyDiv.empty().append(res.body);
				this.infoDiv.empty().append(res.info);
				this.contentDiv.animate({opacity : 1}, 200);
				this.progressDiv.fadeOut(200);
			}

			$.get(url, data, bind(then, this));
		},

		onPageClick : function (e) {
			var target, href;
			e.preventDefault();
			target = $(e.target);
			href = target.attr('href');
			this.requestData(href);
		},

		changeOther : function (e) {
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
		},

		init : function () {
			// bind handler on languge change
			this.filterForm.on('change', '#Inputfield_from, #Inputfield_to', bind(this.changeOther, this));

			// bind ajax request on form change
			this.filterForm.on('change', 'select', bind(this.onSelectChange, this));

			// bind ajax request on pagination click
			this.infoDiv.on('click', '.ProcessBabelPageLink', bind(this.onPageClick, this));

			// Request initial state
			this.requestData(window.location.href);
		}

	};
	
	if (settings.batchForm) {			
		BabelBatcher.init();
	}

	// Make Babel `translate`	action button dynamic.
	// Meaning load the action as an iframe via magnific popup.
	// Makes page translating much faster			
	var $translateButton;
	$(document).on('click', '.PageListActionBabel', function (e) {
		var url;
		$translateButton = $(this);
		if (!$translateButton.is('a')) $translateButton = $translateButton.find('a');
		if (!!$translateButton.data('magnificPopup')) return;

		e.preventDefault();
		url = $translateButton.attr('href');	
		$translateButton.attr('href', url + '&modal=1');

		$translateButton.magnificPopup({
			type : 'iframe',
			callbacks : {
				close : function () {
					if (!settings.batchForm) return;
					BabelBatcher.onSelectChange();
				}
			}
		});

		$translateButton.trigger('click');
	});

	$(document.body).on('babel:action:edit babel:action:view', function (ev, url) {
		$.magnificPopup.instance.close();
		window.location.assign(url);
	});
	
});