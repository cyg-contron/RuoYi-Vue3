const fraction = ['角', '分'];
const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const unit = [['圆', '万', '亿'], ['', '拾', '佰', '仟']];

/**
 * 取文件名
 * @param url
 * @returns {*|string}
 */
export function getFileName(url) {
    if (url && url.lastIndexOf("/") > -1) {
        return url.slice(url.lastIndexOf("/") + 1);
    } else {
        return "";
    }
}

/**
 * 金额的正则表达式，只能输入两位小数123456789.87
 * @param val
 * @returns {*}
 */
export function regexpCurrency(val) {
    return val.toString().match(/^\d{0,9}(?:\.\d{0,2})?/)[0];
    // return val.replace(/^(\-)*(\d+)\.(\d\d).*$/,'');
}

/**
 * 数字金额转为大写的人民币
 * @param money
 * @returns {string}
 */
export function convertCurrency(money) {
    const head = money < 0 ? '欠' : '';
    money = Math.abs(money);
    let result = '';
    for (let i = 0; i < fraction.length; i++) {
        result += (digit[Math.floor(money * 10 * Math.pow(10, i)) % 10] + fraction[i])
            .replace(/零./, '');
    }
    result = result || '整';
    money = Math.floor(money);
    for (let i = 0; i < unit[0].length && money > 0; i++) {
        let uppercase = '';
        for (let j = 0; j < unit[1].length && money > 0; j++) {
            uppercase = digit[money % 10] + unit[1][j] + uppercase;
            money = Math.floor(money / 10);
        }
        result = uppercase.replace(/(零.)*零$/, '')
            .replace(/^$/, '零') + unit[0][i] + result;
    }
    return head + result.replace(/(零.)*零圆/, '圆')
        .replace(/(零.)+/g, '零')
        .replace(/^整$/, '零元整').replace('圆整','元整');
}
