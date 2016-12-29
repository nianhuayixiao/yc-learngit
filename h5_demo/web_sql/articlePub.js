/**
 * Created by yc on 16/12/19.
 */
//加载热点文章
function showArticle() {
	db.transaction(function (tx) {
		//查询数据
		tx.executeSql('select*from article order by id desc limit 6', [], function (tx, rs) {
			for (var i = 0; i < rs.rows.length; i++) {
				var row = rs.rows.item(i);
				$('#hotNews ul').append('<li><a href="#">' + row.title + '</a></li>')
			}
		})
	})
}
var db = openDatabase('article', '1.0', 'article database', 2 * 1024 * 1024);
showArticle();
