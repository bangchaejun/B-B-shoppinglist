// script.js
document.getElementById('addItemButton').addEventListener('click', function() {
    const itemInput = document.getElementById('itemInput');
    const itemText = itemInput.value.trim();

    if (itemText !== '') {
        const listItem = document.createElement('li');
        listItem.textContent = itemText;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '삭제';
        deleteButton.addEventListener('click', function() {
            listItem.remove();
        });

        listItem.appendChild(deleteButton);
        document.getElementById('shoppingList').appendChild(listItem);

        itemInput.value = '';
    }
});

document.getElementById('itemInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('addItemButton').click();
    }
});
