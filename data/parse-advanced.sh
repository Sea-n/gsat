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

subjects=("國" "英" "甲" "乙" "理" "化" "生" "史" "地" "公")
for subj in ${subjects[@]}; do
	weight=`echo $file |grep -oP ">[^<>]*$subj[^<>]+ x \K\d\.\d\d(?=<br>)"`
	if [[ $? -ne 0 ]]; then
		weight="0.00"
	fi
	echo -n "$weight "
done

echo -e "\t$title"
