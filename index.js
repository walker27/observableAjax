let ins = new ObservableAjax(function (params, successCb, errorCb) {
	$.ajax({
		type: 'GET',
		url: 'https://hacker-news.firebaseio.com/v0/item/8863.json',
		data: {
			print: 'pretty'
		},
		success: successCb,
		error: errorCb
	})
});

ins
	.subscribe('this', function (data) {
		console.log('triggered');
		console.log(data);
	})
	.update();