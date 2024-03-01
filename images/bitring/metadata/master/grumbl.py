import json
import os

def combine_json_files(directory, output_filename):
    combined_data = []  # List to store all data

    # Loop through all files in the directory
    for i in range(1, 1001):  # Adjust the range if needed
        filename = os.path.join(directory, f'{i}.json')
        try:
            with open(filename, 'r', encoding='utf-8') as file:
                data = json.load(file)  # Load the JSON data from file
                combined_data.append(data)  # Add the data to our combined list
        except FileNotFoundError:
            print(f'File not found: {filename}')
        except json.JSONDecodeError:
            print(f'Error decoding JSON from file: {filename}')

    # Write the combined data to the output file
    with open(os.path.join(directory, output_filename), 'w', encoding='utf-8') as output_file:
        json.dump(combined_data, output_file, indent=4)  # Write JSON data with indentation

# Usage
directory = '.'  # Current directory, change if your JSON files are in a different directory
output_filename = 'master.json'
combine_json_files(directory, output_filename)
