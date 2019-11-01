#!/bin/bash
id=${1/.html/}
file=`iconv -f big5 -t utf-8 $id.html`
title=`echo $file |grep -oP '<title>\K[^<]+(?=<)' |sed 's/ \- /\t/'`

echo -en "$id\t"

subjects=("國" "英" "數" "自" "社")
for subj in ${subjects[@]}; do
	mark=`echo $file |grep -oP "$subj[^<>]+\K.(?=標[^<>]+<br>)"`
	if [[ $? -ne 0 ]]; then
		mark="無"
	fi
	echo -n $mark
done

echo -ne "\t"

subjects=("國_文" "英_文" "數_甲" "數_乙" "物_理" "化_學" "生_物" "歷_史" "地_理" "公_民")
for s in ${subjects[@]}; do
	subj=${s/_/[^<>]*}
	weight=`echo $file |grep -oP ">[^<>]*$subj[^<>]+ x \K\d\.\d\d(?=<br>)"`
	if [[ $? -ne 0 ]]; then
		weight="0.00"
	fi
	echo -n "$weight "
done

echo -e "\t$title"
