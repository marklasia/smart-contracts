#!/bin/bash
count=1

while $@; 
do 
echo "$count"
sleep 1
(( count++ ))
done