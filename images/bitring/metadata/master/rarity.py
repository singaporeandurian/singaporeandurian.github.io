import json
from open_rarity import (
    Collection,
    Token,
    RarityRanker,
    TokenMetadata,
    StringAttribute,
)
from open_rarity.models.token_identifier import EVMContractTokenIdentifier
from open_rarity.models.token_standard import TokenStandard

# Path to your master.json
master_json_path = 'H:/bitringwebsite/images/bitring/metadata/master/master.json'

# Load your metadata
with open(master_json_path, 'r') as file:
    metadata_list = json.load(file)

# Prepare data for OpenRarity
# First, we need to aggregate attribute frequencies from all tokens
attributes_frequency_counts = {}
for item in metadata_list:
    for attribute in item["attributes"]:
        trait_type = attribute["trait_type"]
        value = attribute["value"]
        if trait_type not in attributes_frequency_counts:
            attributes_frequency_counts[trait_type] = {}
        if value not in attributes_frequency_counts[trait_type]:
            attributes_frequency_counts[trait_type][value] = 0
        attributes_frequency_counts[trait_type][value] += 1

# Now, we create tokens for OpenRarity without contract information
tokens = []
for item in metadata_list:
    token_metadata = TokenMetadata(
        string_attributes={
            attr["trait_type"]: StringAttribute(name=attr["trait_type"], value=attr["value"])
            for attr in item["attributes"]
        }
    )
    tokens.append(
        Token(
            token_identifier=EVMContractTokenIdentifier(contract_address="0x00", token_id=str(item["tokenId"])),
            token_standard=TokenStandard.ERC721,  # Mock the standard as ERC721
            metadata=token_metadata,
        )
    )

# Create OpenRarity collection object
collection = Collection(
    name="My Collection Name",  # Change this to your collection's name
    attributes_frequency_counts=attributes_frequency_counts,
    tokens=tokens,
)

# Generate rarity scores for the collection
ranked_tokens = RarityRanker.rank_collection(collection=collection)
print(ranked_tokens)

# Assuming each token's unique identifier can be directly correlated back to your metadata_list items
token_rarity_map = {}
for token_rarity in ranked_tokens:
    # Extract token ID from the token identifier (assuming EVMContractTokenIdentifier structure)
    token_id = token_rarity.token.token_identifier.token_id
    # Convert token_id to integer if your metadata uses integers for IDs
    token_id = int(token_id)
    # Map the token ID back to its rank and score
    token_rarity_map[token_id] = (token_rarity.rank, token_rarity.score)

# Update metadata with rarity scores using the token ID as the key
for item in metadata_list:
    token_id = item["tokenId"]
    if token_id in token_rarity_map:
        rank, score = token_rarity_map[token_id]
        # Add Rarity Rank attribute
        item["attributes"].append({
            "trait_type": "Rarity Rank",
            "value": str(rank)
        })

# Write updated metadata back to file
with open(master_json_path, 'w') as file:
    json.dump(metadata_list, file, indent=4)
