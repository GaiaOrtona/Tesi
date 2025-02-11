// Funzione per ottenere l'XML dall'head
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

// Funzione per trovare un'entità tramite rdf:about
function findEntityByAbout(xmlDoc, aboutValue) {
    const NAMESPACES = {
        "bibo": "http://purl.org/ontology/bibo/",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "foaf": "http://xmlns.com/foaf/0.1/",
        "owl": "http://www.w3.org/2002/07/owl#"
    }
    console.log('Searching for rdf:about:', aboutValue);
    const entities = Array.from([...xmlDoc.getElementsByTagNameNS(NAMESPACES.rdf, 'RDF')][0].children);

    for (const entity of entities) {
        const about = entity.getAttributeNS(NAMESPACES.rdf, "about");
        
        if (about === aboutValue) {
            console.log('Found entity with rdf:about:', about);
            let metadata = {};
            const children = Array.from(entity.children);
            
            children.forEach((child) => {
                const tagName = child.tagName.replace(/^.*:/, ''); // Remove namespace prefix
                
                if (tagName === 'sameAs') {
                    const value = child.getAttributeNS(NAMESPACES.rdf, 'resource');
                    if (metadata[tagName]) {
                        if (!Array.isArray(metadata[tagName])) {
                            metadata[tagName] = [metadata[tagName]];
                        }
                        metadata[tagName].push(value);
                    } else {
                        metadata[tagName] = value;
                    }
                } else {
                    const value = child.textContent.trim();
                    if (metadata[tagName]) {
                        if (!Array.isArray(metadata[tagName])) {
                            metadata[tagName] = [metadata[tagName]];
                        }
                        metadata[tagName].push(value);
                    } else {
                        metadata[tagName] = value;
                    }
                }
            });
            
            return metadata;
        }
    }
    return null;
}

// Funzione per estrarre i metadati
function extractMetadata(entity) {
    if (!entity) return null;

    const metadata = {};
    entity.childNodes.forEach(child => {
        if (child.nodeType === 1) { // Elemento XML
            metadata[child.tagName] = child.textContent;
        }
    });
    return metadata;
}

function formatMetadata(metadata) {
   if (!metadata) return '';
   
   let html = `<h3>Metadata</h3>`;
   for (const [key, value] of Object.entries(metadata)) {
       const formattedValue = Array.isArray(value) ? value.join(', ') : value;
       html += `<p><strong>${key}:</strong> ${formattedValue}</p>`;
   }
   return html;
}

// Funzione per aggiungere le icone ai riferimenti
function addMetadataIcons() {
    const refs = document.querySelectorAll('[data-ref]');
    refs.forEach(ref => {
        if (!ref.nextElementSibling?.classList.contains('metadata-icon')) {
            const icon = document.createElement('i');
            icon.className = 'metadata-icon';
            icon.textContent = 'M';
            icon.setAttribute('aria-label', 'Visualizza metadati');
            icon.setAttribute('role', 'button');
            ref.parentNode.insertBefore(icon, ref.nextSibling);
        }
    });
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', async () => {
    const xmlDoc = await getXMLFromHead();
    if (!xmlDoc) return;

    addMetadataIcons();

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('metadata-icon')) {
            const refElement = e.target.previousElementSibling;
            if (!refElement || !refElement.hasAttribute('data-ref')) return;

            const entityRef = refElement.getAttribute('data-ref');
            const metadata = findEntityByAbout(xmlDoc, entityRef);
            //const metadata = extractMetadata(entity);

            if (metadata) {
                const existingPopup = document.querySelector('.metadata-popup');
                if (existingPopup) existingPopup.remove();

                const popup = document.createElement('div');
                popup.className = 'metadata-popup';
                popup.innerHTML = formatMetadata(metadata);
                document.body.appendChild(popup);

                const rect = e.target.getBoundingClientRect();
                popup.style.left = `${window.scrollX + rect.right + 10}px`;
                popup.style.top = `${window.scrollY + rect.top}px`;
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.classList.contains('metadata-icon') && !e.target.closest('.metadata-popup')) {
            const popup = document.querySelector('.metadata-popup');
            if (popup) popup.remove();
        }
    });
});
