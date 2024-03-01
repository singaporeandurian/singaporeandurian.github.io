import json

# Define the path to the master.json file
master_json_path = 'H:/bitringwebsite/images/bitring/metadata/master/master.json'

# Load the existing metadata from the master.json file
with open(master_json_path, 'r') as file:
    metadata_list = json.load(file)

# Iterate over each item in the metadata list
for item in metadata_list:
    # Filter out any attributes with 'trait_type' of 'Size'
    item["attributes"] = [attr for attr in item["attributes"] if attr["trait_type"] != "Size"]

# Write the updated metadata back to the master.json file
with open(master_json_path, 'w') as file:
    json.dump(metadata_list, file, indent=4)
