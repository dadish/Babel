$(document).ready(function () {
	
	var cat, url;
	
	$(document).on('click', '.PageListActionBabel a', function (e) {

		cat = $(this);
		if (!!cat.data('magnificPopup')) return;

		e.preventDefault();
		url = cat.attr('href');	
		cat.attr('href', url + '&modal=1');

		cat.magnificPopup({
			type : 'iframe'
		});

		cat.trigger('click');
	});

});