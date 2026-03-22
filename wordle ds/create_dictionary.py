import json
import time
import requests
from deep_translator import GoogleTranslator

# Read the word list from the file
with open('words.txt', 'r') as file:
    words = [line.strip() for line in file.readlines()]

# Create an empty dictionary to store our results
result_dict = {}

# Loop through each word in the list
for word in words:
    print(f"Processing: {word}")
    en_definition = ""
    ar_definition = ""
    ar_word = ""

    # 1. FIRST: Always get the direct translation of the word itself
    try:
        ar_word = GoogleTranslator(source='auto', target='ar').translate(word)
        print(f"  Direct Word Translation: {ar_word}")
    except Exception as e:
        print(f"  Error direct translating word '{word}': {e}")
        ar_word = "كلمة غير متاحة"

    # 2. Try to get English definition from Free Dictionary API
    try:
        response = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}")
        if response.status_code == 200:
            data = response.json()
            # Try to get the first definition
            en_definition = data[0]['meanings'][0]['definitions'][0]['definition']
            print(f"  Found definition: {en_definition}")
            
            # 3. Translate the definition to Arabic
            try:
                ar_definition = GoogleTranslator(source='auto', target='ar').translate(en_definition)
                print(f"  Definition Translation: {ar_definition}")
            except Exception as e:
                print(f"  Error translating definition for {word}: {e}")
                ar_definition = "تعريف غير متاح"
        else:
            print(f"  Warning: No definition found for {word}.")
            # No need for a fallback for en_definition, we'll just leave it empty
    except Exception as e:
        print(f"  Error getting definition for {word}: {e}")

    # 4. Add the data to our result dictionary
    result_dict[word] = {
        "en": en_definition,        # The English definition (might be empty)
        "ar_def": ar_definition,    # The Arabic translation of the definition (might be empty)
        "ar_word": ar_word          # The direct Arabic translation of the word itself (always filled)
    }

    # 5. Be polite and wait a second before the next API call to avoid being blocked
    time.sleep(1)

# After processing all words, save the result to a JSON file
with open('dictionary_output.json', 'w', encoding='utf-8') as json_file:
    json.dump(result_dict, json_file, indent=2, ensure_ascii=False)

print("Finished! Check 'dictionary_output.json' for your file.")