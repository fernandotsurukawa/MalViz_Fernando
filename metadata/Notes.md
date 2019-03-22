###Notes
Some notes about the concepts used in this project.
___
Demo: https://idatavisualizationlab.github.io/MalViz/

Example of a record:
````
Detail: "Desired Access: Generic Read, Disposition: Open, Options: , Attributes: n/a, ShareMode: Read, Delete, AllocationSize: n/a, OpenResult: Opened"
Operation: "CreateFile"
PID: "1652"
Path: "C:\Program Files\Internet Explorer\en-US\iexplore.exe.mui"
Process_Name: "Explorer.EXE"
Timestamp: "2:25:10.1991692 PM"
````
1. **CreateFile**: According to the [docs](https://docs.microsoft.com/en-us/windows/desktop/FileIO/creating-and-opening-files),
CreateFile function can create a new file or open an existing file. The scenarios for this function include:

    - Creating a new file when a file with that name does not already exist.
    - Creating a new file even if a file of the same name already exists, clearing its data and starting empty.
    - Opening an existing file only if it exists, and only intact.
    - Opening an existing file only if it exists, truncating it to be empty.
    - Opening a file always: as-is if it exists, creating a new one if it does not exist.
    
2. **Process_Name**: The values for this property mostly are executable file names (.exe) of all the running programs 
captured. Besides, the values can be `System` or `Idle`.
    - [System](https://www.neuber.com/taskmanager/process/system.html): It is the host of all kind of drivers. The system process has always the PID 4, otherwise it is malware.
    - [Idle](https://www.neuber.com/taskmanager/process/system%20idle.html): Indicates the percentage of time that 
    the processor is idle. It is a single thread running on each processor, which has the sole task of 
    accounting for processor time when the system isn't processing other threads. The system idle process has always the 
    PID 0  in the Windows Task Manager, otherwise it is malware.
    
3. **Windows System Information**
    