==What is this?==
This project is a GPS tracking solution designed for the Beaglebone Black.

==Installation instructions==
After cloning the repo, plug in a GPS module's UART Tx to an Rx pin.  If you're using a Beaglebone Black, use P9_11 (UART4) if possible.
If you are using a different serial port, edit "GPS_PORT" at the top of ./bin/gps_tracker and the overlay in ./bin/load_uart_overlay.sh to the correct port.
Then load the Device Tree Overlay for UART using ./bin/load_uart_overlay.sh.  This needs to be done after every boot for the gps_tracker to work correctly.

Now, install pyserial.  We have a guide on our project's wiki page: http://elinux.org/ECE497_Project_GPS_Tracker#Installing_pyserial

To start up the tracker, first run ./webpage/MapServer.js, then run ./bin/gps_tracker.py.  It should now be serving a webpage on port 8080!
