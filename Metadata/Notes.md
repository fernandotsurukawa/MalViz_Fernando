Demo: https://idatavisualizationlab.github.io/MalViz/
- **CreateFile**: According to the [docs](https://docs.microsoft.com/en-us/windows/desktop/FileIO/creating-and-opening-files),
"The CreateFile function can create a new file or open an existing file."
The scenarios for this function include:
    - Creating a new file when a file with that name does not already exist.
    - Creating a new file even if a file of the same name already exists, clearing its data and starting empty.
    - Opening an existing file only if it exists, and only intact.
    - Opening an existing file only if it exists, truncating it to be empty.
    - Opening a file always: as-is if it exists, creating a new one if it does not exist.