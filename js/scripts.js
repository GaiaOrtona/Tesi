/*!
* Start Bootstrap - Clean Blog v6.0.9 (https://startbootstrap.com/theme/clean-blog)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-clean-blog/blob/master/LICENSE)
*/
window.addEventListener('DOMContentLoaded', () => {
    let scrollPos = 0;
    const mainNav = document.getElementById('mainNav');
    const headerHeight = mainNav.clientHeight;
    window.addEventListener('scroll', function() {
        const currentTop = document.body.getBoundingClientRect().top * -1;
        if ( currentTop < scrollPos) {
            // Scrolling Up
            if (currentTop > 0 && mainNav.classList.contains('is-fixed')) {
                mainNav.classList.add('is-visible');
            } else {
                mainNav.classList.remove('is-visible', 'is-fixed');
            }
        } else {
            // Scrolling Down
            mainNav.classList.remove(['is-visible']);
            if (currentTop > headerHeight && !mainNav.classList.contains('is-fixed')) {
                mainNav.classList.add('is-fixed');
            }
        }
        scrollPos = currentTop;
    });
})



function initializeSidebar() {
    const sidebar = document.getElementById('entity-sidebar');
    const entities = {
        images: [],
        audios: [],
        places: [],
        manifests: []
    };

    // Helper function to check if text already exists in a category
    function isTextInCategory(category, text) {
        return entities[category].some(item => item.text === text);
    }

    document.querySelectorAll('span[data-ref]').forEach(span => {
        const text = span.textContent;
        
        if (!span.getAttribute('data-multimedia')) {
            if (!isTextInCategory('places', text)) {
                entities.places.push({
                    text: text,
                    element: span
                });
            }
        } else {
            const multimedia = span.getAttribute('data-multimedia');
            if (multimedia.match(/\.(jpg|jpeg|png|gif)$/i)) {
                if (!isTextInCategory('images', text)) {
                    entities.images.push({
                        text: text,
                        element: span
                    });
                }
            } else if (multimedia.match(/\.(mp3|wav|ogg)$/i)) {
                if (!isTextInCategory('audios', text)) {
                    entities.audios.push({
                        text: text,
                        element: span
                    });
                }
            } else if (multimedia.match(/manifest.json$/i)) {
                if (!isTextInCategory('manifests', text)) {
                    entities.manifests.push({
                        text: text,
                        element: span
                    });
                }
            }
        }
    });

    // Create sections for each media type
    const sections = [
        { title: 'Images', items: entities.images },
        { title: 'Audios', items: entities.audios },
        { title: 'Places', items: entities.places },
        { title: 'Manifests', items: entities.manifests },
    ];


    sections.forEach(section => {
        if (section.items.length > 0) {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'entity-section';
            
            const title = document.createElement('h4');
            title.textContent = section.title;
            sectionDiv.appendChild(title);

            section.items.forEach(item => {
                const link = document.createElement('a');
                link.className = 'entity-link';
                link.textContent = item.text;
                
                link.onclick = () => {
                    // Remove any existing highlights
                    document.querySelectorAll('.highlight').forEach(el => {
                        el.classList.remove('highlight');
                    });

                    // Add highlight to the target element
                    item.element.classList.add('highlight');
                    
                    // Scroll the element into view
                    item.element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                };

                sectionDiv.appendChild(link);
            });

            sidebar.appendChild(sectionDiv);
        }
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeSidebar);
