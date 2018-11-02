#!/bin/bash

id=$1

file=apply-$id

name=`head -n11 $file |tail -n1 |grep -oP ' \K.*?(?=<)'`

json="{\"id\":\"$id\", \"name\":\"$name\""

for s in "國文" "英文" "數學" "社會" "自然"; do
	for k in 3 6 9; do
		mark=`grep -A$k ">$s<" $file |tail -n1 |grep -oP '>\K.*?(?=<)'`
		if [ "$mark" != "--" ]; then
			break
		fi
	done
#	echo $s: $mark
	json+=", \"$s\":\"$mark\""
done

json+="},"

echo $json >> apply-data
