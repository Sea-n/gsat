# 取得資料
```bash
md pdf && cd pdf
curl -s -O 'https://www.caac.ccu.edu.tw/apply107/system/107ColQry_forapply_4hgd9/ColQry_NextYear/ApplyPreviewGsd_[001-155].pdf'
curl -s -O 'https://www.caac.ccu.edu.tw/star107/system/107ColQry_forstar_9sde/ColQry_NextYear/StarPreviewGsd_[001-155].pdf'
cd ..
```

# 解析
使用 [tabulapdf/tabula-java](https://github.com/tabulapdf/tabula-java) 將 PDF 轉換為 [CSV](https://zh.wikipedia.org/zh-tw/%E9%80%97%E5%8F%B7%E5%88%86%E9%9A%94%E5%80%BC) 格式
```bash
wget https://github.com/tabulapdf/tabula-java/releases/download/v1.0.2/tabula-1.0.2-jar-with-dependencies.jar tabula.jar
md csv
for i in {001..155}; do
  echo $i
  java -jar tabula.jar -f CSV -a %21,0,95,100 -p all -c 100,350,400 pdf/ApplyPreviewGsd_${i}.pdf -o csv/apply-${i}.csv 2> /dev/null
  java -jar tabula.jar -f CSV -a %21,0,95,100 -p all -c 100,350,400 pdf/StarPreviewGsd_${i}.pdf -o csv/star-${i}.csv 2> /dev/null
done
```

手動將大學編號整理為 `001 台大` 格式，寫入 `school-{apply,star}` 檔案

### 彙整所有資料
```bash
while read n s; do
  awk -F, '{print "'$s'" "\t" $2 "\t" $4}' csv/apply-$n.csv >> list-apply.tsv
done < school-apply

rm list-star.tsv
while read n s; do
  awk -F, '{print "'$s'" "\t" $2 "\t" $3 "\t" $4}' csv/star-$n.csv |sed 's/ ; /,/g' >> list-star.tsv
done < school-star
```


# 網頁編譯
感謝 [@gnehs](https://github.com/gnehs) 讓他這麼複雜 :new_moon_with_face:  
```bash
npm install pug-cli -g
pug -P *.pug
```