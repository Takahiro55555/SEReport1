/**
 * @file NormalFunctions.js
 * @author Takahiro55555
 * @brief vue.jsのテンプレートで直接使用（htmlファイルに直接記述）されることが無い関数をまとめた
 */


/**
 * @brief 購入予定のチケット全体の合計額を計算する（一切の割引を考慮しない）
 * @param {次のような構造の辞書型 `{割引ID:{商品ID:{"num":数量}, ...}, ...}` } cartItems 
 * @param {チケットIDをキーにして価格が入っている} itemDict 
 */
function calcTotal(cartItems, itemDict){
	let tmpSubtotal = 0;
	for (discountId in cartItems){
		for (itemId in cartItems[discountId]){
			tmpSubtotal += cartItems[discountId][itemId].num * itemDict[itemId].price;
		}
	}
	return tmpSubtotal;
}

/**
 * @brief 団体割引の割引率を計算する。すべての団体割引が適用されない場合、1を返す。
 * @param {次のような構造の辞書型 `{割引ID:{商品ID:{"num":数量}, ...}, ...}` } cartItems 
 * @param {割引IDをキーとして割引率と条件（最低人数）が入っている} groupDisctounts 
 */
function calcGroupDiscountRate(cartItems, groupDisctounts){
	let groupNum = 0;
	for (let discountId in cartItems){
		for (let itemId in cartItems[discountId]){
			groupNum += cartItems[discountId][itemId].num;
			console.log("group num:" + groupNum);
		}
	}

	let tmpRate = 1;
	for (let discountId in groupDisctounts){
		if (groupDisctounts[discountId].conditionMini <= groupNum){
			console.log("group discount");
			tmpRate *= 1 - groupDisctounts[discountId].rate;
		}
		//console.log("group discount id: " + discountId)
	}
	console.log(tmpRate);
	return tmpRate;
}

/**
 * 
 * @param {次のような構造の辞書型 `{割引ID:{商品ID:{"num":数量}, ...}, ...}` } cartItems 
 * @param {割引IDに対応する割引名目と割引率} individualDicsounts 
 * @param {チケットIDをキーにして価格が入っている} itemDict 
 */
function calcTotalWithIndividualDicsounts(cartItems, individualDicsounts, itemDict){
	let tmpSubtotal = 0;
	for (let discountId in cartItems){
		for (let itemId in cartItems[discountId]){
			tmpSubtotal += cartItems[discountId][itemId].num * itemDict[itemId].price * (1 - individualDicsounts[discountId].rate);
		}
	}
	console.log(tmpSubtotal);
	return tmpSubtotal;
}