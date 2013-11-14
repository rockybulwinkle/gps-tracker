This directory holds all of the information for displaying the webpage
associated with our project.
Run MapServer.js to start up the server. By browsing to <BEAGLE IP ADDRESS>:8080,
the server will display map.html. Make sure the python script gps_tracker.py is
running before trying to connect to the webpage.

From here, you should be able to see a map centered on Rose-Hulman. At the top you
will see two modes, live and search. Selecting live will let you see what GPS data
you're receiving in realtime. If no satelites have been acquired or a fix hasn't been
established, no data will be displayed. In search mode, new data acquired from
the GPS won't be shown. Instead, you can specify a time range you'd like to display
on the map. By setting the Start Time, the End time, and then hitting go, you can
display any GPS data acquired during this time.

Whether you're in live mode or search mode, the time of the most recently plotted
information will be displayed just above the map.

The color of the path changes depending on the Horizontal Dilution of Precision (HDP)
received from the GPS tracker. Green indicates a good HDP, red indicates a less
optimal HDP. 
