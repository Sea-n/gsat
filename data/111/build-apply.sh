#!/usr/bin/env bash

dir="www.cac.edu.tw/apply111/system/0ColQry_for111apply_8fr51gfw"
# wget -r -nc -R pdf --header "User-Agent: Sean" "https://$dir/TotalGsdShow.htm"

rm new-apply

parse () {
	local id
	local file
	local line
	local mark
	local multiple
	local weighted

	file="$dir/html/$1"
	id="$1"
	id="${id/111_/}"
	id="${id/.htm?v=1.0/}"

	line="$id\t"

	for s in "國文" "英文" "數學A" "數學B" "社會" "自然"; do
		mark="$(ggrep -a -A3 "  <font size=\"2\"><b>$s</b></font>" "$file" |tail -n1 |ggrep -oP '>\K[^<]*(?=標<)')"
		if [ $? -ne 0 ]; then
			mark="無"
		fi
		line+="$mark"
	done

	line+="\t"

	for s in "國文" "英文" "數學A" "數學B" "社會" "自然"; do
		mark="$(ggrep -a -A3 "  <font size=\"2\"><b>$s</b></font>" "$file" |tail -n1 |ggrep -oP '>\K[^<]*標(?=<)')"
		if [ $? -eq 0 ]; then
			line+="$mark "
			continue
		fi

		multiple="$(ggrep -a -A6 "  <font size=\"2\"><b>$s</b></font>" "$file" |tail -n1 |ggrep -oP '>\K.*?(?=<)')"
		if [ "$multiple" != "--" ]; then
			line+="x$multiple "
			continue
		fi

		weighted="$(ggrep -a -A9 "  <font size=\"2\"><b>$s</b></font>" "$file" |tail -n1 |ggrep -oP '>\K.*?(?=<)')"
		if [ "$weighted" != "--"  ]; then
			line+="採計 "
			continue
		fi

		line+="-- "
	done

	line+="\t"
	line+="$(head -n10 "$file" |tail -n1 |ggrep -a -oP '>\K[^<>]+(?=<)')"
	line+="\t"
	line+="$(head -n11 "$file" \
		|tail -n1 \
		|ggrep -a -oP ' +\K[^<>]+(?=<)' \
		|sed -e 's/\s*(/（/g' -e 's/\s*)/）/g' \
		|perl -pe 's#(學系|學程|學士班)\-?((?!(（|）)).*)組$#\1（\2組）#' \
		|perl -pe 's#系\-?((?!(（|）)).*)組$#系（\1組）#' \
		|perl -pe 's#\-((?!(（|）)).*)組$#（\1組）#' \
		)"

	echo -e "$line" | tee -a new-apply
}

ls "$dir/html/" | while read -r file; do
	parse "$file" &
	sleep 0.1
done

for pid in $(jobs -p); do
	wait "$pid"
done
sleep 1

sort -o new-apply new-apply

echo "Done!"
wc new-apply

echo "Please confirm and move new-apply to apply"
