Bin
README.md:  The file you are looking at right now!
ad-hoc_setup.sh:  Sets up adhoc networking.
				  Usage: ad-hoc_setup.sh <interface> <IP_Address> <SSID>
				  see elinux.org/ECE497_Project_GPS_Tracker#Ad_Hoc_Networking for
				  more information
gps_tracker.py: Handles the GPS logging and responds to the MapServer.js
load_uart_overlay.sh: Loads the uart overlay for uart4
make_db: The sqlite code to create a new database.  Run by doing "sqlite3 ./var/gps_db < make_db"
