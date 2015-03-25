$(document).ready(function () {
	
	// Make Babel `translate`	action button dynamic.
	// Meaning load the action as an iframe via magnific popup.
	// Makes page translating much faster
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
	
});