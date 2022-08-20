const root = document.querySelector(':root');
const root_styles = getComputedStyle(root);

document.querySelector("#plus-font").addEventListener('click', () => changeFontSize(5))
document.querySelector("#minus-font").addEventListener('click', () => changeFontSize(-5))

function changeFontSize(amount) {
    const currentFontSize = parseInt(root_styles.getPropertyValue('--default-font-size').split('px')[0]);
    const newFontSize = (currentFontSize + amount);
    if (newFontSize >= 45 || newFontSize <= 5) return;

    root.style.setProperty('--default-font-size', newFontSize + 'px');
}
