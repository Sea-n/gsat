#!/bin/bash

path="www.cac.edu.tw/star110/system/110_aColQry_forstar_5pd98yr"
# wget -r -nc -R pdf --header "User-Agent: Sean" "https://$path/TotalGsdShow.htm"

rm new-star

parse () {
	local file
	local line
	local mark

	id=$1
	file="$path/html/$id"
	id=${id/110_/}
	id=${id/.htm?v=1.0/}

	line="$id\t"

	for s in "國文" "英文" "數學" "社會" "自然"; do
		mark=`ggrep -a -A1 ">$s<" $file |tail -n1 |ggrep -oP '>\K[^<]*(?=標<)'`
		if [ $? -ne 0 ]; then
			mark="無"
		fi
		line+="$mark"
	done

	line+="\t"

	for s in "國文" "英文" "數學" "社會" "自然"; do
		mark=`ggrep -a -A1 ">$s<" $file |tail -n1 |ggrep -oP '>\K[^<]*(?=<)'`
		line+="$mark "
	done

	line+="\t"
	line+="` ggrep -a -oP '<b>\K[^<>]+(?=<br>)' $file |head -n1`"
	line+="\t"
	line+="`ggrep -a -oP '<br>\K[^<>]+(?=<)' $file \
		|head -n1 \
		|sed -e 's/\s*(/（/g' -e 's/\s*)/）/g' \
		|perl -pe 's#(學系|學程|學士班)\-?((?!(（|）)).*)組$#\1（\2組）#' \
		|perl -pe 's#系\-?((?!(（|）)).*)組$#系（\1組）#' \
		|perl -pe 's#\-((?!(（|）)).*)組$#（\1組）#' \
		`"

	echo -e "$line" | tee -a new-star
}

for id in `ls $path/html`; do
	parse $id &
	sleep 0.1
done

for job in `jobs -p`; do
    wait $job
done
sleep 5

sort -o new-star new-star

echo "Done!"
wc new-star

echo "Please confirm and move new-star to star"
