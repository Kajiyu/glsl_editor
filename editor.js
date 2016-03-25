var fs = require('fs');
var remote = require('remote');
var dialog = remote.require('dialog');
var browserWindow = remote.require('browser-window');

var inputArea = null;
var inputTxt = null;
var footerArea = null;

var currentPath = "";
var editor = null;

onload = function(){
  //inputArea = document.getElementById("input_area");
  inputTxt = document.getElementById("input_txt");
  footerArea = document.getElementById("footer_fixed");

  editor = ace.edit("input_txt");
  editor.$blockScrolling = Infinity;
  editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  });
  editor.getSession().setMode("ace/mode/glsl");
  editor.setTheme("ace/theme/github");

  document.ondragover = document.ondrop = function (e) {
		e.preventDefault(); // イベントの伝搬を止めて、アプリケーションのHTMLとファイルが差し替わらないようにする
		return false;
	};

  inputArea.ondragover = function () {
		return false;
	};
	inputArea.ondragleave = inputArea.ondragend = function () {
		return false;
	};
	inputArea.ondrop = function (e) {
		e.preventDefault();
		var file = e.dataTransfer.files[0];
		readFile(file.path);
		return false;
	};

}

function openLoadFile(){
  var win = browserWindow.getFocusedWindow();
  dialog.showOpenDialog(
		win,
		// どんなダイアログを出すかを指定するプロパティ
		{
			properties: ['openFile'],
			filters: [
				{
					name: 'Documents',
					extensions: ['txt', 'text', 'frag', 'vert', 'glsl', 'c', 'cpp'],
	 			}
 			]
		},
		// [ファイル選択]ダイアログが閉じられた後のコールバック関数
		function (filenames) {
			if (filenames) {
				readFile(filenames[0]);
			}
		});
}

function readFile(path) {
	currentPath = path;
	fs.readFile(path, function (error, text) {
		if (error != null) {
			alert('error : ' + error);
			return;
		}
		// フッター部分に読み込み先のパスを設定する
		footerArea.innerHTML = path;
		// テキスト入力エリアに設定する
		editor.setValue(text.toString(), -1);
	});
}

function saveFile() {

	//　初期の入力エリアに設定されたテキストを保存しようとしたときは新規ファイルを作成する
	if (currentPath == "") {
		saveNewFile();
		return;
	}

	var win = browserWindow.getFocusedWindow();

	dialog.showMessageBox(win, {
			title: 'ファイルの上書き保存を行います。',
			type: 'info',
			buttons: ['OK', 'Cancel'],
			detail: '本当に保存しますか？'
		},
		// メッセージボックスが閉じられた後のコールバック関数
		function (respnse) {
			// OKボタン(ボタン配列の0番目がOK)
			if (respnse == 0) {
				var data = editor.getValue();
				writeFile(currentPath, data);
			}
		}
	);
}

function writeFile(path, data) {
	fs.writeFile(path, data, function (error) {
		if (error != null) {
			alert('error : ' + error);
			return;
		}
	});
}

function saveNewFile() {

	var win = browserWindow.getFocusedWindow();
	dialog.showSaveDialog(
		win,
		// どんなダイアログを出すかを指定するプロパティ
		{
			properties: ['openFile'],
			filters: [
				{
					name: 'Documents',
					extensions: ['txt', 'text', 'frag', 'vert', 'glsl', 'c', 'cpp'],
				}
			]
		},
		// セーブ用ダイアログが閉じられた後のコールバック関数
		function (fileName) {
			if (fileName) {
				var data = editor.getValue();
				currentPath = fileName;
				writeFile(currentPath, data);
			}
		}
	);
}
