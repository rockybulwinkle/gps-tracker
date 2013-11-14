#!/bin/bash
#Run this file to setup an Ad-hoc wirless network. All machines that you want
#to be involved in this network must run this file.


if [ $# -ne 3 ] ; then
	echo "Usage: $0 interface IP_address SSID"
	echo "This script must be run on each machine involved in the network"
	echo "Each machine needs to have a unique IP Address but must be apart"
	echo "of the same subnet (Subnet is fixed to /24)"
	echo "Number of arguments given: $#"
	exit 1
fi

interface=$1
ipaddr=$2
ssid=$3

#bring the interface down
ip link set $interface down 
#set the interface to ad-hoc mode
iw $interface set type ibss
#bring the interface back up
ip link set $interface up 
#set ssid
iw $interface ibss join $ssid 2447 
#set static ip
ip addr add $ipaddr/24 dev $interface
