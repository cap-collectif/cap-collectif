import xml.etree.ElementTree as ET
import json

# Lire le fichier contenant le dictionnaire
with open('translations/ur-IN.json') as f:
    # Charger le contenu du fichier en tant que dictionnaire Python
    dictionary = json.load(f)

# Créer un nouveau dictionnaire
new_dict = {}

# Parcourir toutes les clés et valeurs du dictionnaire d'origine
for key, value in dictionary.items():
    # Copier la clé dans la valeur
    new_dict[key] = key

# Afficher le nouveau dictionnaire
print(new_dict)

# puis, importer le fichier via https://localise.biz/cap-collectif/cap-collectif/import
