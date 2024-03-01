document.addEventListener('DOMContentLoaded', function() {
    // Selecting the drawer checkbox
    const drawerCheckbox = document.getElementById('my-drawer');
    const galleryContent = document.querySelector('.svg-gallery');
    // Adding event listeners to each button
    document.getElementById('sortRarityAsc').addEventListener('click', () => updateSortAndStyle('sortRarityAsc', 'Rarity Rank', 'asc'));
    document.getElementById('sortRarityDesc').addEventListener('click', () => updateSortAndStyle('sortRarityDesc', 'Rarity Rank', 'desc'));
    document.getElementById('sortInscriptionAsc').addEventListener('click', () => updateSortAndStyle('sortInscriptionAsc', 'Inscription ID', 'asc'));
    document.getElementById('sortInscriptionDesc').addEventListener('click', () => updateSortAndStyle('sortInscriptionDesc', 'Inscription ID', 'desc'));
    document.getElementById('sortTokenAsc').addEventListener('click', () => updateSortAndStyle('sortTokenAsc', 'tokenId', 'asc'));
    document.getElementById('sortTokenDesc').addEventListener('click', () => updateSortAndStyle('sortTokenDesc', 'tokenId', 'desc'));
    const drawerSide = document.querySelector('.drawer-side');

    // Add a click event listener to the clear button
    document.getElementById('clearFilter').addEventListener('click', function() {
        // Get all input elements you want to clear, adjust the selector as needed
        var inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="checkbox"], input[type="radio"]');

        // Loop through all input elements and clear their values
        inputs.forEach(function(input) {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false; // Uncheck checkboxes and radio buttons
            } else {
                input.value = ''; // Clear text and number inputs
            }
        });

        // If you have select elements (drop-downs) to clear, add this:
        var selects = document.querySelectorAll('select');
        selects.forEach(function(select) {
            select.selectedIndex = 0; // Reset drop-downs to their first option
        });

        // After clearing the filters, update the gallery and filter count
        displaySVGs(filteredMetadata); // Reset the gallery display with the full metadata list
        document.getElementById('filteredTotal').textContent = filteredMetadata.length; // Update the total number of displayed items
        document.getElementById('filterCount').textContent = '0'; // Reset the filter count display

        document.querySelector('.flex.flex-nowrap.overflow-x-auto.pt-2.pb-3').textContent = 'No Traits Selected';
        galleryContent.removeEventListener('click', closeDrawer);
        galleryContent.style.opacity = '1'; // Reset opacity for larger screens
        updateDrawerForWindowSize();
    });
            
    const gallery = document.querySelector('.svg-gallery');

    // Intersection Observer for lazy loading images
    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.onload = () => img.removeAttribute('data-src'); // Clean up after loading
                }
                imgObserver.unobserve(img); // Stop observing the image after it has been loaded
            }
        });
    }, { rootMargin: '200px 0px' }); // Adjust rootMargin to control when images start loading

    // Global variables for batch loading
    let currentBatch = 0;
    const batchSize = 50; // Adjust based on performance and user experience

    function loadNextBatch() {
        for (let i = 1; i <= batchSize; i++) {
            const index = currentBatch * batchSize + i;
            if (index > 1000) break; // Stop if we've reached 1000 images

            const img = document.createElement('img');
            img.setAttribute('data-src', `../images/bitring/pngsmall/${index}.png`);
            img.alt = `Loading BITRING #${index}`; // Descriptive alt tag for accessibility
            img.classList.add('svg-image'); // Ensure this class exists and has relevant styles
            gallery.appendChild(img);
            imgObserver.observe(img); // Begin observing the new image for lazy loading
        }
        currentBatch++; // Increment the batch number for the next load
    }


    // Event listener for the form submission
    document.getElementById('tokenIdForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting traditionally
        const tokenIdInput = document.getElementById('tokenIdInput').value;
        if (tokenIdInput.trim() === '') { // Check if input is empty or contains only whitespaces
            displaySVGs(filteredMetadata); // Display all items if input is empty
        } else {
            const tokenId = parseInt(tokenIdInput, 10); // Convert input to an integer
            if (!isNaN(tokenId)) { // Check if conversion was successful (input was a number)
                displayItemByTokenId(tokenId); // Display item by tokenId
            } else {
                // Optionally handle the case where input is not a valid number
                displaySVGs(filteredMetadata); // Or clear the gallery/display a message
            }
        }v
    });

