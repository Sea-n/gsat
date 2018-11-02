#!/bin/bash

id=$1

file=star-$id

name=`head -n78 $file |tail -n1 |grep -oP 'br>\K.*?(?=<)'`

json="{\"id\":\"$id\", \"name\":\"$name\""

for s in "國文" "英文" "數學" "社會" "自然"; do
	mark=`grep -A1 ">$s<" $file |tail -n1 |grep -oP '>\K.*?(?=<)'`
	json+=", \"$s\":\"$mark\""
done

json+="},"

echo $json >> star-data
