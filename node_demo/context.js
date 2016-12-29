/**
 * Created by yc on 16/12/19.
 * 学习this，理解上下文；
 */
var pet = {
	word:'....',
	speak: function () {
		console.log(this.word);
	}
}
pet.speak();