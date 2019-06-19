/**
 * @file TicketCalculator.js
 * @author: Takahiro55555
 * @brief: ソフトウェア工学のレポート課題 Part1
 * HACK: コンポーネントを使用する
 */

var app = new Vue({
	el: '#app',
	data: {
		// NOTE: 商品が追加されると以下のような構造になる
		//       `{割引ID:{商品ID:{"num":数量}, ...}, ...}`
		cartItems: {},          // 購入予定の商品を格納
		
		// NOTE: cartItemsでは入力順序の保持が面倒だったため追加
		cartSequence: [],       // 入力順序を格納
		
		activeItemId: null,     // Active（数量変更可能）な商品ID
		activeDiscountId: null, // Active（数量変更可能）な割引ID
		total: 0,               // 合計金額
		discountTotal: 0,   　  // 割引額の合計
		currentDiscountMode: 0, // 現在商品キーから入力した際の割引ID
		tenKeyOutput: 0,
		operationKeys: {
			// 操作用キーIDとラベル、キーの色(CSSクラス)を設定
			0: {"label": '0', "colorClass": "btn btn-secondary btn-lg"},
			1: {"label": '1', "colorClass": "btn btn-secondary btn-lg"},
			2: {"label": '2', "colorClass": "btn btn-secondary btn-lg"},
			3: {"label": '3', "colorClass": "btn btn-secondary btn-lg"},
			4: {"label": '4', "colorClass": "btn btn-secondary btn-lg"},
			5: {"label": '5', "colorClass": "btn btn-secondary btn-lg"},
			6: {"label": '6', "colorClass": "btn btn-secondary btn-lg"},
			7: {"label": '7', "colorClass": "btn btn-secondary btn-lg"}, 
			8: {"label": '8', "colorClass": "btn btn-secondary btn-lg"},
			9: {"label": '9', "colorClass": "btn btn-secondary btn-lg"},
			'<': {"label": "<del", "colorClass": "btn btn-secondary btn-lg"},
			'=': {"label": "確定", "colorClass": "btn btn-primary btn-lg"}, 
			'C': {"label": '削除', "colorClass": "btn btn-warning btn-lg"},
			"CA": {"label": "全消去", "colorClass": "btn btn-danger btn-lg"},
			' ' : {"label": " ", "colorClass": "none"}
		},
		items: {
			// 商品IDに対応する商品名目と価格を設定
			0: { "label": "大人", "price": 2000, "msg": null },
			1: { "label": "大学生", "price": 1500, "msg": "学生証を確認してください" },
			2: { "label": "高校生・中学生", "price": 1000, "msg": "学生証を確認してください" },
			3: { "label": "小学生", "price": 500, "msg": null },
			4: { "label": "幼児", "price": 0, "msg": null },
			5: { "label": "60歳以上", "price": 1000, "msg": "身分証を確認してください" },
			6: { "label": "身障者", "price": 800, "msg": "身分証を確認してください" }
		},
		individualDicsounts: {
			// 商品単体に適用される割引
			// 割引IDに対応する割引名目と割引率、キーの色(CSSクラス)を設定
			// NOTE: 実装の簡略化のため、通常価格を追加
			0: { "label": "通常価格", "rate": 0, "colorClass": "btn-success", "msg": null},
			1: { "label": "県民感謝デー", "rate": 0.2, "colorClass": "btn-danger", "msg": "身分証を確認してください"}
		},
		groupDicsounts: {
			// 条件を満たすと、該当する会計全体に適用される割引
			// 割引IDに対応する割引名目と割引率、割引条件（必要人数）を設定
			0: { "label": "団体割引", "rate": 0.1, "conditionMini": 10}
		},

		// 以下キーの配置を定義
		tenKey: [
			// テンキーの配置を設定
			[1, 2, 3, '<'],
			[4, 5, 6, '='],
			[7, 8, 9, 'C'],
			[0, ' ', ' ', "CA"]
		],
		opeKey: [
			// テンキー以外の部分の配置を設定
		],
		itemKey: [
			// 商品キーの配置を設定
			// NOTE: キーの配置の他にここで設定したい項目の発生を考慮し辞書型を採用
			[
				{ "id": 0 },
				{ "id": 1 },
				{ "id": 2 }
			],
			[
				{ "id": 3 },
				{ "id": 4 },
				{ "id": 5 }
			],
			[
				{ "id": 6 }
			]
		],
		discountKey: [
			// 割引キーの配置を設定
			// NOTE: キーの配置の他にここで設定したい項目の発生を考慮し辞書型を採用
			[
				{ "id": 0},
				{ "id": 1}
			]
		],
	},

	methods: {
		/**
		 * @brief テンキーと操作－に応じた処理を行う
		 * @param {テンキーと操作キーのID} command 
		 */
		calc: function (command) {
			// 数値から文字列にキャスト
			let cmd = String(command); 

			// 判定・処理
			switch (cmd) {

				// 確定ボタン
				case '=':
					// Activeな商品が無い場合何もしない
					if (this.activeDiscountId === null || this.activeItemId === null) return;
					
					this.cartItems[this.activeDiscountId][this.activeItemId].num = this.tenKeyOutput;

					if (this.tenKeyOutput == 0){
						this.$set(this.cartItems[this.activeDiscountId][this.activeItemId], "num", 0);
						this.activeDiscountId = null;
						this.activeItemId = null;
					}
					break;
				
				// レジクリア（全消去）
				case "CA":
					// 変数を初期状態へ戻す
					this.cartItems = {};
					this.cartSequence.length = 0;
					this.tenKeyOutput = 0;
					this.activeDiscountId = null;
					this.activeItemId = null;
					this.currentDiscountMode = 0;
					break;

				// Activeな商品を削除
				case 'C':
					if (this.activeDiscountId != null && this.activeItemId != null) {
						// 入力順序から削除対処の商品を削除
						for(let i=0; i<this.cartSequence.length; i++ ){
							if(this.cartSequence[i].discountId === this.activeDiscountId){
								if(this.cartSequence[i].itemId === this.activeItemId){
									this.cartSequence.splice(i, 1);
									console.log("delete from sequence: " + this.activeItemId);
								}
							}
						}
						
						// 商品の数を0にする
						this.$set(this.cartItems[this.activeDiscountId][this.activeItemId], "num", 0);
						this.activeDiscountId = null;
						this.activeItemId = null;
						this.tenKeyOutput = 0;
					}
					break;

				// 一文字消す
				case '<':
					if (this.tenKeyOutput.length === 1 || this.tenKeyOutput == '' 
					    || this.activeDiscountId === null || this.activeItemId === null) {
						// 文字数が１文字か空文字、`active*`がnullの場合
						this.tenKeyOutput = 0;
					} else {
						this.tenKeyOutput = String(this.tenKeyOutput);
						this.tenKeyOutput = this.tenKeyOutput.slice(0, -1);
						this.tenKeyOutput = Number(this.tenKeyOutput);
					}
					if (this.tenKeyOutput.length == '') {
						// 空文字の場合
						this.tenKeyOutput = 0;
					}
					break;
				
				// 入力された数値を適用する
				default:
					// Activeな商品が無い場合何もしない
					if (this.activeDiscountId === null || this.activeItemId === null) return;
					
					if (this.tenKeyOutput == 0) {
						this.tenKeyOutput = cmd;
					} else {
						this.tenKeyOutput += cmd;
					}
			}
			// 割引前の合計値、個別割引を適用した合計値に団体割引を適用したものを算出
			this.total = calcTotal(this.cartItems, this.items);
			this.discountTotal = calcTotalWithIndividualDicsounts(this.cartItems, this.individualDicsounts, this.items);
			this.discountTotal *= calcGroupDiscountRate(this.cartItems, this.groupDicsounts);
		},

		/**
		 * @brief 商品を数量を保持するcartItemsと、入力順を保持する
		 * @param {追加する商品ID} itemId 
		 */
		addCart: function (itemId) {
			console.log("Discount: " + this.currentDiscountMode + ", Item: " + itemId);

			if (!this.isInCart(this.currentDiscountMode, itemId)) {
				// 確認事項の表示
				let required = true;
				if(this.items[itemId].msg !== null){
					for(key in this.cartItems){
						console.log(this.cartItems);
						if(itemId in this.cartItems[key]){
							required = false;
							break;
						}
					}
					if(required) alert(this.items[itemId].msg);
				}

				this.cartSequence.unshift({"discountId": this.currentDiscountMode, "itemId": itemId});
				if(!(this.currentDiscountMode in this.cartItems)){
					this.cartItems[this.currentDiscountMode] = {};
				}
				this.$set(this.cartItems[this.currentDiscountMode], itemId, {"num": 1});
				

				console.log("new item: " + itemId);
			} else {
				console.log("this item alrady exists: " + itemId);
				this.cartItems[this.currentDiscountMode][itemId].num += 1;
			}
			// Activeを設定
			this.activeDiscountId = this.currentDiscountMode;
			this.activeItemId = itemId;

			// テンキーの出力を設定
			this.tenKeyOutput = this.cartItems[this.currentDiscountMode][itemId].num;

			// 割引前の合計値、個別割引を適用した合計値に団体割引を適用したものを算出
			this.total = calcTotal(this.cartItems, this.items);			
			this.discountTotal = calcTotalWithIndividualDicsounts(this.cartItems, this.individualDicsounts, this.items);
			this.discountTotal *= calcGroupDiscountRate(this.cartItems, this.groupDicsounts);
			
		},
		setActiveItem: function (discountId, itemId) {
			this.activeItemId = itemId;
			this.activeDiscountId = discountId;
			this.tenKeyOutput = this.getItemNum(discountId, itemId);
			console.log("activeItemId: " + itemId);
			console.log("discountItemId: " + discountId);
		},

		changeCurrentDiscountMode: function(discountId) {
			this.currentDiscountMode = discountId;

			// 確認事項の表示
			if(!(discountId in this.cartItems)){
				if(this.individualDicsounts[discountId].msg !== null){
					alert(this.individualDicsounts[discountId].msg);
				}
			}
		},

		/**
		 * @brief 該当する商品の数を返す
		 * @param {割引ID} discountId
		 * @param {商品ID} itemId 
		 */
		getItemNum: function(discountId, itemId){
			return this.cartItems[discountId][itemId].num;
		},

		/**
		 * @brief 該当する商品の数が0より大きいの場合trueを返す
		 * @param {割引ID} discountId
		 * @param {商品ID} itemId 
		 */
		isInCart: function (discountId, itemId) {
			if (discountId in this.cartItems){
				if (itemId in this.cartItems[discountId]){
					//console.log("id: " + itemId + " " + (this.cartItems[discountId][itemId].num > 0));
					return (this.cartItems[discountId][itemId].num > 0);
				}
			}
			return false;
		},

		/**
		 * @brief 該当する行の商品がActive（数量変更可能）な場合trueを返す
		 * @param {割引ID} discountId 
		 * @param {商品ID} itemId 
		 */
		isActiveRow: function (discountId, itemId){
			if(this.activeDiscountId === discountId){
				if(this.activeItemId === itemId) return true;
			}
			return false;
		}
	},
})