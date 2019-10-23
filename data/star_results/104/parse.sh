#!/bin/bash

mkdir -p pdf csv

# Download Tabula
echo -n 'Getting essential package...  '
wget -nc -O tabula.jar \
	"https://github.com/tabulapdf/tabula-java/releases/download/v1.0.3/tabula-1.0.3-jar-with-dependencies.jar"
echo 'Done'

# Download star result
echo 'Dowloading PDF files and transform to CSV...  '
seq -w 153 | while read i; do
    echo "Processing No.$i."
    curl -s -o pdf/star_result-$i.pdf https://www.cac.edu.tw/cacportal/star_his_report/104/104_result_standard/one2seven/$i/104Standard_$i.pdf
    java -jar tabula.jar -f CSV -a %18,0,87,100 -p all pdf/star_result-$i.pdf -o csv/star_result-$i.csv 2>/dev/null
done
echo 'Done'

rm star_result

echo 'Reformattiog CSV...'
cat ../../school | while read n s; do
    echo -ne "Processing $n $s...\t"
    cat csv/star_result-$n.csv | while read line; do
        first_percent=`echo $line | cut -d, -f13`
        second_percent=`echo $line | cut -d, -f15 | sed -e 's///'`
        [[ -z $second_percent  ]] && second_percent='--'
        read line; read line; read line;
        id=`echo $line | cut -d, -f1`
        # case where department name is more than a line. 
        if [[ $id == '""' ]]; then
            dep=`echo $line | cut -d, -f2`
            read line
            id=`echo $line | cut -d, -f1`
            recruit=`echo $line | cut -d, -f3`
            read line
            dep=$dep`echo $line | cut -d, -f2`
            read line; read line
        else
            dep=`echo $line | cut -d, -f2`
            recruit=`echo $line | cut -d, -f3`
            first_ppl=`echo $line | cut -d, -f12`
            second_ppl=`echo $line | cut -d, -f14 | sed -e 's///'`
            read line; read line; read line;
        fi

        echo -en "$id\t$recruit\t$first_percent\t$first_ppl\t$second_percent\t$second_ppl\t" >> star_result
        echo -e "$s\t$dep" >> star_result
    done
    echo 'Done'
done
