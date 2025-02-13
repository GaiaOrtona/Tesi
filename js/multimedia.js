function getXMLFromHead() {
    const linkElement = document.querySelector('link[type="application/xml"]');
    if (!linkElement) {
        console.error('XML link non trovato nell\'head');
        return null;
    }
    return fetch(linkElement.href)
        .then(response => response.text())
        .then(xmlText => {
            const parser = new DOMParser();
            return parser.parseFromString(xmlText, 'application/xml');
        })
        .catch(error => {
            console.error('Errore nel caricamento del file XML:', error);
            return null;
        });
}

document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('[data-ref]').forEach(tag => {
        tag.addEventListener('click', async () => {
            const multimediaId = tag.getAttribute('data-multimedia');
            
            if (multimediaId) {
                showMultimedia({
                    type: multimediaId.endsWith('.manifest.json') ? 'iiif' : 
                           multimediaId.endsWith('.mp3') ? 'audio' : 'image',
                    src: `./materiali_multimediali/${multimediaId}`,
                    text: tag.textContent,
                });
            } else {
                showMultimedia({
                    type: 'map',
                    src: await getCoordinates(tag.getAttribute('data-ref')),
                    text: tag.textContent,
                });
            }
        });
    });
});

async function getCoordinates(aboutValue) {
    const xmlDoc = await getXMLFromHead();
    // Get all schema:Place elements
    const NS = {
        "bibo": "http://purl.org/ontology/bibo/",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "foaf": "http://xmlns.com/foaf/0.1/",
        "schema": "http://schema.org/",
    };
    const places = Array.from(xmlDoc.getElementsByTagNameNS(NS.schema, 'Place'));
    
    for (const place of places) {
        // Get the address element within this place
        const about =  place.getAttributeNS(NS.rdf, 'about');

        // Check if this is the place we're looking for
        if ( about === aboutValue) {
            // Get the geo element
            const geo = place.getElementsByTagNameNS(NS.schema, 'geo')[0];
            
            if (geo) {
                // Extract coordinates from the Point format
                // Format is "Point(longitude latitude)"
                const coordinates = geo.textContent
                    .replace('Point(', '')
                    .replace(')', '')
                    .split(' ')
                    .map(Number);
                
                return {
                    longitude: coordinates[0],
                    latitude: coordinates[1]
                };
            }
        }
    }

}


let miradorInstance = null;

function clearViewer() {
    const viewer = document.getElementById('media-viewer');
    
    if (miradorInstance) {
        // Get the state before destroying
        const state = miradorInstance.store.getState();
        
        // Clean up any existing windows
        Object.keys(state.windows).forEach(windowId => {
            miradorInstance.store.dispatch({
                type: 'REMOVE_WINDOW',
                windowId: windowId,
            });
        });
        
        // Clear the viewer's content
        viewer.innerHTML = '';
        
        // Reset the instance
        miradorInstance = null;
        
        // Create a new viewer div
        const newViewer = document.createElement('div');
        newViewer.id = 'media-viewer';
        viewer.parentNode.replaceChild(newViewer, viewer);
    } else {
        viewer.innerHTML = '';
    }
}


function showMultimedia(media) {
    clearViewer();
    document.getElementById('MultimediaModal').style.display = 'block';
    const viewer = document.getElementById('media-viewer');
    const titleHtml = `<h4 style="margin: 0 0 15px 0; text-align: center;">${media.text}</h4>`;
    const sourceHtml = `<p class="copyright" style="margin: 15px 0 0 0; text-align: center;">Source: ${media.src}</p>`;
    
    if (media.type === 'iiif') {
        viewer.innerHTML = '<div class="loading">Loading...</div>';

        // Small delay to ensure DOM is ready
        setTimeout(() => {
            miradorInstance = Mirador.viewer({
                id: 'media-viewer',
                windows: [{
                    manifestId: media.src,
                    loadedManifest: media.src, // Explicitly set loaded manifest
                }],
                window: {
                    allowClose: false,
                    allowMaximize: false,
                    defaultView: 'single',  // Ensure consistent view mode
                },
                workspace: {
                    type: 'single',
                    allowNewWindows: false
                },
                workspaceControlPanel: {
                    enabled: false,
                },
            });
        }, 100);
    } else if (media.type === 'image') {
        viewer.innerHTML = `
            ${titleHtml}
            <img src="${media.src}">
        `;
    } else if (media.type === 'audio') {
        viewer.innerHTML = `
            ${titleHtml}
            <audio controls src="${media.src}"></audio>
        `;
    } else if (media.type === 'map') {
        viewer.innerHTML = `
            ${titleHtml}
            <div id="map" style="height: 100%;"></div>
        `;       
        // Initialize the map
        const map = L.map('map').setView([media.src.latitude, media.src.longitude], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Add a marker at the specified coordinates
        L.marker([media.src.latitude, media.src.longitude])
            .addTo(map)
            .openPopup();
    }
}


function closeMultimediaModal() {
    document.getElementById('MultimediaModal').style.display = 'none';
    clearViewer();
}

window.onclick = function(event) {
    if (event.target == document.getElementById('MultimediaModal')) {
        closeMultimediaModal();
    }
}