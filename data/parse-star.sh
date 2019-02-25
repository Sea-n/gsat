#!/bin/bash

file=$1

id=${file/108_/}
id=${id/.htm/}

echo -ne "$id\t"

for s in "國文" "英文" "數學" "社會" "自然"; do
	mark=`grep -A1 ">$s<" $file |tail -n1 |grep -oP '>\K.*?(?=標<)'`
	if [ $? -ne 0 ]; then
		mark="無"
	fi
	echo -n $mark
done

echo -ne "\t"

for s in "國文" "英文" "數學" "社會" "自然"; do
	mark=`grep -A1 ">$s<" $file |tail -n1 |grep -oP '>\K.*?(?=<)'`
	echo -n "$mark "
done

echo -ne "\t`head -n78 $file |tail -n1 |grep -oP '<b>\K[^<>]*(?=<br>)'`"

echo -e "\t`head -n78 $file |tail -n1 |grep -oP '<br>\K[^<>]*(?=<)'`"
