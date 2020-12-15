#!/bin/bash

path="www.cac.edu.tw/apply110/system/110_aColQry4qy_forapply_o5wp6ju"
# wget -r -nc -R pdf --header "User-Agent: Sean" "https://$path/TotalGsdShow.htm"

rm new-apply

parse () {
	local id
	local file
	local line
	local mark
	local multiple
	local weighted

	id=$1
	file="$path/html/$id"
	id=${id/110_/}
	id=${id/.htm?v=1.0/}

	line="$id\t"

	for s in "國文" "英文" "數學" "社會" "自然"; do
		mark=`ggrep -a -A3 "  <font size=\"2\"><b>$s</b></font>" $file |tail -n1 |ggrep -oP '>\K[^<]*(?=標<)'`
		if [ $? -ne 0 ]; then
			mark="無"
		fi
		line+="$mark"
	done

	line+="\t"

	for s in "國文" "英文" "數學" "社會" "自然"; do
		mark=`ggrep -a -A3 "  <font size=\"2\"><b>$s</b></font>" $file |tail -n1 |ggrep -oP '>\K[^<]*標(?=<)'`
		if [ $? -eq 0 ]; then
			line+="$mark "
			continue
		fi

		multiple=`ggrep -a -A6 "  <font size=\"2\"><b>$s</b></font>" $file |tail -n1 |ggrep -oP '>\K.*?(?=<)'`
		if [ "$multiple" != "--" ]; then
			line+="$multiple "
			continue
		fi

		weighted=`ggrep -a -A9 "  <font size=\"2\"><b>$s</b></font>" $file |tail -n1 |ggrep -oP '>\K.*?(?=<)'`
		if [ "$weighted" != "--"  ]; then
			line+="採計 "
			continue
		fi

		line+="-- "
	done

	line+="\t"
	line+="`head -n10 $file |tail -n1 |ggrep -a -oP '>\K[^<>]+(?=<)'`"
	line+="\t"
	line+="`head -n11 $file \
		|tail -n1 \
		|ggrep -a -oP ' +\K[^<>]+(?=<)' \
		|sed -e 's/\s*(/（/g' -e 's/\s*)/）/g' \
		|perl -pe 's#(學系|學程|學士班)\-?((?!(（|）)).*)組$#\1（\2組）#' \
		|perl -pe 's#系\-?((?!(（|）)).*)組$#系（\1組）#' \
		|perl -pe 's#\-((?!(（|）)).*)組$#（\1組）#' \
		`"

	echo -e "$line" | tee -a new-apply
}

for id in `ls $path/html`; do
	parse $id &
	sleep 0.2
done

for job in `jobs -p`; do
    wait $job
done

sort -o new-apply new-apply

echo "Done!"
wc new-apply

echo "Please confirm and move new-apply to apply"
