#!/bin/bash

# while read id; do curl -s "https://campus4.ncku.edu.tw/uac/cross_search/dept_info/$id.html" |iconv -f big5 -t utf-8 > html/$id.html; done

file=$1
id=$file
id=${id/html\//}
id=${id/.html/}
title=`grep -oP '<title>\K[^<]+(?=<)' $file |sed 's/ \- /\t/'`

echo -en "$id\t"

subjects=("國" "英" "數" "自" "社")
for subj in ${subjects[@]}; do
	mark=`grep -oP "$subj[^<>]+\K.(?=標[^<>]+<br>)" $file`
	if [[ $? -ne 0 ]]; then
		mark="無"
	fi
	echo -n $mark
done

echo -ne "\t"

subjects=("國_文" "英_文" "數_甲" "數_乙" "物_理" "化_學" "生_物" "歷_史" "地_理" "公_民")
for s in ${subjects[@]}; do
	subj=${s/_/[^<>]*}
	weight=`grep -oP "[^<>]*$subj[^<>]+ x \K\d\.\d\d(?=<br>)" $file`
	if [[ $? -ne 0 ]]; then
		weight="0.00"
	fi
	echo -n "x$weight "
done

echo -e "\t$title"
