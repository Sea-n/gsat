rm star
cat ../school |while read n s; do
	cat csv/star-$n.csv |while read line; do
		id=`echo "$line" |cut -d, -f1`
		dep=`echo "$line" |cut -d, -f2`
		subj=`echo "$line" |cut -d, -f4`

		echo -en "$id\t無無無無無\t" >> star

		for i in "國文" "英文" "數學" "社會" "自然"; do
			if [[ "$subj" = *"$i"* ]]; then
				echo -n "採計" >> star
			else
				echo -n "--" >> star
			fi

			if [[ $i != "自然" ]]; then
				echo -n " " >> star
			else
				echo -en "\t" >> star
			fi
		done

		echo -e "$s\t$dep" >> star
	done
done
