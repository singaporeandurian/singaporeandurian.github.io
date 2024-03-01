import json
import os

# Define the path to the master.json file
master_json_path = 'H:/bitringwebsite/images/bitring/metadata/master/master.json'

# Define the directory containing the SVG files
svg_directory = 'H:/bitringwebsite/images/bitring/artwork'

# Load the existing metadata from master.json
with open(master_json_path, 'r') as file:
    metadata_list = json.load(file)

# Iterate over each item in the metadata list
for item in metadata_list:
    token_id = item["tokenId"]
    # Construct the SVG file path corresponding to the token ID
    svg_file_path = os.path.join(svg_directory, f"{token_id}.svg")
    
    # Check if the SVG file exists
    if os.path.exists(svg_file_path):
        # Get the size of the SVG file in KB
        size_kb = round(os.path.getsize(svg_file_path) / 1)  # Size in kilobytes, rounded

        
        # Add the Size attribute
        item["attributes"].append({
            "trait_type": "Size",
            "value": f"{size_kb}"  # Keep two decimal places
        })
        print(size_kb)

# Write the updated metadata back to the master.json file
with open(master_json_path, 'w') as file:
    json.dump(metadata_list, file, indent=4)
