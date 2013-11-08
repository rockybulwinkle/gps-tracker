#!/usr/bin/env python
#vim:tabstop=8:shiftwidth=4:smarttab:expandtab:softtabstop=4:autoindent:
#vim:set nonumber
import os

GPS_PORT = '/dev/ttyO4'
LOG_FILE = 'location.log'
LOST_SIGNAL = 0
from socketIO_client import SocketIO
import serial

def parse_gps(line):

    line = line.split(',')
    lat = line[2]
    if lat:
        print lat
        lat = float(lat)
        lat = str(lat/100)
        print lat
        lat_deg, lat_min = lat.split('.')
        lat_deg = float(lat_deg)
        lat_min = float("." + lat_min)
        print lat_deg, lat_min

        lat = (lat_deg + lat_min/.60)
        lat = -lat if "S" in line[3] else lat
    else:
        lat = LOST_SIGNAL

    long_ = line[4]
    if long_:
        print long_
        long_ = float(long_)
        long_ = str(long_/100)
        print long_
        long_deg, long_min = long_.split('.')
        long_deg = float(long_deg)
        long_min = float("." + long_min)
        print long_deg, long_min

        long_ = (long_deg + long_min/.60)
        long_ = -long_ if "W" in line[5] else long_
    else:
        long_ = LOST_SIGNAL

    return (lat,long_)

def on_recv(*args):
    print 'on_aaa_response', args

def on_move(*args):
    quit()
    print "move!"
 
read_pipe, write_pipe = os.pipe()

if os.fork() != 0: #is parent
    os.close(read_pipe)
    serial_port = serial.Serial(port=GPS_PORT, baudrate=9600)
    gps_log = open(LOG_FILE, "r")
    #for line in gps_log:
        #os.write(write_pipe, line)
    gps_log.close()
    gps_log = open(LOG_FILE, "a")
    #parse_gps("$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47")
    for line in serial_port:
        if "GPGGA" in line:
            line = parse_gps(line)
            line = map(str, line)
            line = ','.join(line)
            gps_log.write(line+"\n")
            gps_log.flush()
            os.write(write_pipe, line+"\n")
            #os.close(write_pipe)
    print "done parent"


else:
    os.close(write_pipe)
    socketIO = SocketIO('localhost', 8080)
    socketIO.on('loc_recv', on_recv)
    socketIO.on('move', on_move)
    buffer = ""
    while (True):
        buffer += os.read(read_pipe, 1000)
        line = buffer.split('\n')[0]
        buffer = '\n'.join(buffer.split('\n')[1:])

        line = line.split(',')
        print line
        lat,long_ = map(float,line)
        print lat,long_
        socketIO.emit('loc', {"lat":lat, "long":long_})
        socketIO._transport.send_heartbeat()
    print "done child"

#socketIO.emit('loc', {"lat":"86", "long_":"42"})
#socketIO.wait(seconds=1)
#socketIO.close()
