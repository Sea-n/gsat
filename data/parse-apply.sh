#!/bin/bash

file=$1

id=${file/108_/}
id=${id/.htm/}

echo -ne "$id\t"

for s in "國文" "英文" "數學" "社會" "自然"; do
	mark=`grep -A3 ">$s<" $file |tail -n1 |grep -oP '>\K[^<]*(?=標<)'`
	if [ $? -ne 0 ]; then
		mark="無"
	fi
	echo -n $mark
done

echo -ne "\t"

for s in "國文" "英文" "數學" "社會" "自然"; do
	mark=`grep -A3 ">$s<" $file |tail -n1 |grep -oP '>\K[^<]*標(?=<)'`
	if [ $? -eq 0 ]; then
		echo -n "$mark "
		continue
	fi

	multiple=`grep -A6 ">$s<" $file |tail -n1 |grep -oP '>\K.*?(?=<)'`
	if [ "$multiple" != "--" ]; then
		echo -n "x$multiple "
		continue
	fi

	weighted=`grep -A9 ">$s<" $file |tail -n1 |grep -oP '>\K.*?(?=<)'`
	if [ "$weighted" != "--"  ]; then
		echo -n "採計 "
		continue
	fi

	echo -n "-- "
done

echo -ne "\t`head -n10 $file |tail -n1 |grep -oP '>\K[^<>]+(?=<)'`"

echo -e "\t`head -n11 $file |tail -n1 |grep -oP ' \K *[^<>]+(?=<)'`"
