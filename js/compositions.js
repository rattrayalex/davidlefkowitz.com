var $container = $('#compositions-container');

$container.isotope({
  itemSelector: '.composition-item',
  layoutMode: 'vertical',
  getSortData: {
    'date': '[data-date]'
  }
});

$(".checkbox").click(function(e){
  e.stopPropagation();
  var input = $(this).find('input');
  console.log('clicked ', input)
  if ( input.val() === 'on' ) {
    input.val("off");
  } else {
    input.val('on');
  }
  $container.isotope({ filter: filterCard });
});

function filterCard() {
  var instruments = $(this).data('instrumentation').split(/\s+/ig);
  for (var i = 0; i < instruments.length; i++) {
    var instrument = instruments[i];
    if (instrument && $('#' + instrument).val() === 'on') {
      return true
    }
  }
}
// // filter items on button click
// $('#compositions-filters').on( 'click', 'input', function() {

// });