// Function to toggle the drawer
function closeDrawer() {

    document.querySelector('.drawer-side').style.display = 'none';
    galleryContent.style.opacity = '1';
    drawerCheckbox.checked ='false'
    galleryContent.removeEventListener('click', closeDrawer);
}

// Function to toggle the drawer
function toggleDrawer() {
    console.log('toggle');

    if (drawerCheckbox.checked) {
        document.querySelector('.drawer-side').style.display = 'block';
        galleryContent.style.opacity = '25%';
        galleryContent.addEventListener('click', closeDrawer);

    } else {
        document.querySelector('.drawer-side').style.display = 'none';
        galleryContent.style.opacity = '1';
    }
    // It might be useful to log the state of 'checked' for debugging
}

// Function to update drawer visibility based on window width
function updateDrawerForWindowSize() {
    const windowWidth = window.innerWidth;

    if (windowWidth >= 1024) {
        drawerSide.style.display = 'block'; // Ensure drawer is visible
        galleryContent.style.opacity = '1'; // Reset opacity for larger screens
    } else {
        // When the window is narrower than 1024px, hide the drawer
        drawerSide.style.display = 'none'; // Ensure drawer is hidden
        galleryContent.style.opacity = '1'; // Ensure full opacity for gallery content
        drawerCheckbox.checked = false; // Uncheck the drawer toggle to reset its state
        galleryContent.removeEventListener('click', closeDrawer);
    }
}

// Attach event listener for window resize
window.addEventListener('resize', updateDrawerForWindowSize);

// Call the function initially in case the page is loaded in a non-default state
updateDrawerForWindowSize();

// Attach event listener for window resize
window.addEventListener('resize', updateDrawerForWindowSize);


// Attaching the toggleDrawer function to the click event of the drawerCheckbox
drawerCheckbox.addEventListener('click', toggleDrawer);

});

let filteredMetadata = []; // This stores metadata after filtering

async function loadMetadata() {
    let response = await fetch('../images/bitring/metadata/master/master.json'); 
    let metadataArray = await response.json();
    filteredMetadata = metadataArray; // Assign metadata to filteredMetadata

    const traits = aggregateTraits(metadataArray); // Aggregate traits from metadata
    populateTraits(traits); // Populate HTML with aggregated traits
    displaySVGs(filteredMetadata);
}

// Function to display SVG images
function displaySVGs(metadataArray) {
    let galleryContainer = document.querySelector('.svg-gallery');
    galleryContainer.innerHTML = ''; // Clear existing content

    metadataArray.forEach(metadata => {
        // Create the container div for each image
        const imageContainer = document.createElement('div');
        imageContainer.className = 'svg-image-container';

        // Create the img element
        const imgElement = document.createElement('img');
        imgElement.src = `../images/bitring/pngsmall/${metadata.tokenId}.png`;
        imgElement.alt = `${metadata.name}`; // Descriptive alt tag for accessibility
        imgElement.className = 'svg-image'; // Apply styling

        // Append the img to the container
        imageContainer.appendChild(imgElement);

        // Append the container to the gallery
        galleryContainer.appendChild(imageContainer);

        attachEventListenersToGalleryImages(); // Attach click event listeners to images

    });
}

// Function to attach click event listeners to gallery images
function attachEventListenersToGalleryImages() {
    document.querySelectorAll('.svg-gallery .svg-image').forEach(img => {
        img.addEventListener('click', function() {
            // Extract token ID from the image's alt attribute
            const tokenId = parseInt(this.alt.split('#')[1]);

            // Use the token ID to find the relevant metadata
            const metadata = filteredMetadata.find(item => item.tokenId === tokenId);
            if (metadata) {
                updatePopupWithMetadata(metadata); // Update and display the popup with the relevant metadata
            }
        });
    });
}

