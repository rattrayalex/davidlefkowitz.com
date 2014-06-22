var $container = $('#compositions-container');

var instrumentShown = function instrumentShown($elem) {
  var instruments = $elem.data('instrumentation').split(/\s+/ig);
  for (var i = 0; i < instruments.length; i++) {
    var instrument = instruments[i];
    if (instrument && $('#' + instrument).val() === 'on') {
      return true
    }
  }
  return false;
}

var genreShown = function instrumentShown($elem) {
  var genres = $elem.data('genres').split(/\s+/ig);
  for (var i = 0; i < genres.length; i++) {
    var genre = genres[i];
    if (genre && $('#' + genre).val() === 'on') {
      return true
    }
  }
  return false;
}

var filterCard = function filterCard() {
  var $elem = $(this);
  var instrument_shown = instrumentShown($elem);
  var genre_shown = genreShown($elem);

  if ( instrument_shown && genre_shown ) {
    console.log('i, g: ', instrument_shown, genre_shown);
    return true;
  }
  return false;
}

$container.isotope({
  itemSelector: '.composition-item',
  layoutMode: 'vertical',
  filter: filterCard,
  hiddenStyle: {
    opacity: 0
  },
  getSortData: {
    'date': '[data-date]'
  }
});

var toggleInput = function toggleInput ($input) {
  // console.log('in toggleInput with ', $input.val())
  if ( $input.val() === 'on' ) {
    $input.val("off");
  } else {
    $input.val('on');
  }
  return $input;
}


var filterAll = function filterAll() {
  $container.isotope({ filter: filterCard });
}

var requestFilterAll = function requestFilterAll() {
  if (requestAnimationFrame) {
    requestAnimationFrame(filterAll);
  } else {
    filterAll();
  }
}

$(".filter-checkbox > label > input").click(function(e) {
  e.stopPropagation();
  var input = $(this);
  console.log('clicked ', input)
  toggleInput(input);
  requestFilterAll();
});

$('.parent-checkbox > label > input').click(function(e) {
  var $parent_checkbox = $(this).parent('label').parent('.parent-checkbox');

  // toggle/get val of the top-level checkbox
  var $parent_input = $(this);
  $parent_input = toggleInput($parent_input);
  var parent_val = $parent_input.val();

  // loop through all checkboxes, clicking them if they're wrong.
  var $checkboxes = $parent_checkbox.find('.filter-checkbox');
  $checkboxes.each(function(i, elem) {
    $input = $(elem).find('input');
    if ( $input.val() != parent_val ) {
      $input.click();
    }
  });
  requestFilterAll();
});
