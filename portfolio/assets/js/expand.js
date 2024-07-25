function toggleExpand(section) {
    selector = '#moreSection' + section
    console.log(selector)
    // Get all elements with the class 'toggle' inside the section
    var elements = document.querySelectorAll(selector);
    var button = document.getElementById('textButton' + section)

    // Iterate through each element and toggle its visibility
    elements.forEach(function (element) {
        // Check the current display style and toggle it
        if (element.style.display === 'none') {
            element.style.display = 'inline';
            button.innerHTML = 'Hide'

        } else {
            element.style.display = 'none';
            button.innerHTML = 'Expand'
        }
    });
}