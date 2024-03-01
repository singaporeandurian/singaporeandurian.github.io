import json
import os

# Define the path to the master.json file
master_json_path = 'H:/bitringwebsite/images/bitring/metadata/master/master.json'

# Define the path to the ids.txt file
ids_file_path = 'H:/bitringwebsite/images/bitring/metadata/master/ids.txt'

# Load the existing metadata from master.json
with open(master_json_path, 'r') as file:
    metadata_list = json.load(file)

# Load the InscriptionIds from ids.txt
with open(ids_file_path, 'r') as file:
    inscription_ids = [line.strip() for line in file.readlines()]

# Number of items to update
num_items_to_update = 333

# Iterate over the specified number of items in the metadata list and add the InscriptionId
for i, item in enumerate(metadata_list):
    if i < num_items_to_update:
        item["InscriptionURL"] = 'https://ordinals.com/inscription/' + inscription_ids[i] if i < len(inscription_ids) else None

# Write the updated metadata back to the master.json file
with open(master_json_path, 'w') as file:
    json.dump(metadata_list, file, indent=4)
