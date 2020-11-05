#!/bin/bash

path="www.cac.edu.tw/apply110/system/110ColQrytk4p_forapply_os92k5w"

rm "$path/ShowSchGsd.php"*

wget -r -nc -R pdf --header "User-Agent: Sean" "https://$path/TotalGsdShow.htm"

rm new-apply

for id in `ls $path/html`; do
	file="$path/html/$id"
	id=${id/110_/}
	id=${id/.htm/}

	echo -ne "$id\t" |tee -a new-apply

	for s in "國文" "英文" "數學" "社會" "自然"; do
		mark=`grep -a -A3 "  <font size=\"2\"><b>$s</b></font>" $file |tail -n1 |grep -oP '>\K[^<]*(?=標<)'`
		if [ $? -ne 0 ]; then
			mark="無"
		fi
		echo -n $mark |tee -a new-apply
	done

	echo -ne "\t" |tee -a new-apply

	for s in "國文" "英文" "數學" "社會" "自然"; do
		mark=`grep -a -A3 "  <font size=\"2\"><b>$s</b></font>" $file |tail -n1 |grep -oP '>\K[^<]*標(?=<)'`
		if [ $? -eq 0 ]; then
			echo -n "$mark " |tee -a new-apply
			continue
		fi

		multiple=`grep -a -A6 "  <font size=\"2\"><b>$s</b></font>" $file |tail -n1 |grep -oP '>\K.*?(?=<)'`
		if [ "$multiple" != "--" ]; then
			echo -n "x$multiple " |tee -a new-apply
			continue
		fi

		weighted=`grep -a -A9 "  <font size=\"2\"><b>$s</b></font>" $file |tail -n1 |grep -oP '>\K.*?(?=<)'`
		if [ "$weighted" != "--"  ]; then
			echo -n "採計 " |tee -a new-apply
			continue
		fi

		echo -n "-- " |tee -a new-apply
	done

	echo -ne "\t`head -n32 $file |tail -n1 |grep -a -oP '>\K[^<>]+(?=<)'`" |tee -a new-apply

	echo -e "\t`head -n33 $file \
		|tail -n1 \
		|grep -a -oP ' +\K[^<>]+(?=<)' \
		|sed -e 's/\s*(/（/g' -e 's/\s*)/）/g' \
		|perl -pe 's#(學系|學程|學士班)\-?((?!(（|）)).*)組$#\1（\2組）#' \
		|perl -pe 's#系\-?((?!(（|）)).*)組$#系（\1組）#' \
		|perl -pe 's#\-((?!(（|）)).*)組$#（\1組）#' \
		`" |tee -a new-apply
done

echo "Done!"
wc new-apply

echo "Please confirm and move new-apply to apply"
