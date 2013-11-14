#!/usr/bin/python2
from socketIO_client import SocketIO

def on_move(*args):
	print "hi"

socketIO = SocketIO('localhost', 8080)
socketIO.on('move', on_move)
socketIO.wait()