function filterMetadata() {
    // Retrieve all checked traits from the checkboxes
    const traits = document.querySelectorAll('.nm-checkbox-tree input[type="checkbox"]:checked');

    let newFilteredMetadata;
    // Check if no traits are selected, if so, display all metadata
    if (traits.length === 0) {
        newFilteredMetadata = [...filteredMetadata]; // Clone the original array
        document.querySelector('.flex.flex-nowrap.overflow-x-auto.pt-2.pb-3').textContent = 'No Traits Selected'; // Reset the traits display
    } else {
        // Filter the metadata based on selected traits
        newFilteredMetadata = filteredMetadata.filter(metadata => {
            return Array.from(traits).some(trait => {
                const [traitType, traitValue] = trait.name.split(':');
                return metadata.attributes.some(attr => attr.trait_type === traitType && attr.value === traitValue);
            });
        });

        // Update the traits display
        const selectedTraitsText = Array.from(traits).map(trait => trait.name.split(':')[1]).join(', '); // Concatenate the trait values
        document.querySelector('.flex.flex-nowrap.overflow-x-auto.pt-2.pb-3').textContent = selectedTraitsText; // Update the display with selected traits
    }

    // Display SVGs based on the newly filtered metadata
    displaySVGs(newFilteredMetadata);

    // Update the filtered items count
    document.getElementById('filteredTotal').textContent = newFilteredMetadata.length;
    document.getElementById('filterCount').textContent = traits.length;
}



// Function to sort metadata based on criteria and order
function sortMetadata(criteria, order) {
    filteredMetadata.sort((a, b) => {
        let aValue, bValue;

        // Special handling for sorting by tokenId
        if (criteria === 'tokenId') {
            aValue = a.tokenId;
            bValue = b.tokenId;
        } else {
            // Find the attribute values for the specified criteria from each item
            aValue = a.attributes.find(attr => attr.trait_type === criteria)?.value || '0';
            bValue = b.attributes.find(attr => attr.trait_type === criteria)?.value || '0';
        }

        // Convert values to numbers if they represent numeric values
        aValue = parseInt(aValue, 10);
        bValue = parseInt(bValue, 10);

        // Sort based on order
        return (order === 'asc' ? aValue - bValue : bValue - aValue);
    });

    displaySVGs(filteredMetadata); // Refresh your gallery display function
}


let currentSort = { id: null, criteria: null, order: null };


// Function to update button colors and sort
function updateSortAndStyle(selectedButtonId, criteria, order) {

    console.log(selectedButtonId, criteria, order);
    console.log(filteredMetadata[1]);
    // Check if the currently selected sort is the same as the previous one
    if (currentSort.id === selectedButtonId && currentSort.order === order) {
        // If the same sort button is clicked, remove sorting
        document.querySelectorAll('.btn-ghost').forEach(btn => {
            btn.classList.remove('sorting');
            let childSpan = btn.querySelector('span');
            if (childSpan) {
                childSpan.classList.remove('sorting');
            }
        });
        // Reset the gallery to its original unsorted state
        displaySVGs(filteredMetadata);
        // Clear the current sort state
        currentSort = { id: null, criteria: null, order: null };
    } else {
        // Apply new sorting
        document.querySelectorAll('.btn-ghost').forEach(btn => {
            btn.classList.remove('sorting');
            let childSpan = btn.querySelector('span');
            if (childSpan) {
                childSpan.classList.remove('sorting');
            }
        });

        const selectedButton = document.querySelector("#" + selectedButtonId);
        if (selectedButton) {
            selectedButton.classList.add('sorting');
            let childSpan = selectedButton.querySelector('span');
            if (childSpan) {
                childSpan.classList.add('sorting');
            }
        }

        // Sort the metadata based on the new criteria and order
        sortMetadata(criteria, order);
        // Update the current sort state
        currentSort = { id: selectedButtonId, criteria: criteria, order: order };
    }
}


