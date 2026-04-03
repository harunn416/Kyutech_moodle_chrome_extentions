# 連絡情報の書き方

このファイルは、連絡情報データ [content_scripts/add_notice_space/noticeInfo.js](content_scripts/add_notice_space/noticeInfo.js) の記述ルールをまとめたものです。表示ロジックは [content_scripts/add_notice_space/element.js](content_scripts/add_notice_space/element.js) を基準にしています。

## データ構造

[content_scripts/add_notice_space/noticeInfo.js](content_scripts/add_notice_space/noticeInfo.js) は、以下形式の配列を export します。

```js
const noticeInfo = [
	{
		title: "連絡タイトル",
		description: "連絡本文",
		start: "2026-04-03",
		end: "2026-04-03 23:59",
		link: "https://example.com",
	},
];

export default noticeInfo;
```

## 各項目

- title: **必須**。見出しとして表示されます。
- description: 任意。説明文として表示されます。
- start: **必須**。開始日時です。
- end: 任意。終了日時です。未指定の場合は start と同日の 23:59 扱いになります。
- link: 任意。詳細ページへのリンクです。

## 日時フォーマット

次の形式で書いてください。

- 日付のみ: YYYY-MM-DD
- 日時: YYYY-MM-DD HH:mm

例:

- 2026-04-03
- 2026-04-09 12:00

※ 時間を省略して書いた場合は時間は表示されませんが、開始時刻は`00:00`、終了時刻は`23:59`として処理されます。

## 表示ルール

- 表示対象は「開始日が現在から 7 日以内」かつ「終了日時を過ぎていない」連絡です。
- start時刻がない場合、表示上は日付のみ表示されます。
- end に時刻がない場合、表示上は終了側も日付のみ表示されます。
- end を省略し、かつ start が日付のみの場合は、単日イベントとして `日時: 開始日` の形式で表示されます。

## 記述例

```js
const noticeInfo = [
	{ //一日を指定したい場合
		title: "抽選履修登録発表日",
		start: "2026-04-03",
		link: "https://www.iizuka.kyutech.ac.jp/faculty/educational-info#i-5",
	},
	{ //時刻込みで期間を指定したい場合
		title: "履修登録期間",
		description:
			"履修登録期間です。履修講義を履修する場合は、期間内に履修登録を行ってください。",
		start: "2026-04-09 12:00",
		end: "2026-04-12 23:50",
		link: "https://www.iizuka.kyutech.ac.jp/faculty/educational-info#i-5",
	},
];
```
