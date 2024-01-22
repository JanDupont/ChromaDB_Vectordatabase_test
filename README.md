# Start ChromaDB Docker Container

docker run -d -p 8000:8000 chromadb/chroma

# Run Script

node main.js

# info

-   models laufen in onxx-runtime (web-assembly statt python), deswegen mit xenova nur begrenzete Auswahl an models verfügbar
-   es können aber so ziemlich alle models to onxx konvertiert werden (mehr dazu: https://huggingface.co/docs/transformers.js/custom_usage)

# TODO

-   [ ] weitere/bessere, kostenlose models finden
-   [ ] "update symbol" logik ausprobieren (upsert)
-   [ ] descriptions mit einbeziehen für mehr context (slow af momentan, kurz getestet)
-   [ ] persistieren der datenbank ohne docker (stand jetzt fertigen docker service nutzen)
-   [ ] Models werden aktuell von huggingface gefetched und in node_modules/@xenova/.cache gecached, evtl langfristig (wenn man den Service hier dockerized) sinnvoll, das Model schon in den container zu embedden (mehr dazu: https://huggingface.co/docs/transformers.js/custom_usage)
-   [x] combinedQueries mit positive and negative texten
-   [x] referredBy typen in metadata wiederspiegeln (scopes) (um später spezifischere filter zu ermöglichen)
