# Start ChromaDB Docker Container

docker run -d -p 8000:8000 chromadb/chroma

# Run Script

node main.js

# info

-   models laufen in onxx-runtime (web-assembly statt python), deswegen mit xenova nur begrenzete Auswahl an models verfügbar
-   es können aber so ziemlich alle models to onxx konvertiert werden (mehr dazu: https://huggingface.co/docs/transformers.js/custom_usage)

# TODO

-   bessere, kostenlose models finden
-   "update symbol" logik ausprobieren
-   descriptions mit einbeziehen für mehr context (slow af momentan, kurz getestet)
-   persistieren der datenbank ohne docker
-   Models werden aktuell von huggingface gefetched und in node_modules/@xenova/.cache gecached, evtl langfristig (wenn man den Service hier dockerized) sinnvoll, das Model schon in den container zu embedden (mehr dazu: https://huggingface.co/docs/transformers.js/custom_usage)
