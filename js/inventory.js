document.addEventListener('DOMContentLoaded', () => {
    const query = "SELECT itemID, itemName, itemDescription, itemImgThumbnail FROM tools";
    const params = new URLSearchParams();
    params.append('hostname', 'localhost');
    params.append('username', 'jdonnelly73');
    params.append('password', 'CHZHy02qM20fcLVt');
    params.append('database', 'CSC1034_CW_39');
    params.append('query', query);

    fetch('includes/db_connect.php', {
        method: 'POST',
        body: params
    })
    .then(response => response.json())
    .then(result => {
        const container = document.getElementById('inventory');
        if (!container) return;

        container.innerHTML = "";

        if (result.error) {
            container.textContent = "Error: " + result.error;
        }
        else if (!result.data || result.data.length === 0) {
            container.textContent = "No tools found in the inventory.";
        } else {
            result.data.forEach(tool => {
                const toolDiv = document.createElement('div');
                toolDiv.classList.add('inventory-item-container');

                const img = document.createElement('img');
                img.src = tool.itemImgThumbnail;
                img.alt = tool.itemName;
                img.title = tool.itemName;

                // Create the details div
                const detailsDiv = document.createElement('div');
                detailsDiv.classList.add('inventory-item-details');

                const nameElement = document.createElement('strong');
                nameElement.textContent = tool.itemName;

                const descriptionElement = document.createElement('p');
                descriptionElement.classList.add('inventory-description');
                descriptionElement.textContent = tool.itemDescription || 'No description available';

                detailsDiv.appendChild(nameElement);
                detailsDiv.appendChild(descriptionElement);

                toolDiv.appendChild(img);
                toolDiv.appendChild(detailsDiv);
                container.appendChild(toolDiv);

                // Handle click to expand/collapse
                toolDiv.addEventListener('click', () => {
                    document.querySelectorAll('.inventory-item-container').forEach(item => {
                        if (item !== toolDiv) {
                            item.classList.remove('expanded');
                            const desc = item.querySelector('.inventory-description');
                            if (desc) {
                                desc.classList.remove('show');
                                desc.classList.remove('marquee');
                            }
                        }
                    });

                    // Toggle this tool's expanded state
                    toolDiv.classList.toggle('expanded');

                    if (!toolDiv.classList.contains('expanded')) {
                        descriptionElement.classList.remove('show');
                        descriptionElement.classList.remove('marquee');
                    } else {
                        setTimeout(() => {
                            if (toolDiv.classList.contains('expanded')) {
                                descriptionElement.classList.add('show');
                                setTimeout(() => {
                                    const descWidth = descriptionElement.scrollWidth;
                                    const containerWidth = descriptionElement.clientWidth;
                                    if (descWidth > containerWidth) {
                                        descriptionElement.classList.add('marquee');
                                    } else {
                                        descriptionElement.classList.remove('marquee');
                                    }
                                }, 50);
                            }
                        }, 500);
                    }
                });
            });
        }
    })
    .catch(err => {
        console.error("Error fetching tools:", err);
    });
});
