$('#compositions-container').isotope({
  itemSelector: 'composition-item',
  layoutMode: 'vertical',
  getSortData: {
    'date': '[data-date]'
  }
})
