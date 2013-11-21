#!/usr/bin/env python
#vim:tabstop=8:shiftwidth=4:smarttab:expandtab:softtabstop=4:autoindent:
#vim:set nonumber
import os
import multiprocessing as mp
GPS_PORT = '/dev/ttyO4'
DB_FILE = './var/gps_db'
LOST_SIGNAL = 0
from socketIO_client import SocketIO
import serial
import sqlite3
import datetime
import time
import dateutil.parser

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
	
	ret_val = {}
	ret_val["fix_quality"] = line[6]
	ret_val["num_sats"] = line[7]
	ret_val["hdp"] = line[8]
	ret_val["altitude"] = line[9]
	ret_val["lat"] = lat
	ret_val["long"] = long_

	return ret_val

def parse_date(line):
	line_ = line.split(',')
	tod = line_[1].split('.')[0]
	second = tod[-2:]
	minute = tod[-4:-2]
	hour = tod[-6:-4]

	date_ = line_[9]
	year = "20" + date_[-2:]
	month = date_[-4:-2]
	day = date_[-6:-4]
	print hour,minute,second,year,day,month
	t = datetime.datetime(*map(int,[year,month,day,hour,minute,second]))
	return t

def on_recv(*args):
	print 'on_aaa_response', args


def serial_handler(lock):
	socketIO = SocketIO('localhost', 8080)
	serial_port = serial.Serial(port=GPS_PORT, baudrate=9600)
	last_date = None
	for line in serial_port:
		out_file = open("var/log.dat","a")
		out_file.write(line)
		out_file.close()
		socketIO._transport.send_heartbeat()
		if "GPGGA" in line and last_date:
			line = parse_gps(line)
			if line["fix_quality"] != "0":
				lock.acquire()
				conn = sqlite3.connect(DB_FILE)
				cur = conn.cursor()
				cur.execute('insert into gps_data \
					(date,long,lat,fix_quality,num_sats,\
					hdp,altitude) values (?,?,?,?,?,?,?);'\
					,[last_date,line["long"],line["lat"]\
					,line["fix_quality"], line["num_sats"]\
					,line["hdp"], line["altitude"]] )
				conn.commit()

				cur.execute("select key_value from\
					config where key_name=\
					'tracking.mode.type'")
				tracking_mode_type = cur.fetchone()[0]
				if tracking_mode_type=='live':
					print "sending"
					socketIO.emit('loc', line)
				print line["long"],line["lat"]
				conn.close()
				lock.release()
			
		
			
			#os.close(write_pipe)
		if "GPRMC" in line:
			last_date = str(parse_date(line))

def do_time_search(socket, cursor):
	cursor.execute("select key_value from config where key_name='query.time.start'")
	start_time = dateutil.parser.parse(cursor.fetchone()[0])
	cursor.execute("select key_value from config where key_name='query.time.end'")
	end_time = dateutil.parser.parse(cursor.fetchone()[0])
	print start_time,end_time
	socket.emit("clear")
	cursor.execute("select date,lat,long,hdp,num_sats,fix_quality,altitude from gps_data where date > ? and date < ?  order by date asc;", (start_time,end_time))
	for date_,lat,long,hdp,num_sats,fix_quality,altitude in cursor.fetchall():
		socket.emit("loc", {"lat":lat,"long":long,"hdp":hdp,"num_sats":num_sats,"fix_quality":fix_quality,"altitude":altitude, "date":date_})

def search_handler(lock):
	socketIO = SocketIO('localhost', 8080)
	#socketIO.on('loc_recv', on_recv)
	while (True):
		lock.acquire()
		conn = sqlite3.connect(DB_FILE)
		cur = conn.cursor()
		cur.execute("select key_value from config where key_name='query.waiting'")
		waiting = cur.fetchone()[0]

		if waiting == "true":
			cur.execute("update config set key_value='false'\
			where key_name='query.waiting'")
			conn.commit()
			cur.execute("select key_value from config where\
			key_name='query.type'")
			type = cur.fetchone()[0]
			if type == 'time':
				do_time_search(socketIO,cur)
			conn.close()
		socketIO._transport.send_heartbeat()
		lock.release()
		time.sleep(1)

def settings_handler(lock):
	def update_time_query(*args):
		lock.acquire()
		conn = sqlite3.connect(DB_FILE)
		cur = conn.cursor()
		cur.execute("select key_value from config where key_name='tracking.mode.type'")
		mode = cur.fetchone()[0]
		if mode != "live":
			cur.execute("update config set\
				key_value='time' where key_name=\
				'query.type';")
			cur.execute("update config set\
				key_value=? where key_name=\
				'query.time.start'", (args[0]["start"],))
			cur.execute("update config set\
				key_value=? where key_name=\
				'query.time.end'", (args[0]["end"],))
			cur.execute("update config set\
				key_value='true' where key_name=\
				'query.waiting'")
			cur.close()
		conn.commit()
		conn.close()
		lock.release()
	def update_mode(*args):
		lock.acquire()
		conn = sqlite3.connect(DB_FILE)
		cur = conn.cursor()
		if args and args[0]["mode"] == "live":
			cur.execute("update config set\
				key_value='live' where key_name=\
				'tracking.mode.type';")
			print "set  to live"
		else:
			cur.execute("update config set\
				key_value='search' where key_name=\
				'tracking.mode.type';")
			print "set to %s"%args[0]["mode"]
	
		cur.close()
		conn.commit()
		conn.close()
		lock.release()
	
	socketIO = SocketIO('localhost', 8080)
	socketIO.on('time_query', update_time_query)
	socketIO.on('mode', update_mode)
	socketIO.wait()

lock = mp.Lock()

search_handler = mp.Process(target=search_handler, args=(lock,))
search_handler.start()
serial_handler = mp.Process(target=serial_handler, args=(lock,))
serial_handler.start()
settings_handler = mp.Process(target=settings_handler, args=(lock,))
settings_handler.start()
#socketIO.emit('loc', {"lat":"86", "long_":"42"})
#socketIO.wait(seconds=1)
#socketIO.close()
