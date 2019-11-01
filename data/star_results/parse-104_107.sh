#!/bin/bash

# This script works for year 104 ~ 107.

# Download Tabula
echo -n 'Getting essential package...  '
wget -nc -O tabula.jar \
	"https://github.com/tabulapdf/tabula-java/releases/download/v1.0.3/tabula-1.0.3-jar-with-dependencies.jar"
echo 'Done'

for year in `seq 104 107`; do
    dir='y'$year
    echo 'Starting process year '$year
    mkdir $dir
    mkdir -p $dir/pdf $dir/csv

    # Download star result
    echo 'Dowloading PDF files and transform to CSV...  '
    seq -w 153 | while read i; do
        echo "Processing No.$i."
        curl -s -o $dir/pdf/star_result-$i.pdf https://www.cac.edu.tw/cacportal/star_his_report/${year}/${year}_result_standard/one2seven/$i/${year}Standard_$i.pdf
        java -jar tabula.jar -f CSV -a %18,0,87,100 -p all $dir/pdf/star_result-$i.pdf -o $dir/csv/star_result-$i.csv 2>/dev/null
    done
    echo 'Done'

    rm $year

    echo 'Reformattiog CSV...'
    cat ../school | while read n s; do
        echo -ne "Processing $n $s...\t"
        cat $dir/csv/star_result-$n.csv | while read line; do
            first_percent=`echo $line | cut -d, -f13`
            second_percent=`echo $line | cut -d, -f15 | tr -d '\r'`
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
                dep=`echo $line | cut -d, -f2 \
                | perl -pe 's#(學系|學程|學士班)\-?((?!(（|）)).*)組$#\1（\2組）#' \
                | perl -pe 's#系\-?((?!(（|）)).*)組$#系（\1組）#' \
                | perl -pe 's#\-((?!(（|）)).*)組$#（\1組）#'`
                recruit=`echo $line | cut -d, -f3`
                first_ppl=`echo $line | cut -d, -f12`
                second_ppl=`echo $line | cut -d, -f14 | tr -d '\r'`
                read line; read line; read line;
            fi

            echo -en "$id\t$recruit\t$first_percent\t$first_ppl\t$second_percent\t$second_ppl\t" >> $year
            echo -e "$s\t$dep" >> $year 
        done
        echo 'Done'
    done
done
