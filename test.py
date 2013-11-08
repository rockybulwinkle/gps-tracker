from socketIO_client import SocketIO

def on_move(*args):
	print "hi"

socketIO = SocketIO('localhost', 8080)
socketIO.on('loc_recv', on_recv)
socketIO.on('move', on_move)

while(True):
	pass


