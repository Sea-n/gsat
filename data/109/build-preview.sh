#!/usr/bin/env bash

mkdir -p pdf csv

# Download Tabula
wget -nc -O tabula.jar \
	"https://github.com/tabulapdf/tabula-java/releases/download/v1.0.3/tabula-1.0.3-jar-with-dependencies.jar"


# Download Apply
seq -w 154 |while read i; do
	curl -s -o pdf/apply-$i.pdf https://www.cac.edu.tw/apply109/Classification_readfile.php?fileid=$i
	java -jar tabula.jar -f CSV -a %21,0,95,100 -p all -c 75,350,400 pdf/apply-$i.pdf -o csv/apply-$i.csv
done

rm apply
cat ../school |while read n s; do
	cat csv/apply-$n.csv |while read line; do
		id=`echo "$line" |cut -d, -f1`
		dep=`echo "$line" |cut -d, -f2`
		subj=`echo "$line" |cut -d, -f4`

		echo -en "$id\t無無無無無\t" >> apply

		for i in "國文" "英文" "數學" "社會" "自然"; do
			if [[ "$subj" = *"$i"* ]]; then
				echo -n "採計" >> apply
			else
				echo -n "--" >> apply
			fi

			if [[ $i != "自然" ]]; then
				echo -n " " >> apply
			else
				echo -en "\t" >> apply
			fi
		done

		echo -e "$s\t$dep" >> apply
	done
done


# Download Star
seq -w 154 |while read i; do
	curl -s -o pdf/star-$i.pdf https://www.cac.edu.tw/star109/Classification_readfile.php?fileid=$i
	java -jar tabula.jar -f CSV -a %21,0,95,100 -p all -c 75,320,400 pdf/star-$i.pdf -o csv/star-$i.csv
done

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
