#!/usr/bin/env bash

year="$1" # 109, 110, 111, etc.
mkdir -p pdf csv

echo -n '### Getting essential package...  '
wget -q -nc -O tabula.jar \
    "https://github.com/tabulapdf/tabula-java/releases/download/v1.0.5/tabula-1.0.5-jar-with-dependencies.jar"
echo 'Done'

echo '### Dowloading PDF files and transform to CSV...  '
seq -w 160 | while read -r i; do
    echo "Processing No.$i."
    wget -O "pdf/$year-$i.pdf" -q -nc --header "User-Agent: Sean" \
        "https://www.cac.edu.tw/cacportal/star_his_report/$year/${year}_result_standard/one2seven/$i/${year}Standard_$i.pdf"
    java -jar tabula.jar -f CSV -a %18,0,87,100 -p all "pdf/$year-$i.pdf" -o "csv/$year-$i.csv" 2>/dev/null
done
echo 'Done'

rm "new-$year"

echo '### Reformattiog CSV...'
while read -r n s; do
    echo -ne "Processing $n $s...\t"
    while read -r line; do
        first_percent="$(echo "$line" | cut -d, -f13)"
        second_percent="$(echo "$line" | cut -d, -f15 | tr -d '\r')"
        [[ -z $second_percent  ]] && second_percent='--'
        read -r line; read -r line; read -r line;
        id="$(echo "$line" | cut -d, -f1)"
        # case where department name is more than a line.
        if [[ $id == '""' ]]; then
            dep="$(echo "$line" | cut -d, -f2)"
            read -r line
            id="$(echo "$line" | cut -d, -f1)"
            recruit="$(echo "$line" | cut -d, -f3)"
            read -r line
            dep="$dep$(echo "$line" | cut -d, -f2)"
            read -r line; read -r line
        else
            dep="$(echo "$line" \
                | cut -d, -f2 \
                | perl -pe 's#(學系|學程|學士班)\-?((?!(（|）)).*)組$#\1（\2組）#' \
                | perl -pe 's#系\-?((?!(（|）)).*)組$#系（\1組）#' \
                | perl -pe 's#\-((?!(（|）)).*)組$#（\1組）#')"
            recruit="$(echo "$line" | cut -d, -f3)"
            first_ppl="$(echo "$line" | cut -d, -f12)"
            second_ppl="$(echo "$line" | cut -d, -f14 | tr -d '\r')"
            read -r line; read -r line; read -r line;
        fi

        echo -en "$id\t$recruit\t$first_percent\t$first_ppl\t$second_percent\t$second_ppl\t" >> "new-${year}"
        echo -e "$s\t$dep" >> "new-${year}"
    done < "csv/$year-$n.csv"
    echo 'Done'
done < ../school
