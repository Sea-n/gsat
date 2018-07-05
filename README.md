# 學測五選四
自 108 年開始，學測最多採計四科，來看看您心目中的科系怎麼算吧

## 使用方法
1. 開啟 [學測五選四](https://sean.cat/gsat) 網站
2. 輸入想查詢的校系
3. 點選科目名稱按鈕，切換狀態
4. 覺得實用就點右下角分享出去吧 :D


## 貼文們

* [PTT 高中板](https://www.ptt.cc/bbs/SENIORHIGH/M.1529085042.A.CD0.html)
* [Facebook](https://www.facebook.com/Sean0604/posts/2103316103273571)
* [Twitter](https://twitter.com/Sea_n64/status/1007815631343738880)
* [Meteor](https://meteor.today/a/99fu5g)



## 資料來源
[個人申請 - 參採科目](https://www.caac.ccu.edu.tw/apply107/Classification_NextYear.php)
[繁星推薦 - 參採科目](https://www.caac.ccu.edu.tw/star107/Classification_NextYear.php)


### 使用腳本
抓取資料
```bash
md pdf && cd pdf
curl -s -O 'https://www.caac.ccu.edu.tw/apply107/system/107ColQry_forapply_4hgd9/ColQry_NextYear/ApplyPreviewGsd_[001-155].pdf'
curl -s -O 'https://www.caac.ccu.edu.tw/star107/system/107ColQry_forstar_9sde/ColQry_NextYear/StarPreviewGsd_[001-155].pdf'
cd ..
```

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

手動將大學編號處理為 `001 台大` 格式

彙整所有資料
```bash
while read n s; do
  awk -F, '{print "'$s'" "\t" $2 "\t" $4}' csv/apply-$n.csv >> list-apply.tsv
done < school-apply

rm list-star.tsv
while read n s; do
  awk -F, '{print "'$s'" "\t" $2 "\t" $4}' csv/star-$n.csv |sed 's/ ; /,/g' >> list-star.tsv
done < school-star

grep 不分學群 list-star.tsv > list-star-0.tsv
grep 第一類學群 list-star.tsv > list-star-1.tsv
grep 第二類學群 list-star.tsv > list-star-2.tsv
grep 第三類學群 list-star.tsv > list-star-3.tsv
grep 第四類學群 list-star.tsv > list-star-4.tsv
grep 第五類學群 list-star.tsv > list-star-5.tsv
# No 6
grep 第七類學群 list-star.tsv > list-star-7.tsv
grep 第八類學群 list-star.tsv > list-star-8.tsv
```

### 網頁編譯
感謝 [@gnehs](https://github.com/gnehs) 讓他這麼複雜 :new_moon_with_face:  
```pug -P *.pug```