document.addEventListener('DOMContentLoaded', function() {
    loadMetadata();
    // Option to load more on scroll or via a button, e.g.:
    window.onscroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            loadNextBatch();
        }
    };

    const zoomLevels = ['large', 'medium', 'small', 'extra-small']; // Define zoom levels
    let currentZoomIndex = 2; // Start with the first level ('large')

    function setZoomLevel(zoomLevel) {
        const gallery = document.querySelector('.svg-gallery');
        // Remove all previous zoom classes
        gallery.classList.remove(...zoomLevels.map(level => `zoom-${level}`)); // Remove all zoom classes based on zoomLevels
        // Add the new zoom class
        gallery.classList.add(`zoom-${zoomLevel}`);
    }

    setZoomLevel('small');

    // Event listeners for zoom buttons
    document.getElementById('zoomIn').addEventListener('click', () => {
        // Increase zoom level but stop at the largest view
        currentZoomIndex = Math.min(currentZoomIndex + 1, zoomLevels.length - 1); // Prevent going beyond the largest zoom
        setZoomLevel(zoomLevels[currentZoomIndex]);
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        // Decrease zoom level but stop at the smallest view
        currentZoomIndex = Math.max(currentZoomIndex - 1, 0); // Prevent going below the smallest zoom
        setZoomLevel(zoomLevels[currentZoomIndex]);
    });

});

function aggregateTraits(metadataArray) {
    const traits = {}; // Object to store trait types and their values

    metadataArray.forEach(item => {
        item.attributes.forEach(attr => {
            if (!traits[attr.trait_type]) {
                traits[attr.trait_type] = {}; // Initialize sub-object for trait values if it doesn't exist
            }
            if (!traits[attr.trait_type][attr.value]) {
                traits[attr.trait_type][attr.value] = 1; // Initialize counter for the value
            } else {
                traits[attr.trait_type][attr.value] += 1; // Increment counter for the value
            }
        });
    });

    return traits;
}

function populateTraits(traits) {
    const nmTree = document.querySelector('.nm-tree'); // Get the container for the traits
    nmTree.innerHTML = ''; // Clear existing content

    Object.entries(traits).forEach(([trait, values]) => {
        // Create the list item for each trait type
        const traitElement = document.createElement('li');
        traitElement.innerHTML = `
            <div>
                <div class="collapse rounded-none">
                    <input type="checkbox" class="min-h-0"> <!-- This might be adjusted if needed -->
                    <div class="collapse-title p-0 min-h-0">
                        <span class="whitespace-nowrap mr-2">${trait} (${Object.keys(values).length}) </span>
                    </div>
                    <div class="collapse-content nm-checkbox-tree p-0">
                        <ul>
                            ${Object.entries(values).map(([value, count]) => `
                                <li>
                                    <input id="button-${trait.replace(/\s+/g, '')}:${value.replace(/\s+/g, '')}" type="checkbox" class="min-h-0" name="${trait}:${value}"/>
                                    <label for="button-${trait.replace(/\s+/g, '')}:${value.replace(/\s+/g, '')}" class="flex cursor-pointer">
                                        <div class="flex-grow flex justify-between">
                                            <span>${value}</span>
                                            <span>${count}</span>
                                        </div>
                                    </label>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        nmTree.appendChild(traitElement);
        // After traits are populated, attach event listeners to all checkboxes
        const checkboxes = document.querySelectorAll('.nm-checkbox-tree input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterMetadata); // Call filterMetadata whenever a checkbox changes
        });
    });
}


// Function to display a specific item by tokenId
function displayItemByTokenId(tokenId) {
    const item = filteredMetadata.find(metadata => metadata.tokenId === tokenId);
    let galleryContainer = document.querySelector('.svg-gallery');
    galleryContainer.innerHTML = ''; // Clear existing content

    if (item) {
        const imgElement = document.createElement('img');
        imgElement.src = `../images/bitring/pngsmall/${item.tokenId}.png`;
        imgElement.alt = `${item.name}`; // Descriptive alt tag for accessibility
        galleryContainer.appendChild(imgElement);
    } else {
        // Optional: Display some message if item with tokenId is not found
        galleryContainer.innerHTML = '<p>Item not found.</p>';
    }
}


