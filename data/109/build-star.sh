#!/bin/bash

path="www.cac.edu.tw/star109/system/109ColQry6d3k_forstar_583vd"

rm "$path/ShowSchGsd.php"*

wget -r -nc --header "User-Agent: Sean" "https://$path/TotalGsdShow.htm"

rm new-star

for id in `ls $path/html`; do
	file="$path/html/$id"
	id=${id/109_/}
	id=${id/.htm/}

	echo -ne "$id\t" |tee -a new-star

	for s in "國文" "英文" "數學" "社會" "自然"; do
		mark=`grep -a -A1 ">$s<" $file |tail -n1 |grep -oP '>\K[^<]*(?=標<)'`
		if [ $? -ne 0 ]; then
			mark="無"
		fi
		echo -n $mark |tee -a new-star
	done

	echo -ne "\t" |tee -a new-star

	for s in "國文" "英文" "數學" "社會" "自然"; do
		mark=`grep -a -A1 ">$s<" $file |tail -n1 |grep -oP '>\K[^<]*(?=<)'`
		echo -n "$mark " |tee -a new-star
	done

	echo -ne "\t` grep -a -oP '<b>\K[^<>]+(?=<br>)' $file |head -n1`" |tee -a new-star

	echo -e "\t`grep -a -oP '<br>\K[^<>]+(?=<)' $file |head -n1 |sed -e 's/\s*(/（/g' -e 's/\s*)/）/g'`" |tee -a new-star
done

echo "Done!"
wc new-star

echo "Please confirm and move new-star to star"
