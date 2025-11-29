/**
 * リサイズ可能なスプリッター機能の初期化とイベントリスナーの設定を行う関数。
 * * この関数を実行することで、DOM要素にドラッグ＆ドロップによるリサイズ機能が追加されます。
 */
export function initializeSplitter() {
  // 1. 操作対象の要素を全て取得
  const parent = document.querySelector('#course-memo-wrapper');
  const secondChild = document.querySelector('#course-memo-sidebar');
  const splitter = document.querySelector('#course-memo-separator');

  // 要素が存在しない場合は何もしない
  if (!parent || !secondChild || !splitter) {
    console.warn("スプリッターに必要なDOM要素が見つかりません。");
    return;
  }

  let isDragging = false;

  // --- ステップ1: ドラッグ開始 の処理 ---
  splitter.addEventListener('mousedown', (e) => {
    isDragging = true;
    const parentRect = parent.getBoundingClientRect();

    // --- ステップ2: ドラッグ中 の処理 ---
    function handleMouseMove(e) {
      if (!isDragging) return;

      // ★★★ 幅の計算方法を逆にする ★★★
      // 親要素の右端のX座標 (parentRect.right) から、現在のカーソルX座標 (e.clientX) を引く
      // これが、2つ目の要素の新しい幅になります。
      const newWidth = parentRect.right - e.clientX;

      // 最小・最大幅の制限
      const minWidth = 50;
      const maxWidth = parentRect.width - 50; // 親要素の幅から1つ目の要素の最小幅を引いたもの

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        // ★適用する要素を secondChild に変更★
        secondChild.style.width = `${newWidth}px`;
        // 1つ目の要素 (firstChild) は flex-grow: 1; により自動で調節されます。
      }
    }

    // --- ステップ3: ドラッグ終了 の処理 ---
    function handleMouseUp() {
      if (isDragging) {
        isDragging = false;

        // イベントリスナーの解除
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // スタイルの解除
        parent.style.userSelect = '';
        parent.style.pointerEvents = '';
      }
    }

    // document全体にイベントを登録
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // テキスト選択などを防ぐ
    parent.style.userSelect = 'none';
    parent.style.pointerEvents = 'none';
  });
}