function displayPopup(metadata) {
    // Create the popup container
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup-container');

    // Create the content container inside the popup
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('content-container');

    // Add the image
    const imgElement = document.createElement('img');
    imgElement.src = metadata.image;
    imgElement.alt = metadata.name;
    contentContainer.appendChild(imgElement);

    // Add metadata name
    const nameElement = document.createElement('div');
    nameElement.classList.add('metadata-name');
    nameElement.textContent = `Name: ${metadata.name}`;
    contentContainer.appendChild(nameElement);

    // Add metadata description
    const descriptionElement = document.createElement('div');
    descriptionElement.classList.add('metadata-description');
    descriptionElement.textContent = `Description: ${metadata.description}`;
    contentContainer.appendChild(descriptionElement);

    // Add metadata attributes
    metadata.attributes.forEach(attr => {
        const attrElement = document.createElement('div');
        attrElement.classList.add('attribute');
        attrElement.textContent = `${attr.trait_type}: ${attr.value}`;
        contentContainer.appendChild(attrElement);
    });

    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
    closeButton.onclick = () => {
        popupContainer.remove(); // Remove the popup from the DOM
    };

    // Append the close button and content container to the popup
    popupContainer.appendChild(closeButton);
    popupContainer.appendChild(contentContainer);

    // Append the popup to the body (or another suitable container)
    document.body.appendChild(popupContainer);
}


// Function to attach a single click event listener to the gallery container
function attachEventListenersToGalleryImages() {
    // Attach only one event listener to the parent container of the images
    document.querySelector('.svg-gallery').addEventListener('click', function(event) {
        // Check if the clicked element is an image
        if (event.target.classList.contains('svg-image')) {
            // Extract token ID from the image's alt attribute
            const tokenId = parseInt(event.target.alt.split('#')[1]);

            // Use the token ID to find the relevant metadata
            const metadata = filteredMetadata.find(item => item.tokenId === tokenId);
            if (metadata) {
                updatePopupWithMetadata(metadata); // Update and display the popup with the relevant metadata
                document.querySelector('div.fixed.inset-0.z-50.flex.justify-center.items-center').style.display = "flex";
            }
        }
    });
}


// Update and display the popup with metadata
function updatePopupWithMetadata(metadata) {
    // Find the 'Inscription ID' and 'Rarity Rank' from the attributes array
    const inscriptionId = metadata.attributes.find(attr => attr.trait_type === 'Inscription ID')?.value;
    const rarityRank = metadata.attributes.find(attr => attr.trait_type === 'Rarity Rank')?.value;
    
    // Construct the HTML for the attributes list
    const attributesHtml = metadata.attributes.map(attr => `<li><span>${attr.trait_type} ► ${attr.value}</span></li>`).join('');

    // Update the popup content based on the metadata
    const popup = document.querySelector('.nm-panel.nm-box-shadow');
    popup.querySelector('.nm-canvas').style.backgroundImage = `url('images/bitring/artwork/${metadata.tokenId}.svg')`;
    popup.querySelector('.mb-4').innerHTML = `BITRING #${metadata.tokenId}`;
    popup.querySelector('h3 + ul').innerHTML = attributesHtml;
    popup.querySelector('.text-xl div:last-child').innerHTML = `Inscription ID - ${inscriptionId} bytes <br>Rarity Rank - ${rarityRank} / 1000 <br>`;
    
    document.querySelector("body > div > div > div.drawer.lg\\:drawer-open.drawer-mobile.h-\\[calc\\(100\\%-theme\\(spacing\\.8\\)-var\\(--panel-gutter\\)\\)\\].lg\\:h-full > div.nm-panel.drawer-content.lg\\:\\!z-index-unset > div.relative.h-\\[calc\\(100\\%-theme\\(spacing\\.8\\)\\)\\].overflow-hidden.pr-1 > div.fixed.inset-0.z-50.flex.justify-center.items-center > div > div.nm-border.p-2.overflow-auto.max-h-max > div.grow.flex.justify-between.leading-3 > a").href = metadata.InscriptionURL;


    // Show the popup
    popup.style.display = 'flex'; // Adjust this according to your popup's display style

    // If there's a close (ESC) button in your popup, attach the event to close the popup
    popup.querySelector('.link.link-hover.uppercase').addEventListener('click', function() {
        popup.style.display = 'none!important'; // Hide the popup
    });
    // Attach this function to your close button if needed
    document.getElementById('esc').addEventListener('click', closePopup);
}

// Optionally, if you have a global close button outside of update function scope
function closePopup() {
    document.querySelector('.nm-panel.nm-box-shadow').style.display = 'none';
    document.querySelector('div.fixed.inset-0.z-50.flex.justify-center.items-center').style.display = "none"
    attachEventListenersToGalleryImages();
}